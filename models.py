from sqlalchemy import Column, Integer, String, JSON, DateTime, Float
from sqlalchemy.ext.mutable import MutableDict
from sqlalchemy.orm import declarative_base
from sqlalchemy.dialects.postgresql import JSONB
from datetime import datetime
from database import Base

class Holiday(Base):
    __tablename__ = 'holidays'

    id = Column(Integer, primary_key=True)
    theme = Column(String, nullable=False)
    guests_count = Column(Integer, default=0)
    guests = Column(MutableDict.as_mutable(JSONB), default=dict)
    
    details = Column(String, nullable=False)
    # Простое хранение координат
    latitude = Column(Float, nullable=True)
    longitude = Column(Float, nullable=True)
    location_address = Column(String, nullable=True)
    
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    def __repr__(self):
        return f"<Holiday(id={self.id}, theme='{self.theme}', guests_count={self.guests_count})>"
    
    # Пример структуры guests:
    # {
    #     "confirmed": [
    #         {"name": "Иван", "phone": "+7999999999"},
    #         {"name": "Мария", "phone": "+7888888888"}
    #     ],
    #     "pending": [
    #         {"name": "Петр", "phone": "+7777777777"}
    #     ]
    # }