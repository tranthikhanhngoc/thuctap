# models/lichhoc.py
from sqlalchemy import Column, Integer, String, Date
from sqlalchemy.orm import relationship
from database import Base

class LichHoc(Base):
    __tablename__ = "lichhoc"

    id_lichhoc = Column(Integer, primary_key=True, index=True)
    hoc_ky     = Column(Integer, nullable=False)
    nam_hoc    = Column(String(20), nullable=False)          # ví dụ: "2025-2026"
    
    # === THÊM ĐỂ HỖ TRỢ THEO TUẦN ===
    ngay_bat_dau  = Column(Date, nullable=False)             # Thứ Hai của tuần
    ngay_ket_thuc = Column(Date, nullable=False)             # Thứ Sáu (hoặc Chủ Nhật) của tuần
    
    # Optional: thêm trường để phân biệt nhanh
    ten_tuan      = Column(String(50), nullable=True)        # ví dụ: "Tuần 10 (10/03 - 16/03/2026)"

    chitietlichhoc = relationship("ChiTietLichHoc", back_populates="lichhoc", cascade="all, delete-orphan")