from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from database import get_db
from models import Restaurant


router = APIRouter(
    prefix="/restaurant",
    tags=["restaurant"]
)

@router.get("/")
def read_users(skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    return db.query(Restaurant).offset(skip).limit(limit).all()
