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


def _normalise(rows: List[Dict[str, Any]]) -> List[frozenset]:
    """Convert rows to frozensets of items for order-insensitive comparison."""
    return [frozenset((k, str(v)) for k, v in row.items()) for row in rows]


def compare_results(
    actual: List[Dict[str, Any]],
    expected: List[Dict[str, Any]],
    order_sensitive: bool = False,
) -> bool:
    """Return True if actual matches expected."""
    if order_sensitive:
        return actual == expected
    return sorted(_normalise(actual), key=str) == sorted(_normalise(expected), key=str)
