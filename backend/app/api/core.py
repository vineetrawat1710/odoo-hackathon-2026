from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
from datetime import datetime
from app.api.deps import get_db, get_current_user, require_roles
from app.schemas.core import Vehicle, VehicleCreate, Driver, DriverCreate, Maintenance, MaintenanceCreate
from app.crud.crud_core import (
    create_vehicle, get_vehicles, get_vehicle_by_registration,
    create_driver, get_drivers, get_driver, create_maintenance_log, get_vehicle, get_maintenance_log
)
from app.models.core import VehicleStatus, MaintenanceStatus

router = APIRouter()

@router.post("/vehicles", response_model=Vehicle, dependencies=[Depends(require_roles(["fleet_manager"]))])
def add_vehicle(vehicle: VehicleCreate, db: Session = Depends(get_db)):
    if get_vehicle_by_registration(db, vehicle.registration_number):
        raise HTTPException(status_code=400, detail="Vehicle with this registration number already exists")
    return create_vehicle(db, vehicle=vehicle)

@router.get("/vehicles", response_model=List[Vehicle])
def read_vehicles(skip: int = 0, limit: int = 100, status: str = None, db: Session = Depends(get_db), current_user = Depends(get_current_user)):
    return get_vehicles(db, skip=skip, limit=limit, status=status)

@router.get("/vehicles/{id}", response_model=Vehicle)
def read_vehicle(id: int, db: Session = Depends(get_db), current_user = Depends(get_current_user)):
    vehicle = get_vehicle(db, id)
    if not vehicle:
        raise HTTPException(status_code=404, detail="Vehicle not found")
    return vehicle
@router.post("/drivers", response_model=Driver, dependencies=[Depends(require_roles(["fleet_manager", "safety_officer"]))])
def add_driver(driver: DriverCreate, db: Session = Depends(get_db)):
    return create_driver(db, driver=driver)

@router.get("/drivers", response_model=List[Driver])
def read_drivers(skip: int = 0, limit: int = 100, status: str = None, db: Session = Depends(get_db), current_user = Depends(get_current_user)):
    return get_drivers(db, skip=skip, limit=limit, status=status)

@router.get("/drivers/{id}", response_model=Driver)
def read_driver(id: int, db: Session = Depends(get_db), current_user = Depends(get_current_user)):
    driver = get_driver(db, id)
    if not driver:
        raise HTTPException(status_code=404, detail="Driver not found")
    return driver
@router.post("/maintenance", response_model=Maintenance, dependencies=[Depends(require_roles(["fleet_manager"]))])
def add_maintenance(maintenance: MaintenanceCreate, db: Session = Depends(get_db)):
    vehicle = get_vehicle(db, maintenance.vehicle_id)
    if not vehicle:
        raise HTTPException(status_code=404, detail="Vehicle not found")
    if vehicle.status == VehicleStatus.OnTrip:
        raise HTTPException(status_code=400, detail="Cannot perform maintenance on vehicle currently on trip")
        
    vehicle.status = VehicleStatus.InShop
    return create_maintenance_log(db, maintenance=maintenance)

@router.get("/maintenance/{id}", response_model=Maintenance)
def read_maintenance(id: int, db: Session = Depends(get_db), current_user = Depends(get_current_user)):
    maintenance = get_maintenance_log(db, id)
    if not maintenance:
        raise HTTPException(status_code=404, detail="Maintenance log not found")
    return maintenance

@router.post("/maintenance/{id}/close", response_model=Maintenance, dependencies=[Depends(require_roles(["fleet_manager"]))])
def close_maintenance(id: int, db: Session = Depends(get_db)):
    maintenance = get_maintenance_log(db, id)
    if not maintenance:
        raise HTTPException(status_code=404, detail="Maintenance log not found")
    if maintenance.status == MaintenanceStatus.Closed:
        raise HTTPException(status_code=400, detail="Maintenance log already closed")
    
    vehicle = get_vehicle(db, maintenance.vehicle_id)
    if vehicle:
        vehicle.status = VehicleStatus.Available
    
    maintenance.status = MaintenanceStatus.Closed
    maintenance.closed_at = datetime.utcnow()
    db.commit()
    db.refresh(maintenance)
    return maintenance
