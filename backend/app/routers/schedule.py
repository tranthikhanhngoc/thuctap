import logging
from typing import List, Dict, Optional
from datetime import date, timedelta
from dateutil.parser import parse as parse_date
import re
import traceback
import pandas as pd
from io import BytesIO
from datetime import datetime  # ← thêm dòng này

from fastapi import APIRouter, UploadFile, File, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from sqlalchemy import and_

from database import get_db
from models.lophoc import LopHoc
from models.lichhoc import LichHoc
from models.chitietlichhoc import ChiTietLichHoc
from models.bacsi import BacSi
from models.lophoc import LopHoc

# Thiết lập logging
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] %(message)s",
    datefmt="%Y-%m-%d %H:%M:%S",
)
logger = logging.getLogger(__name__)

router = APIRouter(prefix="/schedule", tags=["Schedule"])

DAY_MAP = {
    "Thứ Hai": 1, "Thứ Ba": 2, "Thứ Tư": 3, "Thứ Năm": 4, "Thứ Sáu": 5,
    "Thứ Bảy": 6, "Chủ Nhật": 7
}

# ────────────────────────────────────────────────
#                Helper Functions
# ────────────────────────────────────────────────
def normalize_ca(ca: Optional[str]) -> str:
    if not ca:
        return "Cả ngày"
    c = ca.lower().strip()

    if "sáng" in c:
        return "Sáng"
    if "chiều" in c:
        return "Chiều"
    return "Cả ngày"

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
        logger.debug(f"Bỏ qua dòng không hợp lệ (ghi chú hoặc header): {first_line}")
        return None

    cleaned = re.sub(r'\s+', ' ', lines[0].strip())
    logger.debug(f"Tên lớp sau clean: '{cleaned}'")
    return cleaned


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

    logger.debug(f"Không xác định được ca học từ: '{text}'")
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
            logger.info(f"Phát hiện giảng viên/bác sĩ (dòng {i+1}): {giang_vien}")
            break

    if not giang_vien and len(lines) >= 2:
        potential = lines[1].strip()
        if len(potential.split()) >= 2 and not any(w in potential.lower() for w in ['sáng', 'chiều', 'cả ngày', 'nghỉ', 'thi', 'phòng', 'lớp']):
            giang_vien = potential
            logger.info(f"Fallback - giảng viên từ dòng 2: {giang_vien}")

    logger.debug(f"Parse cell: mon_hoc='{full_content[:50]}...', giang_vien='{giang_vien}', ca_hoc='{ca_hoc}'")
    return full_content.strip(), giang_vien, ca_hoc


def find_valid_sheet(excel: pd.ExcelFile) -> Optional[tuple[str, pd.DataFrame]]:
    for sheet in excel.sheet_names:
        df = pd.read_excel(excel, sheet_name=sheet, header=None, engine="openpyxl")
        if df.shape[0] > 10 and df.shape[1] > 6:
            logger.info(f"Tìm thấy sheet hợp lệ: {sheet} (rows={df.shape[0]}, cols={df.shape[1]})")
            return sheet, df
    logger.warning("Không tìm thấy sheet nào hợp lệ")
    return None


def find_header_row(df_raw: pd.DataFrame) -> Optional[int]:
    for i in range(min(20, len(df_raw))):
        row_str = df_raw.iloc[i].astype(str).str.lower()
        if "stt" in row_str.values and "lớp" in row_str.values:
            logger.info(f"Tìm thấy header ở dòng {i}")
            return i
    logger.warning("Không tìm thấy header chứa 'STT' và 'Lớp'")
    return None


# ────────────────────────────────────────────────
#                   Endpoints
# ────────────────────────────────────────────────

