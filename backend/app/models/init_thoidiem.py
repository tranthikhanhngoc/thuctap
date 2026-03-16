# init_thoidiem.py
from database import SessionLocal
from models.thoidiem import ThoiDiem

db = SessionLocal()

try:
    # Kiểm tra xem đã có dữ liệu chưa
    if db.query(ThoiDiem).count() == 0:
        thu_list = [
            (1, "Thứ Hai",   None, None, None, None),
            (2, "Thứ Ba",    None, None, None, None),
            (3, "Thứ Tư",    None, None, None, None),
            (4, "Thứ Năm",   None, None, None, None),
            (5, "Thứ Sáu",   None, None, None, None),
            (6, "Thứ Bảy",   None, None, None, None),
            (7, "Chủ Nhật",  None, None, None, None),
        ]

        for id_thoi, ten_thu, tb, tk, gb, gk in thu_list:
            db.add(ThoiDiem(
                id_thoidem=id_thoi,
                thu=ten_thu,
                tiet_bat_dau=tb,
                tiet_ket_thuc=tk,
                gio_bat_dau=gb,
                gio_ket_thuc=gk
            ))

        db.commit()
        print("Đã tạo 7 bản ghi trong bảng thoidiem (Thứ Hai → Chủ Nhật)")
    else:
        print("Bảng thoidiem đã có dữ liệu, không cần tạo lại.")
except Exception as e:
    db.rollback()
    print("Lỗi khi khởi tạo thoidiem:", str(e))
finally:
    db.close()