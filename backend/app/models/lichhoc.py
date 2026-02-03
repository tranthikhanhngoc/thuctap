from sqlalchemy import Column, Integer, String, Date
from sqlalchemy.orm import relationship
from database import Base

class LichHoc(Base):
    __tablename__ = "lichhoc"

    id_lichhoc = Column(Integer, primary_key=True, index=True)
    hoc_ky = Column(Integer)
    nam_hoc = Column(String(20))
    ngay_bat_dau = Column(Date)
    ngay_ket_thuc = Column(Date)

    chitietlichhoc = relationship("ChiTietLichHoc", back_populates="lichhoc")
