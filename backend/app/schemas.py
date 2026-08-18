from pydantic import BaseModel
from typing import Any


class CaseOut(BaseModel):
    id: int
    slug: str
    title: str
    summary: str | None = None
    difficulty: str | None = None
    content: dict | None = None

    class Config:
        orm_mode = True
