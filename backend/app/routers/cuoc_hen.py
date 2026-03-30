# from fastapi import APIRouter, Depends, HTTPException
# from sqlalchemy.orm import Session
# from database import get_db

# from models.cuochen import CuocHen
# from models.benhnhan import BenhNhan

# from schemas.cuochen_schema import CuocHenCreate, CuocHenOut, CuocHenResponse

# router = APIRouter(prefix="/booking", tags=["Booking"])


# # @router.post("/", response_model=CuocHenOut)
# # def dat_lich(payload: CuocHenCreate, db: Session = Depends(get_db)):

# #     # kiểm tra bệnh nhân
# #     benhnhan = db.query(BenhNhan).filter(
# #         BenhNhan.id_benhnhan == payload.id_benhnhan
# #     ).first()

# #     if not benhnhan:
# #         raise HTTPException(404, "Bệnh nhân không tồn tại")

# #     # kiểm tra ca hợp lệ
# #     if payload.ca_lam_viec not in ["sang", "chieu"]:
# #         raise HTTPException(
# #             status_code=400,
# #             detail="Ca làm việc phải là 'sang' hoặc 'chieu'"
# #         )

# #     # kiểm tra trùng lịch bác sĩ
# #     existing = db.query(CuocHen).filter(
# #         CuocHen.id_bacsi == payload.id_bacsi,
# #         CuocHen.ngay_hen == payload.ngay_hen,
# #         CuocHen.ca_lam_viec == payload.ca_lam_viec
# #     ).first()

# #     if existing:
# #         raise HTTPException(
# #             status_code=400,
# #             detail="Bác sĩ đã có lịch trong ca này"
# #         )

# #     cuoc_hen = CuocHen(
# #         id_bacsi=payload.id_bacsi,
# #         id_benhnhan=payload.id_benhnhan,
# #         ngay_hen=payload.ngay_hen,
# #         ca_lam_viec=payload.ca_lam_viec,
# #         ly_do=payload.ly_do,
# #         trang_thai="CHO_XAC_NHAN"
# #     )

# #     db.add(cuoc_hen)
# #     db.commit()
# #     db.refresh(cuoc_hen)

# #     return cuoc_hen
# @router.post("/", response_model=CuocHenOut)
# def dat_lich(payload: CuocHenCreate, db: Session = Depends(get_db)):

#     # kiểm tra bệnh nhân
#     benhnhan = db.query(BenhNhan).filter(
#         BenhNhan.id_benhnhan == payload.id_benhnhan
#     ).first()

#     if not benhnhan:
#         raise HTTPException(status_code=404, detail="Bệnh nhân không tồn tại")

#     # kiểm tra bác sĩ
#     bacsi = db.query(BacSi).filter(
#         BacSi.id_bacsi == payload.id_bacsi
#     ).first()

#     if not bacsi:
#         raise HTTPException(status_code=404, detail="Bác sĩ không tồn tại")

#     # kiểm tra ca hợp lệ
#     if payload.ca_lam_viec not in ["sang", "chieu"]:
#         raise HTTPException(
#             status_code=400,
#             detail="Ca làm việc phải là 'sang' hoặc 'chieu'"
#         )

#     # # kiểm tra trùng lịch
#     # existing = db.query(CuocHen).filter(
#     #     CuocHen.id_bacsi == payload.id_bacsi,
#     #     CuocHen.ngay_hen == payload.ngay_hen,
#     #     CuocHen.ca_lam_viec == payload.ca_lam_viec
#     # ).first()

#     # if existing:
#     #     raise HTTPException(
#     #         status_code=400,
#     #         detail="Bác sĩ đã có lịch trong ca này"
#     #     )

#     # tạo lịch
#     cuoc_hen = CuocHen(
#         id_bacsi=payload.id_bacsi,
#         id_benhnhan=payload.id_benhnhan,
#         ngay_hen=payload.ngay_hen,
#         ca_lam_viec=payload.ca_lam_viec,
#         ly_do=payload.ly_do,
#         trang_thai="CHO_XAC_NHAN"
#     )

#     db.add(cuoc_hen)
#     db.commit()
#     db.refresh(cuoc_hen)

#     # trả response đúng schema
#     return {
#         "id_cuochen": cuoc_hen.id_cuochen,

