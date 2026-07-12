from sqlalchemy.orm import Session
from app.models.trip import Trip, TripStatus
from app.schemas.trip import TripCreate

def get_trip(db: Session, trip_id: int):
    return db.query(Trip).filter(Trip.id == trip_id).first()

def get_trips(db: Session, skip: int = 0, limit: int = 100, status: str = None, vehicle_id: int = None, driver_id: int = None):
    query = db.query(Trip)
    if status:
        query = query.filter(Trip.status == status)
    if vehicle_id:
        query = query.filter(Trip.vehicle_id == vehicle_id)
    if driver_id:
        query = query.filter(Trip.driver_id == driver_id)
    return query.offset(skip).limit(limit).all()

def create_trip(db: Session, trip: TripCreate, created_by_id: int):
    db_trip = Trip(**trip.model_dump(), created_by_id=created_by_id)
    db.add(db_trip)
    db.commit()
    db.refresh(db_trip)
    return db_trip
