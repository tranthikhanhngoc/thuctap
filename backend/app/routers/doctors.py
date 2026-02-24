from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from database import get_db
from models.bacsi import BacSi
from schemas.bacsi_schema import BacSiCreate, BacSiUpdate

router = APIRouter(prefix="/doctors", tags=["Doctor"])


# ===============================
# LẤY DANH SÁCH BÁC SĨ
# ===============================
@router.get("/")
def get_all_doctors(db: Session = Depends(get_db)):
    doctors = db.query(BacSi).all()
    return doctors


# ===============================
# LẤY CHI TIẾT BÁC SĨ
# ===============================
@router.get("/{doctor_id}")
def get_doctor(doctor_id: int, db: Session = Depends(get_db)):

    doctor = db.query(BacSi).filter(BacSi.id_bacsi == doctor_id).first()

    if not doctor:
        raise HTTPException(status_code=404, detail="Doctor not found")

    return doctor

# ===============================
# THÊM BÁC SĨ
# ===============================
@router.post("/")
def create_doctor(data: BacSiCreate, db: Session = Depends(get_db)):

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

    return doctor

# ===============================
# CẬP NHẬT BÁC SĨ
# ===============================
@router.put("/{id}")
def update_doctor(id: int, data: BacSiUpdate, db: Session = Depends(get_db)):
    doctor = db.query(BacSi).filter(BacSi.id_bacsi == id).first()

    if not doctor:
        raise HTTPException(status_code=404, detail="Doctor not found")

    doctor.ho_ten = data.ho_ten
    doctor.chuyen_khoa = data.chuyen_khoa
    doctor.trinh_do = data.trinh_do
    doctor.nam_kinh_nghiem = data.nam_kinh_nghiem
    doctor.so_dien_thoai = data.so_dien_thoai
    doctor.email = data.email
    doctor.id_lophoc = data.id_lophoc

    db.commit()
    db.refresh(doctor)

    return doctor

# ===============================
# XÓA BÁC SĨ
# ===============================
@router.delete("/{doctor_id}")
def delete_doctor(doctor_id: int, db: Session = Depends(get_db)):

    doctor = db.query(BacSi).filter(BacSi.id_bacsi == doctor_id).first()

    if not doctor:
        raise HTTPException(status_code=404, detail="Doctor not found")

    db.delete(doctor)
    db.commit()

    return {"message": "Doctor deleted"}