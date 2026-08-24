"""
Router for the SQL-detective-case module.
Style matches app/api/challenges.py exactly:
  - inline get_session() call (no Depends for DB)
  - Depends(get_current_user) only for auth-required endpoints
  - response_model on GET endpoints, inline dict on POST
"""

from fastapi import APIRouter, HTTPException, Depends

from ..models import get_session
from ..auth import get_current_user
from . import models as sqld_models
from .models import SqldCase, SqldStage, SqldSubmission
from ..models import User
from .schemas import (
    SqldCaseOut,
    SqldCaseDetailOut,
    SqldStageOut,
    SqldSubmissionRequest,
    SqldSubmissionResult,
)
from .sandbox import run_query, compare_results, SandboxError, SandboxTimeout

router = APIRouter()


# ── GET /cases ──────────────────────────────────────────────────────────────

@router.get("/cases", response_model=list[SqldCaseOut])
def list_sql_cases():
    sess = get_session()
    cases = sess.query(SqldCase).all()
    return [SqldCaseOut.from_orm(c) for c in cases]


# ── GET /cases/{slug} ────────────────────────────────────────────────────────

@router.get("/cases/{slug}", response_model=SqldCaseDetailOut)
def get_sql_case(slug: str):
    sess = get_session()
    case = sess.query(SqldCase).filter_by(slug=slug).first()
    if not case:
        raise HTTPException(status_code=404, detail="SQL case not found")
    return SqldCaseDetailOut.from_orm(case)


# ── GET /stages/{id} ─────────────────────────────────────────────────────────

@router.get("/stages/{stage_id}", response_model=SqldStageOut)
def get_sql_stage(stage_id: int):
    sess = get_session()
    stage = sess.get(SqldStage, stage_id)
    if not stage:
        raise HTTPException(status_code=404, detail="Stage not found")
    return SqldStageOut.from_orm(stage)


# ── POST /stages/{id}/submit ─────────────────────────────────────────────────

@router.post("/stages/{stage_id}/submit", response_model=SqldSubmissionResult)
def submit_sql_query(
    stage_id: int,
    req: SqldSubmissionRequest,
    user=Depends(get_current_user),
):
    sess = get_session()
    stage = sess.get(SqldStage, stage_id)
    if not stage:
        raise HTTPException(status_code=404, detail="Stage not found")

    # Run the query in the sandbox
    try:
        actual_rows, truncated = run_query(
            schema_sql=stage.schema_sql or "",
            seed_sql=stage.seed_sql or "",
            query=req.query,
        )
    except SandboxError as exc:
        raise HTTPException(status_code=400, detail=str(exc))
    except SandboxTimeout as exc:
        raise HTTPException(status_code=408, detail=str(exc))
    except Exception as exc:  # noqa: BLE001 — sqlite3 errors, etc.
        raise HTTPException(status_code=400, detail=f"Query error: {exc}")

    # Compare against expected result
    correct = compare_results(
        actual=actual_rows,
        expected=stage.expected_result or [],
        order_sensitive=stage.order_sensitive,
    )

    xp_awarded = stage.xp_reward if correct else 0

    # Build human-readable feedback
    if correct:
        feedback = "Correct! Your query matches the expected result."
    else:
        feedback = (
            "Not quite. Check the column names and filter conditions."
            + (" (Result was truncated at 500 rows.)" if truncated else "")
        )

    # Persist submission record
    submission = SqldSubmission(
        stage_id=stage_id,
        user_id=user.id if user else None,
        query=req.query,
        correct=correct,
        result_rows=actual_rows,
        xp_awarded=xp_awarded,
        feedback=feedback,
    )
    sess.add(submission)

    # Award XP to authenticated user on first correct solve
    if correct and user:
        fresh_user = sess.query(User).filter(User.id == user.id).first()
        fresh_user.xp = (fresh_user.xp or 0) + xp_awarded

    sess.commit()

    return SqldSubmissionResult(
        correct=correct,
        result_rows=actual_rows,
        xp_awarded=xp_awarded,
        feedback=feedback,
    )


# ── GET /my-submissions ─────────────────────────────────────────────────────

@router.get("/my-submissions")
def my_submissions(user=Depends(get_current_user)):
    """Get all SQL submissions for the current authenticated user."""
    if not user:
        raise HTTPException(status_code=401, detail="Authentication required")
    
    sess = get_session()
    submissions = sess.query(SqldSubmission).filter_by(user_id=user.id).order_by(SqldSubmission.submitted_at.desc()).all()
    
    return [
        {
            "id": sub.id,
            "stage_id": sub.stage_id,
            "query": sub.query,
            "correct": sub.correct,
            "xp_awarded": sub.xp_awarded,
            "feedback": sub.feedback,
            "submitted_at": sub.submitted_at.isoformat() if sub.submitted_at else None,
        }
        for sub in submissions
    ]
