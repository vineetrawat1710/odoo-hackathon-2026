from pydantic import BaseModel, Field
from typing import Optional
from datetime import datetime
from app.models.trip import TripStatus

class TripBase(BaseModel):
    source: str
    destination: str
    vehicle_id: int
    driver_id: int
    cargo_weight: float = Field(..., gt=0)
    planned_distance: float = Field(..., gt=0)
    revenue: float = 0.0

class TripCreate(TripBase):
    pass

class TripComplete(BaseModel):
    actual_distance: float
    end_odometer: float

class Trip(TripBase):
    id: int
    status: TripStatus
    start_odometer: Optional[float] = None
    end_odometer: Optional[float] = None
    actual_distance: Optional[float] = None
    created_by_id: Optional[int] = None
    created_at: datetime
    updated_at: datetime
    dispatched_at: Optional[datetime] = None
    completed_at: Optional[datetime] = None
    cancelled_at: Optional[datetime] = None

    class Config:
        from_attributes = True
