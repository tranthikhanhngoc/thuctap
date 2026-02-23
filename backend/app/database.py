# database.py
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, declarative_base

DATABASE_URL = "postgresql+psycopg2://fastapi_user:123456@localhost:5432/fastapi"

print("DATABASE_URL =", DATABASE_URL)

# Engine
engine = create_engine(
    DATABASE_URL,
    pool_pre_ping=True,   # tránh lỗi mất kết nối
)

# Session
SessionLocal = sessionmaker(
    autocommit=False,
    autoflush=False,
    bind=engine
)

# Base model
Base = declarative_base()

# =====================
# Dependency cho FastAPI
# =====================
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
