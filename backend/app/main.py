from dotenv import load_dotenv; load_dotenv()  # load backend/.env before os.environ.get() calls
from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from .api import challenges, runs, submissions
from .auth import router as auth_router
from .models import create_tables, Case, session_scope
from .api import attempts
from .sql_cases.router import router as sql_cases_router
from .sql_cases.loader import load_all_cases
from .sql_cases.models import SqldCase
from .api.shop import router as shop_router, seed_shop_items
from .api.leaderboard import router as leaderboard_router
from .api.achievements import router as achievements_router, seed_achievements


@asynccontextmanager
async def lifespan(app: FastAPI):
    # Create tables for dev (uses DATABASE_URL env var or sqlite file)
    create_tables()
    
    # Seed each data set independently so a partially initialized database heals.
    with session_scope() as sess:
        case_count = sess.query(Case).count()
        sqld_case_count = sess.query(SqldCase).count()

    if sqld_case_count == 0:
        load_all_cases()
        print("[startup] SQL cases seeded.")
    if case_count == 0:
        from .seed_cases import seed_additional_cases
        from .services.cases import seed_sample_case
        seed_additional_cases()
        seed_sample_case()
        print("[startup] Programming cases seeded.")
    seed_shop_items()
    seed_achievements()
    yield


app = FastAPI(title="Code Case Files API", lifespan=lifespan)

app.add_middleware(
    CORSMiddleware,
    allow_origins=['*'],
    allow_credentials=True,
    allow_methods=['*'],
    allow_headers=['*'],
)

app.include_router(challenges.router, prefix="/api/challenges")
app.include_router(runs.router, prefix="/api/runs")
app.include_router(submissions.router, prefix="/api/submissions")
app.include_router(auth_router, prefix="/api/auth")
from .api import hints
app.include_router(hints.router, prefix="/api/hints")
app.include_router(attempts.router, prefix="/api/attempts")
app.include_router(sql_cases_router, prefix="/api/sql-cases")
app.include_router(shop_router, prefix="/api/shop")
app.include_router(leaderboard_router, prefix="/api/leaderboard")
app.include_router(achievements_router, prefix="/api/achievements")


@app.get("/")
def root():
    return {"status": "ok", "service": "code-case-files"}


@app.get("/health")
def health():
    return {"status": "ok"}
