from pydantic import BaseModel
from typing import Optional

class BacSiCreate(BaseModel):
    ho_ten: str
    chuyen_khoa: str
    trinh_do: str
    nam_kinh_nghiem: int
    so_dien_thoai: str
    email: str

class BacSiUpdate(BaseModel):
    ho_ten: Optional[str]
    chuyen_khoa: Optional[str]
    trinh_do: Optional[str]
    nam_kinh_nghiem: Optional[int]
    so_dien_thoai: Optional[str]
    email: Optional[str]
    id_lophoc: Optional[int] = None    