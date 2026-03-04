from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from database import get_db

from models.bacsi import BacSi
from models.user import User
from schemas.bacsi_schema import BacSiCreate, BacSiUpdate

from passlib.context import CryptContext

router = APIRouter(prefix="/doctors", tags=["Doctor"])

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")


# ===============================
# LẤY DANH SÁCH BÁC SĨ
# ===============================
@router.get("/")
def get_all_doctors(db: Session = Depends(get_db)):
    return db.query(BacSi).all()


# ===============================
# LẤY BÁC SĨ CHƯA CÓ LỚP
# ===============================
@router.get("/no-class")
def get_doctors_no_class(db: Session = Depends(get_db)):
    return db.query(BacSi).filter(BacSi.id_lophoc == None).all()


# ===============================
# LẤY CHI TIẾT BÁC SĨ
# ===============================
@router.get("/{doctor_id}")
def get_doctor(doctor_id: int, db: Session = Depends(get_db)):

    doctor = db.query(BacSi).filter(
        BacSi.id_bacsi == doctor_id
    ).first()

    if not doctor:
        raise HTTPException(status_code=404, detail="Doctor not found")

    return doctor


# ===============================
# THÊM BÁC SĨ + USER
# ===============================
@router.post("/")
def create_doctor(data: BacSiCreate, db: Session = Depends(get_db)):

    # kiểm tra username trùng
    existing_user = db.query(User).filter(
        User.username == data.username
    ).first()

    if existing_user:
        raise HTTPException(status_code=400, detail="Username đã tồn tại")

    try:
        # 1️⃣ Tạo bác sĩ
        doctor = BacSi(
            ho_ten=data.ho_ten,
            chuyen_khoa=data.chuyen_khoa,
            trinh_do=data.trinh_do,
            nam_kinh_nghiem=data.nam_kinh_nghiem,
            so_dien_thoai=data.so_dien_thoai,
            email=data.email
        )

        db.add(doctor)
        db.commit()
        db.refresh(doctor)

        # 2️⃣ Tạo user cho bác sĩ
        hashed_password = pwd_context.hash(data.password)

        user = User(
            username=data.username,
            password=hashed_password,
            role="bacsi",
            id_bacsi=doctor.id_bacsi
        )

        db.add(user)
        db.commit()
        db.refresh(user)

        return {
            "message": "Tạo bác sĩ thành công",
            "doctor_id": doctor.id_bacsi,
            "user_id": user.id_user
        }

    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=str(e))


# ===============================
# CẬP NHẬT BÁC SĨ
# ===============================
@router.put("/{doctor_id}")
def update_doctor(doctor_id: int, data: BacSiUpdate, db: Session = Depends(get_db)):

    doctor = db.query(BacSi).filter(
        BacSi.id_bacsi == doctor_id
    ).first()

    if not doctor:
        raise HTTPException(status_code=404, detail="Doctor not found")

    for key, value in data.dict(exclude_unset=True).items():
        setattr(doctor, key, value)

    db.commit()
    db.refresh(doctor)

    return doctor


# ===============================
# XÓA BÁC SĨ + USER
# ===============================
@router.delete("/{doctor_id}")
def delete_doctor(doctor_id: int, db: Session = Depends(get_db)):

    doctor = db.query(BacSi).filter(
        BacSi.id_bacsi == doctor_id
    ).first()

    if not doctor:
        raise HTTPException(status_code=404, detail="Doctor not found")

    # xóa user trước
    user = db.query(User).filter(
        User.id_bacsi == doctor_id
    ).first()

    if user:
        db.delete(user)

    db.delete(doctor)
    db.commit()

    return {"message": "Doctor deleted successfully"}