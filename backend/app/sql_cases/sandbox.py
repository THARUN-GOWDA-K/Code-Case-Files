"""
SQL sandbox: executes a player-submitted SELECT query against a fresh in-memory
SQLite database populated from a stage's schema_sql + seed_sql.

Security model:
- Keyword blacklist rejects anything other than a single SELECT statement.
- Query timeout enforced via threading.Timer.
- Result rows capped at MAX_ROWS.
- Comparison against expected_result is order-insensitive by default.
"""

import sqlite3
import threading
import re
from typing import Any, Dict, List, Tuple

MAX_ROWS = 500
TIMEOUT_SECONDS = 3

# Words that must not appear anywhere in the submitted query (case-insensitive).
# We check whole-word boundaries to avoid false positives on e.g. "selected".
BLACKLISTED_KEYWORDS = [
    "INSERT", "UPDATE", "DELETE", "DROP", "ALTER",
    "CREATE", "ATTACH", "DETACH", "PRAGMA", "REPLACE",
    "TRUNCATE", "VACUUM", "REINDEX", "ANALYZE",
]

_BLACKLIST_RE = re.compile(
    r"\b(" + "|".join(BLACKLISTED_KEYWORDS) + r")\b",
    re.IGNORECASE,
)

# Reject multiple statements (simple check: a semicolon that isn't at the very end)
_MULTI_STMT_RE = re.compile(r";(?!\s*$)")


class SandboxError(ValueError):
    """Raised when the query is rejected before execution."""


class SandboxTimeout(RuntimeError):
    """Raised when the query exceeds TIMEOUT_SECONDS."""


def _validate_query(query: str) -> None:
    """Raise SandboxError if the query looks unsafe."""
    stripped = query.strip()
    if not stripped:
        raise SandboxError("Query is empty.")

    if _BLACKLIST_RE.search(stripped):
        raise SandboxError(
            "Only SELECT statements are allowed. "
            "Forbidden keyword detected in query."
        )

    if _MULTI_STMT_RE.search(stripped):
        raise SandboxError("Only a single statement is allowed per submission.")

    if not re.match(r"^\s*SELECT\b", stripped, re.IGNORECASE):
        raise SandboxError("Query must begin with SELECT.")


def _run_query_thread(
    schema_sql: str,
    seed_sql: str,
    query: str,
    result_container: list,
    error_container: list,
) -> None:
    """Executed in a daemon thread so we can apply a wall-clock timeout."""
    try:
        conn = sqlite3.connect(":memory:")
        conn.row_factory = sqlite3.Row
        cur = conn.cursor()

        # Build the sandbox schema and load seed data
        if schema_sql:
            cur.executescript(schema_sql)
        if seed_sql:
            cur.executescript(seed_sql)

        cur.execute(query)
        columns = [d[0] for d in cur.description] if cur.description else []
        raw_rows = cur.fetchmany(MAX_ROWS + 1)

        truncated = len(raw_rows) > MAX_ROWS
        rows = [dict(zip(columns, row)) for row in raw_rows[:MAX_ROWS]]

        conn.close()
        result_container.append({"rows": rows, "truncated": truncated})
    except Exception as exc:  # noqa: BLE001
        error_container.append(exc)


def run_query(
    schema_sql: str,
    seed_sql: str,
    query: str,
) -> Tuple[List[Dict[str, Any]], bool]:
    """
    Execute *query* against a fresh in-memory SQLite DB.
    Returns (rows, truncated_flag).
    Raises SandboxError, SandboxTimeout, or re-raises sqlite3 errors.
    """
    _validate_query(query)

    result: list = []
    error: list = []

    thread = threading.Thread(
        target=_run_query_thread,
        args=(schema_sql, seed_sql, query, result, error),
        daemon=True,
    )
    thread.start()
    thread.join(timeout=TIMEOUT_SECONDS)

    if thread.is_alive():
        raise SandboxTimeout(
            f"Query exceeded the {TIMEOUT_SECONDS}s time limit."
        )

    if error:
        raise error[0]

    if result:
        return result[0]["rows"], result[0]["truncated"]

    return [], False


def _normalise_value(v: Any) -> str:
    """Normalize a value for comparison: booleans → int string, everything else → str."""
    if isinstance(v, bool):
        return str(int(v))
    return str(v)


def _normalise(rows: List[Dict[str, Any]]) -> List[frozenset]:
    """Convert rows to frozensets of (key, normalised_string_value) pairs."""
    return [frozenset((k, _normalise_value(v)) for k, v in row.items()) for row in rows]


def _normalise_expected(rows: List[Dict[str, Any]]) -> List[Dict[str, Any]]:
    """Convert YAML-loaded expected rows: Python booleans → integers."""
    out = []
    for row in rows:
        out.append({
            k: (1 if v is True else 0 if v is False else v)
            for k, v in row.items()
        })
    return out


def compare_results(
    actual: List[Dict[str, Any]],
    expected: List[Dict[str, Any]],
    order_sensitive: bool = False,
) -> bool:
    """
    Return True if actual matches expected.

    Improvements over naive equality:
    - Only checks the columns present in expected_result (extra columns in
      the player's query are ignored, so SELECT * still passes).
    - Normalises Python booleans from YAML (True/False) to integers (1/0)
      before comparison so they match SQLite's INTEGER storage.
    """
    if not expected and not actual:
        return True
    if not expected or not actual:
        return False

    # Normalise YAML booleans in expected result
    norm_expected = _normalise_expected(expected)

    # Determine which columns we care about (from first expected row)
    expected_keys = set(norm_expected[0].keys())

    # Project actual rows to only the expected columns
    projected_actual = [
        {k: v for k, v in row.items() if k in expected_keys}
        for row in actual
    ]

    # Row count must match
    if len(projected_actual) != len(norm_expected):
        return False

    if order_sensitive:
        return _normalise(projected_actual) == _normalise(norm_expected)
    return sorted(_normalise(projected_actual), key=str) == sorted(_normalise(norm_expected), key=str)

