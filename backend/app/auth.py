from fastapi import HTTPException, status
from sqlalchemy.orm import Session
from passlib.context import CryptContext

from models.user import User
from models.benhnhan import BenhNhan
from schemas.user_schema import UserRegisterRequest
from core.security import create_access_token


pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")


# =====================
# HASH PASSWORD
# =====================
def hash_password(password: str) -> str:
    return pwd_context.hash(password)


def verify_password(password: str, hashed: str) -> bool:
    return pwd_context.verify(password, hashed)


# =====================
# REGISTER
# =====================
def register_user(db: Session, data: UserRegisterRequest):

    # 1. kiểm tra username
    existing_user = db.query(User).filter(User.username == data.username).first()

    if existing_user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Username đã tồn tại"
        )

    # 2. tạo bệnh nhân (ban đầu có thể rỗng)
    benhnhan = BenhNhan()

    if data.benhnhan:
        benhnhan.ho_ten = data.benhnhan.ho_ten
        benhnhan.nam_sinh = data.benhnhan.nam_sinh
        benhnhan.gioi_tinh = data.benhnhan.gioi_tinh
        benhnhan.so_dien_thoai = data.benhnhan.so_dien_thoai
        benhnhan.cccd = data.benhnhan.cccd
        benhnhan.dia_chi = data.benhnhan.dia_chi

    db.add(benhnhan)
    db.flush()   # lấy id_benhnhan trước khi commit

    # 3. tạo user
    user = User(
        username=data.username,
        password=hash_password(data.password),
        role="benhnhan",
        id_benhnhan=benhnhan.id_benhnhan
    )

    db.add(user)
    db.commit()
    db.refresh(user)

    return {
        "msg": "Đăng ký thành công",
        "id_user": user.id_user,
        "username": user.username,
        "role": user.role
    }


# =====================
# LOGIN + JWT
# =====================
def login_user(db: Session, username: str, password: str):

    user = db.query(User).filter(User.username == username).first()

    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Sai username hoặc password"
        )

    if not verify_password(password, user.password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Sai username hoặc password"
        )

    # tạo token
    access_token = create_access_token(
        data={
            "sub": str(user.id_user),   # ⚠️ PHẢI là id_user
            "username": user.username,
            "role": user.role
        }
    )

    return {
        "access_token": access_token,
        "token_type": "bearer",
        "user": {
            "id_user": user.id_user,
            "username": user.username,
            "role": user.role
        }
    }