from pydantic import BaseModel
from datetime import date

class CuocHenCreate(BaseModel):
    id_bacsi: int
    id_benhnhan: int
    ngay_hen: date
    ca_lam_viec: str
    ly_do: str


# class CuocHenOut(BaseModel):
#     id_cuochen: int
#     id_bacsi: int
#     id_benhnhan: int
#     ngay_hen: date
#     ca_lam_viec: str
#     ly_do: str
#     trang_thai: str

#     class Config:
#         orm_mode = True
from pydantic import BaseModel
from datetime import date

class CuocHenOut(BaseModel):
    id_cuochen: int
    ngay_hen: date
    ca_lam_viec: str
    ly_do: str
    trang_thai: str

    id_bacsi: int
    ten_bacsi: str

    id_benhnhan: int
    ten_benhnhan: str

    class Config:
        orm_mode = True
        
        
