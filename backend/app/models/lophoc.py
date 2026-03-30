from sqlalchemy import Column, Integer, String
from sqlalchemy.orm import relationship
from database import Base

class LopHoc(Base):
    __tablename__ = "lophoc"

    id_lophoc = Column(Integer, primary_key=True, index=True)
    ten_lop = Column(String(50))
    khoa = Column(String(50))
    nien_khoa = Column(String(20))
    si_so = Column(Integer)

    bacsi = relationship("BacSi", back_populates="lophoc")
    chitietlichhoc = relationship("ChiTietLichHoc", back_populates="lophoc")
