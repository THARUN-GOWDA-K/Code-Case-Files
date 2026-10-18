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


def award_achievement(user_id: int, slug: str, sess):
    """Unlock an achievement for a user and award XP if not already unlocked."""
    from ..models import User
    ach = sess.query(Achievement).filter_by(slug=slug).first()
    if not ach:
        return None
    existing = sess.query(UserAchievement).filter_by(user_id=user_id, achievement_id=ach.id).first()
    if existing:
        return None
    ua = UserAchievement(user_id=user_id, achievement_id=ach.id)
    sess.add(ua)
    if ach.xp_reward:
        user = sess.query(User).filter(User.id == user_id).first()
        if user:
            user.xp = (user.xp or 0) + ach.xp_reward
    return ach


def check_user_achievements(user_id: int, sess):
    """Check and award any eligible achievements based on current user state."""
    from ..models import User, Submission
    try:
        from ..sql_cases.models import SqldSubmission
    except ImportError:
        SqldSubmission = None

    user = sess.query(User).filter(User.id == user_id).first()
    if not user:
        return

    # streak_3, streak_7
    streak = user.streak or 0
    if streak >= 3:
        award_achievement(user_id, "streak_3", sess)
    if streak >= 7:
        award_achievement(user_id, "streak_7", sess)

    # xp_100, xp_500
    xp = user.xp or 0
    if xp >= 100:
        award_achievement(user_id, "xp_100", sess)
    if xp >= 500:
        award_achievement(user_id, "xp_500", sess)

    # first_arrest: any passed Python submission or correct SQL submission
    py_pass = sess.query(Submission).filter_by(user_id=user_id, status="passed").first()
    sql_pass = None
    if SqldSubmission:
        sql_pass = sess.query(SqldSubmission).filter_by(user_id=user_id, correct=True).first()
    if py_pass or sql_pass:
        award_achievement(user_id, "first_arrest", sess)


@router.get("/")
def list_achievements(sess=Depends(get_session)):
    return [
        {"id": a.id, "slug": a.slug, "name": a.name, "description": a.description, "icon": a.icon, "xp_reward": a.xp_reward}
        for a in sess.query(Achievement).all()
    ]


@router.get("/mine")
def my_achievements(user=Depends(require_user), sess=Depends(get_session)):
    check_user_achievements(user.id, sess)
    sess.commit()
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
