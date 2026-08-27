import os
from datetime import datetime, timedelta
from typing import Optional

from fastapi import APIRouter, Depends, HTTPException, status, Security
from fastapi.security import OAuth2PasswordRequestForm, HTTPAuthorizationCredentials, HTTPBearer
from pydantic import BaseModel
from passlib.hash import bcrypt
from jose import jwt, JWTError

from .models import get_session, User

router = APIRouter()
security = HTTPBearer(auto_error=False)

SECRET_KEY = os.environ.get("SECRET_KEY", "dev-secret")
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 60 * 24


class Token(BaseModel):
    access_token: str
    token_type: str = "bearer"


class SignupIn(BaseModel):
    email: str
    password: str
    display_name: Optional[str] = None


@router.post("/signup")
def signup(payload: SignupIn, sess=Depends(get_session)):
    existing = sess.query(User).filter_by(email=payload.email).first()
    if existing:
        raise HTTPException(status_code=400, detail="Email already registered")
    hashed = bcrypt.hash(payload.password)
    user = User(email=payload.email, display_name=payload.display_name or payload.email.split("@")[0], password_hash=hashed)
    sess.add(user)
    sess.commit()
    return {"id": user.id, "email": user.email, "display_name": user.display_name}


@router.post("/login", response_model=Token)
def login(form_data: OAuth2PasswordRequestForm = Depends(), sess=Depends(get_session)):
    user = sess.query(User).filter_by(email=form_data.username).first()
    if not user or not bcrypt.verify(form_data.password, user.password_hash):
        raise HTTPException(status_code=400, detail="Incorrect username or password")
    
    # Update login streak
    from datetime import datetime, timezone
    now = datetime.now(timezone.utc)
    last = user.last_login
    if last is None:
        user.streak = 1
    else:
        last_date = last.date() if hasattr(last, 'date') else last
        today = now.date()
        diff = (today - last_date).days
        if diff == 0:
            pass  # already logged in today
        elif diff == 1:
            user.streak = (user.streak or 0) + 1
        else:
            user.streak = 1
    user.last_login = now

    from .api.leaderboard import get_rank
    user.rank_title = get_rank(user.xp or 0)
    sess.commit()

    access = create_access_token(data={"sub": str(user.id)})
    return {"access_token": access, "token_type": "bearer"}


def create_access_token(data: dict, expires_delta: Optional[timedelta] = None):
    to_encode = data.copy()
    expire = datetime.utcnow() + (expires_delta or timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES))
    to_encode.update({"exp": expire})
    return jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)


def get_current_user(credentials: Optional[HTTPAuthorizationCredentials] = Security(security), sess=Depends(get_session)):
    if not credentials:
        return None
    token = credentials.credentials
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        user_id = int(payload.get("sub"))
    except (JWTError, TypeError, ValueError):
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid token")
    user = sess.get(User, user_id)
    return user


def require_user(user=Depends(get_current_user)):
    if not user:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Authentication required")
    return user


@router.get("/me")
def me(user=Depends(get_current_user)):
    if not user:
        raise HTTPException(status_code=401, detail="Unauthorized")
    from .api.leaderboard import get_rank
    return {
        "id": user.id,
        "email": user.email,
        "display_name": user.display_name,
        "xp": user.xp or 0,
        "streak": user.streak or 1,
        "rank_title": user.rank_title or get_rank(user.xp or 0),
        "last_login": user.last_login.isoformat() if user.last_login else None,
    }

