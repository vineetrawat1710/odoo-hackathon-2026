from sqlalchemy import Column, Integer, String, Numeric, Date, ForeignKey, DateTime, Enum as SQLEnum
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
import enum
from app.db.base_class import Base

class ExpenseType(str, enum.Enum):
    TOLL = "TOLL"
    MAINTENANCE = "MAINTENANCE"
    MISCELLANEOUS = "MISCELLANEOUS"

class Expense(Base):
    id = Column(Integer, primary_key=True, index=True)
    vehicle_id = Column(Integer, ForeignKey("vehicle.id"), nullable=False)
    trip_id = Column(Integer, ForeignKey("trip.id"), nullable=True)
    type = Column(SQLEnum(ExpenseType), nullable=False)
    amount = Column(Numeric(10, 2), nullable=False)
    description = Column(String, nullable=True)
    date = Column(Date, nullable=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())
    
    trip = relationship("Trip")
    vehicle = relationship("Vehicle")

class FuelLog(Base):
    id = Column(Integer, primary_key=True, index=True)
    vehicle_id = Column(Integer, ForeignKey("vehicle.id"), nullable=False)
    trip_id = Column(Integer, ForeignKey("trip.id"), nullable=True)
    liters = Column(Numeric(10, 2), nullable=False)
    cost = Column(Numeric(10, 2), nullable=False)
    date = Column(Date, nullable=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())
    
    vehicle = relationship("Vehicle")
    trip = relationship("Trip")
