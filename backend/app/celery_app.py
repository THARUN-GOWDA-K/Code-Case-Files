import os
from celery import Celery

BROKER = os.environ.get("CELERY_BROKER_URL", os.environ.get("BROKER_URL", "redis://redis:6379/0"))
BACKEND = os.environ.get("CELERY_RESULT_BACKEND", BROKER)

celery = Celery("codecase", broker=BROKER, backend=BACKEND)

# Optional: configure Celery from environment or config module
celery.conf.task_routes = {}
