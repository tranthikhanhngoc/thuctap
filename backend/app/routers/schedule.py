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
# Upload Excel
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

        # ======================
        # 1️⃣ LỚP HỌC
        # ======================
        lop = db.query(LopHoc).filter(
            LopHoc.ten_lop == row["ten_lop"]
        ).first()

        if not lop:
            lop = LopHoc(
                ten_lop=row["ten_lop"],
                khoa=row["khoa"],
                nien_khoa=row["nien_khoa"],
                si_so=row["si_so"]
            )
            db.add(lop)
            db.commit()
            db.refresh(lop)

        # ======================
        # 2️⃣ PHÒNG HỌC
        # ======================
        phong = db.query(PhongHoc).filter(
            PhongHoc.ten_phong == row["ten_phong"]
        ).first()

        if not phong:
            phong = PhongHoc(
                ten_phong=row["ten_phong"],
                suc_chua=row["suc_chua"],
                loai_phong=row["loai_phong"],
                vi_tri=row["vi_tri"]
            )
            db.add(phong)
            db.commit()
            db.refresh(phong)

        # ======================
        # 3️⃣ LỊCH HỌC
        # ======================
        lich = db.query(LichHoc).filter(
            LichHoc.hoc_ky == row["hoc_ky"],
            LichHoc.nam_hoc == row["nam_hoc"]
        ).first()

        if not lich:
            lich = LichHoc(
                hoc_ky=row["hoc_ky"],
                nam_hoc=row["nam_hoc"],
                ngay_bat_dau=row["ngay_bat_dau"],
                ngay_ket_thuc=row["ngay_ket_thuc"]
            )
            db.add(lich)
            db.commit()
            db.refresh(lich)

        # ======================
        # 4️⃣ CHI TIẾT LỊCH
        # ======================
        ct = ChiTietLichHoc(
            id_lichhoc=lich.id_lichhoc,
            id_lophoc=lop.id_lophoc,
            id_phong=phong.id_phong,
            id_thoidem=row["id_thoidem"],
            mon_hoc=row["mon_hoc"],
            giang_vien=row["giang_vien"]
        )

        db.add(ct)

    db.commit()

    return {"msg": "Upload lịch học thành công"}