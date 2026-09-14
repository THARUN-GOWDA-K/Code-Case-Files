"""
Shop API - allows players to spend XP on items.
"""
from fastapi import APIRouter, HTTPException, Depends
from pydantic import BaseModel
from typing import Optional
from ..models import get_session, User, ShopItem, PlayerInventory, session_scope
from ..auth import require_user
from ..models import Hint, HintUnlock
from ..sql_cases.models import SqldStage, SqldHintUnlock
from ..sql_cases.router import _regular_hints

router = APIRouter()

SHOP_ITEMS_SEED = [
    {"name": "Hint Token", "description": "Unlocks the next regular clue on a selected stage when used.", "icon": "🔓", "cost_xp": 5, "effect_type": "hint_token", "category": "hints"},
    {"name": "XP Booster (2x)", "description": "Doubles XP from your next successful Python or SQL stage solve.", "icon": "⚡", "cost_xp": 10, "effect_type": "xp_boost", "category": "boosts"},
]


def seed_shop_items():
    with session_scope() as sess:
        sess.query(ShopItem).filter(
            ShopItem.effect_type.in_({
                "hint_token", "schema_reveal", "xp_boost", "informant", "skip", "time_freeze",
                "cosmetic_badge", "cosmetic_gold",
            })
        ).update({ShopItem.is_active: False}, synchronize_session=False)
        if sess.query(ShopItem).filter_by(is_active=True).count() == 0:
            for item_data in SHOP_ITEMS_SEED:
                item = ShopItem(**item_data)
                sess.add(item)
            print("[shop] Seeded shop items.")


@router.get("/items")
def list_items(sess=Depends(get_session)):
    items = sess.query(ShopItem).filter_by(is_active=True).all()
    return [
        {
            "id": i.id,
            "name": i.name,
            "description": i.description,
            "icon": i.icon,
            "cost_xp": i.cost_xp,
            "effect_type": i.effect_type,
            "category": i.category,
        }
        for i in items
    ]


@router.post("/purchase/{item_id}")
def purchase_item(item_id: int, user=Depends(require_user), sess=Depends(get_session)):
    item = sess.get(ShopItem, item_id)
    if not item or not item.is_active:
        raise HTTPException(status_code=404, detail="Item not found")

    fresh_user = sess.query(User).filter(User.id == user.id).first()
    if (fresh_user.xp or 0) < item.cost_xp:
        raise HTTPException(
            status_code=400,
            detail=f"Not enough XP. You need {item.cost_xp} XP but have {fresh_user.xp or 0}."
        )

    fresh_user.xp = (fresh_user.xp or 0) - item.cost_xp

    existing = sess.query(PlayerInventory).filter_by(user_id=user.id, item_id=item_id).first()
    if existing:
        existing.quantity += 1
    else:
        inv = PlayerInventory(user_id=user.id, item_id=item_id, quantity=1)
        sess.add(inv)

    sess.commit()
    return {
        "success": True,
        "message": f"Purchased {item.name}!",
        "xp_remaining": fresh_user.xp,
        "item": {"id": item.id, "name": item.name, "icon": item.icon},
    }


class UseItemRequest(BaseModel):
    path: Optional[str] = None
    stage_id: Optional[int] = None


@router.post("/use/{inventory_id}")
def use_item(
    inventory_id: int,
    req: UseItemRequest,
    user=Depends(require_user),
    sess=Depends(get_session),
):
    inventory = (
        sess.query(PlayerInventory, ShopItem)
        .join(ShopItem, PlayerInventory.item_id == ShopItem.id)
        .filter(PlayerInventory.id == inventory_id, PlayerInventory.user_id == user.id)
        .first()
    )
    if not inventory:
        raise HTTPException(status_code=404, detail="Inventory item not found")

    entry, item = inventory
    if entry.quantity <= 0:
        raise HTTPException(status_code=400, detail="Item is depleted")

    fresh_user = sess.query(User).filter(User.id == user.id).first()
    result = {"effect_type": item.effect_type, "item": item.name}

    if item.effect_type == "xp_boost":
        if (fresh_user.xp_boost_multiplier or 1) > 1:
            raise HTTPException(status_code=400, detail="An XP booster is already active")
        fresh_user.xp_boost_multiplier = 2
        result["message"] = "XP Booster active: your next successful stage solve awards 2x XP."
    elif item.effect_type == "hint_token":
        if req.path not in {"python", "sql"} or req.stage_id is None:
            raise HTTPException(status_code=400, detail="Hint Tokens require a path and stage_id")

        if req.path == "python":
            hint = (
                sess.query(Hint)
                .filter_by(stage_id=req.stage_id)
                .outerjoin(HintUnlock, (HintUnlock.hint_id == Hint.id) & (HintUnlock.user_id == user.id))
                .filter(HintUnlock.id.is_(None))
                .order_by(Hint.order)
                .first()
            )
            if not hint:
                raise HTTPException(status_code=400, detail="No locked Python clue remains on this stage")
            unlock = HintUnlock(user_id=user.id, hint_id=hint.id)
            result["text"] = hint.text
            result["message"] = "Hint Token used. Evidence uncovered."
        else:
            stage = sess.get(SqldStage, req.stage_id)
            if not stage:
                raise HTTPException(status_code=404, detail="SQL stage not found")
            unlocked = {
                record.hint_index
                for record in sess.query(SqldHintUnlock).filter_by(
                    user_id=user.id, stage_id=stage.id, hint_kind="regular"
                ).all()
            }
            regular_hints = _regular_hints(stage)
            next_index = next((index for index in range(len(regular_hints)) if index not in unlocked), None)
            if next_index is None:
                raise HTTPException(status_code=400, detail="No locked SQL clue remains on this stage")
            unlock = SqldHintUnlock(
                user_id=user.id,
                stage_id=stage.id,
                hint_kind="regular",
                hint_index=next_index,
            )
            result["text"] = regular_hints[next_index].get("text", "")
            result["message"] = "Hint Token used. Clue note uncovered."
        sess.add(unlock)
    else:
        raise HTTPException(status_code=400, detail="This item has no usable effect")

    entry.quantity -= 1
    sess.commit()
    result["quantity_remaining"] = entry.quantity
    result["xp_remaining"] = fresh_user.xp
    return result


@router.get("/inventory")
def get_inventory(user=Depends(require_user), sess=Depends(get_session)):
    inventory = (
        sess.query(PlayerInventory, ShopItem)
        .join(ShopItem, PlayerInventory.item_id == ShopItem.id)
        .filter(PlayerInventory.user_id == user.id, PlayerInventory.quantity > 0)
        .all()
    )
    return [
        {
            "id": inv.id,
            "item_id": item.id,
            "name": item.name,
            "icon": item.icon,
            "description": item.description,
            "effect_type": item.effect_type,
            "quantity": inv.quantity,
        }
        for inv, item in inventory
    ]
