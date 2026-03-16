# from fastapi import APIRouter, UploadFile, File, Depends
# from sqlalchemy.orm import Session
# import pandas as pd
# import traceback
# from io import BytesIO
# import re

# from database import get_db
# from models.lophoc import LopHoc
# from models.lichhoc import LichHoc
# from models.chitietlichhoc import ChiTietLichHoc

# router = APIRouter(
#     prefix="/schedule",
#     tags=["Schedule"]
# )

# # map thứ -> id_thoidem
# DAY_MAP = {
#     "Thứ Hai": 1,
#     "Thứ Ba": 2,
#     "Thứ Tư": 3,
#     "Thứ Năm": 4,
#     "Thứ Sáu": 5,
#     "Thứ Bảy": 6,
#     "Chủ Nhật": 7
# }


# def clean_class_name(raw):
#     if pd.isna(raw):
#         return None

#     text = str(raw).strip()
#     if not text:
#         return None

#     # Lấy dòng đầu tiên nếu có nhiều dòng
#     text = text.split("\n")[0].strip()
#     text = re.sub(r'\s+', ' ', text)

#     ignore_keywords = [
#         "ghi chú", "nơi nhận", "- ban", "- các khoa", "- lưu", "lưu vt"
#     ]

#     lower_text = text.lower()
#     if any(lower_text.startswith(k) for k in ignore_keywords) or text.startswith("-"):
#         return None

#     return text


# def parse_schedule_cell(value):
#     if pd.isna(value) or not str(value).strip():
#         return None, None

#     text = str(value).strip().replace("\r", "\n")
#     lines = [l.strip() for l in re.split(r"\n| {2,}", text) if l.strip()]

#     mon = None
#     gv = None

#     for line in lines:
#         # Nhận diện môn học
#         if any(kw in line for kw in ["Giảng bài", "Thi", "Nghỉ", "Học lại"]):
#             mon = line
#             break  # ưu tiên dòng đầu chứa từ khóa môn

#         # Nhận diện giảng viên
#         if any(prefix in line for prefix in ["TS.", "ThS.", "PGS.", "GS.", "Thầy", "Cô"]):
#             gv = line

#     # Fallback regex nếu chưa tìm được
#     if not mon:
#         m = re.search(r"(S\.|C\.|Cả ngày\.)?\s*(Giảng bài|Thi|Nghỉ|Học lại)[^\n]*", text, re.IGNORECASE)
#         if m:
#             mon = m.group().strip()

#     if not gv:
#         m = re.search(r"(TS|ThS|PGS|GS)\.?\s*[A-ZÀ-ỹa-zà-ỹ\s\.]+", text, re.IGNORECASE)
#         if m:
#             gv = m.group().strip()

#     return mon, gv


# @router.post("/upload")
# async def upload_schedule(
#     file: UploadFile = File(...),
#     db: Session = Depends(get_db)
# ):
#     try:
#         print("========== BẮT ĐẦU UPLOAD FILE ==========")
#         print("Tên file:", file.filename)

#         content = await file.read()
#         excel = pd.ExcelFile(BytesIO(content), engine="openpyxl")

#         print("Các sheet có sẵn:", excel.sheet_names)

#         df_raw = None
#         used_sheet = None

#         # Tìm sheet có dữ liệu đáng kể
#         for sheet in excel.sheet_names:
#             temp = excel.parse(sheet, header=None)
#             if temp.shape[0] > 5 and temp.shape[1] > 5:
#                 df_raw = temp
#                 used_sheet = sheet
#                 break

#         if df_raw is None:
#             raise Exception("Không tìm thấy sheet nào có dữ liệu hợp lệ")

#         print(f"✅ Sử dụng sheet: {used_sheet}")
#         print(f"📊 Kích thước raw: {df_raw.shape}")

#         # Tìm dòng header (chứa "STT")
#         header_row = None
#         for i in range(min(15, len(df_raw))):  # giới hạn tìm trong 15 dòng đầu
#             row = df_raw.iloc[i].astype(str)
#             if row.str.contains("stt", case=False, na=False).any():
#                 header_row = i
#                 break

#         if header_row is None:
#             raise Exception("Không tìm thấy dòng header chứa 'STT'")

#         print(f"✅ Dòng header: {header_row + 1} (index {header_row})")

#         # Đọc lại DataFrame với header đúng
#         df = pd.read_excel(
#             BytesIO(content),
#             sheet_name=used_sheet,
#             engine="openpyxl",
#             header=header_row
#         )

#         # Làm sạch tên cột
#         df.columns = df.columns.astype(str).str.strip().str.replace(r'\s+', ' ', regex=True)

#         print("Các cột sau khi đọc:", df.columns.tolist())

#         # 1. Tìm và fill cột STT
#         stt_col = next((col for col in df.columns if "stt" in col.lower()), None)
#         if not stt_col:
#             raise Exception("Không tìm thấy cột STT")

