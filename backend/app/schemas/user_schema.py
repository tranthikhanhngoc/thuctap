from pydantic import BaseModel
from typing import Optional

class BenhNhanCreate(BaseModel):
    ho_ten: Optional[str] = None
    nam_sinh: Optional[int] = None
    gioi_tinh: Optional[str] = None
    so_dien_thoai: Optional[str] = None
    cccd: Optional[str] = None
    dia_chi: Optional[str] = None

class UserRegisterRequest(BaseModel):
    username: str
    password: str
    benhnhan: Optional[BenhNhanCreate] = None
