from fastapi import APIRouter, HTTPException, Depends
from pydantic import BaseModel
from ..models import get_session, Hint, Stage, User
from ..auth import get_current_user

router = APIRouter()


@router.get("/stage/{stage_id}")
def get_hints(stage_id: int, sess=Depends(get_session)):
    hints = sess.query(Hint).filter_by(stage_id=stage_id).order_by(Hint.order).all()
    return [{"id": h.id, "text": h.text, "unlock_after_attempts": h.unlock_after_attempts, "cost_points": h.cost_points} for h in hints]


class UnlockRequest(BaseModel):
    hint_id: int


@router.post("/unlock")
def unlock(req: UnlockRequest, user=Depends(get_current_user), sess=Depends(get_session)):
    if not user:
        raise HTTPException(status_code=401, detail="Authentication required")
    hint = sess.get(Hint, req.hint_id)
    if not hint:
        raise HTTPException(status_code=404, detail="Hint not found")
    # Cost deduction (simple)
    if hint.cost_points and user.xp < hint.cost_points:
        raise HTTPException(status_code=400, detail="Insufficient points to unlock")
    if hint.cost_points:
        fresh_user = sess.query(User).filter(User.id == user.id).first()
        fresh_user.xp -= hint.cost_points
    sess.commit()
    return {"hint_id": hint.id, "text": hint.text}
