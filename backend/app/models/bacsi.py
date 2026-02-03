from sqlalchemy import Column, Integer, String, ForeignKey
from sqlalchemy.orm import relationship
from database import Base

class BacSi(Base):
    __tablename__ = "bacsi"

    id_bacsi = Column(Integer, primary_key=True, index=True)
    id_lophoc = Column(Integer, ForeignKey("lophoc.id_lophoc"))

    ho_ten = Column(String(100))
    chuyen_khoa = Column(String(100))
    trinh_do = Column(String(50))
    nam_kinh_nghiem = Column(Integer)
    so_dien_thoai = Column(String(20))
    email = Column(String(100))

    lophoc = relationship("LopHoc", back_populates="bacsi")
    user = relationship("User", back_populates="bacsi", uselist=False)
    cuochen = relationship("CuocHen", back_populates="bacsi")
