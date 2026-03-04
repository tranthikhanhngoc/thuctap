from fastapi import APIRouter, UploadFile, File, Depends, HTTPException
from sqlalchemy.orm import Session
import pandas as pd

from database import get_db
from models.lophoc import LopHoc
from models.lichhoc import LichHoc
from models.phonghoc import PhongHoc
from models.chitietlichhoc import ChiTietLichHoc

router = APIRouter(
    prefix="/schedule",
    tags=["Schedule"]
)


# ==========================
# Upload Excel Lịch Học
# ==========================
@router.post("/upload")
async def upload_schedule(
    file: UploadFile = File(...),
    db: Session = Depends(get_db)
):

    if not file.filename.endswith(".xlsx"):
        raise HTTPException(status_code=400, detail="File phải là Excel")

    df = pd.read_excel(file.file)

    for _, row in df.iterrows():

        # ===== LỚP =====
        ten_lop = row.get("ten_lop")

        lop = db.query(LopHoc).filter(
            LopHoc.ten_lop == ten_lop
        ).first()

        if not lop:
            lop = LopHoc(
                ten_lop=ten_lop,
                khoa=row.get("khoa", ""),
                nien_khoa=row.get("nien_khoa", ""),
                si_so=row.get("si_so", 0)
            )
            db.add(lop)
            db.flush()


        # ===== PHÒNG =====
        ten_phong = row.get("ten_phong")

        phong = db.query(PhongHoc).filter(
            PhongHoc.ten_phong == ten_phong
        ).first()

        if not phong:
            phong = PhongHoc(
                ten_phong=ten_phong,
                suc_chua=row.get("suc_chua", 0),
                loai_phong=row.get("loai_phong", ""),
                vi_tri=row.get("vi_tri", "")
            )
            db.add(phong)
            db.flush()


        # ===== LỊCH =====
        lich = db.query(LichHoc).filter(
            LichHoc.hoc_ky == row.get("hoc_ky"),
            LichHoc.nam_hoc == row.get("nam_hoc")
        ).first()

        if not lich:
            lich = LichHoc(
                hoc_ky=row.get("hoc_ky"),
                nam_hoc=row.get("nam_hoc"),
                ngay_bat_dau=row.get("ngay_bat_dau"),
                ngay_ket_thuc=row.get("ngay_ket_thuc")
            )
            db.add(lich)
            db.flush()


        # ===== CHI TIẾT =====
        ct = ChiTietLichHoc(
            id_lichhoc=lich.id_lichhoc,
            id_lophoc=lop.id_lophoc,
            id_phong=phong.id_phong,
            id_thoidem=row.get("id_thoidem"),
            mon_hoc=row.get("mon_hoc"),
            giang_vien=row.get("giang_vien")
        )

        db.add(ct)

    db.commit()

    return {"message": "Upload thành công"}