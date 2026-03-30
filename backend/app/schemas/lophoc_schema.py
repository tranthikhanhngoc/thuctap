from pydantic import BaseModel

class LopHocBase(BaseModel):
    ten_lop: str
    khoa: str
    nien_khoa: str
    si_so: int


class LopHocCreate(LopHocBase):
    pass


class LopHocUpdate(LopHocBase):
    pass