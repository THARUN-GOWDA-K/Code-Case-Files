"""
Pydantic v1 schemas for the SQL-detective-case module.
Uses orm_mode = True to match the style of app/schemas.py.
"""

from pydantic import BaseModel
from typing import Any, List, Optional


class SqldStageOut(BaseModel):
    id: int
    order: int
    title: str
    prompt: Optional[str] = None
    schema_description: Optional[str] = None
    xp_reward: int
    hints: List[str] = []

    class Config:
        orm_mode = True


class SqldStageSummary(BaseModel):
    id: int
    order: int
    title: str

    class Config:
        orm_mode = True


class SqldCaseOut(BaseModel):
    id: int
    slug: str
    title: str
    story_intro: Optional[str] = None
    difficulty: Optional[str] = None
    stages: List[SqldStageSummary] = []

    class Config:
        orm_mode = True


class SqldCaseDetailOut(BaseModel):
    id: int
    slug: str
    title: str
    story_intro: Optional[str] = None
    difficulty: Optional[str] = None
    stages: List[SqldStageOut] = []

    class Config:
        orm_mode = True


class SqldSubmissionRequest(BaseModel):
    query: str


class SqldSubmissionResult(BaseModel):
    correct: bool
    result_rows: List[Any] = []
    xp_awarded: int
    feedback: str
