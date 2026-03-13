from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from database import get_db
from models.lophoc import LopHoc
from models.bacsi import BacSi   # ← thêm dòng này
from schemas.lophoc_schema import LopHocCreate, LopHocUpdate

router = APIRouter(prefix="/classes", tags=["Classes"])

# ==========================
# Lấy danh sách lớp
# ==========================

@router.get("/")
def get_classes(db: Session = Depends(get_db)):
    return db.query(LopHoc).all()


# ==========================
# Xem chi tiết lớp
# ==========================

@router.get("/{class_id}")
def get_class_detail(class_id: int, db: Session = Depends(get_db)):

    cls = db.query(LopHoc).filter(LopHoc.id_lophoc == class_id).first()

    if not cls:
        raise HTTPException(status_code=404, detail="Class not found")

    return cls


# ==========================
# Lấy danh sách học viên (bác sĩ)
# ==========================

@router.get("/{class_id}/students")
def get_students_of_class(class_id: int, db: Session = Depends(get_db)):
    cls = db.query(LopHoc).filter(LopHoc.id_lophoc == class_id).first()
    if not cls:
        raise HTTPException(status_code=404, detail="Lớp không tồn tại")
    
    # Cách 1: Nếu bạn đã định nghĩa relationship 'bacsi' trong model LopHoc
    return cls.bacsi  # ← ưu tiên cách này nếu có

    # Cách 2: Nếu chưa có relationship, dùng query trực tiếp
    # return db.query(BacSi).filter(BacSi.id_lophoc == class_id).all()
    
    
 # =========================
# Thêm lớp
# =========================
@router.post("/")
def create_class(data: LopHocCreate, db: Session = Depends(get_db)):

    new_class = LopHoc(
        ten_lop=data.ten_lop,
        khoa=data.khoa,
        nien_khoa=data.nien_khoa,
        si_so=data.si_so
    )

    db.add(new_class)
    db.commit()
    db.refresh(new_class)

    return new_class


# =========================
# Cập nhật lớp
# =========================
@router.put("/{class_id}")
def update_class(class_id: int, data: LopHocUpdate, db: Session = Depends(get_db)):

    lop = db.query(LopHoc).filter(LopHoc.id_lophoc == class_id).first()

    if not lop:
        raise HTTPException(status_code=404, detail="Class not found")

    lop.ten_lop = data.ten_lop
    lop.khoa = data.khoa
    lop.nien_khoa = data.nien_khoa
    lop.si_so = data.si_so

    db.commit()
    db.refresh(lop)

    return lop
    
    
@router.get("/doctors")
def get_all_doctors(db: Session = Depends(get_db)):
    return db.query(BacSi).all()