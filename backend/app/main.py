from dotenv import load_dotenv; load_dotenv()  # load backend/.env before os.environ.get() calls
from fastapi import FastAPI
from .api import challenges, runs, submissions
from .auth import router as auth_router
from .models import create_tables, Case, session_scope
from .api import attempts
from .sql_cases.router import router as sql_cases_router
from .sql_cases.loader import load_all_cases
from .sql_cases.models import SqldCase

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
    
    # Only seed if tables are empty (fresh database)
    with session_scope() as sess:
        case_count = sess.query(Case).count()
        sqld_case_count = sess.query(SqldCase).count()
    
    if case_count == 0 and sqld_case_count == 0:
        print("[startup] Fresh database detected — running initial seed...")
        load_all_cases()
        try:
            from .seed_cases import seed_additional_cases
            seed_additional_cases()
        except Exception as e:
            print(f"Warning: Could not seed additional cases: {e}")
        try:
            from .services.cases import seed_sample_case
            seed_sample_case()
        except Exception as e:
            print(f"Warning: Could not seed sample case: {e}")
    else:
        print("[startup] Existing data found — skipping seed.")


@app.get("/")
def root():
    return {"status": "ok", "service": "code-case-files"}
