from sqlalchemy.orm import Session
from app.models.core import Vehicle, Driver, MaintenanceLog, VehicleStatus, DriverStatus, MaintenanceStatus
from app.schemas.core import VehicleCreate, DriverCreate, MaintenanceCreate

def create_vehicle(db: Session, vehicle: VehicleCreate):
    db_vehicle = Vehicle(**vehicle.model_dump())
    db.add(db_vehicle)
    db.commit()
    db.refresh(db_vehicle)
    return db_vehicle

def get_vehicles(db: Session, skip: int = 0, limit: int = 100, status: str = None):
    query = db.query(Vehicle)
    if status:
        query = query.filter(Vehicle.status == status)
    return query.offset(skip).limit(limit).all()

def get_vehicle_by_registration(db: Session, registration: str):
    return db.query(Vehicle).filter(Vehicle.registration_number == registration).first()

def get_vehicle(db: Session, vehicle_id: int):
    return db.query(Vehicle).filter(Vehicle.id == vehicle_id).first()

def create_driver(db: Session, driver: DriverCreate):
    db_driver = Driver(**driver.model_dump())
    db.add(db_driver)
    db.commit()
    db.refresh(db_driver)
    return db_driver

def get_drivers(db: Session, skip: int = 0, limit: int = 100, status: str = None):
    query = db.query(Driver)
    if status:
        query = query.filter(Driver.status == status)
    return query.offset(skip).limit(limit).all()

def get_driver(db: Session, driver_id: int):
    return db.query(Driver).filter(Driver.id == driver_id).first()

def create_maintenance_log(db: Session, maintenance: MaintenanceCreate):
    db_log = MaintenanceLog(**maintenance.model_dump())
    db.add(db_log)
    db.flush() # flush to get the id without committing
    return db_log

def get_maintenance_log(db: Session, maintenance_id: int):
    return db.query(MaintenanceLog).filter(MaintenanceLog.id == maintenance_id).first()
