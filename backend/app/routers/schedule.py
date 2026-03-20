from typing import List, Dict, Optional
from datetime import date, timedelta
from dateutil.parser import parse as parse_date
import re
import traceback
import pandas as pd
from io import BytesIO

from fastapi import APIRouter, UploadFile, File, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from sqlalchemy import and_

from database import get_db
from models.lophoc import LopHoc
from models.lichhoc import LichHoc
from models.chitietlichhoc import ChiTietLichHoc
from models.bacsi import BacSi     # import model BacSi
from models.lophoc import LopHoc   # nếu muốn join lấy tên lớp

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


# ────────────────────────────────────────────────
#                Helper Functions
# ────────────────────────────────────────────────

def clean_class_name(raw) -> Optional[str]:
    if pd.isna(raw):
        return None
    text = str(raw).strip()
    if not text:
        return None

    lines = text.split("\n")
    first_line = lines[0].strip().lower()

    ignore_keywords = ["ghi chú", "nơi nhận", "- ban", "- các khoa", "- lưu", "lưu vt"]
    if any(first_line.startswith(kw) for kw in ignore_keywords) or first_line.startswith("-"):
        return None

    return re.sub(r'\s+', ' ', lines[0].strip())


def determine_ca_hoc(text: str) -> Optional[str]:
    if not text:
        return None
    t = text.lower().strip()

    if t.startswith("cả ngày"):
        return "Cả ngày"
    if any(p in t for p in ["s.", "sáng", "s thi", "s. thi"]):
        return "Sáng"
    if any(p in t for p in ["c.", "chiều", "c thi", "c. thi"]):
        return "Chiều"
    if any(kw in t for kw in ["giảng bài", "thi ", "nghỉ", "học lại"]):
        return "Cả ngày"

    return None


def parse_cell_content(value) -> tuple[Optional[str], Optional[str], Optional[str]]:
    if pd.isna(value) or not str(value).strip():
        return None, None, None

    text = str(value).strip().replace("\r", "\n")
    lines = [line.strip() for line in text.split("\n") if line.strip()]
    if not lines:
        return None, None, None

    full_content = "\n".join(lines)
    first_line_lower = lines[0].lower().strip()
    ca_hoc = determine_ca_hoc(first_line_lower)

    giang_vien = None

    # Tìm giảng viên (ưu tiên từ dòng thứ 2 trở đi)
    title_prefixes = [
        "ts.", "th.s.", "ths.", "pgs.", "gs.", "bs.", "bs ck", "ckii", "ck i", "ck ii",
        "bác sĩ", "dr.", "dr ", "bs ", "gv.", "giảng viên", "thầy ", "cô ", "p.gs.", "p gs"
    ]

    name_pattern = re.compile(
        r'^[A-ZÁÀẢÃẠĂẰẲẴẶÂẤẦẨẪẬĐÉÈẺẼẸÊẾỀỂỄỆÍÌỈĨỊÓÒỎÕỌÔỐỒỔỖỘƠỚỜỞỠỢÚÙỦŨỤƯỨỪỬỮỰÝỲỶỸỴ]'
        r'[a-záàảãạăằẳẵặâấầẩẫậđéèẻẽẹêếềểễệíìỉĩịóòỏõọôốồổỗộơớờởỡợúùủũụưứừửữựýỳỷỹỵ\s\.-]+'
        r'\s+[A-ZÁÀẢÃẠĂẰẲẴẶÂẤẦẨẪẬĐÉÈẺẼẸÊẾỀỂỄỆÍÌỈĨỊÓÒỎÕỌÔỐỒỔỖỘƠỚỜỞỠỢÚÙỦŨỤƯỨỪỬỮỰÝỲỶỸỴ]'
        r'[a-záàảãạăằẳẵặâấầẩẫậđéèẻẽẹêếềểễệíìỉĩịóòỏõọôốồổỗộơớờởỡợúùủũụưứừửữựýỳỷỹỵ\s\.-]+$'
    )

    for i, line in enumerate(lines):
        line_lower = line.lower().strip()

        has_title = any(p in line_lower for p in title_prefixes)
        looks_like_name = bool(name_pattern.match(line))

        if (has_title or (looks_like_name and i >= 1)) and len(line.split()) >= 2:
            giang_vien = line.strip()
            break

    # Fallback: dòng thứ 2 nếu trông giống tên
    if not giang_vien and len(lines) >= 2:
        potential = lines[1].strip()
        if len(potential.split()) >= 2 and not any(w in potential.lower() for w in ['sáng', 'chiều', 'cả ngày', 'nghỉ', 'thi', 'phòng', 'lớp']):
            giang_vien = potential

    return full_content.strip(), giang_vien, ca_hoc


