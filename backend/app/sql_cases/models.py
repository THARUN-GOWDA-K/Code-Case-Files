"""
SQLAlchemy models for the SQL-detective-case module.
Table name prefix: sqld_  (no collision with existing tables)
Base is imported from app.models so create_tables() registers these automatically.
"""

from sqlalchemy import Column, Integer, String, Text, JSON, Boolean, DateTime, ForeignKey,UniqueConstraint
from sqlalchemy.orm import relationship
from sqlalchemy import func

# Share the same Base/metadata as the rest of the app so that
# app.models.create_tables() (called on startup) also creates these tables.
from ..models import Base


class SqldCase(Base):
    __tablename__ = "sqld_cases"

    id = Column(Integer, primary_key=True)
    slug = Column(String(255), unique=True, nullable=False)
    title = Column(String(255), nullable=False)
    story_intro = Column(Text)          # narrative flavour text shown before puzzles
    difficulty = Column(String(50), default="easy")
    intro_dialogue = Column(Text)
    epilogue_text = Column(Text)
    npc_characters = Column(JSON, default=[])
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    stages = relationship("SqldStage", back_populates="case", order_by="SqldStage.order")


class SqldStage(Base):
    __tablename__ = "sqld_stages"

    id = Column(Integer, primary_key=True)
    case_id = Column(Integer, ForeignKey("sqld_cases.id"), nullable=False)
    slug = Column(String(255), nullable=False)
    order = Column(Integer, default=1)
    title = Column(String(255), nullable=False)
    prompt = Column(Text)               # the puzzle question shown to the player
    schema_description = Column(Text)  # human-readable description of tables/columns
    # DDL + INSERT statements to populate the in-memory sandbox DB
    schema_sql = Column(Text)          # CREATE TABLE statements
    seed_sql = Column(Text)            # INSERT statements
    # Expected result stored as a JSON list-of-dicts (column-name keyed)
    expected_result = Column(JSON, default=[])
    order_sensitive = Column(Boolean, default=False)
    xp_reward = Column(Integer, default=10)
    hints = Column(JSON, default=[])   # list of hint strings
    npc_hints = Column(JSON, default=[])

    case = relationship("SqldCase", back_populates="stages")
    submissions = relationship("SqldSubmission", back_populates="stage")

    __table_args__ = (UniqueConstraint("case_id", "slug", name="uq_sqld_stage_case_slug"),)


class SqldSubmission(Base):
    __tablename__ = "sqld_submissions"

    id = Column(Integer, primary_key=True)
    stage_id = Column(Integer, ForeignKey("sqld_stages.id"), nullable=False)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=True)
    query = Column(Text)
    submitted_at = Column(DateTime(timezone=True), server_default=func.now())
    correct = Column(Boolean, default=False)
    result_rows = Column(JSON, default=[])  # actual rows returned by sandbox
    xp_awarded = Column(Integer, default=0)
    feedback = Column(Text)

    stage = relationship("SqldStage", back_populates="submissions")
