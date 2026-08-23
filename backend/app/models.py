import os
from sqlalchemy import (Column, Integer, String, Text, ForeignKey, JSON, DateTime, Boolean)
from sqlalchemy.orm import declarative_base, relationship, sessionmaker
from sqlalchemy import create_engine, func

# Database connection URL. Default to local SQLite fallback.
# For MySQL use: mysql+pymysql://user:password@localhost:3306/codecase
DATABASE_URL = os.environ.get("DATABASE_URL", "sqlite:///./dev.db")

engine = create_engine(DATABASE_URL, echo=False, future=True)
SessionLocal = sessionmaker(bind=engine, autoflush=False, autocommit=False)
Base = declarative_base()


class Case(Base):
    __tablename__ = "cases"
    id = Column(Integer, primary_key=True)
    slug = Column(String(255), unique=True, nullable=False)
    title = Column(String(255), nullable=False)
    summary = Column(Text)
    difficulty = Column(String(50), default="easy")
    content = Column(JSON, default={})
    created_at = Column(DateTime(timezone=True), server_default=func.now())


class Stage(Base):
    __tablename__ = "stages"
    id = Column(Integer, primary_key=True)
    case_id = Column(Integer, ForeignKey("cases.id"))
    title = Column(String(255))
    order = Column(Integer, default=1)
    time_limit_seconds = Column(Integer, default=2)
    memory_limit_mb = Column(Integer, default=256)
    allowed_languages = Column(JSON, default=["python"])
    case = relationship("Case", backref="stages")


class TestCase(Base):
    __tablename__ = "test_cases"
    id = Column(Integer, primary_key=True)
    stage_id = Column(Integer, ForeignKey("stages.id"))
    input = Column(Text)
    expected_output = Column(Text)
    is_hidden = Column(Boolean, default=True)
    weight = Column(Integer, default=1)
    stage = relationship("Stage", backref="test_cases")


class Hint(Base):
    __tablename__ = "hints"
    id = Column(Integer, primary_key=True)
    stage_id = Column(Integer, ForeignKey("stages.id"))
    text = Column(Text)
    unlock_after_attempts = Column(Integer, default=0)
    unlock_after_time_seconds = Column(Integer, nullable=True)
    cost_points = Column(Integer, default=0)
    order = Column(Integer, default=0)
    stage = relationship("Stage", backref="hints")


class User(Base):
    __tablename__ = "users"
    id = Column(Integer, primary_key=True)
    email = Column(String(255), unique=True)
    display_name = Column(String(255))
    password_hash = Column(String(255))
    xp = Column(Integer, default=0)


class Attempt(Base):
    __tablename__ = "attempts"
    id = Column(Integer, primary_key=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=True)
    stage_id = Column(Integer, ForeignKey("stages.id"))
    language = Column(String(50))
    source_code = Column(Text)
    submitted_at = Column(DateTime(timezone=True), server_default=func.now())
    status = Column(String(50))
    score = Column(Integer, default=0)
    tests_passed = Column(Integer, default=0)
    total_tests = Column(Integer, default=0)


def create_tables():
    Base.metadata.create_all(bind=engine)


def get_session():
    return SessionLocal()