def find_valid_sheet(excel: pd.ExcelFile) -> Optional[tuple[str, pd.DataFrame]]:
    for sheet in excel.sheet_names:
        df = pd.read_excel(excel, sheet_name=sheet, header=None, engine="openpyxl")
        if df.shape[0] > 10 and df.shape[1] > 6:
            return sheet, df
    return None


def find_header_row(df_raw: pd.DataFrame) -> Optional[int]:
    for i in range(min(20, len(df_raw))):
        row_str = df_raw.iloc[i].astype(str).str.lower()
        if "stt" in row_str.values and "lớp" in row_str.values:
            return i
    return None


# ────────────────────────────────────────────────
#                   Endpoints
# ────────────────────────────────────────────────

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
        start_date = parse_date(week_start, dayfirst=True).date()
        end_date = parse_date(week_end, dayfirst=True).date()

        if start_date > end_date:
            raise HTTPException(400, detail="Ngày bắt đầu phải trước hoặc bằng ngày kết thúc")

        # Xóa lịch cũ nếu trùng tuần
        existing = db.query(LichHoc).filter(
            and_(LichHoc.ngay_bat_dau == start_date, LichHoc.ngay_ket_thuc == end_date)
        ).first()
        if existing:
            db.delete(existing)
            db.flush()

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

        # Đọc file Excel
        content = await file.read()
        excel = pd.ExcelFile(BytesIO(content), engine="openpyxl")

        sheet_info = find_valid_sheet(excel)
        if not sheet_info:
            raise HTTPException(400, detail="Không tìm thấy sheet hợp lệ")

        used_sheet, df_raw = sheet_info

        header_row = find_header_row(df_raw)
        if header_row is None:
            raise HTTPException(400, detail="Không tìm thấy header chứa 'STT' và 'Lớp'")

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

        # Forward fill các cột cần thiết
        df[stt_col] = df[stt_col].ffill()
        df[class_col] = df[class_col].ffill()
        for day in DAY_MAP:
            if day in df.columns:
                df[day] = df[day].ffill()

        # Lọc bỏ dòng không hợp lệ
        df = df[
            df[class_col].notna() &
            df[class_col].str.strip().str.len() > 0 &
            (~df[class_col].str.lower().str.startswith(tuple(["ghi chú", "nơi nhận", "-"])))
        ].reset_index(drop=True)

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

                content_str = str(cell_value).strip()
                if not content_str or content_str in {"/", ".", "-"}:
                    continue

                mon_hoc, giang_vien, ca_hoc = parse_cell_content(content_str)
                if not mon_hoc:
                    continue

                mon_hoc = mon_hoc.strip()
                giang_vien = giang_vien.strip() if giang_vien else None

                # Kiểm tra trùng lặp
                existing_ct = db.query(ChiTietLichHoc).filter(
                    and_(
                        ChiTietLichHoc.id_lichhoc == lich.id_lichhoc,
                        ChiTietLichHoc.id_lophoc == lop.id_lophoc,
                        ChiTietLichHoc.id_thoidem == thoidem_id,
                        ChiTietLichHoc.ca_hoc == ca_hoc,
                        ChiTietLichHoc.mon_hoc == mon_hoc,
                        (ChiTietLichHoc.giang_vien == giang_vien) |
                        (ChiTietLichHoc.giang_vien.is_(None) & (giang_vien is None))
                    )
                ).first()

                if existing_ct:
                    skipped += 1
                    continue

                ct = ChiTietLichHoc(
                    id_lichhoc=lich.id_lichhoc,
                    id_lophoc=lop.id_lophoc,
                    id_phong=None,  # sẽ bổ sung sau nếu cần
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
        and_(LichHoc.ngay_bat_dau == start_date, LichHoc.ngay_ket_thuc == end_date)
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
        and_(LichHoc.ngay_bat_dau == start_date, LichHoc.ngay_ket_thuc == end_date)
    ).first()

    if not lich:
        raise HTTPException(404, detail="Không tìm thấy lịch tuần này")

    db.delete(lich)  # cascade delete chi tiết
    db.commit()

    return {"message": "Đã xóa lịch tuần thành công"}


