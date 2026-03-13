from fastapi import APIRouter, UploadFile, File, Depends
from sqlalchemy.orm import Session
import pandas as pd
import traceback
from io import BytesIO

from database import get_db
from models.lophoc import LopHoc
from models.lichhoc import LichHoc
from models.chitietlichhoc import ChiTietLichHoc

router = APIRouter(
    prefix="/schedule",
    tags=["Schedule"]
)

# map thứ -> id_thoidem
DAY_MAP = {
    "Thứ Hai": 1,
    "Thứ Ba": 2,
    "Thứ Tư": 3,
    "Thứ Năm": 4,
    "Thứ Sáu": 5,
    "Thứ Bảy": 6,
    "Chủ Nhật": 7
}


# ==========================
# Hàm xử lý tên lớp
# ==========================
def clean_class_name(raw):

    if pd.isna(raw):
        return None

    text = str(raw).strip()

    if text == "":
        return None

    text = text.split("\n")[0]
    text = text.replace("  ", " ")
    text = text.strip()

    ignore_keywords = [
        "ghi chú",
        "nơi nhận",
        "- ban",
        "- các khoa",
        "- lưu",
        "lưu vt"
    ]

    for k in ignore_keywords:
        if text.lower().startswith(k):
            return None

    if text.startswith("-"):
        return None

    return text


# ==========================
# Parse nội dung cell lịch
# ==========================
import re

def parse_schedule_cell(value):

    if not value:
        return None, None

    text = str(value).strip()

    # chuẩn hóa xuống dòng
    text = text.replace("\r", "\n")

    # tách dòng
    lines = [l.strip() for l in re.split(r"\n| {2,}", text) if l.strip()]

    mon = None
    gv = None

    for l in lines:

        if "Giảng bài" in l:
            mon = l

        if any(x in l for x in ["TS", "ThS", "PGS", "GS"]):
            gv = l

    # nếu vẫn chưa có môn thì regex
    if not mon:
        m = re.search(r"(S\.|C\.|Cả ngày\.?)?\s*Giảng bài\s*\d+(\s*\(tt\))?", text)
        if m:
            mon = m.group()

    # nếu vẫn chưa có GV
    if not gv:
        m = re.search(r"(TS|ThS|PGS|GS)\s+[A-ZÀ-Ỹa-zà-ỹ\s]+", text)
        if m:
            gv = m.group()

    return mon, gv


# ==========================
# Upload Excel
# ==========================
@router.post("/upload")
async def upload_schedule(
    file: UploadFile = File(...),
    db: Session = Depends(get_db)
):

    try:

        print("========== UPLOAD FILE ==========")
        print("Tên file:", file.filename)

        content = await file.read()

        excel = pd.ExcelFile(BytesIO(content), engine="openpyxl")

        print("📄 Sheet names:", excel.sheet_names)

        df_raw = None
        used_sheet = None

        # tìm sheet có dữ liệu
        for sheet in excel.sheet_names:

            temp = excel.parse(sheet, header=None)

            if temp.shape[0] > 5:
                df_raw = temp
                used_sheet = sheet
                break

        if df_raw is None:
            raise Exception("Không tìm thấy sheet có dữ liệu")

        print("✅ Using sheet:", used_sheet)
        print("📊 Raw shape:", df_raw.shape)

        # tìm dòng header STT
        header_row = None

        for i in range(len(df_raw)):

            row = df_raw.iloc[i].astype(str)

            if row.str.contains("stt", case=False).any():
                header_row = i
                break

        if header_row is None:
            raise Exception("Không tìm thấy header STT")

        print("✅ Header row:", header_row)

        df = pd.read_excel(
            BytesIO(content),
            sheet_name=used_sheet,
            engine="openpyxl",
            header=header_row
        )

        df.columns = df.columns.astype(str).str.strip()

        print("📊 Columns:", df.columns.tolist())

        # tìm cột STT
        stt_col = None
        for col in df.columns:
            if "stt" in col.lower():
                stt_col = col
                break

        if not stt_col:
            raise Exception("Không tìm thấy cột STT")

        df[stt_col] = df[stt_col].ffill()

        # tìm cột lớp
        class_col = None
        for col in df.columns:
            if "lớp" in col.lower():
                class_col = col
                break

        if not class_col:
            raise Exception("Không tìm thấy cột Lớp")

        print("✅ Class column:", class_col)

        # tạo lịch học
        lich = LichHoc(
            hoc_ky=1,
            nam_hoc="2026"
        )

        db.add(lich)
        db.flush()

        insert_count = 0

        # ==========================
        # parse dữ liệu
        # ==========================
        for _, row in df.iterrows():

            class_name = clean_class_name(row[class_col])

            if not class_name:
                continue

            lop = db.query(LopHoc).filter(
                LopHoc.ten_lop == class_name
            ).first()

            if not lop:
                print("⚠ Không tìm thấy lớp:", class_name)
                continue

            print("✔ Found class:", class_name)

            for day, thoidem_id in DAY_MAP.items():

                if day not in df.columns:
                    continue

                value = row[day]

                if pd.isna(value):
                    continue

                value = str(value).strip()

                if value == "" or value == "/":
                    continue

                mon, gv = parse_schedule_cell(value)

                if not mon:
                    continue

                ct = ChiTietLichHoc(
                    id_lichhoc=lich.id_lichhoc,
                    id_lophoc=lop.id_lophoc,
                    id_phong=None,
                    id_thoidem=thoidem_id,
                    mon_hoc=mon,
                    giang_vien=gv
                )

                db.add(ct)
                insert_count += 1

                print(f"📌 Insert {day} | {mon} | {gv}")

        db.commit()

        print("🎉 Upload thành công")
        print("📊 Tổng số lịch đã thêm:", insert_count)

        return {
            "message": "Upload thành công",
            "inserted": insert_count
        }

    except Exception as e:

        print("❌ LỖI UPLOAD")
        traceback.print_exc()

        return {"error": str(e)}


# ==========================
# Lấy lịch theo lớp
# ==========================
@router.get("/class/{class_id}")
def get_schedule(class_id: int, db: Session = Depends(get_db)):

    records = db.query(ChiTietLichHoc).filter(
        ChiTietLichHoc.id_lophoc == class_id
    ).all()

    result = []

    for r in records:

        result.append({
            "thu": r.id_thoidem,
            "mon_hoc": r.mon_hoc,
            "giang_vien": r.giang_vien
        })

    return result


# ĐÒng đầu tiên không có đọc không được 