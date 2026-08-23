"""
Case file loader for the SQL-detective-case module.

Reads YAML files from app/sql_cases/case_files/*.yaml and upserts
SqldCase + SqldStage rows using the existing app.models.get_session() pattern.

Usage:
    # Called automatically on app startup (see main.py), or manually:
    python -m app.sql_cases.loader

YAML file structure expected:
    slug: "case-001-the-missing-funds"
    title: "The Missing Funds"
    story_intro: "..."
    difficulty: "easy"
    stages:
      - slug: "who-was-there"
        order: 1
        title: "..."
        prompt: "..."
        schema_description: "..."
        schema_sql: |
          CREATE TABLE ...
        seed_sql: |
          INSERT INTO ...
        expected_result:
          - column_a: value
            column_b: value
        order_sensitive: false
        xp_reward: 10
        hints:
          - "Try filtering by date."
"""

import os
import glob
import yaml

from ..models import get_session
from .models import SqldCase, SqldStage

# Directory containing *.yaml case definitions (relative to this file)
_CASE_FILES_DIR = os.path.join(os.path.dirname(__file__), "case_files")


def load_all_cases() -> None:
    """
    Upsert all YAML case files into the database.
    Existing cases (matched by slug) are updated in-place.
    New cases are inserted.
    """
    pattern = os.path.join(_CASE_FILES_DIR, "*.yaml")
    yaml_files = sorted(glob.glob(pattern))

    if not yaml_files:
        print(f"[sql_cases.loader] No YAML files found in {_CASE_FILES_DIR}")
        return

    sess = get_session()

    for path in yaml_files:
        _upsert_case_file(sess, path)

    sess.commit()
    print(f"[sql_cases.loader] Loaded {len(yaml_files)} case file(s).")


def _upsert_case_file(sess, path: str) -> None:
    with open(path, encoding="utf-8") as f:
        data = yaml.safe_load(f)

    slug = data["slug"]
    case = sess.query(SqldCase).filter_by(slug=slug).first()

    if case is None:
        case = SqldCase(slug=slug)
        sess.add(case)
        print(f"[sql_cases.loader]  + Inserting case '{slug}'")
    else:
        print(f"[sql_cases.loader]  ~ Updating case '{slug}'")

    case.title = data["title"]
    case.story_intro = data.get("story_intro", "")
    case.difficulty = data.get("difficulty", "easy")

    # Flush so case.id is available for FK references
    sess.flush()

    # Upsert stages: match by (case_id, slug) to preserve stage.id across reloads
    yaml_stage_slugs = set()
    for stage_data in data.get("stages", []):
        stage_slug = stage_data.get("slug")
        if not stage_slug:
            raise ValueError(f"Stage missing 'slug' in {path}")

        yaml_stage_slugs.add(stage_slug)
        stage = sess.query(SqldStage).filter_by(case_id=case.id, slug=stage_slug).first()

        if stage is None:
            stage = SqldStage(case_id=case.id, slug=stage_slug)
            sess.add(stage)
            print(f"[sql_cases.loader]    + Inserting stage '{stage_slug}'")
        else:
            print(f"[sql_cases.loader]    ~ Updating stage '{stage_slug}'")

        stage.order = stage_data.get("order", 1)
        stage.title = stage_data["title"]
        stage.prompt = stage_data.get("prompt", "")
        stage.schema_description = stage_data.get("schema_description", "")
        stage.schema_sql = stage_data.get("schema_sql", "")
        stage.seed_sql = stage_data.get("seed_sql", "")
        stage.expected_result = stage_data.get("expected_result", [])
        stage.order_sensitive = stage_data.get("order_sensitive", False)
        stage.xp_reward = stage_data.get("xp_reward", 10)
        stage.hints = stage_data.get("hints", [])

    # Removed stages (in DB but not in YAML) are left in place so existing
    # SqldSubmission rows remain valid and no FK violation can occur.


if __name__ == "__main__":
    load_all_cases()