#         df[stt_col] = df[stt_col].ffill()

#         # 2. Tìm cột Lớp
#         class_col = next((col for col in df.columns if "lớp" in col.lower()), None)
#         if not class_col:
#             raise Exception("Không tìm thấy cột Lớp")

#         print(f"✅ Cột lớp: {class_col}")

#         # 3. Fill cột lớp (merge cell theo chiều dọc)
#         df[class_col] = df[class_col].ffill()

#         # 4. Fill các cột ngày trong tuần
#         for day in DAY_MAP:
#             if day in df.columns:
#                 df[day] = df[day].ffill()

#         # Loại bỏ dòng rỗng hoặc không có lớp
#         df = df[df[class_col].notna() & (df[class_col].str.strip() != "")]
#         df = df.reset_index(drop=True)

#         print(f"Sau khi làm sạch: {len(df)} dòng dữ liệu")

#         # Tạo bản ghi LichHoc mới
#         lich = LichHoc(hoc_ky=1, nam_hoc="2025-2026")  # bạn có thể thay đổi năm học
#         db.add(lich)
#         db.flush()

#         insert_count = 0

#         for _, row in df.iterrows():
#             class_name = clean_class_name(row[class_col])
#             if not class_name:
#                 continue

#             # Tìm hoặc tạo lớp
#             lop = db.query(LopHoc).filter(LopHoc.ten_lop == class_name).first()
#             if not lop:
#                 lop = LopHoc(ten_lop=class_name)
#                 db.add(lop)
#                 db.flush()
#                 print(f"🆕 Tạo lớp mới: {class_name}")

#             for day, thoidem_id in DAY_MAP.items():
#                 if day not in df.columns:
#                     continue

#                 value = row[day]
#                 if pd.isna(value) or str(value).strip() in {"", "/"}:
#                     continue

#                 mon, gv = parse_schedule_cell(value)
#                 if not mon:
#                     continue

#                 ct = ChiTietLichHoc(
#                     id_lichhoc=lich.id_lichhoc,
#                     id_lophoc=lop.id_lophoc,
#                     id_phong=None,  # có thể bổ sung sau
#                     id_thoidem=thoidem_id,
#                     mon_hoc=mon,
#                     giang_vien=gv
#                 )

#                 db.add(ct)
#                 insert_count += 1

#                 print(f"  → Insert: {day} | {mon} | {gv or 'Chưa xác định GV'}")

#         db.commit()

#         print(f"🎉 UPLOAD THÀNH CÔNG - Tổng: {insert_count} tiết học")
#         return {
#             "message": "Upload lịch học thành công",
#             "inserted": insert_count,
#             "lich_hoc_id": lich.id_lichhoc
#         }

#     except Exception as e:
#         db.rollback()
#         print("❌ LỖI UPLOAD:")
#         traceback.print_exc()
#         return {"error": str(e)}


# @router.get("/class/{class_id}")
# def get_schedule(class_id: int, db: Session = Depends(get_db)):
#     records = db.query(ChiTietLichHoc).filter(
#         ChiTietLichHoc.id_lophoc == class_id
#     ).all()

#     return [
#         {
#             "thu": r.id_thoidem,
#             "mon_hoc": r.mon_hoc,
#             "giang_vien": r.giang_vien or "Chưa xác định",
#             "phong": r.id_phong  # nếu sau này có phòng
#         }
#         for r in records
#     ]


from fastapi import APIRouter, UploadFile, File, Depends
from sqlalchemy.orm import Session
import pandas as pd
import traceback
from io import BytesIO
import re

from database import get_db
from models.lophoc import LopHoc
from models.lichhoc import LichHoc
from models.chitietlichhoc import ChiTietLichHoc

router = APIRouter(
    prefix="/schedule",
    tags=["Schedule"]
)

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
    """Làm sạch tên lớp - chỉ lấy phần tên lớp chính"""
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

    first_line = re.sub(r'\s+', ' ', first_line).strip()
    return first_line


def determine_ca_hoc(text: str) -> str | None:
    """Phân loại ca học: Sáng / Chiều / Cả ngày"""
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
    """
    Trả về: (mon_hoc_full, giang_vien, ca_hoc)
    mon_hoc_full: toàn bộ nội dung cell (giữ nguyên nhiều dòng)
    """
    if pd.isna(value) or not str(value).strip():
        return None, None, None

    text = str(value).strip().replace("\r", "\n")
    lines = [line.strip() for line in text.split("\n") if line.strip()]

    if not lines:
        return None, None, None

    full_content = "\n".join(lines)

    # Xác định ca học từ dòng đầu
    first_line = lines[0].lower()
    ca_hoc = None
    if first_line.startswith("cả ngày"):
        ca_hoc = "Cả ngày"
    elif any(prefix in first_line for prefix in ["s.", "sáng", "s thi", "s. thi"]):
        ca_hoc = "Sáng"
    elif any(prefix in first_line for prefix in ["c.", "chiều", "c thi", "c. thi"]):
        ca_hoc = "Chiều"
    elif any(kw in first_line for kw in ["giảng bài", "thi ", "nghỉ"]):
        ca_hoc = "Cả ngày"

    # Tìm giảng viên
    giang_vien = None
    for line in lines:
        if any(prefix in line for prefix in ["TS.", "ThS.", "PGS.", "GS.", "Thầy", "Cô"]):
            giang_vien = line.strip()
            break

    return full_content, giang_vien, ca_hoc


