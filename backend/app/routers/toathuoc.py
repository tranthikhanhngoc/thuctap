from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session, joinedload
from datetime import date
import uuid

from database import get_db

# Models
from models.toathuoc import ToaThuoc, ToaThuocChiTiet
from models.cuochen import CuocHen

# Schemas
from schemas.toathuoc import ToaThuocCreate, ToaThuocResponse

router = APIRouter(prefix="/toathuoc", tags=["Toa Thuốc"])


# ===============================
# TẠO TOA THUỐC
# ===============================
@router.post("/", response_model=ToaThuocResponse)
def create_toa_thuoc(
    toa_create: ToaThuocCreate,
    db: Session = Depends(get_db),
):
    cuochen = db.query(CuocHen).filter(
        CuocHen.id_cuochen == toa_create.id_cuochen
    ).first()

    if not cuochen:
        raise HTTPException(status_code=400, detail="Cuộc hẹn không tồn tại")

    ma_toa = f"TOA-{date.today().strftime('%Y%m%d')}-{str(uuid.uuid4())[:6].upper()}"

    new_toa = ToaThuoc(
        ma_toa=ma_toa,
        id_cuochen=toa_create.id_cuochen,
        id_bacsi=cuochen.id_bacsi,
        chan_doan=toa_create.chan_doan,
        loi_dan=toa_create.loi_dan,
    )

    db.add(new_toa)
    db.flush()

    for ct in toa_create.chi_tiets:
        db.add(ToaThuocChiTiet(
            toa_thuoc_id=new_toa.id,
            id_thuoc=ct.id_thuoc,
            stt=ct.stt,
            so_luong=ct.so_luong,
            sang=ct.sang,
            trua=ct.trua,
            chieu=ct.chieu,
            toi=ct.toi,
        ))

    db.commit()

    # Query lại để load thuốc
    toa = db.query(ToaThuoc).options(
        joinedload(ToaThuoc.chi_tiets)
        .joinedload(ToaThuocChiTiet.thuoc)
    ).filter(ToaThuoc.id == new_toa.id).first()

    return {
        "id": toa.id,
        "ma_toa": toa.ma_toa,
        "chan_doan": toa.chan_doan,
        "loi_dan": toa.loi_dan,
        "ngay_ke": toa.ngay_ke,   # ✅ FIX
        "chi_tiets": [
            {
                "id": ct.id,
                "id_thuoc": ct.id_thuoc,
                "stt": ct.stt,
                "so_luong": ct.so_luong,
                "sang": ct.sang,
                "trua": ct.trua,
                "chieu": ct.chieu,
                "toi": ct.toi,
                "ten_thuoc": ct.thuoc.ten_thuoc,
                "ma_thuoc": ct.thuoc.ma_thuoc,
                "don_vi": ct.thuoc.don_vi,
            }
            for ct in toa.chi_tiets
        ]
    }


# ===============================
# LẤY TOA THEO CUỘC HẸN
# ===============================
@router.get("/{id_cuochen}", response_model=ToaThuocResponse)
def get_toa_by_cuochen(id_cuochen: int, db: Session = Depends(get_db)):
    toa = db.query(ToaThuoc).options(
        joinedload(ToaThuoc.chi_tiets)
        .joinedload(ToaThuocChiTiet.thuoc)
    ).filter(ToaThuoc.id_cuochen == id_cuochen).first()

    if not toa:
        raise HTTPException(status_code=404, detail="Chưa có toa thuốc")

    return {
        "id": toa.id,
        "ma_toa": toa.ma_toa,
        "chan_doan": toa.chan_doan,
        "loi_dan": toa.loi_dan,
        "ngay_ke": toa.ngay_ke,   # ✅ FIX QUAN TRỌNG
        "chi_tiets": [
            {
                "id": ct.id,
                "id_thuoc": ct.id_thuoc,
                "stt": ct.stt,
                "so_luong": ct.so_luong,
                "sang": ct.sang,
                "trua": ct.trua,
                "chieu": ct.chieu,
                "toi": ct.toi,
                "ten_thuoc": ct.thuoc.ten_thuoc,
                "ma_thuoc": ct.thuoc.ma_thuoc,
                "don_vi": ct.thuoc.don_vi,
            }
            for ct in toa.chi_tiets
        ]
    }