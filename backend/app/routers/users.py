from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from database import get_db
from auth import register_user, login_user
from schemas.user_schema import UserRegisterRequest, LoginRequest

router = APIRouter(prefix="/users", tags=["Users"])

@router.post("/register")
def register(
    data: UserRegisterRequest,
    db: Session = Depends(get_db)
):
    return register_user(db, data)

@router.post("/login")
def login(data: LoginRequest, db: Session = Depends(get_db)):
    return login_user(db, data.username, data.password)

@router.get("/profile")
def get_profile():
    return {"msg": "User profile endpoint"}
