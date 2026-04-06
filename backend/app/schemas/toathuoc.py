from pydantic import BaseModel
from datetime import date
from typing import List, Optional

class ToaThuocChiTietCreate(BaseModel):
    id_thuoc: int          # ← bắt buộc phải truyền id_thuoc
    stt: int
    so_luong: int
    sang: int = 0
    trua: int = 0
    chieu: int = 0
    toi: int = 0


class ToaThuocChiTietResponse(BaseModel):
    id: int
    id_thuoc: int
    stt: int
    so_luong: int
    sang: int
    trua: int
    chieu: int
    toi: int
    
    # Thông tin thuốc (join từ bảng Thuoc)
    ten_thuoc: str
    ma_thuoc: str
    don_vi: str

    class Config:
        from_attributes = True


class ToaThuocCreate(BaseModel):
    id_cuochen: int
    chan_doan: str
    loi_dan: Optional[str] = None
    chi_tiets: List[ToaThuocChiTietCreate]


class ToaThuocResponse(BaseModel):
    id: int
    ma_toa: str
    chan_doan: str
    loi_dan: Optional[str]
    ngay_ke: date
    chi_tiets: List[ToaThuocChiTietResponse]

    class Config:
        from_attributes = True