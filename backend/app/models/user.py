from sqlalchemy import Column, Integer, String, ForeignKey
from sqlalchemy.orm import relationship
from database import Base

class User(Base):
    __tablename__ = "users"

    id_user = Column(Integer, primary_key=True, index=True)
    username = Column(String, unique=True, nullable=False)
    password = Column(String, nullable=False)
    role = Column(String, nullable=False)

    id_benhnhan = Column(Integer, ForeignKey("benhnhan.id_benhnhan"), nullable=True)
    id_bacsi = Column(Integer, ForeignKey("bacsi.id_bacsi"), nullable=True)

    benhnhan = relationship("BenhNhan", back_populates="user")
    bacsi = relationship("BacSi", back_populates="user")