@router.get("/class/{class_id}")
def get_class_schedule(
    class_id: int,
    start: Optional[str] = Query(None, description="Ngày bắt đầu tuần (dd/mm/yyyy)"),
    end: Optional[str] = Query(None, description="Ngày kết thúc tuần (dd/mm/yyyy)"),
    db: Session = Depends(get_db)
):
    query = db.query(ChiTietLichHoc).filter(ChiTietLichHoc.id_lophoc == class_id)

    if start and end:
        try:
            start_date = parse_date(start, dayfirst=True).date()
            end_date = parse_date(end, dayfirst=True).date()
            query = query.join(LichHoc).filter(
                and_(
                    LichHoc.ngay_bat_dau == start_date,
                    LichHoc.ngay_ket_thuc == end_date
                )
            )
        except Exception:
            raise HTTPException(400, detail="Định dạng ngày không hợp lệ (dd/mm/yyyy)")

    records = query.order_by(ChiTietLichHoc.id_thoidem, ChiTietLichHoc.ca_hoc).all()

    return [
        {
            "thu": r.id_thoidem,
            "ca_hoc": r.ca_hoc,
            "mon_hoc": r.mon_hoc,
            "giang_vien": r.giang_vien,
            "phong": r.id_phong  # None hiện tại
        }
        for r in records
    ]


# ────────────────────────────────────────────────
#              Bác sĩ / Trực khoa endpoints
# ────────────────────────────────────────────────

def get_doctors_on_duty_logic(db: Session, target_date_str: str) -> Dict:
    try:
        target_date = parse_date(target_date_str, dayfirst=True).date()
    except Exception:
        return {"ngay": target_date_str, "bac_si": []}

    lich = db.query(LichHoc).filter(
        and_(
            LichHoc.ngay_bat_dau <= target_date,
            LichHoc.ngay_ket_thuc >= target_date
        )
    ).order_by(LichHoc.ngay_bat_dau.desc()).first()

    if not lich:
        return {"ngay": target_date_str, "bac_si": []}

    thu = target_date.isoweekday()

    records = db.query(
        ChiTietLichHoc.giang_vien.label("bac_si"),
        ChiTietLichHoc.ca_hoc.label("ca"),
        ChiTietLichHoc.mon_hoc.label("mon"),
        LopHoc.ten_lop.label("lop")
    ).join(LopHoc).filter(
        ChiTietLichHoc.id_lichhoc == lich.id_lichhoc,
        ChiTietLichHoc.id_thoidem == thu,
        ChiTietLichHoc.giang_vien.isnot(None),
        ChiTietLichHoc.giang_vien != ""
    ).all()

    result: Dict[str, Dict[str, List[Dict]]] = {}
    for r in records:
        bs = r.bac_si.strip()
        ca = r.ca or "Cả ngày"

        if bs not in result:
            result[bs] = {}
        if ca not in result[bs]:
            result[bs][ca] = []

        result[bs][ca].append({
            "mon": (r.mon or "").strip(),
            "lop": r.lop.strip()
        })

    formatted = []
    for bs, groups in result.items():
        for ca, items in groups.items():
            formatted.append({
                "bac_si": bs,
                "ca": ca,
                "so_lop": len(items),
                "chi_tiet": items
            })

    return {
        "ngay": target_date_str,
        "thu": f"Thứ {thu}",
        "tuan": lich.ten_tuan,
        "tong_bac_si": len(result),
        "bac_si": sorted(formatted, key=lambda x: (x["ca"] or "", x["bac_si"]))
    }


