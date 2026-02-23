from sqlalchemy import Column, Integer, String
from sqlalchemy.orm import relationship
from database import Base

class PhongHoc(Base):
    __tablename__ = "phonghoc"

    id_phong = Column(Integer, primary_key=True, index=True)
    ten_phong = Column(String(50))
    suc_chua = Column(Integer)
    loai_phong = Column(String(50))
    vi_tri = Column(String(100))

    chitietlichhoc = relationship("ChiTietLichHoc", back_populates="phonghoc")
