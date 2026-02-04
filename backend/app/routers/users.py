from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from database import get_db
from auth import register_user, login_user
from schemas.user_schema import UserRegisterRequest

router = APIRouter(prefix="/users", tags=["Users"])

@router.post("/register")
def register(
    data: UserRegisterRequest,
    db: Session = Depends(get_db)
):
    return register_user(db, data)

@router.post("/login")
def login(
    username: str,
    password: str,
    db: Session = Depends(get_db)
):
    return login_user(db, username, password)

@router.get("/profile")
def get_profile():
    return {"msg": "User profile endpoint"}
