# # from fastapi import APIRouter, Depends, HTTPException, UploadFile, File
# # from sqlalchemy.orm import Session
# # from database import get_db
# # from models.lophoc import LopHoc
# # from schemas.lophoc_schema import LopHocCreate, LopHocUpdate

# # router = APIRouter(prefix="/classes", tags=["Classes"])


# # # =========================
# # # Lấy danh sách lớp
# # # =========================
# # @router.get("/")
# # def get_classes(db: Session = Depends(get_db)):
# #     return db.query(LopHoc).all()


# # # =========================
# # # Xem chi tiết lớp
# # # =========================
# # @router.get("/{class_id}")
# # def get_class_detail(class_id: int, db: Session = Depends(get_db)):
# #     lop = db.query(LopHoc).filter(LopHoc.id_lophoc == class_id).first()

# #     if not lop:
# #         raise HTTPException(status_code=404, detail="Class not found")

# #     return lop


# # # =========================
# # # Thêm lớp
# # # =========================
# # @router.post("/")
# # def create_class(data: LopHocCreate, db: Session = Depends(get_db)):
# #     new_class = LopHoc(
# #         ten_lop=data.ten_lop,
# #         khoa=data.khoa,
# #         nien_khoa=data.nien_khoa,
# #         si_so=data.si_so
# #     )

# #     db.add(new_class)
# #     db.commit()
# #     db.refresh(new_class)

# #     return new_class


# # # =========================
# # # Cập nhật lớp
# # # =========================
# # @router.put("/{class_id}")
# # def update_class(class_id: int, data: LopHocUpdate, db: Session = Depends(get_db)):
# #     lop = db.query(LopHoc).filter(LopHoc.id_lophoc == class_id).first()

# #     if not lop:
# #         raise HTTPException(status_code=404, detail="Class not found")

# #     lop.ten_lop = data.ten_lop
# #     lop.khoa = data.khoa
# #     lop.nien_khoa = data.nien_khoa
# #     lop.si_so = data.si_so

# #     db.commit()
# #     db.refresh(lop)

# #     return lop


# # # =========================
# # # Xóa lớp
# # # =========================
# # @router.delete("/{class_id}")
# # def delete_class(class_id: int, db: Session = Depends(get_db)):
# #     lop = db.query(LopHoc).filter(LopHoc.id_lophoc == class_id).first()

# #     if not lop:
# #         raise HTTPException(status_code=404, detail="Class not found")

# #     db.delete(lop)
# #     db.commit()

# #     return {"message": "Deleted successfully"}

# # @router.post("/{class_id}/add-doctors")
# # def add_doctors_to_class(class_id: int, doctor_ids: list[int], db: Session = Depends(get_db)):

# #     doctors = db.query(BacSi).filter(
# #         BacSi.id_bacsi.in_(doctor_ids)
# #     ).all()

# #     for doc in doctors:
# #         doc.id_lophoc = class_id

# #     db.commit()

# #     return {"message": "Added doctors to class"}
# # @router.get("/{class_id}/students")
# # def get_class_students(class_id: int, db: Session = Depends(get_db)):

# #     students = db.query(BacSi).filter(
# #         BacSi.id_lophoc == class_id
# #     ).all()

# #     return students

# from fastapi import APIRouter, Depends, HTTPException
# from sqlalchemy.orm import Session

# from database import get_db
# from models.lophoc import LopHoc
# from models.bacsi import BacSi
# from schemas.lophoc_schema import LopHocCreate, LopHocUpdate

# router = APIRouter(prefix="/classes", tags=["Classes"])


# # =========================
# # Lấy danh sách lớp
# # =========================
# @router.get("/")
# def get_classes(db: Session = Depends(get_db)):
#     return db.query(LopHoc).all()


# # =========================
# # Xem chi tiết lớp
# # =========================
# @router.get("/{class_id}")
# def get_class_detail(class_id: int, db: Session = Depends(get_db)):

#     lop = db.query(LopHoc).filter(LopHoc.id_lophoc == class_id).first()

#     if not lop:
#         raise HTTPException(status_code=404, detail="Class not found")

#     return lop


# # =========================
# # Thêm lớp
# # =========================
# @router.post("/")
# def create_class(data: LopHocCreate, db: Session = Depends(get_db)):

#     new_class = LopHoc(
#         ten_lop=data.ten_lop,
#         khoa=data.khoa,
#         nien_khoa=data.nien_khoa,
#         si_so=data.si_so
#     )

#     db.add(new_class)
#     db.commit()
#     db.refresh(new_class)

#     return new_class


# # =========================
# # Cập nhật lớp
# # =========================
# @router.put("/{class_id}")
# def update_class(class_id: int, data: LopHocUpdate, db: Session = Depends(get_db)):

#     lop = db.query(LopHoc).filter(LopHoc.id_lophoc == class_id).first()

#     if not lop:
#         raise HTTPException(status_code=404, detail="Class not found")

#     lop.ten_lop = data.ten_lop
#     lop.khoa = data.khoa
#     lop.nien_khoa = data.nien_khoa
#     lop.si_so = data.si_so

#     db.commit()
#     db.refresh(lop)

#     return lop


# # =========================
# # Xóa lớp
# # =========================
# @router.delete("/{class_id}")
# def delete_class(class_id: int, db: Session = Depends(get_db)):

#     lop = db.query(LopHoc).filter(LopHoc.id_lophoc == class_id).first()

#     if not lop:
#         raise HTTPException(status_code=404, detail="Class not found")

#     db.delete(lop)
#     db.commit()

#     return {"message": "Deleted successfully"}


# # =========================
# # Thêm nhiều bác sĩ vào lớp
# # =========================
# @router.post("/{class_id}/add-doctors")
# def add_doctors_to_class(class_id: int, doctor_ids: list[int], db: Session = Depends(get_db)):

#     lop = db.query(LopHoc).filter(LopHoc.id_lophoc == class_id).first()

#     if not lop:
#         raise HTTPException(status_code=404, detail="Class not found")

#     doctors = db.query(BacSi).filter(
#         BacSi.id_bacsi.in_(doctor_ids)
#     ).all()

#     for doc in doctors:
#         doc.id_lophoc = class_id

#     db.commit()

#     return {"message": "Added doctors to class"}


# # =========================
# # Lấy danh sách học viên của lớp
# # =========================
# @router.get("/{class_id}/students")
# def get_class_students(class_id: int, db: Session = Depends(get_db)):

#     students = db.query(BacSi).filter(
#         BacSi.id_lophoc == class_id
#     ).all()

#     return students

from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from database import get_db
from models.lophoc import LopHoc
from models.bacsi import BacSi   # ← thêm dòng này

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
    
    
@router.get("/doctors")
def get_all_doctors(db: Session = Depends(get_db)):
    return db.query(BacSi).all()