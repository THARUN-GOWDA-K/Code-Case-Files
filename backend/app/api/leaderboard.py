"""
Leaderboard API
"""
from fastapi import APIRouter, Depends
from ..models import get_session, User

router = APIRouter()

RANK_TITLES = [
    (2001, "Master Detective"),
    (1001, "Chief Inspector"),
    (601,  "Senior Detective"),
    (301,  "Senior Investigator"),
    (101,  "Investigator"),
    (0,    "Rookie Detective"),
]

def get_rank(xp: int) -> str:
    for threshold, title in RANK_TITLES:
        if xp >= threshold:
            return title
    return "Rookie Detective"


@router.get("/top")
def leaderboard(sess=Depends(get_session)):
    users = sess.query(User).order_by(User.xp.desc()).limit(10).all()
    return [
        {
            "rank": i + 1,
            "display_name": u.display_name,
            "xp": u.xp or 0,
            "rank_title": get_rank(u.xp or 0),
            "streak": getattr(u, "streak", 0) or 0,
        }
        for i, u in enumerate(users)
    ]
