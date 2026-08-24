from dotenv import load_dotenv; load_dotenv()  # load backend/.env before os.environ.get() calls
from fastapi import FastAPI
from .api import challenges, runs, submissions
from .auth import router as auth_router
from .models import create_tables
from .api import attempts
from .sql_cases.router import router as sql_cases_router
from .sql_cases.loader import load_all_cases

app = FastAPI(title="Code Case Files API")

app.include_router(challenges.router, prefix="/api/challenges")
app.include_router(runs.router, prefix="/api/runs")
app.include_router(submissions.router, prefix="/api/submissions")
app.include_router(auth_router, prefix="/api/auth")
from .api import hints
app.include_router(hints.router, prefix="/api/hints")
app.include_router(attempts.router, prefix="/api/attempts")
app.include_router(sql_cases_router, prefix="/api/sql-cases")


@app.on_event("startup")
def on_startup():
    # Create tables for dev (uses DATABASE_URL env var or sqlite file)
    create_tables()
    # Upsert SQL-detective case definitions from YAML files
    load_all_cases()
    # Seed additional challenge cases (if needed)
    try:
        from .seed_cases import seed_additional_cases
        seed_additional_cases()
    except Exception as e:
        print(f"Warning: Could not seed additional cases: {e}")


@app.get("/")
def root():
    return {"status": "ok", "service": "code-case-files"}
