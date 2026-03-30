from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from database import get_db
from models.user import User
from models.benhnhan import BenhNhan
from schemas.benhnhan_schema import BenhNhanResponse, BenhNhanUpdate
from core.security import get_current_user

router = APIRouter(
    prefix="/benhnhan",
    tags=["BenhNhan"]
)

# ==================================================
# ADMIN - Lấy danh sách bệnh nhân
# ==================================================
@router.get("", response_model=list[BenhNhanResponse])
def get_all_patients(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):

    if current_user.role != "admin":
        raise HTTPException(status_code=403, detail="Không có quyền")

    results = (
        db.query(User, BenhNhan)
        .join(BenhNhan, User.id_benhnhan == BenhNhan.id_benhnhan)
        .filter(User.role == "benhnhan")
        .all()
    )

    patients = []

    for user, bn in results:
        patients.append({
            "id_benhnhan": bn.id_benhnhan,
            "username": user.username,
            "ho_ten": bn.ho_ten,
            "nam_sinh": bn.nam_sinh,
            "gioi_tinh": bn.gioi_tinh,
            "so_dien_thoai": bn.so_dien_thoai,
            "cccd": bn.cccd,
            "dia_chi": bn.dia_chi
        })

    return patients

# ==================================================
# ADMIN - Lấy chi tiết bệnh nhân
# ==================================================
@router.get("/{id}", response_model=BenhNhanResponse)
def get_patient(
    id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):

    patient = db.query(BenhNhan).filter(
        BenhNhan.id_benhnhan == id
    ).first()

    if not patient:
        raise HTTPException(status_code=404, detail="Không tìm thấy bệnh nhân")

    return patient


# ==================================================
# ADMIN - Update bệnh nhân
# ==================================================
@router.put("/{id}")
def update_patient(
    id: int,
    data: BenhNhanUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):

    if current_user.role != "admin":
        raise HTTPException(status_code=403, detail="Không có quyền")

    patient = db.query(BenhNhan).filter(
        BenhNhan.id_benhnhan == id
    ).first()

    if not patient:
        raise HTTPException(status_code=404, detail="Không tìm thấy bệnh nhân")

    for key, value in data.dict(exclude_unset=True).items():
        setattr(patient, key, value)

    db.commit()

    return {"msg": "Cập nhật thành công"}


# ==================================================
# ADMIN - Xóa bệnh nhân
# ==================================================
@router.delete("/{id}")
def delete_patient(
    id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):

    if current_user.role != "admin":
        raise HTTPException(status_code=403, detail="Không có quyền")

    patient = db.query(BenhNhan).filter(
        BenhNhan.id_benhnhan == id
    ).first()

    if not patient:
        raise HTTPException(status_code=404, detail="Không tìm thấy bệnh nhân")

    db.delete(patient)
    db.commit()

    return {"msg": "Xóa bệnh nhân thành công"}


# ==================================================
# PATIENT - Lấy hồ sơ của chính mình
# ==================================================
@router.get("/me", response_model=BenhNhanResponse)
def get_profile(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):

    patient = db.query(BenhNhan).filter(
        BenhNhan.id_benhnhan == current_user.id_benhnhan
    ).first()

    if not patient:
        raise HTTPException(status_code=404, detail="Không tìm thấy hồ sơ")

    return patient


# ==================================================
# PATIENT - Update hồ sơ của mình
# ==================================================
@router.put("/me")
def update_profile(
    data: BenhNhanUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):

    patient = db.query(BenhNhan).filter(
        BenhNhan.id_benhnhan == current_user.id_benhnhan
    ).first()

    if not patient:
        raise HTTPException(status_code=404, detail="Không tìm thấy hồ sơ")

    for key, value in data.dict(exclude_unset=True).items():
        setattr(patient, key, value)

    db.commit()

    return {"msg": "Cập nhật hồ sơ thành công"}