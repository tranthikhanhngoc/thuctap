from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List

from database import get_db
from models.thuoc import Thuoc

from schemas.thuoc_schema import (
    ThuocCreate,
    ThuocResponse,
    StockOperation
)

router = APIRouter(prefix="/medicines", tags=["Thuốc"])


# ===============================
# LẤY DANH SÁCH THUỐC
# ===============================
@router.get("/", response_model=List[ThuocResponse])
def get_all_medicines(db: Session = Depends(get_db)):
    thuocs = db.query(Thuoc).order_by(Thuoc.ten_thuoc).all()
    return thuocs


# ===============================
# THÊM THUỐC MỚI
# ===============================
@router.post("/", response_model=ThuocResponse, status_code=status.HTTP_201_CREATED)
def create_medicine(payload: ThuocCreate, db: Session = Depends(get_db)):
    # Kiểm tra mã thuốc đã tồn tại chưa
    existing = db.query(Thuoc).filter(Thuoc.ma_thuoc == payload.ma_thuoc).first()
    if existing:
        raise HTTPException(
            status_code=400,
            detail="Mã thuốc đã tồn tại trong hệ thống"
        )

    thuoc = Thuoc(
        ma_thuoc=payload.ma_thuoc,
        ten_thuoc=payload.ten_thuoc,
        loai_thuoc=payload.loai_thuoc,
        don_vi=payload.don_vi,
        so_luong_ton=payload.so_luong_ton,
        gia_nhap=payload.gia_nhap,
        gia_ban=payload.gia_ban,
        ngay_nhap=payload.ngay_nhap,
        han_su_dung=payload.han_su_dung,
        nha_cung_cap=payload.nha_cung_cap,
        mo_ta=payload.mo_ta,
    )

    db.add(thuoc)
    db.commit()
    db.refresh(thuoc)
    return thuoc


# ===============================
# LẤY THÔNG TIN 1 THUỐC
# ===============================
@router.get("/{id_thuoc}", response_model=ThuocResponse)
def get_medicine(id_thuoc: int, db: Session = Depends(get_db)):
    thuoc = db.query(Thuoc).filter(Thuoc.id_thuoc == id_thuoc).first()
    if not thuoc:
        raise HTTPException(status_code=404, detail="Không tìm thấy thuốc")
    return thuoc


# ===============================
# CẬP NHẬT THUỐC
# ===============================
@router.put("/{id_thuoc}", response_model=ThuocResponse)
def update_medicine(id_thuoc: int, payload: ThuocCreate, db: Session = Depends(get_db)):
    thuoc = db.query(Thuoc).filter(Thuoc.id_thuoc == id_thuoc).first()
    if not thuoc:
        raise HTTPException(status_code=404, detail="Không tìm thấy thuốc")

    # Nếu thay đổi mã thuốc → kiểm tra trùng
    if payload.ma_thuoc != thuoc.ma_thuoc:
        existing = db.query(Thuoc).filter(Thuoc.ma_thuoc == payload.ma_thuoc).first()
        if existing:
            raise HTTPException(status_code=400, detail="Mã thuốc mới đã tồn tại")

    thuoc.ma_thuoc = payload.ma_thuoc
    thuoc.ten_thuoc = payload.ten_thuoc
    thuoc.loai_thuoc = payload.loai_thuoc
    thuoc.don_vi = payload.don_vi
    thuoc.so_luong_ton = payload.so_luong_ton
    thuoc.gia_nhap = payload.gia_nhap
    thuoc.gia_ban = payload.gia_ban
    thuoc.ngay_nhap = payload.ngay_nhap
    thuoc.han_su_dung = payload.han_su_dung
    thuoc.nha_cung_cap = payload.nha_cung_cap
    thuoc.mo_ta = payload.mo_ta

    db.commit()
    db.refresh(thuoc)
    return thuoc


# ===============================
# XÓA THUỐC
# ===============================
@router.delete("/{id_thuoc}")
def delete_medicine(id_thuoc: int, db: Session = Depends(get_db)):
    thuoc = db.query(Thuoc).filter(Thuoc.id_thuoc == id_thuoc).first()
    if not thuoc:
        raise HTTPException(status_code=404, detail="Không tìm thấy thuốc")

    db.delete(thuoc)
    db.commit()
    return {"message": "Xóa thuốc thành công"}


# ===============================
# NHẬP KHO
# ===============================
@router.post("/{id_thuoc}/nhap-kho")
def nhap_kho(id_thuoc: int, payload: StockOperation, db: Session = Depends(get_db)):
    thuoc = db.query(Thuoc).filter(Thuoc.id_thuoc == id_thuoc).first()
    if not thuoc:
        raise HTTPException(status_code=404, detail="Không tìm thấy thuốc")

    if payload.so_luong <= 0:
        raise HTTPException(status_code=400, detail="Số lượng nhập phải lớn hơn 0")

    thuoc.so_luong_ton += payload.so_luong
    db.commit()
    db.refresh(thuoc)

    return {
        "message": f"Nhập kho thành công +{payload.so_luong} {thuoc.don_vi}",
        "id_thuoc": thuoc.id_thuoc,
        "ten_thuoc": thuoc.ten_thuoc,
        "so_luong_ton_moi": thuoc.so_luong_ton
    }


# ===============================
# XUẤT KHO
# ===============================
@router.post("/{id_thuoc}/xuat-kho")
def xuat_kho(id_thuoc: int, payload: StockOperation, db: Session = Depends(get_db)):
    thuoc = db.query(Thuoc).filter(Thuoc.id_thuoc == id_thuoc).first()
    if not thuoc:
        raise HTTPException(status_code=404, detail="Không tìm thấy thuốc")

    if payload.so_luong <= 0:
        raise HTTPException(status_code=400, detail="Số lượng xuất phải lớn hơn 0")

    if thuoc.so_luong_ton < payload.so_luong:
        raise HTTPException(status_code=400, detail="Không đủ số lượng tồn kho")

    thuoc.so_luong_ton -= payload.so_luong
    db.commit()
    db.refresh(thuoc)

    return {
        "message": f"Xuất kho thành công -{payload.so_luong} {thuoc.don_vi}",
        "id_thuoc": thuoc.id_thuoc,
        "ten_thuoc": thuoc.ten_thuoc,
        "so_luong_ton_moi": thuoc.so_luong_ton
    }