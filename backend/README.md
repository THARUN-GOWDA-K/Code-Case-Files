# Backend (FastAPI) — Code Case Files

Quick start (local dev with SQLite):

1. Create and activate a Python virtualenv (Python 3.10+)

```bash
python -m venv .venv
source .venv/bin/activate  # or .venv\Scripts\activate on Windows
pip install -r requirements.txt
```

2. Start the FastAPI app:

```bash
uvicorn app.main:app --reload --port 8000
```

3. Seed the sample case:

```bash
python scripts\seed_sample_case.py
```
