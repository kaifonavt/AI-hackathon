from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List, Optional
from pydantic import BaseModel, Field
from datetime import datetime
from database import get_db
from routes.holiday.crud import GuestService, HolidayService

router = APIRouter()

# Pydantic models for request/response
class GuestBase(BaseModel):
    name: str
    telegram_id: Optional[str] = None
    status: str = "pending"

class GuestCreate(GuestBase):
    pass

class GuestResponse(GuestBase):
    id: int
    holiday_id: int
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True

class HolidayBase(BaseModel):
    theme: str
    details: str
    latitude: Optional[float] = None
    longitude: Optional[float] = None
    location_address: Optional[str] = None

class HolidayCreate(HolidayBase):
    pass

class HolidayUpdate(BaseModel):
    theme: Optional[str] = None
    details: Optional[str] = None
    latitude: Optional[float] = None
    longitude: Optional[float] = None
    location_address: Optional[str] = None

class HolidayResponse(HolidayBase):
    id: int
    guests_count: int
    guests: dict
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True

# Holiday routes
@router.post("/holidays/", response_model=HolidayResponse, status_code=status.HTTP_201_CREATED)
def create_holiday(
    holiday: HolidayCreate,
    db: Session = Depends(get_db)
):
    holiday_service = HolidayService(db)
    try:
        return holiday_service.create_holiday(**holiday.model_dump())
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e)
        )

@router.get("/holidays/", response_model=List[HolidayResponse])
def get_holidays(
    skip: int = 0,
    limit: int = 100,
    db: Session = Depends(get_db)
):
    holiday_service = HolidayService(db)
    return holiday_service.get_all_holidays()

@router.get("/holidays/{holiday_id}", response_model=HolidayResponse)
def get_holiday(
    holiday_id: int,
    db: Session = Depends(get_db)
):
    holiday_service = HolidayService(db)
    holiday = holiday_service.get_holiday(holiday_id)
    if holiday is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Holiday not found"
        )
    return holiday

@router.put("/holidays/{holiday_id}", response_model=HolidayResponse)
def update_holiday(
    holiday_id: int,
    holiday: HolidayUpdate,
    db: Session = Depends(get_db)
):
    holiday_service = HolidayService(db)
    updated_holiday = holiday_service.update_holiday(
        holiday_id,
        **holiday.model_dump(exclude_unset=True)
    )
    if updated_holiday is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Holiday not found"
        )
    return updated_holiday

@router.delete("/holidays/{holiday_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_holiday(
    holiday_id: int,
    db: Session = Depends(get_db)
):
    holiday_service = HolidayService(db)
    if not holiday_service.delete_holiday(holiday_id):
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Holiday not found"
        )
    return None

# Guest routes
@router.post("/holidays/{holiday_id}/guests/", response_model=GuestResponse, status_code=status.HTTP_201_CREATED)
def add_guest(
    holiday_id: int,
    guest: GuestCreate,
    db: Session = Depends(get_db)
):
    guest_service = GuestService(db)
    try:
        return guest_service.add_guest(
            holiday_id=holiday_id,
            **guest.model_dump()
        )
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e)
        )

@router.get("/holidays/{holiday_id}/guests/", response_model=List[GuestResponse])
def get_holiday_guests(
    holiday_id: int,
    db: Session = Depends(get_db)
):
    guest_service = GuestService(db)
    return guest_service.get_holiday_guests(holiday_id)

class GuestStatusUpdate(BaseModel):
    status: str = Field(..., description="New status for the guest")

@router.patch("/guests/{guest_id}/status", response_model=GuestResponse)
def update_guest_status(
    guest_id: int,
    status_update: GuestStatusUpdate,
    db: Session = Depends(get_db)
):
    guest_service = GuestService(db)
    updated_guest = guest_service.update_guest_status(guest_id, status_update.status)
    if updated_guest is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Guest not found"
        )
    return updated_guest

@router.delete("/guests/{guest_id}", status_code=status.HTTP_204_NO_CONTENT)
def remove_guest(
    guest_id: int,
    db: Session = Depends(get_db)
):
    guest_service = GuestService(db)
    if not guest_service.remove_guest(guest_id):
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Guest not found"
        )
    return None