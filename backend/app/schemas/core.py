from pydantic import BaseModel, Field, field_validator
from typing import Optional
from datetime import datetime, date
import re
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

    @field_validator("license_number")
    @classmethod
    def validate_license_number(cls, value: str) -> str:
        val = value.strip().upper()
        if len(val) < 8 or len(val) > 25:
            raise ValueError("Driving license number must be between 8 and 25 characters long")
        if not re.search(r"\d", val):
            raise ValueError("Driving license number must contain at least one digit")
        if not re.match(r"^[A-Z]{2,3}[-\s/]?([A-Z0-9-\s/]){5,22}$", val):
            raise ValueError("Driving license must start with a 2-3 letter state/region code and contain valid alphanumeric characters (e.g., DL-04-2026-8888)")
        return val

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
