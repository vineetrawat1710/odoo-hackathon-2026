from pydantic import BaseModel, Field
from typing import Optional
from datetime import datetime, date
from app.models.finance import ExpenseType

class ExpenseBase(BaseModel):
    trip_id: Optional[int] = None
    vehicle_id: Optional[int] = None
    type: ExpenseType
    amount: float = Field(..., ge=0)
    description: Optional[str] = None
    date: date

class ExpenseCreate(ExpenseBase):
    pass

class Expense(ExpenseBase):
    id: int
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True

class FuelLogBase(BaseModel):
    vehicle_id: int
    trip_id: Optional[int] = None
    liters: float = Field(..., gt=0)
    cost: float = Field(..., ge=0)
    date: date

class FuelLogCreate(FuelLogBase):
    pass

class FuelLog(FuelLogBase):
    id: int
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True
