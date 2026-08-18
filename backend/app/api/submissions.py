from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from ..models import get_session, Stage
from ..tasks import grade_submission_task
from celery.result import AsyncResult
from fastapi import Depends
from ..auth import get_current_user

router = APIRouter()


class SubmissionRequest(BaseModel):
    stage_id: int
    language: str
    source: str
    final: bool = False


@router.post("/")
def submit(req: SubmissionRequest, user=Depends(get_current_user)):
    sess = get_session()
    stage = sess.get(Stage, req.stage_id)
    if not stage:
        raise HTTPException(status_code=404, detail="Stage not found")

    # Enqueue grading task
    user_id = user.id if user else None
    task = grade_submission_task.delay(req.stage_id, req.language, req.source, user_id)
    return {"status": "queued", "task_id": task.id}


@router.get("/{task_id}")
def get_status(task_id: str):
    ar = AsyncResult(task_id)
    if not ar:
        raise HTTPException(status_code=404, detail="Task not found")
    return {"task_id": task_id, "status": ar.status, "result": ar.result}
