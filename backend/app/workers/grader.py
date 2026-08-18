from ..models import get_session, Attempt, TestCase
from ..executors.docker_executor import run_code_in_docker


def grade_submission(stage_id: int, language: str, source: str, user_id: int | None = None):
    """Grade the given source against visible+hidden tests for the stage.
    Returns aggregated result and per-test details."""
    sess = get_session()
    tests = sess.query(TestCase).filter(TestCase.stage_id == stage_id).all()
    total = len(tests)
    passed = 0
    details = []

    for t in tests:
        res = run_code_in_docker(source=source, language=language, stdin=t.input or "")
        out = (res.get("stdout") or "").strip()
        expected = (t.expected_output or "").strip()
        ok = out == expected
        if ok:
            passed += 1
        details.append({"test_id": t.id, "passed": ok, "stdout": out, "expected": expected})

    score = passed / total if total else 0

    # Persist attempt record
    att = Attempt(user_id=user_id, stage_id=stage_id, language=language, source_code=source,
                  status="graded", score=int(score * 100), tests_passed=passed, total_tests=total)
    sess.add(att)
    sess.commit()

    return {"score": score, "passed": passed, "total": total, "details": details, "attempt_id": att.id}
