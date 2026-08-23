# Code Case Files — Detective Coding Game (MVP → Production)

## Overview

Code Case Files is a coding-focused detective game that turns programming
challenges into story-driven case investigations. Players solve coding
puzzles and SQL mysteries inside narrative stages to reveal clues, earn XP,
and progress toward a final accusation.

This repository contains two parallel investigation paths:

- **Python challenge path** — fix/write code to pass hidden test cases
- **SQL detective path** — query mock evidence databases to solve mysteries

Stack:

- **Frontend:** React + TypeScript + Vite + Monaco Editor
- **Backend:** FastAPI (Python) with SQLAlchemy models
- **Execution:** self-hosted Docker-based executor (Python path) + sandboxed
  in-memory SQLite execution (SQL path)
- **Async grading:** Celery + Redis (Python path only)
- **Data:** MySQL (primary), SQLite fallback for quick local dev
- **Auth:** JWT-based, full login gate across the app

## Key features implemented

**Python challenge path**

- Case, Stage, Challenge data model (seeded sample case)
- Embedded Monaco code editor in the frontend
- Submission API (`/api/submissions`) that enqueues grading jobs
- Grader worker (Celery) runs submitted code inside ephemeral Docker
  containers (network disabled, resource limits)
- Tiered hint system with unlock and XP cost

**SQL detective path**

- Isolated module (`app/sql_cases/`) with its own `sqld_`-prefixed tables —
  no shared schema with the Python path
- Sandboxed SQL execution: SELECT-only whitelist, query timeout, row limit,
  fresh in-memory SQLite per submission (not the main app database)
- Case content authored as YAML (`app/sql_cases/case_files/*.yaml`)
- True upsert-on-load by `(case_id, slug)` — case content can be edited and
  reloaded without breaking existing user submissions
- First working case: **"The Missing Funds"** (3 stages)

**Shared**

- User auth (signup/login), JWT-based tokens, `GET /api/auth/me`
- Entire app gated behind login — no page is browsable without an account
- Attempts persistence and `GET /api/attempts/me` for user history
- Noir detective-themed UI across all pages
- Basic admin/dev scripts to seed cases and create a test user

## Project layout

backend/
├── app/
│ ├── main.py # FastAPI entrypoint, router registration
│ ├── models.py # Core SQLAlchemy models (Case, Stage, User, etc.)
│ ├── auth.py # JWT auth: signup, login, get_current_user
│ ├── api/ # REST endpoints: challenges, runs, submissions,
│ │ # hints, attempts, auth
│ ├── executors/ # docker_executor.py (Python code execution)
│ ├── workers/ # grader.py (Celery grading logic)
│ ├── celery_app.py, tasks.py
│ └── sql_cases/ # SQL detective path (isolated module)
│ ├── models.py # SqldCase, SqldStage, SqldSubmission
│ ├── schemas.py
│ ├── router.py # /api/sql-cases/_
│ ├── sandbox.py # sandboxed SELECT-only execution
│ ├── loader.py # YAML → DB upsert on startup
│ └── case_files/ # _.yaml case definitions
│ └── case_001.yaml
├── scripts/ # seed_sample_case.py, create_test_user.py,
│ # run_playthrough.py
├── requirements.txt
└── .env.example # copy to .env and fill in real values

frontend/
├── src/
│ ├── pages/
│ │ ├── ChallengeList.tsx, ChallengeView.tsx # Python path
│ │ ├── SqlCaseList.tsx, SqlCaseView.tsx, # SQL path
│ │ │ SqlStageView.tsx
│ │ ├── Login.tsx, Signup.tsx
│ │ └── Profile.tsx
│ ├── lib/
│ │ ├── api.ts, sqlCases.ts # API clients
│ │ └── auth.ts # token storage, authenticatedFetch
│ ├── context/
│ │ └── AuthContext.tsx # auth state, memoized provider
│ ├── components/
│ │ └── ProtectedRoute.tsx
│ ├── App.tsx, main.tsx
│ └── vite.config.ts # dev proxy → backend :8000
└── package.json

docker-compose.yml # local dev stack (MySQL, Redis, backend, worker)

## Getting started (local development)

Prereqs: MySQL (locally installed or via Docker), Redis + Docker (for Python
path grading), Python 3.11+ (note: Python 3.12 requires `pydantic>=1.10.13`
— see Known Issues), Node.js & npm.

### 1) Create the MySQL database

Run in your MySQL shell:

```sql
CREATE DATABASE codecase CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
```

If using a dedicated app user instead of `root`:

```sql
CREATE USER 'codecase'@'localhost' IDENTIFIED BY 'codecase';
GRANT ALL PRIVILEGES ON codecase.* TO 'codecase'@'localhost';
FLUSH PRIVILEGES;
```

> On MySQL 8+, if you hit an auth-plugin error later when connecting via
> PyMySQL: `ALTER USER 'codecase'@'localhost' IDENTIFIED WITH mysql_native_password BY 'codecase'; FLUSH PRIVILEGES;`

### 2) Backend: environment setup

