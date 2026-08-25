"""
Reset database: drop all tables, recreate them, and reseed all data.
Usage:
    cd backend
    python app/reset_db.py
"""

import os
import sys

sys.path.insert(0, os.path.dirname(os.path.dirname(__file__)))

from app.models import engine, Base, DATABASE_URL
from app.sql_cases.loader import load_all_cases
from app.seed_cases import seed_additional_cases
from app.services.cases import seed_sample_case


def reset_and_seed():
    if DATABASE_URL.startswith("sqlite"):
        db_path = DATABASE_URL.replace("sqlite:///", "")
        if os.path.exists(db_path):
            os.remove(db_path)
            print(f"[reset_db] Deleted SQLite database file: {db_path}")
        if os.path.exists(db_path + "-wal"):
            os.remove(db_path + "-wal")
        if os.path.exists(db_path + "-shm"):
            os.remove(db_path + "-shm")
        Base.metadata.create_all(bind=engine)
        print("[reset_db] Created all tables")
    else:
        with engine.connect() as conn:
            conn.execute("SET FOREIGN_KEY_CHECKS = 0")
            print("[reset_db] Disabled MySQL foreign key checks")
            
            tables = conn.execute(
                "SELECT TABLE_NAME FROM information_schema.TABLES WHERE TABLE_SCHEMA = DATABASE()"
            ).fetchall()
            for (table,) in tables:
                conn.execute(f"TRUNCATE TABLE {table}")
                print(f"[reset_db] Truncated {table}")
            
            conn.execute("SET FOREIGN_KEY_CHECKS = 1")
            print("[reset_db] Re-enabled MySQL foreign key checks")
            conn.commit()

    print("[reset_db] Loading SQL cases from YAML...")
    load_all_cases()

    print("[reset_db] Seeding additional programming cases...")
    seed_additional_cases()

    print("[reset_db] Seeding sample case...")
    seed_sample_case()

    print("[reset_db] Done. Database reset and reseeded.")


if __name__ == "__main__":
    reset_and_seed()