@router.post("/upload")
async def upload_schedule(
    file: UploadFile = File(...),
    week_start: str = Query(...),
    week_end: str = Query(...),
    hoc_ky: int = Query(1, ge=1, le=3),
    nam_hoc: str = Query("2025-2026"),
    db: Session = Depends(get_db)
):
    logger.info(f"Bắt đầu upload lịch tuần: {week_start} → {week_end}")
    try:
        start_date = parse_date(week_start, dayfirst=True).date()
        end_date = parse_date(week_end, dayfirst=True).date()
        logger.info(f"Parsed: start={start_date}, end={end_date}")

        if start_date > end_date:
            raise HTTPException(400, detail="Ngày bắt đầu phải trước hoặc bằng ngày kết thúc")

        # Xóa lịch cũ
        existing = db.query(LichHoc).filter(
            and_(LichHoc.ngay_bat_dau == start_date, LichHoc.ngay_ket_thuc == end_date)
        ).first()
        if existing:
            logger.info(f"Xóa lịch cũ ID={existing.id_lichhoc}")
            db.delete(existing)
            db.flush()

        lich = LichHoc(
            hoc_ky=hoc_ky,
            nam_hoc=nam_hoc,
            ngay_bat_dau=start_date,
            ngay_ket_thuc=end_date,
            ten_tuan=f"Tuần từ {week_start} đến {week_end}"
        )
        db.add(lich)
        db.flush()
        logger.info(f"Tạo LichHoc mới ID={lich.id_lichhoc}")

        content = await file.read()
        excel = pd.ExcelFile(BytesIO(content), engine="openpyxl")

        sheet_info = find_valid_sheet(excel)
        if not sheet_info:
            raise HTTPException(400, detail="Không tìm thấy sheet hợp lệ")

        used_sheet, df_raw = sheet_info
        header_row = find_header_row(df_raw)
        if header_row is None:
            raise HTTPException(400, detail="Không tìm thấy header chứa 'STT' và 'Lớp'")

        df = pd.read_excel(BytesIO(content), sheet_name=used_sheet, header=header_row, engine="openpyxl")
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

        logger.info(f"Số dòng dữ liệu sau lọc: {len(df)}")

        insert_count = 0
        skipped = 0

        for idx, row in df.iterrows():
            class_name = clean_class_name(row[class_col])
            if not class_name:
                continue

            lop = db.query(LopHoc).filter(LopHoc.ten_lop == class_name).first()
            if not lop:
                lop = LopHoc(ten_lop=class_name)
                db.add(lop)
                db.flush()
                logger.info(f"Tạo lớp mới: {class_name} (ID={lop.id_lophoc})")

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
                    logger.debug(f"Bỏ qua trùng lặp: {class_name} - {ca_hoc} - {mon_hoc} - {giang_vien}")
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
                logger.info(f"Thêm chi tiết: {class_name} - {ca_hoc} - {mon_hoc} - GV: {giang_vien}")

        db.commit()
        logger.info(f"Upload hoàn tất: inserted={insert_count}, skipped={skipped}")

        return {
            "message": "Upload lịch học thành công",
            "inserted": insert_count,
            "skipped_duplicate": skipped,
            "lich_hoc_id": lich.id_lichhoc
        }

    except Exception as e:
        db.rollback()
        logger.error(f"Lỗi upload: {str(e)}", exc_info=True)
        raise HTTPException(500, detail=f"Lỗi upload: {str(e)}")


# ────────────────────────────────────────────────
#              Bác sĩ / Trực khoa endpoints
# ────────────────────────────────────────────────

