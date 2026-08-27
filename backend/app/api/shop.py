"""
Shop API - allows players to spend XP on items.
"""
from fastapi import APIRouter, HTTPException, Depends
from ..models import get_session, User, ShopItem, PlayerInventory, session_scope
from ..auth import require_user

router = APIRouter()

SHOP_ITEMS_SEED = [
    {"name": "Hint Token",       "description": "Reveals the next locked hint for free on any stage.", "icon": "🔓", "cost_xp": 25,  "effect_type": "hint_token",      "category": "hints"},
    {"name": "Schema Reveal",    "description": "Instantly shows the full database schema for any stage.", "icon": "🔍", "cost_xp": 30,  "effect_type": "schema_reveal",   "category": "hints"},
    {"name": "XP Booster (2x)", "description": "Doubles the XP earned on your next successful solve.", "icon": "⚡", "cost_xp": 60,  "effect_type": "xp_boost",        "category": "boosts"},
    {"name": "Informant Call",   "description": "Unlocks a cryptic clue from The Informant NPC.",       "icon": "💬", "cost_xp": 75,  "effect_type": "informant",       "category": "hints"},
    {"name": "Case Skip",        "description": "Skip one stage and mark it as solved (awards 0 XP).",  "icon": "📋", "cost_xp": 100, "effect_type": "skip",            "category": "utility"},
    {"name": "Disguise Kit",     "description": "Unlocks a cosmetic detective badge for your profile.",  "icon": "🎭", "cost_xp": 50,  "effect_type": "cosmetic_badge",  "category": "cosmetics"},
    {"name": "Gold Badge",       "description": "Prestigious profile badge: Master Detective.",          "icon": "🏆", "cost_xp": 200, "effect_type": "cosmetic_gold",   "category": "cosmetics"},
    {"name": "Time Freeze",      "description": "Removes any time pressure from your current stage.",    "icon": "⏱️", "cost_xp": 40,  "effect_type": "time_freeze",     "category": "utility"},
]


def seed_shop_items():
    with session_scope() as sess:
        if sess.query(ShopItem).count() == 0:
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


@router.get("/inventory")
def get_inventory(user=Depends(require_user), sess=Depends(get_session)):
    inventory = (
        sess.query(PlayerInventory, ShopItem)
        .join(ShopItem, PlayerInventory.item_id == ShopItem.id)
        .filter(PlayerInventory.user_id == user.id)
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
