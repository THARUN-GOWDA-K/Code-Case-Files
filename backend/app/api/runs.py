from fastapi import APIRouter
from pydantic import BaseModel

router = APIRouter()


class RunRequest(BaseModel):
    stage_id: int
    language: str
    source: str
    run_type: str = "interactive"


@router.post("/")
def create_run(req: RunRequest):
    # For MVP, return queued response; worker integration will process actual runs
    return {"run_id": "local-queued", "status": "queued", "stage_id": req.stage_id}
