from fastapi import APIRouter, UploadFile, File, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from sqlalchemy import and_
from datetime import date
from dateutil.parser import parse as parse_date
import pandas as pd
import traceback
from io import BytesIO
import re

from database import get_db
from models.lophoc import LopHoc
from models.lichhoc import LichHoc
from models.chitietlichhoc import ChiTietLichHoc

router = APIRouter(prefix="/schedule", tags=["Schedule"])

DAY_MAP = {
    "Thứ Hai": 1,
    "Thứ Ba": 2,
    "Thứ Tư": 3,
    "Thứ Năm": 4,
    "Thứ Sáu": 5,
    "Thứ Bảy": 6,
    "Chủ Nhật": 7
}

def clean_class_name(raw):
    if pd.isna(raw):
        return None
    text = str(raw).strip()
    if not text:
        return None
    lines = text.split("\n")
    first_line = lines[0].strip()
    ignore_starts = ["ghi chú", "nơi nhận", "- ban", "- các khoa", "- lưu", "lưu vt"]
    lower_first = first_line.lower()
    if any(lower_first.startswith(kw) for kw in ignore_starts) or first_line.startswith("-"):
        return None
    return re.sub(r'\s+', ' ', first_line).strip()

def determine_ca_hoc(text: str) -> str | None:
    if not text:
        return None
    t = text.lower().strip()
    if t.startswith("cả ngày"):
        return "Cả ngày"
    if any(prefix in t for prefix in ["s.", "sáng", "s thi", "s. thi"]):
        return "Sáng"
    if any(prefix in t for prefix in ["c.", "chiều", "c thi", "c. thi"]):
        return "Chiều"
    if any(kw in t for kw in ["giảng bài", "thi ", "nghỉ", "học lại"]):
        return "Cả ngày"
    return None

def parse_cell_content(value) -> tuple[str | None, str | None, str | None]:
    if pd.isna(value) or not str(value).strip():
        return None, None, None
    text = str(value).strip().replace("\r", "\n")
    lines = [line.strip() for line in text.split("\n") if line.strip()]
    if not lines:
        return None, None, None
    full_content = "\n".join(lines)
    first_line = lines[0].lower()
    ca_hoc = determine_ca_hoc(first_line)
    giang_vien = None
    for line in lines:
        if any(prefix in line for prefix in ["TS.", "ThS.", "PGS.", "GS.", "Thầy", "Cô"]):
            giang_vien = line.strip()
            break
    return full_content, giang_vien, ca_hoc

@router.post("/upload")
async def upload_schedule(
    file: UploadFile = File(...),
    week_start: str = Query(..., description="Ngày bắt đầu tuần (dd/mm/yyyy)"),
    week_end: str = Query(..., description="Ngày kết thúc tuần (dd/mm/yyyy)"),
    hoc_ky: int = Query(1, ge=1, le=3),
    nam_hoc: str = Query("2025-2026"),
    db: Session = Depends(get_db)
):
    try:
        # Parse ngày
        start_date = parse_date(week_start, dayfirst=True).date()
        end_date = parse_date(week_end, dayfirst=True).date()

        if start_date > end_date:
            raise HTTPException(400, detail="Ngày bắt đầu phải trước hoặc bằng ngày kết thúc")

        # Xóa lịch cũ nếu tồn tại
        existing = db.query(LichHoc).filter(
            and_(LichHoc.ngay_bat_dau == start_date, LichHoc.ngay_ket_thuc == end_date)
        ).first()
        if existing:
            db.delete(existing)
            db.flush()
            print(f"[INFO] Đã xóa lịch cũ tuần {week_start} → {week_end}")

        # Tạo LichHoc mới
        lich = LichHoc(
            hoc_ky=hoc_ky,
            nam_hoc=nam_hoc,
            ngay_bat_dau=start_date,
            ngay_ket_thuc=end_date,
            ten_tuan=f"Tuần từ {week_start} đến {week_end}"
        )
        db.add(lich)
        db.flush()

        # ====================== PHẦN ĐỌC EXCEL (đã bị thiếu) ======================
        content = await file.read()
        excel = pd.ExcelFile(BytesIO(content), engine="openpyxl")

        used_sheet = None
        df_raw = None
        for sheet in excel.sheet_names:
            temp = pd.read_excel(BytesIO(content), sheet_name=sheet, header=None, engine="openpyxl")
            if temp.shape[0] > 10 and temp.shape[1] > 6:
                used_sheet = sheet
                df_raw = temp
                break

        if used_sheet is None:
            raise HTTPException(400, detail="Không tìm thấy sheet hợp lệ")

        # Tìm header
        header_row = None
        for i in range(min(20, len(df_raw))):
            row_str = df_raw.iloc[i].astype(str)
            if "stt" in row_str.str.lower().values and "lớp" in row_str.str.lower().values:
                header_row = i
                break

        if header_row is None:
            raise HTTPException(400, detail="Không tìm thấy header chứa 'STT' và 'Lớp'")

        # Đọc lại với header
        df = pd.read_excel(
            BytesIO(content),
            sheet_name=used_sheet,
            header=header_row,
            engine="openpyxl"
        )

        df.columns = df.columns.astype(str).str.strip().str.replace(r'\s+', ' ', regex=True)

        stt_col = next((c for c in df.columns if "stt" in c.lower()), None)
        class_col = next((c for c in df.columns if "lớp" in c.lower()), None)

        if not stt_col or not class_col:
            raise HTTPException(400, detail="Không tìm thấy cột STT hoặc Lớp")

        df[stt_col] = df[stt_col].ffill()
        df[class_col] = df[class_col].ffill()

        for day in DAY_MAP:
            if day in df.columns:
                df[day] = df[day].ffill()

        df = df[
            df[class_col].notna() &
            df[class_col].str.strip().str.len() > 0 &
            (~df[class_col].str.lower().str.startswith(tuple(["ghi chú", "nơi nhận", "-"])))
        ].reset_index(drop=True)

        # ====================== PHẦN INSERT (có kiểm tra trùng) ======================
        insert_count = 0
        skipped = 0

        for _, row in df.iterrows():
            class_name = clean_class_name(row[class_col])
            if not class_name:
                continue

            lop = db.query(LopHoc).filter(LopHoc.ten_lop == class_name).first()
            if not lop:
                lop = LopHoc(ten_lop=class_name)
                db.add(lop)
                db.flush()

            for day_str, thoidem_id in DAY_MAP.items():
                if day_str not in df.columns:
                    continue
                cell_value = row[day_str]
                if pd.isna(cell_value):
                    continue

                content = str(cell_value).strip()
                if not content or content in {"/", ".", "-"}:
                    continue

                mon_hoc, giang_vien, ca_hoc = parse_cell_content(content)
                if not mon_hoc:
                    continue

                mon_hoc = mon_hoc.strip()
                if giang_vien:
                    giang_vien = giang_vien.strip()

                # Kiểm tra trùng
                existing_ct = db.query(ChiTietLichHoc).filter(
                    and_(
                        ChiTietLichHoc.id_lichhoc == lich.id_lichhoc,
                        ChiTietLichHoc.id_lophoc == lop.id_lophoc,
                        ChiTietLichHoc.id_thoidem == thoidem_id,
                        ChiTietLichHoc.ca_hoc == ca_hoc,
                        ChiTietLichHoc.mon_hoc == mon_hoc,
                        (ChiTietLichHoc.giang_vien == giang_vien) | 
                        (ChiTietLichHoc.giang_vien.is_(None) & (giang_vien == None))
                    )
                ).first()

                if existing_ct:
                    skipped += 1
                    continue

                ct = ChiTietLichHoc(
                    id_lichhoc=lich.id_lichhoc,
                    id_lophoc=lop.id_lophoc,
                    id_phong=None,
                    id_thoidem=thoidem_id,
                    mon_hoc=mon_hoc,
                    giang_vien=giang_vien,
                    ca_hoc=ca_hoc
                )
                db.add(ct)
                insert_count += 1

        db.commit()

        return {
            "message": "Upload lịch học thành công",
            "inserted": insert_count,
            "skipped_duplicate": skipped,
            "lich_hoc_id": lich.id_lichhoc
        }

    except Exception as e:
        db.rollback()
        traceback.print_exc()
        raise HTTPException(500, detail=f"Lỗi upload: {str(e)}")

