from fastapi import APIRouter, HTTPException
from .. import models, schemas

router = APIRouter()


@router.get("/", response_model=list[schemas.CaseOut])
def list_cases():
    sess = models.get_session()
    cases = sess.query(models.Case).all()
    return [schemas.CaseOut.from_orm(c) for c in cases]


@router.get("/{case_id}", response_model=schemas.CaseOut)
def get_case(case_id: int):
    sess = models.get_session()
    case = sess.get(models.Case, case_id)
    if not case:
        raise HTTPException(status_code=404, detail="Case not found")
    return schemas.CaseOut.from_orm(case)