#         "id_bacsi": bacsi.id_bacsi,
#         "ten_bacsi": bacsi.ho_ten,

#         "id_benhnhan": benhnhan.id_benhnhan,
#         "ten_benhnhan": benhnhan.ho_ten,

#         "ngay_hen": cuoc_hen.ngay_hen,
#         "ca_lam_viec": cuoc_hen.ca_lam_viec,
#         "ly_do": cuoc_hen.ly_do,
#         "trang_thai": cuoc_hen.trang_thai
#     }


# from typing import List

# @router.get("/history/{id_benhnhan}",  response_model=List[CuocHenResponse])
# # def lich_su_dat_lich(id_benhnhan: int, db: Session = Depends(get_db)):

# #     lich_su = db.query(CuocHen).filter(
# #         CuocHen.id_benhnhan == id_benhnhan
# #     ).order_by(CuocHen.ngay_hen.desc()).all()

# #     return lich_su
# @router.get("/history/{id_benhnhan}", response_model=List[CuocHenResponse])
# def lich_su_dat_lich(id_benhnhan: int, db: Session = Depends(get_db)):

#     data = (
#         db.query(CuocHen, BacSi, BenhNhan)
#         .join(BacSi, BacSi.id_bacsi == CuocHen.id_bacsi)
#         .join(BenhNhan, BenhNhan.id_benhnhan == CuocHen.id_benhnhan)
#         .filter(CuocHen.id_benhnhan == id_benhnhan)
#         .order_by(CuocHen.ngay_hen.desc())
#         .all()
#     )

#     result = []

#     for cuochen, bacsi, benhnhan in data:
#         result.append({
#             "id_cuochen": cuochen.id_cuochen,
#             "id_bacsi": bacsi.id_bacsi,
#             "ten_bacsi": bacsi.ho_ten,
#             "id_benhnhan": benhnhan.id_benhnhan,
#             "ten_benhnhan": benhnhan.ho_ten,
#             "ngay_hen": cuochen.ngay_hen,
#             "ca_lam_viec": cuochen.ca_lam_viec,
#             "ly_do": cuochen.ly_do,
#             "trang_thai": cuochen.trang_thai
#         })

#     return result

# # @router.put("/{id_cuochen}", response_model=CuocHenOut)
# # def chinh_sua_lich(id_cuochen: int, payload: CuocHenCreate, db: Session = Depends(get_db)):

# #     cuoc_hen = db.query(CuocHen).filter(
# #         CuocHen.id_cuochen == id_cuochen
# #     ).first()

# #     if not cuoc_hen:
# #         raise HTTPException(status_code=404, detail="Không tìm thấy lịch hẹn")

# #     # kiểm tra ca hợp lệ
# #     if payload.ca_lam_viec not in ["sang", "chieu"]:
# #         raise HTTPException(
# #             status_code=400,
# #             detail="Ca làm việc phải là 'sang' hoặc 'chieu'"
# #         )

# #     # kiểm tra trùng lịch bác sĩ (trừ chính nó)
# #     existing = db.query(CuocHen).filter(
# #         CuocHen.id_bacsi == payload.id_bacsi,
# #         CuocHen.ngay_hen == payload.ngay_hen,
# #         CuocHen.ca_lam_viec == payload.ca_lam_viec,
# #         CuocHen.id_cuochen != id_cuochen
# #     ).first()

# #     if existing:
# #         raise HTTPException(
# #             status_code=400,
# #             detail="Bác sĩ đã có lịch trong ca này"
# #         )

# #     # cập nhật dữ liệu
# #     cuoc_hen.id_bacsi = payload.id_bacsi
# #     cuoc_hen.ngay_hen = payload.ngay_hen
# #     cuoc_hen.ca_lam_viec = payload.ca_lam_viec
# #     cuoc_hen.ly_do = payload.ly_do
# #     cuoc_hen.trang_thai = "CHO_XAC_NHAN"

# #     db.commit()
# #     db.refresh(cuoc_hen)

# #     return cuoc_hen

# @router.put("/{id_cuochen}", response_model=CuocHenResponse)
# def chinh_sua_lich(id_cuochen: int, payload: CuocHenCreate, db: Session = Depends(get_db)):

