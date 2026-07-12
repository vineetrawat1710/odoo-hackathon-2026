from sqlalchemy import Column, Integer, String, Numeric, ForeignKey, DateTime, Enum as SQLEnum
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
import enum
from app.db.base_class import Base

class TripStatus(str, enum.Enum):
    DRAFT = "DRAFT"
    DISPATCHED = "DISPATCHED"
    COMPLETED = "COMPLETED"
    CANCELLED = "CANCELLED"

class Trip(Base):
    id = Column(Integer, primary_key=True, index=True)
    source = Column(String, nullable=False)
    destination = Column(String, nullable=False)
    
    vehicle_id = Column(Integer, ForeignKey("vehicle.id"), nullable=False)
    driver_id = Column(Integer, ForeignKey("driver.id"), nullable=False)
    
    cargo_weight = Column(Numeric(10, 2), nullable=False)
    planned_distance = Column(Numeric(10, 2), nullable=False)
    actual_distance = Column(Numeric(10, 2), nullable=True)
    start_odometer = Column(Numeric(12, 2), nullable=True)
    end_odometer = Column(Numeric(12, 2), nullable=True)
    
    status = Column(SQLEnum(TripStatus), default=TripStatus.DRAFT, nullable=False)
    revenue = Column(Numeric(12, 2), default=0.0, nullable=False)
    
    created_by_id = Column(Integer, ForeignKey("user.id"), nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())
    dispatched_at = Column(DateTime(timezone=True), nullable=True)
    completed_at = Column(DateTime(timezone=True), nullable=True)
    cancelled_at = Column(DateTime(timezone=True), nullable=True)

    vehicle = relationship("Vehicle")
    driver = relationship("Driver")
    created_by = relationship("User")
