from sqlalchemy import Column, Integer, String, Text, Date, Numeric, DateTime
from sqlalchemy.sql import func
from database import Base

class Thuoc(Base):
    __tablename__ = "thuoc"

    id_thuoc = Column(Integer, primary_key=True, index=True, autoincrement=True)
    
    ma_thuoc = Column(String(50), unique=True, nullable=False, index=True)
    ten_thuoc = Column(String(255), nullable=False)
    
    loai_thuoc = Column(String(100), default="Khác")
    don_vi = Column(String(50), default="Viên")
    
    so_luong_ton = Column(Integer, default=0)
    
    gia_nhap = Column(Numeric(12, 0), default=0)
    gia_ban = Column(Numeric(12, 0), default=0)
    
    ngay_nhap = Column(Date, nullable=True)
    han_su_dung = Column(Date, nullable=True)
    
    nha_cung_cap = Column(String(255), nullable=True)
    mo_ta = Column(Text, nullable=True)
    
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now(), server_default=func.now())

    def __repr__(self):
        return f"<Thuoc {self.ma_thuoc} - {self.ten_thuoc}>"