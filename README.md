# Code Case Files — Detective Coding Game (MVP → Production)

Overview
--------
Code Case Files is a coding-focused detective game that turns programming challenges into story-driven case investigations. Players solve coding puzzles (Python for MVP) inside narrative stages to reveal clues, earn XP, and progress toward a final accusation.

This repository contains an MVP implementation with:
- Frontend: React + TypeScript + Vite + Monaco Editor
- Backend: FastAPI (Python) with SQLAlchemy models
- Execution: self-hosted Docker-based executor (dev) and Celery tasks for asynchronous grading
- Data: MySQL (recommended) or SQLite for quick dev
- Async queue: Redis + Celery

Key features implemented
------------------------
- Case, Stage, Challenge data model (seeded sample case)
- Embedded Monaco code editor in the frontend
- Submission API (`/api/submissions`) that enqueues grading jobs
- Grader worker (Celery) that runs submitted code inside ephemeral Docker containers (network disabled, resource limits)
- Tiered hint system with unlock and XP cost
- User auth (signup/login), JWT-based tokens, and `GET /api/auth/me`
- Attempts persistence and `GET /api/attempts/me` for user history
- Basic admin/dev scripts to seed cases and create a test user

Project layout
--------------
- `backend/` — FastAPI app, models, API routes, Celery tasks, grader and executors
	- `app/main.py` — FastAPI entrypoint
	- `app/models.py` — SQLAlchemy models
	- `app/api/` — REST endpoints: `challenges`, `submissions`, `hints`, `attempts`, `auth`
	- `app/executors/` — `docker_executor.py` (runs code in containers)
	- `app/workers/` — `grader.py` (grading logic)
	- `app/celery_app.py`, `app/tasks.py` — Celery configuration & tasks
- `frontend/` — Vite + React app with Monaco integration
	- `src/pages/ChallengeView.tsx` — Editor + Run/Submit + Hints
	- `src/pages/Profile.tsx` — User XP & attempt history
- `scripts/` — small helper scripts: `seed_sample_case.py`, `create_test_user.py`, `run_playthrough.py`
- `docker-compose.yml` — local dev stack (Postgres, Redis, backend, Celery worker)

Getting started (local development)
---------------------------------
Prereqs: Docker (for MySQL/Redis and for executing code during grading), Python 3.11+, Node.js & npm (for frontend).

1) Start only DB and Redis (recommended for Windows dev so Celery/worker runs on host):

```powershell
# from repo root
docker-compose up -d db redis
```

2) Backend: create venv, install deps, and run locally

```powershell
cd backend
python -m venv .venv
.venv\Scripts\activate
pip install -r requirements.txt
# set env vars (PowerShell)
$env:DATABASE_URL = "mysql+pymysql://codecase:codecase@localhost:3306/codecase"
$env:CELERY_BROKER_URL = "redis://localhost:6379/0"
$env:CELERY_RESULT_BACKEND = "redis://localhost:6379/0"
$env:SECRET_KEY = "dev-secret"
uvicorn app.main:app --reload --port 8000
```

3) Start Celery worker (in another shell, same venv + env):

```powershell
cd backend
.venv\Scripts\activate
# ensure env vars as above
celery -A app.celery_app.celery worker --loglevel=info
```

4) Seed sample case and create test user (backend shell):

```powershell
python ..\scripts\seed_sample_case.py
python ..\scripts\create_test_user.py
```

5) Frontend: install and start

```powershell
cd ..\frontend
npm install
npm run dev
# open http://localhost:3000
```

6) Run a playthrough (submits code to backend)

```powershell
cd ..\scripts
python run_playthrough.py
# note the returned task_id and poll
curl "http://localhost:8000/api/submissions/<task_id>"
```

Notes for Docker execution
--------------------------
- The grader currently uses a host Docker CLI-based executor for running code in ephemeral containers. For local dev the `worker` can be run on the host (recommended) to avoid mounting Docker socket inside containers on Windows. The `docker-compose.yml` includes a `worker` service that mounts `/var/run/docker.sock` (Linux/macOS only).
- For production, do NOT mount host Docker socket into app containers. Instead use a dedicated execution cluster or a specialized isolation technology (gVisor, Firecracker, Isolate) and run graders in a separate, hardened environment.

Security considerations
-----------------------
- Hidden tests are stored and executed server-side; the API returns aggregated results — do not expose hidden inputs/outputs.
- Enforce strict resource limits on graders: CPU, memory, pids, and wall-timeouts.
- Use network isolation (`--network none`) for execution containers and read-only mounts.
- Store secrets in a secrets manager (Vault, cloud secret manager) and rotate keys; set `SECRET_KEY` in production.
- Add rate-limits, per-user concurrency caps, and monitoring to detect abuse.

Production & deployment notes
----------------------------
- Recommended production stack: MySQL managed DB, Redis (managed), Kubernetes or managed container platform (Fly.io, Cloud Run, Render), and a dedicated executor pool.
- CI: add GitHub Actions to run tests, build images, and deploy.
- Observability: Sentry for errors, Prometheus/Grafana for metrics, and centralized logs (ELK or a managed alternative).

Roadmap / Next steps
--------------------
1. Harden the execution environment (migrate to gVisor/Firecracker or a managed judge service).
2. Add Java support and language selection per-case.
3. Build an admin case-builder UI and import tool for new cases.
4. Improve hint/adaptive hinting telemetry and player progression algorithms.
5. Add tests (unit, integration, E2E) and CI/CD for production launch.

Support
-------
If you run into issues during local setup, gather the relevant logs and paste them here: `docker-compose ps`, `docker-compose logs backend --tail=200`, `docker-compose logs worker --tail=200`, and console output from the backend or Celery worker.

License
-------
This project scaffold is provided as-is for educational and prototype purposes.

