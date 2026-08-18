from fastapi import APIRouter, Depends, HTTPException
from ..auth import get_current_user
from ..models import get_session, Attempt

router = APIRouter()


@router.get("/me")
def my_attempts(user=Depends(get_current_user)):
    if not user:
        raise HTTPException(status_code=401, detail="Unauthorized")
    sess = get_session()
    rows = sess.query(Attempt).filter_by(user_id=user.id).order_by(Attempt.submitted_at.desc()).all()
    out = []
    for a in rows:
        out.append({
            "id": a.id,
            "stage_id": a.stage_id,
            "status": a.status,
            "score": a.score,
            "tests_passed": a.tests_passed,
            "total_tests": a.total_tests,
            "submitted_at": a.submitted_at.isoformat() if a.submitted_at else None,
        })
    return out