def get_doctors_on_duty_logic(db: Session, target_date_str: str) -> Dict:
    logger.info(f"Query bác sĩ trực ngày: {target_date_str}")
    try:
        target_date = parse_date(target_date_str, dayfirst=True).date()
    except Exception as e:
        logger.warning(f"Parse ngày thất bại: {target_date_str} - {e}")
        return {"ngay": target_date_str, "ca_truc": {}}

    lich = db.query(LichHoc).filter(
        and_(
            LichHoc.ngay_bat_dau <= target_date,
            LichHoc.ngay_ket_thuc >= target_date
        )
    ).order_by(LichHoc.ngay_bat_dau.desc()).first()

    if not lich:
        logger.info(f"Không tìm thấy tuần chứa ngày {target_date_str}")
        return {"ngay": target_date_str, "ca_truc": {}}

    logger.info(f"Tìm thấy LichHoc ID={lich.id_lichhoc} - {lich.ten_tuan}")

    thu = target_date.isoweekday()
    logger.debug(f"Thứ trong tuần: {thu} ({target_date.strftime('%A')})")

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

    logger.info(f"Tìm thấy {len(records)} bản ghi bác sĩ trực ngày {target_date_str}")

    result = {"Sáng": [], "Chiều": [], "Cả ngày": []}

    for r in records:
        ca = normalize_ca(r.ca)
        entry = {
            "bac_si": r.bac_si.strip(),
            "lop": r.lop.strip(),
            "mon": (r.mon or "").strip()
        }
        result[ca].append(entry)
        logger.debug(f"Thêm: {ca} - {entry['bac_si']} - {entry['lop']} - {entry['mon']}")

    result = {k: v for k, v in result.items() if v}

    return {
        "ngay": target_date_str,
        "thu": f"Thứ {thu}",
        "tuan": lich.ten_tuan,
        "tong_bac_si": len({r.bac_si for r in records}),
        "ca_truc": result
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
@router.get("/doctors/on-duty")
def get_doctors_on_duty(
    date: str = Query(...),
    ca: Optional[str] = Query(None),
    db: Session = Depends(get_db)
):
    logger.info(f"API /doctors/on-duty gọi với date={date}, ca={ca}")
    data = get_doctors_on_duty_logic(db, date)
    if ca:
        ca_norm = normalize_ca(ca)
        data["ca_truc"] = {k: v for k, v in data.get("ca_truc", {}).items() if k == ca_norm}
        logger.info(f"Lọc theo ca: {ca_norm} → còn {sum(len(v) for v in data['ca_truc'].values())} bản ghi")
    return data

def get_doctors_on_duty_logic(db: Session, target_date_str: str) -> Dict:
    logger.info(f"Query bác sĩ trực ngày: {target_date_str}")
    try:
        target_date = parse_date(target_date_str, dayfirst=True).date()
    except Exception as e:
        logger.warning(f"Parse ngày thất bại: {target_date_str} - {e}")
        return {"ngay": target_date_str, "ca_truc": {}}

    # 1. Tìm tuần chứa ngày
    lich = db.query(LichHoc).filter(
        and_(
            LichHoc.ngay_bat_dau <= target_date,
            LichHoc.ngay_ket_thuc >= target_date
        )
    ).order_by(LichHoc.ngay_bat_dau.desc()).first()

    if not lich:
        logger.info(f"Không tìm thấy tuần chứa ngày {target_date_str}")
        return {"ngay": target_date_str, "ca_truc": {}}

    logger.info(f"Tìm thấy LichHoc ID={lich.id_lichhoc} - {lich.ten_tuan}")

    thu = target_date.isoweekday()
    logger.debug(f"Thứ trong tuần: {thu}")

    # 2. Tìm tất cả lớp có lịch ngày đó (có id_thoidem == thu)
    lich_hoc_records = db.query(
        ChiTietLichHoc.id_lophoc,
        ChiTietLichHoc.ca_hoc,
        ChiTietLichHoc.mon_hoc
    ).filter(
        ChiTietLichHoc.id_lichhoc == lich.id_lichhoc,
        ChiTietLichHoc.id_thoidem == thu
    ).all()

    if not lich_hoc_records:
        logger.info(f"Không có lớp nào có lịch ngày {target_date_str}")
        return {"ngay": target_date_str, "ca_truc": {}}

    logger.info(f"Tìm thấy {len(lich_hoc_records)} lớp có lịch ngày {target_date_str}")

    # 3. Group lớp theo ca_hoc
    lop_theo_ca = {"Sáng": [], "Chiều": [], "Cả ngày": []}
    for rec in lich_hoc_records:
        ca = normalize_ca(rec.ca_hoc)
        lop_theo_ca[ca].append({
            "id_lophoc": rec.id_lophoc,
            "mon_hoc": rec.mon_hoc or "—"
        })

    # 4. Query bác sĩ theo các lớp có lịch
    result = {"Sáng": [], "Chiều": [], "Cả ngày": []}
    tong_bac_si = set()

    for ca, lops in lop_theo_ca.items():
        if not lops:
            continue

        id_lophocs = [lop["id_lophoc"] for lop in lops]
        bacsi_list = db.query(BacSi).filter(
            BacSi.id_lophoc.in_(id_lophocs)
        ).all()

        for bs in bacsi_list:
            # Tìm môn/lớp tương ứng để ghi chú
            ghi_chu_parts = []
            for lop_info in lops:
                if lop_info["id_lophoc"] == bs.id_lophoc:
                    ghi_chu_parts.append(f"{lop_info['mon_hoc']} - Lớp {bs.lophoc.ten_lop if bs.lophoc else '—'}")

            entry = {
                "bac_si": bs.ho_ten.strip() if bs.ho_ten else "Chưa có tên",
                "lop": bs.lophoc.ten_lop if bs.lophoc else "—",
                "mon": ", ".join(set(ghi_chu_parts)) if ghi_chu_parts else "—",
                "chuyen_khoa": bs.chuyen_khoa or "—",
                "sdt": bs.so_dien_thoai or "—",
                "email": bs.email or "—",
            }
            result[ca].append(entry)
            tong_bac_si.add(bs.id_bacsi)

    result = {k: v for k, v in result.items() if v}

    return {
        "ngay": target_date_str,
        "thu": f"Thứ {thu}",
        "tuan": lich.ten_tuan,
        "tong_bac_si": len(tong_bac_si),
        "ca_truc": result
    }


@router.get("/doctors/current-and-next")
def get_current_and_next_doctors(
    days_ahead: int = Query(3, ge=1, le=10),
    db: Session = Depends(get_db)
):
    today = date.today()
    logger.info(f"API current-and-next gọi, days_ahead={days_ahead}, today={today}")

    dates = [today + timedelta(days=i) for i in range(days_ahead + 1)]
    current = []
    upcoming = []

    for target_date in dates:
        date_str = target_date.strftime("%d/%m/%Y")
        data = get_doctors_on_duty_logic(db, date_str)

        for ca, doctors in data.get("ca_truc", {}).items():
            for doc in doctors:
                entry = {
                    "ten_bac_si": doc["bac_si"],
                    "ca_truc": ca,
                    "ngay": date_str,
                    "thu": data["thu"],
                    "mon": doc["mon"],
                    "lop": doc["lop"],
                    "chuyen_khoa": doc.get("chuyen_khoa", "—"),
                    "sdt": doc.get("sdt", "—"),
                    "email": doc.get("email", "—"),
                    "ghi_chu": doc["mon"],
                    "thoi_gian_bat_dau": "07:00" if ca == "Sáng" else "13:00" if ca == "Chiều" else "07:00",
                    "thoi_gian_ket_thuc": "12:00" if ca == "Sáng" else "17:00" if ca == "Chiều" else "17:00",
                }
                if target_date == today:
                    current.append(entry)
                else:
                    upcoming.append(entry)

    sort_ca = {"Sáng": 0, "Chiều": 1, "Cả ngày": 2}
    upcoming.sort(key=lambda x: (
        datetime.strptime(x["ngay"], "%d/%m/%Y"),
        sort_ca.get(x["ca_truc"], 999)
    ))

    logger.info(f"Trả về: current={len(current)}, upcoming={len(upcoming)}")
    return {
        "ngay_hien_tai": today.strftime("%d/%m/%Y"),
        "current": current,
        "next": upcoming,
        "total_current": len(current),
        "total_next": len(upcoming)
    }