@router.post("/upload")
async def upload_schedule(
    file: UploadFile = File(...),
    db: Session = Depends(get_db)
):
    try:
        print("========== BẮT ĐẦU UPLOAD FILE ==========")
        print("Tên file:", file.filename)

        content = await file.read()
        excel = pd.ExcelFile(BytesIO(content), engine="openpyxl")

        used_sheet = None
        df_raw = None

        for sheet_name in excel.sheet_names:
            temp_df = pd.read_excel(
                BytesIO(content),
                sheet_name=sheet_name,
                header=None,
                engine="openpyxl"
            )
            if temp_df.shape[0] > 10 and temp_df.shape[1] > 6:
                has_stt = temp_df.astype(str).apply(lambda x: x.str.contains("stt", case=False)).any().any()
                has_lop = temp_df.astype(str).apply(lambda x: x.str.contains("lớp", case=False)).any().any()
                if has_stt and has_lop:
                    used_sheet = sheet_name
                    df_raw = temp_df
                    break

        if used_sheet is None:
            raise Exception("Không tìm thấy sheet lịch học hợp lệ")

        print(f"→ Sử dụng sheet: {used_sheet}")

        header_row = None
        for i in range(min(20, len(df_raw))):
            row_str = df_raw.iloc[i].astype(str)
            if "stt" in row_str.str.lower().values and "lớp" in row_str.str.lower().values:
                header_row = i
                break

        if header_row is None:
            raise Exception("Không tìm thấy dòng header chứa 'Stt' và 'Lớp'")

        print(f"→ Header tại dòng: {header_row + 1}")

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
            raise Exception("Không tìm thấy cột STT hoặc Lớp")

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

        print(f"→ Sau lọc: {len(df)} dòng lớp học")

        lich = LichHoc(
            hoc_ky=1,
            nam_hoc="2026"
        )
        db.add(lich)
        db.flush()

        insert_count = 0

        # Regex phát hiện ô chỉ chứa ngày tháng (định dạng phổ biến)
        date_pattern = re.compile(
            r'^(Ngày\s*)?\d{1,2}[./-]\d{1,2}[./-]\d{2,4}$',
            re.IGNORECASE
        )

        for _, row in df.iterrows():
            class_name = clean_class_name(row[class_col])
            if not class_name:
                continue

            lop = db.query(LopHoc).filter(LopHoc.ten_lop == class_name).first()
            if not lop:
                lop = LopHoc(ten_lop=class_name)
                db.add(lop)
                db.flush()
                print(f"  + Tạo lớp mới: {class_name}")

            for day_str, thoidem_id in DAY_MAP.items():
                if day_str not in df.columns:
                    continue

                cell_value = row[day_str]
                if pd.isna(cell_value):
                    continue

                content = str(cell_value).strip()
                if not content or content in {"/", ".", "-"}:
                    continue

                # TỰ ĐỘNG BỎ QUA Ô CHỈ CHỨA NGÀY THÁNG
                if date_pattern.match(content):
                    # print(f"Bỏ qua header ngày: {content}")  # uncomment để debug
                    continue

                mon_hoc, giang_vien, ca_hoc = parse_cell_content(content)

                if not mon_hoc:
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

                ca_display = f"[{ca_hoc}] " if ca_hoc else ""
                print(f"  → {day_str:<8} {ca_display}{mon_hoc[:60]}{'...' if len(mon_hoc)>60 else ''} | {giang_vien or ''}")

        db.commit()

        print(f"🎉 Upload hoàn tất - {insert_count} tiết học được lưu")
        return {
            "message": "Upload lịch học thành công",
            "inserted": insert_count,
            "lich_hoc_id": lich.id_lichhoc
        }

    except Exception as e:
        db.rollback()
        print("❌ LỖI UPLOAD:")
        traceback.print_exc()
        return {"error": str(e)}


@router.get("/class/{class_id}")
def get_schedule(class_id: int, db: Session = Depends(get_db)):
    records = db.query(ChiTietLichHoc).filter(
        ChiTietLichHoc.id_lophoc == class_id
    ).order_by(ChiTietLichHoc.id_thoidem).all()

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