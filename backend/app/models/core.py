from sqlalchemy import Column, Integer, String, Numeric, ForeignKey, DateTime, Date, Enum as SQLEnum
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
import enum
from app.db.base_class import Base

class VehicleStatus(str, enum.Enum):
    AVAILABLE = "AVAILABLE"
    ON_TRIP = "ON_TRIP"
    IN_SHOP = "IN_SHOP"
    RETIRED = "RETIRED"

class VehicleType(str, enum.Enum):
    TRUCK = "TRUCK"
    VAN = "VAN"
    BIKE = "BIKE"
    CAR = "CAR"
    BUS = "BUS"

class Vehicle(Base):
    id = Column(Integer, primary_key=True, index=True)
    registration_number = Column(String, unique=True, index=True, nullable=False)
    name = Column(String, nullable=False)
    type = Column(SQLEnum(VehicleType), nullable=False)
    max_load_capacity = Column(Numeric(10, 2), nullable=False)
    odometer = Column(Numeric(12, 2), default=0.0, nullable=False)
    acquisition_cost = Column(Numeric(12, 2), nullable=False)
    status = Column(SQLEnum(VehicleStatus), default=VehicleStatus.AVAILABLE, nullable=False)
    region = Column(String, nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())

class DriverStatus(str, enum.Enum):
    AVAILABLE = "AVAILABLE"
    ON_TRIP = "ON_TRIP"
    OFF_DUTY = "OFF_DUTY"
    SUSPENDED = "SUSPENDED"

class LicenseCategory(str, enum.Enum):
    A = "A"
    B = "B"
    C = "C"
    D = "D"
    CE = "CE"

class Driver(Base):
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, nullable=False)
    license_number = Column(String, unique=True, index=True, nullable=False)
    license_category = Column(SQLEnum(LicenseCategory), nullable=False)
    license_expiry_date = Column(Date, nullable=False)
    contact_number = Column(String, nullable=False)
    safety_score = Column(Numeric(5, 2), default=100.0, nullable=False)
    status = Column(SQLEnum(DriverStatus), default=DriverStatus.AVAILABLE, nullable=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())

class MaintenanceStatus(str, enum.Enum):
    ACTIVE = "ACTIVE"
    OPEN = "OPEN"
    CLOSED = "CLOSED"


class MaintenanceLog(Base):
    id = Column(Integer, primary_key=True, index=True)
    vehicle_id = Column(Integer, ForeignKey("vehicle.id"), nullable=False)
    type = Column(String, nullable=False)
    description = Column(String, nullable=True)
    cost = Column(Numeric(10, 2), default=0.0, nullable=False)
    status = Column(SQLEnum(MaintenanceStatus), default=MaintenanceStatus.OPEN, nullable=False)

    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())
    closed_at = Column(DateTime(timezone=True), nullable=True)
    
    vehicle = relationship("Vehicle")
