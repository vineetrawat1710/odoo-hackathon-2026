from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from sqlalchemy import func
from typing import List
from app.api.deps import get_db, get_current_user, require_roles
from app.schemas.finance import Expense, ExpenseCreate, FuelLog, FuelLogCreate
from app.crud.crud_finance import (
    create_expense, get_expenses, get_expense, create_fuel_log, get_fuel_logs, get_fuel_log
)
from app.models.trip import Trip, TripStatus
from app.models.finance import Expense as ExpenseModel, FuelLog as FuelLogModel
from app.models.core import Vehicle, Driver, VehicleStatus, DriverStatus

router = APIRouter()

# --- Expenses ---
@router.post("/expenses", response_model=Expense, dependencies=[Depends(require_roles(["fleet_manager", "dispatcher"]))])
def add_expense(expense: ExpenseCreate, db: Session = Depends(get_db)):
    return create_expense(db, expense)

@router.get("/expenses", response_model=List[Expense])
def read_expenses(skip: int = 0, limit: int = 100, trip_id: int = None, vehicle_id: int = None, db: Session = Depends(get_db), current_user=Depends(get_current_user)):
    return get_expenses(db, skip=skip, limit=limit, trip_id=trip_id, vehicle_id=vehicle_id)

@router.get("/expenses/{id}", response_model=Expense)
def read_expense(id: int, db: Session = Depends(get_db), current_user=Depends(get_current_user)):
    expense = get_expense(db, id)
    if not expense:
        raise HTTPException(status_code=404, detail="Expense not found")
    return expense

# --- Fuel Logs ---
@router.post("/fuel-logs", response_model=FuelLog, dependencies=[Depends(require_roles(["fleet_manager", "dispatcher"]))])
def add_fuel_log(fuel_log: FuelLogCreate, db: Session = Depends(get_db)):
    return create_fuel_log(db, fuel_log)

@router.get("/fuel-logs", response_model=List[FuelLog])
def read_fuel_logs(skip: int = 0, limit: int = 100, vehicle_id: int = None, db: Session = Depends(get_db), current_user=Depends(get_current_user)):
    return get_fuel_logs(db, skip=skip, limit=limit, vehicle_id=vehicle_id)

@router.get("/fuel-logs/{id}", response_model=FuelLog)
def read_fuel_log(id: int, db: Session = Depends(get_db), current_user=Depends(get_current_user)):
    fuel_log = get_fuel_log(db, id)
    if not fuel_log:
        raise HTTPException(status_code=404, detail="Fuel log not found")
    return fuel_log

# --- Dashboard Analytics ---
@router.get("/dashboard")
def get_dashboard(db: Session = Depends(get_db), current_user=Depends(get_current_user)):
    total_vehicles = db.query(func.count(Vehicle.id)).scalar()
    available_vehicles = db.query(func.count(Vehicle.id)).filter(Vehicle.status == VehicleStatus.AVAILABLE).scalar()
    on_trip_vehicles = db.query(func.count(Vehicle.id)).filter(Vehicle.status == VehicleStatus.ON_TRIP).scalar()

    total_drivers = db.query(func.count(Driver.id)).scalar()
    available_drivers = db.query(func.count(Driver.id)).filter(Driver.status == DriverStatus.AVAILABLE).scalar()

    total_trips = db.query(func.count(Trip.id)).scalar()
    completed_trips = db.query(func.count(Trip.id)).filter(Trip.status == TripStatus.COMPLETED).scalar()
    active_trips = db.query(func.count(Trip.id)).filter(Trip.status == TripStatus.DISPATCHED).scalar()

    total_revenue = db.query(func.coalesce(func.sum(Trip.revenue), 0)).filter(Trip.status == TripStatus.COMPLETED).scalar()
    total_expenses = db.query(func.coalesce(func.sum(ExpenseModel.amount), 0)).scalar()
    total_fuel_cost = db.query(func.coalesce(func.sum(FuelLogModel.cost), 0)).scalar()

    return {
        "fleet": {
            "total_vehicles": total_vehicles,
            "available_vehicles": available_vehicles,
            "on_trip_vehicles": on_trip_vehicles,
            "total_drivers": total_drivers,
            "available_drivers": available_drivers,
        },
        "operations": {
            "total_trips": total_trips,
            "completed_trips": completed_trips,
            "active_trips": active_trips,
        },
        "financials": {
            "total_revenue": total_revenue,
            "total_expenses": total_expenses,
            "total_fuel_cost": total_fuel_cost,
            "net_profit": total_revenue - total_expenses - total_fuel_cost,
        },
    }