#     cuoc_hen = db.query(CuocHen).filter(
#         CuocHen.id_cuochen == id_cuochen
#     ).first()

#     if not cuoc_hen:
#         raise HTTPException(status_code=404, detail="Không tìm thấy lịch hẹn")

#     # kiểm tra ca hợp lệ
#     if payload.ca_lam_viec not in ["sang", "chieu"]:
#         raise HTTPException(
#             status_code=400,
#             detail="Ca làm việc phải là 'sang' hoặc 'chieu'"
#         )

#     # kiểm tra trùng lịch bác sĩ
#     existing = db.query(CuocHen).filter(
#         CuocHen.id_bacsi == payload.id_bacsi,
#         CuocHen.ngay_hen == payload.ngay_hen,
#         CuocHen.ca_lam_viec == payload.ca_lam_viec,
#         CuocHen.id_cuochen != id_cuochen
#     ).first()

#     if existing:
#         raise HTTPException(
#             status_code=400,
#             detail="Bác sĩ đã có lịch trong ca này"
#         )

#     # cập nhật dữ liệu
#     cuoc_hen.id_bacsi = payload.id_bacsi
#     cuoc_hen.id_benhnhan = payload.id_benhnhan
#     cuoc_hen.ngay_hen = payload.ngay_hen
#     cuoc_hen.ca_lam_viec = payload.ca_lam_viec
#     cuoc_hen.ly_do = payload.ly_do
#     cuoc_hen.trang_thai = "CHO_XAC_NHAN"

#     db.commit()
#     db.refresh(cuoc_hen)

#     # lấy bác sĩ
#     bacsi = db.query(BacSi).filter(
#         BacSi.id_bacsi == cuoc_hen.id_bacsi
#     ).first()

#     # lấy bệnh nhân
#     benhnhan = db.query(BenhNhan).filter(
#         BenhNhan.id_benhnhan == cuoc_hen.id_benhnhan
#     ).first()

#     return {
#         "id_cuochen": cuoc_hen.id_cuochen,

#         "id_bacsi": bacsi.id_bacsi,
#         "ten_bacsi": bacsi.ho_ten,

#         "id_benhnhan": benhnhan.id_benhnhan,
#         "ten_benhnhan": benhnhan.ho_ten,

#         "ngay_hen": cuoc_hen.ngay_hen,
#         "ca_lam_viec": cuoc_hen.ca_lam_viec,
#         "ly_do": cuoc_hen.ly_do,
#         "trang_thai": cuoc_hen.trang_thai
#     }

# # @router.patch("/cancel/{id_cuochen}", response_model=CuocHenOut)
# # def huy_lich(id_cuochen: int, db: Session = Depends(get_db)):

# #     cuoc_hen = db.query(CuocHen).filter(
# #         CuocHen.id_cuochen == id_cuochen
# #     ).first()

# #     if not cuoc_hen:
# #         raise HTTPException(status_code=404, detail="Không tìm thấy lịch hẹn")

# #     if cuoc_hen.trang_thai == "DA_HUY":
# #         raise HTTPException(status_code=400, detail="Lịch đã bị hủy trước đó")

# #     cuoc_hen.trang_thai = "DA_HUY"

# #     db.commit()
# #     db.refresh(cuoc_hen)

# #     return cuoc_hen
# @router.patch("/cancel/{id_cuochen}", response_model=CuocHenResponse)
# def huy_lich(id_cuochen: int, db: Session = Depends(get_db)):

#     cuoc_hen = db.query(CuocHen).filter(
#         CuocHen.id_cuochen == id_cuochen
#     ).first()

#     if not cuoc_hen:
#         raise HTTPException(status_code=404, detail="Không tìm thấy lịch hẹn")

#     if cuoc_hen.trang_thai == "DA_HUY":
#         raise HTTPException(status_code=400, detail="Lịch đã bị hủy trước đó")

#     cuoc_hen.trang_thai = "DA_HUY"

#     db.commit()
#     db.refresh(cuoc_hen)

#     # lấy thông tin bác sĩ
#     bacsi = db.query(BacSi).filter(
#         BacSi.id_bacsi == cuoc_hen.id_bacsi
#     ).first()

#     # lấy thông tin bệnh nhân
#     benhnhan = db.query(BenhNhan).filter(
#         BenhNhan.id_benhnhan == cuoc_hen.id_benhnhan
#     ).first()

