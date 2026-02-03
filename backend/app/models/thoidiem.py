from sqlalchemy import Column, Integer, Time
from sqlalchemy.orm import relationship
from database import Base

class ThoiDiem(Base):
    __tablename__ = "thoidiem"

    id_thoidem = Column(Integer, primary_key=True, index=True)
    thu = Column(Integer)
    tiet_bat_dau = Column(Integer)
    tiet_ket_thuc = Column(Integer)
    gio_bat_dau = Column(Time)
    gio_ket_thuc = Column(Time)

    chitietlichhoc = relationship("ChiTietLichHoc", back_populates="thoidiem")
