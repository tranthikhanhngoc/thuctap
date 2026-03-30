from sqlalchemy import Column, Integer, String
from sqlalchemy.orm import relationship
from database import Base

class BenhNhan(Base):
    __tablename__ = "benhnhan"

    id_benhnhan = Column(Integer, primary_key=True, index=True)
    ho_ten = Column(String(100))
    nam_sinh = Column(Integer)
    gioi_tinh = Column(String(10))
    so_dien_thoai = Column(String(20))
    cccd = Column(String(20))
    dia_chi = Column(String(255))

    user = relationship("User", back_populates="benhnhan", uselist=False)
    cuochen = relationship("CuocHen", back_populates="benhnhan")