#     return {
#         "id_cuochen": cuoc_hen.id_cuochen,

#         "id_bacsi": bacsi.id_bacsi,
#         "ten_bacsi": bacsi.ho_ten,

#         "id_benhnhan": benhnhan.id_benhnhan,
#         "ten_benhnhan": benhnhan.ho_ten,

#         "ngay_hen": cuoc_hen.ngay_hen,
#         "ca_lam_viec": cuoc_hen.ca_lam_viec,
#         "ly_do": cuoc_hen.ly_do,
#         "trang_thai": cuoc_hen.trang_thai
#     }

# # from typing import List

# # @router.get("/", response_model=List[CuocHenOut])
# # def lay_tat_ca_lich(db: Session = Depends(get_db)):
# #     """
# #     Lấy toàn bộ lịch hẹn trong hệ thống (dùng cho Admin/Quản lý)
# #     """
# #     danh_sach = db.query(CuocHen)\
# #         .order_by(CuocHen.ngay_hen.desc())\
# #         .all()

# #     return danh_sach

# from models.bacsi import BacSi
# from models.benhnhan import BenhNhan

# @router.get("/", response_model=List[CuocHenOut])
# def lay_tat_ca_lich(db: Session = Depends(get_db)):

#     data = db.query(
#         CuocHen,
#         BacSi.ho_ten,
#         BenhNhan.ho_ten
#     ).join(
#         BacSi, CuocHen.id_bacsi == BacSi.id_bacsi
#     ).join(
#         BenhNhan, CuocHen.id_benhnhan == BenhNhan.id_benhnhan
#     ).order_by(CuocHen.ngay_hen.desc()).all()

#     result = []
#     for cuoc_hen, ten_bacsi, ten_benhnhan in data:
#         result.append({
#             **cuoc_hen.__dict__,
#             "ten_bacsi": ten_bacsi,
#             "ten_benhnhan": ten_benhnhan
#         })

#     return result



from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List

from database import get_db

from models.cuochen import CuocHen
from models.bacsi import BacSi
from models.benhnhan import BenhNhan

from schemas.cuochen_schema import CuocHenCreate, CuocHenResponse

router = APIRouter(prefix="/booking", tags=["Booking"])


# ===============================
# ĐẶT LỊCH
# ===============================
@router.post("/", response_model=CuocHenResponse)
def dat_lich(payload: CuocHenCreate, db: Session = Depends(get_db)):

    benhnhan = db.query(BenhNhan).filter(
        BenhNhan.id_benhnhan == payload.id_benhnhan
    ).first()

    if not benhnhan:
        raise HTTPException(404, "Bệnh nhân không tồn tại")

    bacsi = db.query(BacSi).filter(
        BacSi.id_bacsi == payload.id_bacsi
    ).first()

    if not bacsi:
        raise HTTPException(404, "Bác sĩ không tồn tại")

    if payload.ca_lam_viec not in ["sang", "chieu"]:
        raise HTTPException(400, "Ca làm việc phải là 'sang' hoặc 'chieu'")

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

    return {
        "id_cuochen": cuoc_hen.id_cuochen,
        "id_bacsi": bacsi.id_bacsi,
        "ten_bacsi": bacsi.ho_ten,
        "id_benhnhan": benhnhan.id_benhnhan,
        "ten_benhnhan": benhnhan.ho_ten,
        "ngay_hen": cuoc_hen.ngay_hen,
        "ca_lam_viec": cuoc_hen.ca_lam_viec,
        "ly_do": cuoc_hen.ly_do,
        "trang_thai": cuoc_hen.trang_thai
    }


