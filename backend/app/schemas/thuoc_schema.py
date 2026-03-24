from pydantic import BaseModel
from datetime import date
from decimal import Decimal
from typing import Optional

class ThuocCreate(BaseModel):
    ma_thuoc: str
    ten_thuoc: str
    loai_thuoc: Optional[str] = "Khác"
    don_vi: Optional[str] = "Viên"
    so_luong_ton: Optional[int] = 0
    gia_nhap: Optional[Decimal] = 0
    gia_ban: Optional[Decimal] = 0
    ngay_nhap: Optional[date] = None
    han_su_dung: Optional[date] = None
    nha_cung_cap: Optional[str] = None
    mo_ta: Optional[str] = None

class ThuocResponse(BaseModel):
    id_thuoc: int
    ma_thuoc: str
    ten_thuoc: str
    loai_thuoc: str
    don_vi: str
    so_luong_ton: int
    gia_nhap: Decimal
    gia_ban: Decimal
    ngay_nhap: Optional[date]
    han_su_dung: Optional[date]
    nha_cung_cap: Optional[str]
    mo_ta: Optional[str]

    class Config:
        from_attributes = True   # Thay cho orm_mode=True ở Pydantic v2


class StockOperation(BaseModel):
    so_luong: int
    ghi_chu: Optional[str] = None