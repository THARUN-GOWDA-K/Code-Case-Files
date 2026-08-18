from fastapi import FastAPI
from .api import challenges, runs, submissions
from .auth import router as auth_router
from .models import create_tables
from .api import attempts

app = FastAPI(title="Code Case Files API")

app.include_router(challenges.router, prefix="/api/challenges")
app.include_router(runs.router, prefix="/api/runs")
app.include_router(submissions.router, prefix="/api/submissions")
app.include_router(auth_router, prefix="/api/auth")
from .api import hints
app.include_router(hints.router, prefix="/api/hints")
app.include_router(attempts.router, prefix="/api/attempts")


@app.on_event("startup")
def on_startup():
    # Create tables for dev (uses DATABASE_URL env var or sqlite file)
    create_tables()


@app.get("/")
def root():
    return {"status": "ok", "service": "code-case-files"}