# ===============================
# LỊCH SỬ ĐẶT LỊCH
# ===============================
@router.get("/history/{id_benhnhan}", response_model=List[CuocHenResponse])
def lich_su_dat_lich(id_benhnhan: int, db: Session = Depends(get_db)):

    data = (
        db.query(CuocHen, BacSi, BenhNhan)
        .join(BacSi, BacSi.id_bacsi == CuocHen.id_bacsi)
        .join(BenhNhan, BenhNhan.id_benhnhan == CuocHen.id_benhnhan)
        .filter(CuocHen.id_benhnhan == id_benhnhan)
        .order_by(CuocHen.ngay_hen.desc())
        .all()
    )

    result = []

    for cuochen, bacsi, benhnhan in data:
        result.append({
            "id_cuochen": cuochen.id_cuochen,
            "id_bacsi": bacsi.id_bacsi,
            "ten_bacsi": bacsi.ho_ten,
            "id_benhnhan": benhnhan.id_benhnhan,
            "ten_benhnhan": benhnhan.ho_ten,
            "ngay_hen": cuochen.ngay_hen,
            "ca_lam_viec": cuochen.ca_lam_viec,
            "ly_do": cuochen.ly_do,
            "trang_thai": cuochen.trang_thai
        })

    return result


# ===============================
# CHỈNH SỬA LỊCH
# ===============================
@router.put("/{id_cuochen}", response_model=CuocHenResponse)
def chinh_sua_lich(id_cuochen: int, payload: CuocHenCreate, db: Session = Depends(get_db)):

    cuoc_hen = db.query(CuocHen).filter(
        CuocHen.id_cuochen == id_cuochen
    ).first()

    if not cuoc_hen:
        raise HTTPException(404, "Không tìm thấy lịch")

    if payload.ca_lam_viec not in ["sang", "chieu"]:
        raise HTTPException(400, "Ca làm việc không hợp lệ")

    cuoc_hen.id_bacsi = payload.id_bacsi
    cuoc_hen.id_benhnhan = payload.id_benhnhan
    cuoc_hen.ngay_hen = payload.ngay_hen
    cuoc_hen.ca_lam_viec = payload.ca_lam_viec
    cuoc_hen.ly_do = payload.ly_do
    cuoc_hen.trang_thai = "CHO_XAC_NHAN"

    db.commit()
    db.refresh(cuoc_hen)

    bacsi = db.query(BacSi).filter(BacSi.id_bacsi == cuoc_hen.id_bacsi).first()
    benhnhan = db.query(BenhNhan).filter(BenhNhan.id_benhnhan == cuoc_hen.id_benhnhan).first()

    return {
        "id_cuochen": cuoc_hen.id_cuochen,

        "id_bacsi": bacsi.id_bacsi,
        "ten_bacsi": bacsi.ho_ten,

        "id_benhnhan": benhnhan.id_benhnhan,
        "ten_benhnhan": benhnhan.ho_ten,

        "ngay_hen": cuoc_hen.ngay_hen,
        "ca_lam_viec": cuoc_hen.ca_lam_viec,
        "ly_do": cuoc_hen.ly_do,
        "trang_thai": cuoc_hen.trang_thai
    }


# ===============================
# HỦY LỊCH
# ===============================
@router.patch("/cancel/{id_cuochen}", response_model=CuocHenResponse)
def huy_lich(id_cuochen: int, db: Session = Depends(get_db)):

    cuoc_hen = db.query(CuocHen).filter(
        CuocHen.id_cuochen == id_cuochen
    ).first()

    if not cuoc_hen:
        raise HTTPException(404, "Không tìm thấy lịch")

    if cuoc_hen.trang_thai == "DA_HUY":
        raise HTTPException(400, "Lịch đã hủy")

    cuoc_hen.trang_thai = "DA_HUY"

    db.commit()
    db.refresh(cuoc_hen)

    bacsi = db.query(BacSi).filter(BacSi.id_bacsi == cuoc_hen.id_bacsi).first()
    benhnhan = db.query(BenhNhan).filter(BenhNhan.id_benhnhan == cuoc_hen.id_benhnhan).first()

    return {
        "id_cuochen": cuoc_hen.id_cuochen,
        "id_bacsi": bacsi.id_bacsi,
        "ten_bacsi": bacsi.ho_ten,
        "id_benhnhan": benhnhan.id_benhnhan,
        "ten_benhnhan": benhnhan.ho_ten,
        "ngay_hen": cuoc_hen.ngay_hen,
        "ca_lam_viec": cuoc_hen.ca_lam_viec,
        "ly_do": cuoc_hen.ly_do,
        "trang_thai": cuoc_hen.trang_thai
    }
    
    
