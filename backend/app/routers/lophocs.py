from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from database import get_db
from models.lophoc import LopHoc

router = APIRouter(prefix="/classes", tags=["Classes"])

@router.get("/")
def get_classes(db: Session = Depends(get_db)):
    return db.query(LopHoc).all()