from pydantic import BaseModel
from typing import Optional


# =========================
# Base schema
# =========================
class BenhNhanBase(BaseModel):
    ho_ten: Optional[str] = None
    nam_sinh: Optional[int] = None
    gioi_tinh: Optional[str] = None
    so_dien_thoai: Optional[str] = None
    cccd: Optional[str] = None
    dia_chi: Optional[str] = None


# =========================
# Update schema
# =========================
class BenhNhanUpdate(BaseModel):
    ho_ten: Optional[str] = None
    nam_sinh: Optional[int] = None
    gioi_tinh: Optional[str] = None
    so_dien_thoai: Optional[str] = None
    cccd: Optional[str] = None
    dia_chi: Optional[str] = None


# =========================
# Response schema
# =========================
class BenhNhanResponse(BaseModel):
    id_benhnhan: int
    username: str

    ho_ten: Optional[str] = None
    nam_sinh: Optional[int] = None
    gioi_tinh: Optional[str] = None
    so_dien_thoai: Optional[str] = None
    cccd: Optional[str] = None
    dia_chi: Optional[str] = None

    class Config:
        from_attributes = True


# =========================
# Profile (dùng cho /benhnhan/me)
# =========================
class BenhNhanProfile(BenhNhanBase):
    username: str