@router.get("/", response_model=List[CuocHenResponse])
def get_all_booking(db: Session = Depends(get_db)):

    data = (
        db.query(CuocHen, BacSi, BenhNhan)
        .join(BacSi, BacSi.id_bacsi == CuocHen.id_bacsi)
        .join(BenhNhan, BenhNhan.id_benhnhan == CuocHen.id_benhnhan)
        .order_by(CuocHen.ngay_hen.desc())
        .all()
    )

    result = []

    for cuochen, bacsi, benhnhan in data:
        result.append({
            "id_cuochen": cuochen.id_cuochen,
            "id_bacsi": bacsi.id_bacsi,
            "ten_bacsi": bacsi.ho_ten,
            "id_benhnhan": benhnhan.id_benhnhan,
            "ten_benhnhan": benhnhan.ho_ten,
            "ngay_hen": cuochen.ngay_hen,
            "ca_lam_viec": cuochen.ca_lam_viec,
            "ly_do": cuochen.ly_do,
            "trang_thai": cuochen.trang_thai
        })

    return result


@router.patch("/done/{id_cuochen}", response_model=CuocHenResponse)
def done_booking(id_cuochen: int, db: Session = Depends(get_db)):

    cuoc_hen = db.query(CuocHen).filter(
        CuocHen.id_cuochen == id_cuochen
    ).first()

    if not cuoc_hen:
        raise HTTPException(404, "Không tìm thấy lịch")

    # chỉ cho phép khi đã xác nhận
    if cuoc_hen.trang_thai != "DA_XAC_NHAN":
        raise HTTPException(
            400,
            "Chỉ bệnh nhân đã xác nhận mới có thể đánh dấu đã khám"
        )

    cuoc_hen.trang_thai = "DA_KHAM"

    db.commit()
    db.refresh(cuoc_hen)

    bacsi = db.query(BacSi).filter(
        BacSi.id_bacsi == cuoc_hen.id_bacsi
    ).first()

    benhnhan = db.query(BenhNhan).filter(
        BenhNhan.id_benhnhan == cuoc_hen.id_benhnhan
    ).first()

    return {
        "id_cuochen": cuoc_hen.id_cuochen,
        "id_bacsi": bacsi.id_bacsi,
        "ten_bacsi": bacsi.ho_ten,
        "id_benhnhan": benhnhan.id_benhnhan,
        "ten_benhnhan": benhnhan.ho_ten,
        "ngay_hen": cuoc_hen.ngay_hen,
        "ca_lam_viec": cuoc_hen.ca_lam_viec,
        "ly_do": cuoc_hen.ly_do,
        "trang_thai": cuoc_hen.trang_thai
    }



@router.patch("/confirm/{id_cuochen}", response_model=CuocHenResponse)
def confirm_booking(id_cuochen: int, db: Session = Depends(get_db)):

    cuoc_hen = db.query(CuocHen).filter(
        CuocHen.id_cuochen == id_cuochen
    ).first()

    if not cuoc_hen:
        raise HTTPException(status_code=404, detail="Không tìm thấy lịch hẹn")

    # Optional: only allow certain statuses to be confirmed
    if cuoc_hen.trang_thai not in ["CHO_XAC_NHAN", "DA_XAC_NHAN"]:  # adjust as needed
        raise HTTPException(
            status_code=400,
            detail="Lịch không thể xác nhận ở trạng thái hiện tại"
        )

    cuoc_hen.trang_thai = "DA_XAC_NHAN"

    db.commit()
    db.refresh(cuoc_hen)

    # Lấy thông tin bác sĩ + bệnh nhân để trả về response đầy đủ
    bacsi = db.query(BacSi).filter(BacSi.id_bacsi == cuoc_hen.id_bacsi).first()
    benhnhan = db.query(BenhNhan).filter(BenhNhan.id_benhnhan == cuoc_hen.id_benhnhan).first()

    return {
        "id_cuochen": cuoc_hen.id_cuochen,
        "id_bacsi": bacsi.id_bacsi,
        "ten_bacsi": bacsi.ho_ten,
        "id_benhnhan": benhnhan.id_benhnhan,
        "ten_benhnhan": benhnhan.ho_ten,
        "ngay_hen": cuoc_hen.ngay_hen,
        "ca_lam_viec": cuoc_hen.ca_lam_viec,
        "ly_do": cuoc_hen.ly_do,
        "trang_thai": cuoc_hen.trang_thai
    }