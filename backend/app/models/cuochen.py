from sqlalchemy import Column, Integer, String, Date, Time, ForeignKey
from sqlalchemy.orm import relationship
from database import Base

class CuocHen(Base):
    __tablename__ = "cuochen"

    id_cuochen = Column(Integer, primary_key=True, index=True)
    id_bacsi = Column(Integer, ForeignKey("bacsi.id_bacsi"))
    id_benhnhan = Column(Integer, ForeignKey("benhnhan.id_benhnhan"))

    ngay_hen = Column(Date)
    gio_hen = Column(Time)
    ly_do = Column(String(255))
    trang_thai = Column(String(50))

    bacsi = relationship("BacSi", back_populates="cuochen")
    benhnhan = relationship("BenhNhan", back_populates="cuochen")
