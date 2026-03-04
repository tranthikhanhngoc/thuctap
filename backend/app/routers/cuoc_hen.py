from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from database import get_db

from models.cuochen import CuocHen
from models.benhnhan import BenhNhan

from schemas.cuochen_schema import CuocHenCreate, CuocHenOut

router = APIRouter(prefix="/booking", tags=["Booking"])


@router.post("/", response_model=CuocHenOut)
def dat_lich(payload: CuocHenCreate, db: Session = Depends(get_db)):

    # kiểm tra bệnh nhân
    benhnhan = db.query(BenhNhan).filter(
        BenhNhan.id_benhnhan == payload.id_benhnhan
    ).first()

    if not benhnhan:
        raise HTTPException(404, "Bệnh nhân không tồn tại")

    # kiểm tra ca hợp lệ
    if payload.ca_lam_viec not in ["sang", "chieu"]:
        raise HTTPException(
            status_code=400,
            detail="Ca làm việc phải là 'sang' hoặc 'chieu'"
        )

    # kiểm tra trùng lịch bác sĩ
    existing = db.query(CuocHen).filter(
        CuocHen.id_bacsi == payload.id_bacsi,
        CuocHen.ngay_hen == payload.ngay_hen,
        CuocHen.ca_lam_viec == payload.ca_lam_viec
    ).first()

    if existing:
        raise HTTPException(
            status_code=400,
            detail="Bác sĩ đã có lịch trong ca này"
        )

    cuoc_hen = CuocHen(
        id_bacsi=payload.id_bacsi,
        id_benhnhan=payload.id_benhnhan,
        ngay_hen=payload.ngay_hen,
        ca_lam_viec=payload.ca_lam_viec,
        ly_do=payload.ly_do,
        trang_thai="CHO_XAC_NHAN"
    )

    db.add(cuoc_hen)
    db.commit()
    db.refresh(cuoc_hen)

    return cuoc_hen


from typing import List

@router.get("/history/{id_benhnhan}", response_model=List[CuocHenOut])
def lich_su_dat_lich(id_benhnhan: int, db: Session = Depends(get_db)):

    lich_su = db.query(CuocHen).filter(
        CuocHen.id_benhnhan == id_benhnhan
    ).order_by(CuocHen.ngay_hen.desc()).all()

    return lich_su

@router.put("/{id_cuochen}", response_model=CuocHenOut)
def chinh_sua_lich(id_cuochen: int, payload: CuocHenCreate, db: Session = Depends(get_db)):

    cuoc_hen = db.query(CuocHen).filter(
        CuocHen.id_cuochen == id_cuochen
    ).first()

    if not cuoc_hen:
        raise HTTPException(status_code=404, detail="Không tìm thấy lịch hẹn")

    # kiểm tra ca hợp lệ
    if payload.ca_lam_viec not in ["sang", "chieu"]:
        raise HTTPException(
            status_code=400,
            detail="Ca làm việc phải là 'sang' hoặc 'chieu'"
        )

    # kiểm tra trùng lịch bác sĩ (trừ chính nó)
    existing = db.query(CuocHen).filter(
        CuocHen.id_bacsi == payload.id_bacsi,
        CuocHen.ngay_hen == payload.ngay_hen,
        CuocHen.ca_lam_viec == payload.ca_lam_viec,
        CuocHen.id_cuochen != id_cuochen
    ).first()

    if existing:
        raise HTTPException(
            status_code=400,
            detail="Bác sĩ đã có lịch trong ca này"
        )

    # cập nhật dữ liệu
    cuoc_hen.id_bacsi = payload.id_bacsi
    cuoc_hen.ngay_hen = payload.ngay_hen
    cuoc_hen.ca_lam_viec = payload.ca_lam_viec
    cuoc_hen.ly_do = payload.ly_do
    cuoc_hen.trang_thai = "CHO_XAC_NHAN"

    db.commit()
    db.refresh(cuoc_hen)

    return cuoc_hen

@router.patch("/cancel/{id_cuochen}", response_model=CuocHenOut)
def huy_lich(id_cuochen: int, db: Session = Depends(get_db)):

    cuoc_hen = db.query(CuocHen).filter(
        CuocHen.id_cuochen == id_cuochen
    ).first()

    if not cuoc_hen:
        raise HTTPException(status_code=404, detail="Không tìm thấy lịch hẹn")

    if cuoc_hen.trang_thai == "DA_HUY":
        raise HTTPException(status_code=400, detail="Lịch đã bị hủy trước đó")

    cuoc_hen.trang_thai = "DA_HUY"

    db.commit()
    db.refresh(cuoc_hen)

    return cuoc_hen


# from typing import List

# @router.get("/", response_model=List[CuocHenOut])
# def lay_tat_ca_lich(db: Session = Depends(get_db)):
#     """
#     Lấy toàn bộ lịch hẹn trong hệ thống (dùng cho Admin/Quản lý)
#     """
#     danh_sach = db.query(CuocHen)\
#         .order_by(CuocHen.ngay_hen.desc())\
#         .all()

#     return danh_sach

from models.bacsi import BacSi
from models.benhnhan import BenhNhan

@router.get("/", response_model=List[CuocHenOut])
def lay_tat_ca_lich(db: Session = Depends(get_db)):

    data = db.query(
        CuocHen,
        BacSi.ho_ten,
        BenhNhan.ho_ten
    ).join(
        BacSi, CuocHen.id_bacsi == BacSi.id_bacsi
    ).join(
        BenhNhan, CuocHen.id_benhnhan == BenhNhan.id_benhnhan
    ).order_by(CuocHen.ngay_hen.desc()).all()

    result = []
    for cuoc_hen, ten_bacsi, ten_benhnhan in data:
        result.append({
            **cuoc_hen.__dict__,
            "ten_bacsi": ten_bacsi,
            "ten_benhnhan": ten_benhnhan
        })

    return result