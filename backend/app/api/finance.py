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
from app.models.core import Vehicle, Driver, VehicleStatus, DriverStatus, MaintenanceLog

router = APIRouter()

# --- Expenses ---
@router.post("/expenses", response_model=Expense, dependencies=[Depends(require_roles(["fleet_manager", "dispatcher", "financial_analyst"]))])
def add_expense(expense: ExpenseCreate, db: Session = Depends(get_db)):
    if expense.vehicle_id:
        vehicle = db.query(Vehicle).filter(Vehicle.id == expense.vehicle_id).first()
        if not vehicle:
            raise HTTPException(status_code=404, detail="Vehicle not found")
    if expense.trip_id:
        trip = db.query(Trip).filter(Trip.id == expense.trip_id).first()
        if not trip:
            raise HTTPException(status_code=404, detail="Trip not found")
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
@router.post("/fuel-logs", response_model=FuelLog, dependencies=[Depends(require_roles(["fleet_manager", "dispatcher", "financial_analyst"]))])
def add_fuel_log(fuel_log: FuelLogCreate, db: Session = Depends(get_db)):
    vehicle = db.query(Vehicle).filter(Vehicle.id == fuel_log.vehicle_id).first()
    if not vehicle:
        raise HTTPException(status_code=404, detail="Vehicle not found")
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
    total_vehicles = db.query(func.count(Vehicle.id)).scalar() or 0
    available_vehicles = db.query(func.count(Vehicle.id)).filter(Vehicle.status == VehicleStatus.AVAILABLE).scalar() or 0
    on_trip_vehicles = db.query(func.count(Vehicle.id)).filter(Vehicle.status == VehicleStatus.ON_TRIP).scalar() or 0
    vehicles_in_shop = db.query(func.count(Vehicle.id)).filter(Vehicle.status == VehicleStatus.IN_SHOP).scalar() or 0

    total_drivers = db.query(func.count(Driver.id)).scalar() or 0
    available_drivers = db.query(func.count(Driver.id)).filter(Driver.status == DriverStatus.AVAILABLE).scalar() or 0
    drivers_on_duty = db.query(func.count(Driver.id)).filter(Driver.status.in_([DriverStatus.AVAILABLE, DriverStatus.ON_TRIP])).scalar() or 0

    total_trips = db.query(func.count(Trip.id)).scalar() or 0
    completed_trips = db.query(func.count(Trip.id)).filter(Trip.status == TripStatus.COMPLETED).scalar() or 0
    active_trips = db.query(func.count(Trip.id)).filter(Trip.status == TripStatus.DISPATCHED).scalar() or 0
    pending_trips = db.query(func.count(Trip.id)).filter(Trip.status == TripStatus.DRAFT).scalar() or 0

    # Fleet Utilization
    fleet_utilization = round((on_trip_vehicles / total_vehicles * 100), 2) if total_vehicles > 0 else 0.0

    # Fuel Efficiency
    total_actual_distance = db.query(func.sum(Trip.actual_distance)).filter(Trip.actual_distance.isnot(None)).scalar() or 0
    total_liters = db.query(func.sum(FuelLogModel.liters)).scalar() or 0
    fuel_efficiency = round((float(total_actual_distance) / float(total_liters)), 2) if total_liters > 0 else 0.0

    # Operational Cost
    total_maintenance_cost = db.query(func.sum(MaintenanceLog.cost)).scalar() or 0
    total_fuel_cost = db.query(func.sum(FuelLogModel.cost)).scalar() or 0
    total_expenses = db.query(func.sum(ExpenseModel.amount)).scalar() or 0
    operational_cost = float(total_fuel_cost) + float(total_maintenance_cost) + float(total_expenses)

    # Vehicle ROI
    total_revenue = db.query(func.sum(Trip.revenue)).filter(Trip.status == TripStatus.COMPLETED).scalar() or 0
    total_acquisition_cost = db.query(func.sum(Vehicle.acquisition_cost)).scalar() or 0
    
    vehicle_roi = round((((float(total_revenue) - operational_cost) / float(total_acquisition_cost)) * 100), 2) if total_acquisition_cost > 0 else 0.0

    # Individual Vehicle ROIs
    revenues_dict = {v_id: rev for v_id, rev in db.query(Trip.vehicle_id, func.sum(Trip.revenue)).filter(Trip.status == TripStatus.COMPLETED).group_by(Trip.vehicle_id).all()}
    fuels_dict = {v_id: cost for v_id, cost in db.query(FuelLogModel.vehicle_id, func.sum(FuelLogModel.cost)).group_by(FuelLogModel.vehicle_id).all()}
    maints_dict = {v_id: cost for v_id, cost in db.query(MaintenanceLog.vehicle_id, func.sum(MaintenanceLog.cost)).group_by(MaintenanceLog.vehicle_id).all()}
    exps_dict = {v_id: amt for v_id, amt in db.query(ExpenseModel.vehicle_id, func.sum(ExpenseModel.amount)).group_by(ExpenseModel.vehicle_id).all()}
    
    individual_rois = {}
    for v in db.query(Vehicle.id, Vehicle.acquisition_cost).all():
        v_id, acq_cost = v.id, float(v.acquisition_cost)
        rev = float(revenues_dict.get(v_id, 0) or 0)
        fuel = float(fuels_dict.get(v_id, 0) or 0)
        maint = float(maints_dict.get(v_id, 0) or 0)
        exp = float(exps_dict.get(v_id, 0) or 0)
        op_cost = fuel + maint + exp
        individual_rois[v_id] = round(((rev - op_cost) / acq_cost) * 100, 2) if acq_cost > 0 else 0.0

    return {
        "total_vehicles": total_vehicles,
        "available_vehicles": available_vehicles,
        "vehicles_on_trip": on_trip_vehicles,
        "vehicles_in_shop": vehicles_in_shop,
        "total_drivers": total_drivers,
        "available_drivers": available_drivers,
        "drivers_on_duty": drivers_on_duty,
        "active_trips": active_trips,
        "pending_trips": pending_trips,
        "completed_trips": completed_trips,
        "fleet_utilization": fleet_utilization,
        "fuel_efficiency": fuel_efficiency,
        "operational_cost": operational_cost,
        "vehicle_roi": vehicle_roi,
        "total_revenue": float(total_revenue),
        "individual_vehicle_rois": individual_rois
    }