@router.get("/doctors/on-duty/{target_date}")
def get_doctors_on_duty(
    target_date: str,
    ca: Optional[str] = Query(None, description="Sáng / Chiều / Cả ngày"),
    db: Session = Depends(get_db)
):
    data = get_doctors_on_duty_logic(db, target_date)

    if ca:
        ca_norm = ca.strip().title()
        if ca_norm not in ["Sáng", "Chiều", "Cả Ngày", "Cả ngày"]:
            raise HTTPException(400, detail="Ca không hợp lệ")
        data["bac_si"] = [item for item in data["bac_si"] if item["ca"] == ca_norm]

    return data

@router.get("/doctors/current-and-next")
def get_current_and_next_doctors(
    days_ahead: int = Query(3, ge=1, le=10, description="Số ngày tới cần lấy (mặc định 3)"),
    db: Session = Depends(get_db)
):
    today = date.today()
    dates = [today + timedelta(days=i) for i in range(days_ahead + 1)]

    current = []
    upcoming = []

    for target_date in dates:
        date_str = target_date.strftime("%d/%m/%Y")
        data = get_doctors_on_duty_logic(db, date_str)

        for item in data.get("bac_si", []):
            ca = item["ca"]
            if ca is None or ca.strip() == "":
                ca = "Cả ngày"

            # Chuẩn hóa tên ca (để frontend dễ so sánh)
            ca_norm = ca.strip().title()  # → "Sáng", "Chiều", "Cả Ngày"

            entry = {
                "ten_bac_si": item["bac_si"].strip(),
                "ca_truc": ca_norm,                     # ← dùng tên đã chuẩn hóa
                "ngay": date_str,
                "chuyen_khoa": "Giảng viên / Trực khoa",
                "sdt": None,          # sau này join với BacSi nếu cần
                "email": None,
                "avatar": None,
                "ghi_chu": ", ".join(f"{c['lop']} - {c['mon']}" for c in item["chi_tiet"]),
                # Thời gian cố định theo ca – có thể cải thiện sau nếu có giờ thực tế
                "thoi_gian_bat_dau": "07:00" if ca_norm == "Sáng" else "13:00" if ca_norm == "Chiều" else "07:00",
                "thoi_gian_ket_thuc": "12:00" if ca_norm == "Sáng" else "17:00" if ca_norm == "Chiều" else "17:00",
            }

            if target_date == today:
                current.append(entry)
            else:
                upcoming.append(entry)

    # Sort current: ưu tiên đang trực (có thể thêm logic isActive ở backend nếu muốn)
    # Sort upcoming: theo ngày → ca (Sáng > Chiều > Cả ngày)
    sort_ca = {"Sáng": 0, "Chiều": 1, "Cả Ngày": 2, "Cả ngày": 2}
    upcoming.sort(key=lambda x: (
        datetime.strptime(x["ngay"], "%d/%m/%Y"),
        sort_ca.get(x["ca_truc"], 999)
    ))

    return {
        "ngay_hien_tai": today.strftime("%d/%m/%Y"),
        "current": current,
        "next": upcoming,
        "total_current": len(current),
        "total_next": len(upcoming)
    }

@router.get("/doctors/all")
def get_all_doctors(db: Session = Depends(get_db)):
    doctors = db.query(BacSi).all()
    
    result = [
        {
            "ten_bac_si": bs.ho_ten.strip() if bs.ho_ten else "",
            "chuyen_khoa": bs.chuyen_khoa or "Khoa lâm sàng / Giảng viên",
            "sdt": bs.so_dien_thoai,
            "email": bs.email,
            "avatar": None,
            "ghi_chu": f"Trình độ: {bs.trinh_do or 'Chưa cập nhật'}",
        }
        for bs in doctors
        if bs.ho_ten and bs.ho_ten.strip()  # loại bỏ bản ghi rỗng nếu có
    ]
    
    return {"total": len(result), "doctors": result}