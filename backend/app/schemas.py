from pydantic import BaseModel
from typing import Any, List


class StageSummary(BaseModel):
    id: int
    order: int
    title: str
    prompt: str | None = None
    description: str | None = None

    class Config:
        orm_mode = True


class CaseOut(BaseModel):
    id: int
    slug: str
    title: str
    summary: str | None = None
    difficulty: str | None = None
    content: dict | None = None
    stages: List[StageSummary] = []

    class Config:
        orm_mode = True
