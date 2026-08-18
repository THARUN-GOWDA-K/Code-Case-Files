import os
import requests

JUDGE0_URL = os.environ.get("JUDGE0_URL", "https://judge0-ce.p.rapidapi.com")
# If using the public Judge0 CE that supports /submissions?wait=true

LANGUAGE_MAP = {
    "python": 71,  # Judge0 language id for Python (may differ across instances)
}


def run_code(source: str, language: str, stdin: str = "", timeout_seconds: int = 2):
    """Submit code to Judge0 and wait for result. Returns dict with stdout, stderr, status."""
    lang_id = LANGUAGE_MAP.get(language.lower())
    if not lang_id:
        raise ValueError("Unsupported language")

    payload = {
        "source_code": source,
        "language_id": lang_id,
        "stdin": stdin,
        "cpu_time_limit": timeout_seconds,
    }

    url = JUDGE0_URL.rstrip("/") + "/submissions?wait=true"
    headers = {"Content-Type": "application/json"}
    # Optional: set API key headers via env if using RapidAPI or auth'd judge0
    api_key = os.environ.get("JUDGE0_API_KEY")
    if api_key:
        headers["X-RapidAPI-Key"] = api_key

    resp = requests.post(url, json=payload, headers=headers, timeout=10)
    resp.raise_for_status()
    return resp.json()