```powershell
cd backend
python -m venv .venv
.venv\Scripts\activate
pip install -r requirements.txt
```

Copy `.env.example` to `.env` and fill in your real values:

```dotenv
DATABASE_URL=mysql+pymysql://root:YOUR_PASSWORD@localhost:3306/codecase
CELERY_BROKER_URL=redis://localhost:6379/0
CELERY_RESULT_BACKEND=redis://localhost:6379/0
SECRET_KEY=dev-secret-change-me
```

> No password? Use `root:@localhost` (empty password) between the colons.
> No `DATABASE_URL` set at all? Falls back to `sqlite:///./dev.db` for quick
> testing without MySQL running.

### 3) Start Redis (for Python path grading)

```powershell
docker-compose up -d redis
```

### 4) Start the backend

```powershell
cd backend
.venv\Scripts\activate
uvicorn app.main:app --reload --port 8000
```

On startup this will:

- Create all tables (`create_tables()`) — including `sqld_*` tables
- Seed/upsert SQL case content from YAML (`load_all_cases()`)

Watch for `[sql_cases.loader] Loaded N case file(s).` to confirm it worked.

### 5) Start the Celery worker (Python path only)

```powershell
cd backend
.venv\Scripts\activate
celery -A app.celery_app.celery worker --loglevel=info
```

### 6) Seed the Python path + create a test user

```powershell
python ..\scripts\seed_sample_case.py
python ..\scripts\create_test_user.py
```

### 7) Frontend

```powershell
cd ..\frontend
npm install
npm run dev
# open http://localhost:3000 (or Vite's chosen port, e.g. 5173)
```

The whole app is login-gated — you'll land on `/login` first. Sign up, then
explore both the Challenges and SQL Cases sections.

### 8) Sanity-check the SQL path directly

```powershell
curl http://localhost:8000/api/sql-cases/cases
```

Should return JSON including `case-001-the-missing-funds`.

## Known issues

- `Toast is not defined` error fires on successful login — cosmetic,
  doesn't block the flow, needs a follow-up fix.
- No automated tests yet for the SQL cases module.
- Windows + Node 17+: if you see `ECONNREFUSED ::1:8000` from Vite's proxy,
  it's an IPv6 (`::1`) vs IPv4 (`127.0.0.1`) loopback mismatch — set the
  proxy target in `vite.config.ts` to `http://127.0.0.1:8000` explicitly.
- Python 3.12 requires `pydantic>=1.10.13,<2.0` — earlier 1.10.x versions
  break due to a `ForwardRef._evaluate()` signature change.
- `bcrypt` is pinned to `4.0.1` for `passlib` compatibility — newer bcrypt
  versions removed silent password truncation and break passlib's calling
  convention.

## Notes for Docker execution (Python path)

- The grader uses a host Docker CLI-based executor for running code in
  ephemeral containers. For local dev, run the `worker` on the host
  (recommended) to avoid mounting the Docker socket inside containers on
  Windows.
- For production, do **not** mount the host Docker socket into app
  containers. Use a dedicated execution cluster or an isolation technology
  (gVisor, Firecracker, Isolate) and run graders in a separate, hardened
  environment.

## Security considerations

- Hidden tests are stored and executed server-side; the API returns
  aggregated results only.
- Both execution paths enforce strict resource limits: CPU, memory, wall-
  timeouts, and (Python path) network isolation via `--network none`.
- The SQL sandbox whitelists `SELECT`-only queries with a keyword blacklist
  (`INSERT`, `UPDATE`, `DELETE`, `DROP`, `ALTER`, `ATTACH`, `PRAGMA`, etc.),
  query timeout, and row limit, executed against an ephemeral in-memory
  SQLite database — never against the main app database.
- Store secrets in a secrets manager for production; rotate `SECRET_KEY`.
- Add rate-limits and per-user concurrency caps before production launch.

## Production & deployment notes

- Recommended stack: managed MySQL, managed Redis, Kubernetes or a managed
  container platform (Fly.io, Cloud Run, Render), dedicated executor pool
  for the Python grader.
- No Alembic migrations are wired up yet — schema changes currently require
  manual `ALTER TABLE` statements against MySQL (see git history for
  examples from the `slug` column migration).
- CI: add GitHub Actions to run tests, build images, and deploy.
- Observability: Sentry for errors, Prometheus/Grafana for metrics,
  centralized logging.

## Roadmap / Next steps

1. Fix the login `Toast` reference error.
2. Add Alembic for real schema migrations instead of manual `ALTER TABLE`.
3. Harden Python execution (migrate to gVisor/Firecracker or a managed
   judge service).
4. Wire SQL case submissions into the Profile XP/history view.
5. Write a second SQL case; expand the DSA/Python path.
6. Add tests (unit, integration, E2E) and CI/CD for production launch.

## Support

If you run into issues during local setup, gather the relevant logs and
share them: backend terminal output, `docker-compose logs redis --tail=200`,
and the browser console for any frontend errors.

## License

This project scaffold is provided as-is for educational and prototype
purposes.
