from fastapi import APIRouter, HTTPException, Depends
from .. import models, schemas

router = APIRouter()


@router.get("/", response_model=list[schemas.CaseOut])
def list_cases(sess=Depends(models.get_session)):
    cases = sess.query(models.Case).order_by(models.Case.id.asc()).all()
    seen = set()
    unique_cases = []
    for c in cases:
        if c.slug not in seen:
            seen.add(c.slug)
            unique_cases.append(c)
    return [schemas.CaseOut.from_orm(c) for c in unique_cases]


@router.get("/{case_id}", response_model=schemas.CaseOut)
def get_case(case_id: int, sess=Depends(models.get_session)):
    case = sess.get(models.Case, case_id)
    if not case:
        raise HTTPException(status_code=404, detail="Case not found")
    return schemas.CaseOut.from_orm(case)


@router.get("/{case_id}/stages/{stage_id}")
def get_stage(case_id: int, stage_id: int, sess=Depends(models.get_session)):
    stage = sess.query(models.Stage).filter_by(id=stage_id, case_id=case_id).first()
    if not stage:
        raise HTTPException(status_code=404, detail="Stage not found")
    return {
        "id": stage.id,
        "title": stage.title,
        "order": stage.order,
        "prompt": stage.prompt,
        "description": stage.description,
        "time_limit_seconds": stage.time_limit_seconds,
        "memory_limit_mb": stage.memory_limit_mb
    }
