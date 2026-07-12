from pydantic import BaseModel, Field
from typing import Optional
from datetime import datetime, date
from app.models.core import VehicleStatus, VehicleType, DriverStatus, LicenseCategory, MaintenanceStatus

class VehicleBase(BaseModel):
    registration_number: str
    name: str
    type: VehicleType
    max_load_capacity: float = Field(..., gt=0)
    acquisition_cost: float = Field(..., ge=0)
    region: Optional[str] = None

class VehicleCreate(VehicleBase):
    pass

class Vehicle(VehicleBase):
    id: int
    odometer: float
    status: VehicleStatus
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True

class DriverBase(BaseModel):
    name: str
    license_number: str
    license_category: LicenseCategory
    license_expiry_date: date
    contact_number: str

class DriverCreate(DriverBase):
    pass

class Driver(DriverBase):
    id: int
    safety_score: float = Field(..., ge=0, le=100)
    status: DriverStatus
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True

class MaintenanceBase(BaseModel):
    vehicle_id: int
    type: str
    description: Optional[str] = None
    cost: float = Field(0.0, ge=0)

class MaintenanceCreate(MaintenanceBase):
    pass

class Maintenance(MaintenanceBase):
    id: int
    status: MaintenanceStatus
    created_at: datetime
    updated_at: datetime
    closed_at: Optional[datetime] = None

    class Config:
        from_attributes = True