@router.get("/class/{class_id}")
def get_schedule(
    class_id: int,
    start: str = Query(None, description="Ngày bắt đầu tuần (dd/mm/yyyy)"),
    end: str = Query(None, description="Ngày kết thúc tuần (dd/mm/yyyy)"),
    db: Session = Depends(get_db)
):
    query = db.query(ChiTietLichHoc).filter(ChiTietLichHoc.id_lophoc == class_id)

    if start and end:
        try:
            start_date = parse_date(start, dayfirst=True).date()
            end_date = parse_date(end, dayfirst=True).date()
        except Exception:
            raise HTTPException(400, detail="Định dạng ngày không hợp lệ (dd/mm/yyyy)")

        query = query.join(LichHoc).filter(
            and_(
                LichHoc.ngay_bat_dau == start_date,
                LichHoc.ngay_ket_thuc == end_date
            )
        )

    records = query.order_by(ChiTietLichHoc.id_thoidem).all()

    return [
        {
            "thu": r.id_thoidem,
            "ca_hoc": r.ca_hoc,
            "mon_hoc": r.mon_hoc,
            "giang_vien": r.giang_vien,
            "phong": r.id_phong
        }
        for r in records
    ]

@router.get("/week/exists")
def check_week_exists(
    start: str = Query(...),
    end: str = Query(...),
    db: Session = Depends(get_db)
):
    try:
        start_date = parse_date(start, dayfirst=True).date()
        end_date = parse_date(end, dayfirst=True).date()
    except Exception:
        raise HTTPException(400, detail="Định dạng ngày không hợp lệ (dd/mm/yyyy)")

    exists = db.query(LichHoc).filter(
        and_(
            LichHoc.ngay_bat_dau == start_date,
            LichHoc.ngay_ket_thuc == end_date
        )
    ).first() is not None

    return {"exists": exists}

@router.delete("/week")
def delete_week(
    start: str = Query(...),
    end: str = Query(...),
    db: Session = Depends(get_db)
):
    try:
        start_date = parse_date(start, dayfirst=True).date()
        end_date = parse_date(end, dayfirst=True).date()
    except Exception:
        raise HTTPException(400, detail="Định dạng ngày không hợp lệ (dd/mm/yyyy)")

    lich = db.query(LichHoc).filter(
        and_(
            LichHoc.ngay_bat_dau == start_date,
            LichHoc.ngay_ket_thuc == end_date
        )
    ).first()

    if not lich:
        raise HTTPException(404, detail="Không tìm thấy lịch tuần này")

    db.delete(lich)  # cascade xóa chi tiết
    db.commit()
    return {"message": "Đã xóa lịch tuần thành công"}