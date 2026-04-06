from sqlalchemy import Column, Integer, String, ForeignKey, Date, Text, SmallInteger
from sqlalchemy.orm import relationship
from datetime import date
from database import Base
from models.thuoc import Thuoc   # ← import model Thuoc bạn đã có


class ToaThuoc(Base):
    __tablename__ = "toathuoc"

    id = Column(Integer, primary_key=True, index=True)
    ma_toa = Column(String(20), unique=True, index=True, nullable=False)
    
    id_cuochen = Column(Integer, ForeignKey("cuochen.id_cuochen"), nullable=False)
    id_bacsi = Column(Integer, ForeignKey("bacsi.id_bacsi"), nullable=False)
    
    chan_doan = Column(String(255), nullable=False)
    loi_dan = Column(Text, nullable=True)
    ngay_ke = Column(Date, default=date.today)

    # Quan hệ
    chi_tiets = relationship("ToaThuocChiTiet", back_populates="toa_thuoc", cascade="all, delete-orphan")


class ToaThuocChiTiet(Base):
    __tablename__ = "toathuoc_chitiet"

    id = Column(Integer, primary_key=True, index=True)
    
    toa_thuoc_id = Column(Integer, ForeignKey("toathuoc.id"), nullable=False)
    id_thuoc = Column(Integer, ForeignKey("thuoc.id_thuoc"), nullable=False)   # ← LIÊN KẾT VỚI THUỐC

    stt = Column(Integer, nullable=False)                    # thứ tự thuốc trong toa
    so_luong = Column(Integer, nullable=False)               # số lượng kê
    
    sang = Column(SmallInteger, default=0)
    trua = Column(SmallInteger, default=0)
    chieu = Column(SmallInteger, default=0)
    toi = Column(SmallInteger, default=0)

    # Quan hệ
    toa_thuoc = relationship("ToaThuoc", back_populates="chi_tiets")
    thuoc = relationship("Thuoc")   # để dễ join lấy thông tin thuốc