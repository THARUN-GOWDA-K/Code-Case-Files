"""
Achievements API
"""
from fastapi import APIRouter, Depends
from ..models import get_session, Achievement, UserAchievement, session_scope
from ..auth import require_user

router = APIRouter()

ACHIEVEMENT_SEEDS = [
    {"slug": "first_arrest",  "name": "First Arrest",        "description": "Solved your very first case stage.",    "icon": "🔫", "xp_reward": 10},
    {"slug": "sql_wizard",    "name": "SQL Wizard",           "description": "Completed all stages of a SQL case.",   "icon": "🧙", "xp_reward": 25},
    {"slug": "speed_demon",   "name": "Speed Demon",          "description": "Solved a stage in under 60 seconds.",   "icon": "⚡", "xp_reward": 20},
    {"slug": "streak_3",      "name": "On a Roll",            "description": "Maintained a 3-day login streak.",      "icon": "🔥", "xp_reward": 15},
    {"slug": "streak_7",      "name": "Dedicated Detective",  "description": "Maintained a 7-day login streak.",      "icon": "🏅", "xp_reward": 50},
    {"slug": "xp_100",        "name": "Century Club",         "description": "Earned 100 total XP.",                 "icon": "💯", "xp_reward": 10},
    {"slug": "xp_500",        "name": "Elite Investigator",   "description": "Earned 500 total XP.",                 "icon": "🌟", "xp_reward": 25},
    {"slug": "shopaholic",    "name": "Shopping Spree",       "description": "Purchased your first shop item.",       "icon": "🛒", "xp_reward": 5},
]


def seed_achievements():
    with session_scope() as sess:
        for ach in ACHIEVEMENT_SEEDS:
            existing = sess.query(Achievement).filter_by(slug=ach["slug"]).first()
            if not existing:
                sess.add(Achievement(**ach))
    print("[achievements] Seeded achievements.")


@router.get("/")
def list_achievements(sess=Depends(get_session)):
    return [
        {"id": a.id, "slug": a.slug, "name": a.name, "description": a.description, "icon": a.icon, "xp_reward": a.xp_reward}
        for a in sess.query(Achievement).all()
    ]


@router.get("/mine")
def my_achievements(user=Depends(require_user), sess=Depends(get_session)):
    rows = (
        sess.query(Achievement, UserAchievement)
        .join(UserAchievement, Achievement.id == UserAchievement.achievement_id)
        .filter(UserAchievement.user_id == user.id)
        .all()
    )
    return [
        {
            "id": a.id, "slug": a.slug, "name": a.name,
            "description": a.description, "icon": a.icon,
            "unlocked_at": ua.unlocked_at.isoformat() if ua.unlocked_at else None,
        }
        for a, ua in rows
    ]
