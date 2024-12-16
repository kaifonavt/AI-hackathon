from sqlalchemy.orm import Session
from sqlalchemy.exc import SQLAlchemyError
from datetime import datetime
from typing import List, Dict, Optional

from models import Guest, Holiday

class HolidayService:
    def __init__(self, db: Session):
        self.db = db

    def create_holiday(
        self,
        theme: str,
        details: str,
        latitude: Optional[float] = None,
        longitude: Optional[float] = None,
        location_address: Optional[str] = None
    ) -> Holiday:
        try:
            holiday = Holiday(
                theme=theme,
                details=details,
                latitude=latitude,
                longitude=longitude,
                location_address=location_address,
                guests={"confirmed": [], "pending": []}
            )
            self.db.add(holiday)
            self.db.commit()
            self.db.refresh(holiday)
            return holiday
        except SQLAlchemyError as e:
            self.db.rollback()
            raise Exception(f"Error creating holiday: {str(e)}")

    def get_holiday(self, holiday_id: int) -> Optional[Holiday]:
        return self.db.query(Holiday).filter(Holiday.id == holiday_id).first()

    def get_all_holidays(self) -> List[Holiday]:
        return self.db.query(Holiday).all()

    def update_holiday(
        self,
        holiday_id: int,
        theme: Optional[str] = None,
        details: Optional[str] = None,
        latitude: Optional[float] = None,
        longitude: Optional[float] = None,
        location_address: Optional[str] = None
    ) -> Optional[Holiday]:
        holiday = self.get_holiday(holiday_id)
        if not holiday:
            return None

        try:
            if theme is not None:
                holiday.theme = theme
            if details is not None:
                holiday.details = details
            if latitude is not None:
                holiday.latitude = latitude
            if longitude is not None:
                holiday.longitude = longitude
            if location_address is not None:
                holiday.location_address = location_address

            holiday.updated_at = datetime.utcnow()
            self.db.commit()
            self.db.refresh(holiday)
            return holiday
        except SQLAlchemyError as e:
            self.db.rollback()
            raise Exception(f"Error updating holiday: {str(e)}")

    def delete_holiday(self, holiday_id: int) -> bool:
        holiday = self.get_holiday(holiday_id)
        if not holiday:
            return False

        try:
            self.db.delete(holiday)
            self.db.commit()
            return True
        except SQLAlchemyError as e:
            self.db.rollback()
            raise Exception(f"Error deleting holiday: {str(e)}")

class GuestService:
    def __init__(self, db: Session):
        self.db = db

    def add_guest(
        self,
        holiday_id: int,
        name: str,
        telegram_id: Optional[str] = None,
        status: str = 'pending'
    ) -> Guest:
        try:
            guest = Guest(
                holiday_id=holiday_id,
                name=name,
                telegram_id=telegram_id,
                status=status
            )
            self.db.add(guest)
            
            # Update the holiday's guests JSONB field
            holiday = self.db.query(Holiday).filter(Holiday.id == holiday_id).first()
            if not holiday:
                raise Exception("Holiday not found")
            
            status_list = holiday.guests.get(status, [])
            guest_info = {"name": name}
            if telegram_id:
                guest_info["telegram_id"] = telegram_id
            status_list.append(guest_info)
            holiday.guests[status] = status_list
            holiday.guests_count = sum(len(guests) for guests in holiday.guests.values())
            
            self.db.commit()
            self.db.refresh(guest)
            return guest
        except SQLAlchemyError as e:
            self.db.rollback()
            raise Exception(f"Error adding guest: {str(e)}")

    def get_guest(self, guest_id: int) -> Optional[Guest]:
        return self.db.query(Guest).filter(Guest.id == guest_id).first()

    def get_holiday_guests(self, holiday_id: int) -> List[Guest]:
        return self.db.query(Guest).filter(Guest.holiday_id == holiday_id).all()

    def update_guest_status(self, guest_id: int, new_status: str) -> Optional[Guest]:
        guest = self.get_guest(guest_id)
        if not guest:
            return None

        try:
            old_status = guest.status
            guest.status = new_status
            
            # Update the holiday's guests JSONB field
            holiday = self.db.query(Holiday).filter(Holiday.id == guest.holiday_id).first()
            if holiday:
                # Remove from old status list
                old_status_list = holiday.guests.get(old_status, [])
                guest_info = next((g for g in old_status_list if g["name"] == guest.name), None)
                if guest_info:
                    old_status_list.remove(guest_info)
                    holiday.guests[old_status] = old_status_list
                
                # Add to new status list
                new_status_list = holiday.guests.get(new_status, [])
                new_status_list.append(guest_info)
                holiday.guests[new_status] = new_status_list
            
            self.db.commit()
            self.db.refresh(guest)
            return guest
        except SQLAlchemyError as e:
            self.db.rollback()
            raise Exception(f"Error updating guest status: {str(e)}")

    def remove_guest(self, guest_id: int) -> bool:
        guest = self.get_guest(guest_id)
        if not guest:
            return False

        try:
            # Update the holiday's guests JSONB field
            holiday = self.db.query(Holiday).filter(Holiday.id == guest.holiday_id).first()
            if holiday:
                status_list = holiday.guests.get(guest.status, [])
                guest_info = next((g for g in status_list if g["name"] == guest.name), None)
                if guest_info:
                    status_list.remove(guest_info)
                    holiday.guests[guest.status] = status_list
                holiday.guests_count = sum(len(guests) for guests in holiday.guests.values())

            self.db.delete(guest)
            self.db.commit()
            return True
        except SQLAlchemyError as e:
            self.db.rollback()
            raise Exception(f"Error removing guest: {str(e)}")