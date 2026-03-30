from pydantic import BaseModel
from datetime import date


class ScheduleExcelRow(BaseModel):

    # ===== LỚP =====
    ten_lop: str
    khoa: str
    nien_khoa: str
    si_so: int

    # ===== LỊCH =====
    hoc_ky: int
    nam_hoc: str
    ngay_bat_dau: date
    ngay_ket_thuc: date

    # ===== PHÒNG =====
    ten_phong: str
    suc_chua: int
    loai_phong: str
    vi_tri: str

    # ===== CHI TIẾT LỊCH =====
    mon_hoc: str
    giang_vien: str
    id_thoidem: int