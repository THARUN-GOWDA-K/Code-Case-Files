from fastapi import APIRouter, HTTPException, Depends
from pydantic import BaseModel
from ..models import get_session, Hint, HintUnlock, User
from ..auth import require_user

router = APIRouter()


@router.get("/stage/{stage_id}")
def get_hints(stage_id: int, user=Depends(require_user), sess=Depends(get_session)):
    hints = sess.query(Hint).filter_by(stage_id=stage_id).order_by(Hint.order).all()
    unlocked_ids = {
        unlock.hint_id
        for unlock in sess.query(HintUnlock).filter_by(user_id=user.id).all()
    }
    return [
        {
            "id": h.id,
            "order": h.order,
            "cost_points": h.cost_points,
            "unlocked": h.id in unlocked_ids,
            **({"text": h.text} if h.id in unlocked_ids else {}),
        }
        for h in hints
    ]


class UnlockRequest(BaseModel):
    hint_id: int


@router.post("/unlock")
def unlock(req: UnlockRequest, user=Depends(require_user), sess=Depends(get_session)):
    hint = sess.get(Hint, req.hint_id)
    if not hint:
        raise HTTPException(status_code=404, detail="Hint not found")
    existing = sess.query(HintUnlock).filter_by(user_id=user.id, hint_id=hint.id).first()
    if existing:
        return {"id": hint.id, "text": hint.text, "cost_points": hint.cost_points, "unlocked": True}

    fresh_user = sess.query(User).filter(User.id == user.id).first()
    if hint.cost_points and (fresh_user.xp or 0) < hint.cost_points:
        raise HTTPException(status_code=400, detail="Insufficient points to unlock")

    fresh_user.xp = (fresh_user.xp or 0) - (hint.cost_points or 0)
    sess.add(HintUnlock(user_id=user.id, hint_id=hint.id))
    sess.commit()
    return {"id": hint.id, "text": hint.text, "cost_points": hint.cost_points, "unlocked": True}
