from sqlalchemy import Column, Integer, String, ForeignKey
from sqlalchemy.orm import relationship
from database import Base

class ChiTietLichHoc(Base):
    __tablename__ = "chitietlichhoc"

    id_ctlh = Column(Integer, primary_key=True, index=True)
    id_lichhoc = Column(Integer, ForeignKey("lichhoc.id_lichhoc"))
    id_lophoc = Column(Integer, ForeignKey("lophoc.id_lophoc"))
    id_phong = Column(Integer, ForeignKey("phonghoc.id_phong"))
    id_thoidem = Column(Integer, ForeignKey("thoidiem.id_thoidem"))

    mon_hoc = Column(String(100))
    giang_vien = Column(String(100))

    lichhoc = relationship("LichHoc", back_populates="chitietlichhoc")
    lophoc = relationship("LopHoc", back_populates="chitietlichhoc")
    phonghoc = relationship("PhongHoc", back_populates="chitietlichhoc")
    thoidiem = relationship("ThoiDiem", back_populates="chitietlichhoc")
