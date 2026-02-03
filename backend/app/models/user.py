from sqlalchemy import Column, Integer, String, ForeignKey
from database import Base

class User(Base):
    __tablename__ = "users"

    id_user = Column(Integer, primary_key=True, index=True)
    username = Column(String(50), unique=True, nullable=False)
    password = Column(String(255), nullable=False)

    # role: admin | bacsi | benhnhan
    role = Column(String(20), nullable=False)

    id_bacsi = Column(Integer, ForeignKey("bacsi.id_bacsi"), nullable=True)
    id_benhnhan = Column(Integer, ForeignKey("benhnhan.id_benhnhan"), nullable=True)