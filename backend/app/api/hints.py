from fastapi import APIRouter, HTTPException, Depends
from pydantic import BaseModel
from ..models import get_session, Hint, Stage, User
from ..auth import get_current_user, require_user

router = APIRouter()


@router.get("/stage/{stage_id}")
def get_hints(stage_id: int, sess=Depends(get_session)):
    hints = sess.query(Hint).filter_by(stage_id=stage_id).order_by(Hint.order).all()
    return [{"id": h.id, "order": h.order, "cost_points": h.cost_points, "text": h.text} for h in hints]


class UnlockRequest(BaseModel):
    hint_id: int


@router.post("/unlock")
def unlock(req: UnlockRequest, user=Depends(require_user), sess=Depends(get_session)):
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
    return {"id": hint.id, "text": hint.text, "cost_points": hint.cost_points}
