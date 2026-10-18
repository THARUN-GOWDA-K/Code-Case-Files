"""
Router for the SQL-detective-case module.
Style matches app/api/challenges.py exactly:
  - Depends(get_session) for DB sessions
  - Depends(get_current_user) only for auth-required endpoints
  - response_model on GET endpoints, inline dict on POST
"""

from fastapi import APIRouter, HTTPException, Depends
from pydantic import BaseModel

from ..models import get_session
from ..auth import require_user
from . import models as sqld_models
from .models import SqldCase, SqldStage, SqldSubmission, SqldHintUnlock
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


def _regular_hints(stage: SqldStage):
    return [hint if isinstance(hint, dict) else {"text": hint, "cost_points": 0}
            for hint in (stage.hints or [])]


def _npc_hints(stage: SqldStage):
    return [hint for hint in (stage.npc_hints or []) if isinstance(hint, dict)]


def _unlocked_keys(sess, user_id: int, stage_id: int):
    return {
        (unlock.hint_kind, unlock.hint_index)
        for unlock in sess.query(SqldHintUnlock).filter_by(
            user_id=user_id, stage_id=stage_id
        ).all()
    }


# ── GET /cases ──────────────────────────────────────────────────────────────

@router.get("/cases", response_model=list[SqldCaseOut])
def list_sql_cases(sess=Depends(get_session)):
    cases = sess.query(SqldCase).order_by(SqldCase.id.asc()).all()
    seen = set()
    unique_cases = []
    for c in cases:
        if c.slug not in seen:
            seen.add(c.slug)
            unique_cases.append(c)
    return [SqldCaseOut.from_orm(c) for c in unique_cases]


# ── GET /cases/{slug} ────────────────────────────────────────────────────────

@router.get("/cases/{slug}", response_model=SqldCaseDetailOut)
def get_sql_case(slug: str, sess=Depends(get_session)):
    case = sess.query(SqldCase).filter_by(slug=slug).first()
    if not case:
        raise HTTPException(status_code=404, detail="SQL case not found")
    return SqldCaseDetailOut.from_orm(case)


# ── GET /stages/{id} ─────────────────────────────────────────────────────────

@router.get("/stages/{stage_id}", response_model=SqldStageOut)
def get_sql_stage(stage_id: int, user=Depends(require_user), sess=Depends(get_session)):
    stage = sess.get(SqldStage, stage_id)
    if not stage:
        raise HTTPException(status_code=404, detail="Stage not found")
    unlocked = _unlocked_keys(sess, user.id, stage.id)
    hints = []
    for index, hint in enumerate(_regular_hints(stage)):
        is_unlocked = ("regular", index) in unlocked
        hints.append({
            "order": index + 1,
            "cost_points": hint.get("cost_points", 0),
            "unlocked": is_unlocked,
            **({"text": hint.get("text", "")} if is_unlocked else {}),
        })
    npc_hints = []
    for index, hint in enumerate(_npc_hints(stage)):
        is_unlocked = ("npc", index) in unlocked
        npc_hints.append({
            "character": hint.get("character", ""),
            "xp_cost": hint.get("xp_cost", 0),
            "unlocked": is_unlocked,
            **({"dialogue": hint.get("dialogue", "")} if is_unlocked else {}),
        })
    return {
        "id": stage.id,
        "order": stage.order,
        "title": stage.title,
        "prompt": stage.prompt,
        "schema_description": stage.schema_description,
        "xp_reward": stage.xp_reward,
        "hints": hints,
        "npc_hints": npc_hints,
    }


class SqlHintUnlockRequest(BaseModel):
    kind: str
    index: int


@router.post("/stages/{stage_id}/hints/unlock")
def unlock_sql_hint(
    stage_id: int,
    req: SqlHintUnlockRequest,
    user=Depends(require_user),
    sess=Depends(get_session),
):
    if req.kind not in {"regular", "npc"} or req.index < 0:
        raise HTTPException(status_code=400, detail="Invalid hint")

    stage = sess.get(SqldStage, stage_id)
    if not stage:
        raise HTTPException(status_code=404, detail="Stage not found")

    source = _regular_hints(stage) if req.kind == "regular" else _npc_hints(stage)
    if req.index >= len(source):
        raise HTTPException(status_code=404, detail="Hint not found")

    existing = sess.query(SqldHintUnlock).filter_by(
        user_id=user.id,
        stage_id=stage_id,
        hint_kind=req.kind,
        hint_index=req.index,
    ).first()
    hint = source[req.index]
    cost = int(hint.get("cost_points", hint.get("xp_cost", 0)) or 0)
    if existing:
        return {
            "kind": req.kind,
            "index": req.index,
            "cost": cost,
            "unlocked": True,
            "text": hint.get("text") if req.kind == "regular" else hint.get("dialogue"),
        }

    fresh_user = sess.query(User).filter(User.id == user.id).first()
    if (fresh_user.xp or 0) < cost:
        raise HTTPException(status_code=400, detail="Insufficient XP to unlock hint")

    fresh_user.xp = (fresh_user.xp or 0) - cost
    sess.add(SqldHintUnlock(
        user_id=user.id,
        stage_id=stage_id,
        hint_kind=req.kind,
        hint_index=req.index,
    ))
    sess.commit()
    return {
        "kind": req.kind,
        "index": req.index,
        "cost": cost,
        "unlocked": True,
        "text": hint.get("text") if req.kind == "regular" else hint.get("dialogue"),
    }


# ── POST /stages/{id}/submit ─────────────────────────────────────────────────

@router.post("/stages/{stage_id}/submit", response_model=SqldSubmissionResult)
def submit_sql_query(
    stage_id: int,
    req: SqldSubmissionRequest,
    user=Depends(require_user),
    sess=Depends(get_session),
):
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

    already_solved = bool(
        user and sess.query(SqldSubmission).filter_by(
            stage_id=stage_id, user_id=user.id, correct=True
        ).first()
    )
    xp_awarded = stage.xp_reward if correct and not already_solved else 0

    # Build human-readable feedback
    if correct:
        feedback = "Correct! Your query matches the expected result."
    else:
        feedback = (
            "Not quite. Check the column names and filter conditions."
            + (" (Result was truncated at 500 rows.)" if truncated else "")
        )

    # Award XP only for the first correct solve of a stage.
    # Apply the booster multiplier BEFORE persisting so stored xp_awarded is accurate.
    if xp_awarded and user:
        fresh_user = sess.query(User).filter(User.id == user.id).first()
        multiplier = fresh_user.xp_boost_multiplier or 1
        xp_awarded *= multiplier
        fresh_user.xp = (fresh_user.xp or 0) + xp_awarded
        fresh_user.xp_boost_multiplier = 1

    # Persist submission record (with boosted xp_awarded already set)
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
    if correct and user:
        try:
            from ..api.achievements import check_user_achievements
            check_user_achievements(user.id, sess)
        except Exception:
            pass
    sess.commit()

    return SqldSubmissionResult(
        correct=correct,
        result_rows=actual_rows,
        xp_awarded=xp_awarded,
        feedback=feedback,
    )


# ── GET /my-submissions ─────────────────────────────────────────────────────

@router.get("/my-submissions")
def my_submissions(user=Depends(require_user), sess=Depends(get_session)):
    """Get all SQL submissions for the current authenticated user."""
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
