from .celery_app import celery
from .workers import grader


@celery.task(bind=True)
def grade_submission_task(self, stage_id: int, language: str, source: str, user_id: int | None = None):
    # Delegate to grader implementation
    result = grader.grade_submission(stage_id=stage_id, language=language, source=source, user_id=user_id)
    return result
