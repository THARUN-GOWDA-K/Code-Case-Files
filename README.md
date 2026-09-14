<div align="center">

# 🕵️‍♂️ CODE CASE FILES

### _A Noir Detective Coding & SQL Investigation Platform_

[![FastAPI](https://img.shields.io/badge/FastAPI-0.95+-009688.svg?style=for-the-badge&logo=fastapi&logoColor=white)](https://fastapi.tiangolo.com/)
[![React](https://img.shields.io/badge/React-18.2-61DAFB.svg?style=for-the-badge&logo=react&logoColor=black)](https://reactjs.org/)
[![Vite](https://img.shields.io/badge/Vite-5.1+-646CFF.svg?style=for-the-badge&logo=vite&logoColor=white)](https://vitejs.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.5+-3178C6.svg?style=for-the-badge&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Python](https://img.shields.io/badge/Python-3.11+-3776AB.svg?style=for-the-badge&logo=python&logoColor=white)](https://www.python.org/)
[![Docker](https://img.shields.io/badge/Docker-Supported-2496ED.svg?style=for-the-badge&logo=docker&logoColor=white)](https://www.docker.com/)

<p align="center">
  <b>Crack the code. Query the evidence. Uncover the truth.</b><br>
  Turn algorithmic puzzles and SQL databases into immersive, story-driven crime investigations.
</p>

</div>

---

## 🔍 Overview

**Code Case Files** transforms traditional algorithmic challenges and database querying into interactive noir investigations. Players assume the role of a digital detective, analyzing server logs, parsing decrypted data, querying suspect registries, and submitting solution scripts to earn XP and solve cases.

The application features two parallel investigation tracks:

- 🐍 **Python Challenge Path**: Fix, optimize, or write algorithm solutions graded asynchronously against hidden test cases.
- 🗄️ **SQL Detective Path**: Query mock evidence databases in a sandboxed, SELECT-only SQLite environment to uncover suspects and unravel complex criminal plots.

### Current Content

- **Python cases**: 6 seeded cases with 13 playable stages. Every stage has a prompt, description, starter program, executable stdin test cases, and three progressive hints.
- **SQL cases**: 2 YAML-authored cases with 6 stages, each with three regular clues and three NPC advisor clues.
- **Hints**: Both paths use three tiers priced uniformly at 0, 2, and 5 XP. Hint text is authenticated, locked per user until its unlock is persisted, and never returned for a locked tier.
- **Shop**: The intentionally small catalog contains only real effects: Hint Token (5 XP) unlocks the next regular hint on a chosen stage, and XP Booster (10 XP) doubles XP from the next successful Python or SQL solve.

---

## ✨ Key Features & Enhancements

### 🎨 Premium Noir UI & Interactive Design System

- **Dark Aesthetic & Glassmorphism**: Vibrant HSL gold accents (`#fbbf24`), deep space backgrounds (`#050810`), and glassmorphism elements.
- **Cinematic Experience**: Animated split-screen login, typewriter dispatch messages, floating case file badges, and custom badge stamps (`CLEARED`, `CONFIDENTIAL`, `RESTRICTED`).
- **Interactive Code Editor**: Integrated Monaco Editor with syntax highlighting, custom theme matching, auto-completion, and editor chrome controls.
- **Real-Time Toast & Soundless Notifications**: Stacking toast notification system for instant feedback on actions, hints, and error alerts.

### 🐍 Python Path & Asynchronous Execution

- **Asynchronous Execution & Polling**: Celery + Redis worker integration with frontend status polling for real-time grading feedback.
- **Interactive Verdict Panel**: Breakdown of passed/failed test cases, execution stdout/expected output comparisons, and percentage progress bars.
- **Tiered Hint System**: Per-user evidence files with 0/2/5 XP costs, server-side unlock records, and inline text reveal only after authentication.
- **XP Progression**: Automatically awards XP upon solving challenges and updates player profile in real-time.

### 🗄️ SQL Detective Path & Isolated Sandbox

- **SELECT-only Whitelist Sandbox**: In-memory SQLite execution engine preventing destructive queries (DELETE, DROP, UPDATE).
- **YAML-driven Case Authoring**: Declarative case file definitions (`app/sql_cases/case_files/*.yaml`) with automatic schema loader and zero-downtime upsert.
- **Query Results Visualizer**: Formatted data tables with record counters and status indicators.
- **NPC Advisors**: Commissioner Blake, Dr. Maya Chen, and Riya Sharma provide progressive, server-gated clues without handing over complete queries.

### 👤 Detective Dossier & Profile

- **Career Statistics**: Track total XP earned, total cases solved, and breakdowns across Python and SQL paths.
- **Attempt History**: Historical records of all code runs, scores, and SQL submission results.

---

## 🛠️ Architecture & Tech Stack

```
                     ┌──────────────────────────────────────────┐
                     │          React + Vite + TypeScript        │
                     │          Monaco Editor + Modern UI       │
                     └────────────────────┬─────────────────────┘
                                          │  REST API (JWT Auth)
                                          ▼
                     ┌──────────────────────────────────────────┐
                     │          FastAPI Backend (Python)        │
                     │          SQLAlchemy ORM + Pydantic       │
                     └───────┬──────────────────────────┬───────┘
                             │                          │
           Python Path       │                          │  SQL Path
                             ▼                          ▼
                 ┌───────────────────────┐  ┌───────────────────────┐
                 │ Celery Worker + Redis │  │ Sandboxed SQLite Engine│
                 └───────────┬───────────┘  └───────────────────────┘
                             │
                             ▼
                 ┌───────────────────────┐
                 │  Isolated Execution   │
                 └───────────────────────┘
```

### Stack Breakdown

| Layer           | Technology                                                | Description                                                              |
| --------------- | --------------------------------------------------------- | ------------------------------------------------------------------------ |
| **Frontend**    | React 18, TypeScript, Vite, Monaco Editor, React Router 6 | SPA with custom CSS design system, glassmorphism, responsive navigation  |
| **Backend**     | FastAPI 0.95+, Pydantic 1.10+, Python 3.11/3.12           | Asynchronous REST API, CORS middleware, JWT authentication               |
| **Database**    | SQLAlchemy 2.0+, MySQL / SQLite fallback                  | Dual schema support: Core App models + isolated SQL Case models          |
| **Async Tasks** | Celery 5.3+, Redis 4.6+                                   | Background code evaluation and queue handling                            |
| **Sandbox**     | Custom SQLite sandbox / Docker executor                   | Safe query execution engine with keyword whitelisting & execution limits |

---

## 📂 Project Structure

```
Sherlock Coder/
├── backend/
│   ├── app/
│   │   ├── main.py              # FastAPI app initialization, CORS, lifespan & health check
│   │   ├── models.py            # Core SQLAlchemy models, unlock records, and shop inventory
│   │   ├── schemas.py           # Pydantic validation schemas
│   │   ├── auth.py              # JWT authentication & password hashing logic
│   │   ├── tasks.py             # Celery task definitions
│   │   ├── api/                 # API endpoint routers
│   │   │   ├── challenges.py    # Python challenge path endpoints
│   │   │   ├── submissions.py   # Code execution submission & polling
│   │   │   ├── hints.py         # Hint unlock & reveal system
│   │   │   └── auth.py          # User authentication endpoints
│   │   ├── workers/
│   │   │   └── grader.py        # Submission evaluator & XP distributor
│   │   └── sql_cases/           # Standalone SQL Detective Module
│   │       ├── router.py        # SQL cases endpoints
│   │       ├── sandbox.py       # SELECT-only SQLite execution sandbox
│   │       ├── loader.py        # YAML case files auto-loader
│   │       └── case_files/      # Case file definitions (.yaml)
│   └── requirements.txt         # Backend Python dependencies
├── frontend/
│   ├── src/
│   │   ├── components/          # Reusable components (Nav, Toast, Editor, ProtectedRoute)
│   │   ├── contexts/            # React Contexts (AuthContext, ToastContext)
│   │   ├── pages/               # App views (Login, Signup, ChallengeList, SqlCaseView, Profile, 404)
│   │   ├── lib/                 # API client utilities (api.ts, sqlCases.ts, auth.ts)
│   │   ├── index.css            # Custom Noir Design System & Animations
│   │   └── App.tsx              # Central Router configuration
│   ├── package.json
│   └── vite.config.ts
├── docker-compose.yml           # Production & multi-container orchestration
└── README.md
```

---

## ⚡ Quick Start Guide

### Prerequisites

- **Python 3.11+**
- **Node.js 18+** & **npm**
- _(Optional)_ **Redis** & **Docker** for asynchronous Python challenge evaluation

---

### 1️⃣ Backend Setup

```bash
# Navigate to backend directory
cd backend

# Install Python dependencies
pip install -r requirements.txt

# Start the FastAPI server
python -m uvicorn app.main:app --reload --port 8000 --host 127.0.0.1
```

> **Important after pulling schema changes**: from `backend/`, run `python app/reset_db.py --yes`. This performs a full drop, recreate, and reseed; `--yes` is required as a destructive-operation safety guard.

> **SQLite fallback**: when `DATABASE_URL` is omitted, SQLite is anchored to `backend/dev.db` regardless of the invocation directory. Run backend commands from `backend/` for consistent imports and operational paths.

> The backend automatically initializes the anchored SQLite fallback when `DATABASE_URL` is omitted and seeds all programming and SQL case files on startup.

---

### 2️⃣ Frontend Setup

```bash
# Navigate to frontend directory
cd frontend

# Install Node dependencies
npm install

# Start the Vite development server
npm run dev
```

Visit **[http://localhost:3000](http://localhost:3000)** in your browser to launch the Detective Terminal!

---

## 🌐 API Overview

| Method | Endpoint                                  | Description                                        | Auth Required |
| ------ | ----------------------------------------- | -------------------------------------------------- | :-----------: |
| `POST` | `/api/auth/signup`                        | Register a new detective account                   |      ❌       |
| `POST` | `/api/auth/login`                         | Authenticate and retrieve JWT token                |      ❌       |
| `GET`  | `/api/auth/me`                            | Fetch active user profile and XP                   |      ✅       |
| `GET`  | `/api/challenges/`                        | List all available programming cases               |      ❌       |
| `GET`  | `/api/challenges/{id}`                    | Get detailed case & stage information              |      ❌       |
| `POST` | `/api/submissions/`                       | Submit code for asynchronous evaluation            |      ✅       |
| `GET`  | `/api/submissions/{task_id}`              | Poll grading task status and test details          |      ✅       |
| `GET`  | `/api/sql-cases/cases`                    | List all SQL detective cases                       |      ❌       |
| `GET`  | `/api/sql-cases/stages/{id}`              | Get an authenticated, personalized SQL stage       |      ✅       |
| `GET`  | `/api/hints/stage/{id}`                   | List authenticated hint metadata and unlocked text |      ✅       |
| `POST` | `/api/hints/unlock`                       | Unlock a Python hint tier and deduct its cost      |      ✅       |
| `POST` | `/api/sql-cases/stages/{id}/hints/unlock` | Unlock a SQL clue or advisor hint                  |      ✅       |
| `GET`  | `/api/shop/items`                         | List active shop items                             |      ❌       |
| `POST` | `/api/shop/purchase/{id}`                 | Purchase a shop item                               |      ✅       |
| `POST` | `/api/shop/use/{inventory_id}`            | Consume a Hint Token or XP Booster                 |      ✅       |
| `POST` | `/api/sql-cases/stages/{id}/submit`       | Execute and evaluate SQL query                     |      ✅       |
| `GET`  | `/api/attempts/me`                        | Fetch user attempt history                         |      ✅       |
| `GET`  | `/health`                                 | Server health check endpoint                       |      ❌       |

---

## 📜 License & Credits

Built with ❤️ by [THARUN GOWDA K](https://github.com/THARUN-GOWDA-K) as part of the **Code Case Files** project.

<div align="center">
  <sub>Designed for developers who love puzzles, SQL mysteries, and clean code.</sub>
</div>
