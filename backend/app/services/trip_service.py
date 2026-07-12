from sqlalchemy.orm import Session
from sqlalchemy.sql import func
from fastapi import HTTPException, status
from datetime import datetime, timezone
from app.models.trip import Trip, TripStatus
from app.models.core import Vehicle, Driver, VehicleStatus, DriverStatus
from app.schemas.trip import TripCreate, TripComplete
from app.crud.crud_trip import create_trip

def validate_and_create_trip(db: Session, trip: TripCreate, user_id: int):
    vehicle = db.query(Vehicle).filter(Vehicle.id == trip.vehicle_id).first()
    driver = db.query(Driver).filter(Driver.id == trip.driver_id).first()
    
    if not vehicle or not driver:
        raise HTTPException(status_code=404, detail="Vehicle or Driver not found")
        
    if trip.cargo_weight > vehicle.max_load_capacity:
        raise HTTPException(status_code=400, detail=f"Cargo weight exceeds vehicle capacity of {vehicle.max_load_capacity}")
        
    if driver.status == DriverStatus.Suspended:
        raise HTTPException(status_code=400, detail="Driver is suspended")
        
    if driver.license_expiry_date.replace(tzinfo=timezone.utc) < datetime.now(timezone.utc):
        raise HTTPException(status_code=400, detail="Driver license has expired")
        
    return create_trip(db, trip, user_id)

def dispatch_trip(db: Session, trip_id: int):
    trip = db.query(Trip).filter(Trip.id == trip_id).first()
    if not trip:
        raise HTTPException(status_code=404, detail="Trip not found")
    
    if trip.status != TripStatus.Draft:
        raise HTTPException(status_code=400, detail="Only Draft trips can be dispatched")

    vehicle = trip.vehicle
    driver = trip.driver
    
    if vehicle.status != VehicleStatus.Available:
        raise HTTPException(status_code=400, detail="Vehicle is not available for dispatch")
        
    if driver.status != DriverStatus.Available:
        raise HTTPException(status_code=400, detail="Driver is not available for dispatch")
        
    try:
        # State transitions
        trip.status = TripStatus.Dispatched
        trip.dispatched_at = func.now()
        trip.start_odometer = vehicle.odometer
        
        vehicle.status = VehicleStatus.OnTrip
        driver.status = DriverStatus.OnTrip
        
        db.commit()
        db.refresh(trip)
        return trip
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=f"Failed to dispatch trip: {str(e)}")

def complete_trip(db: Session, trip_id: int, payload: TripComplete):
    trip = db.query(Trip).filter(Trip.id == trip_id).first()
    if not trip or trip.status != TripStatus.Dispatched:
        raise HTTPException(status_code=400, detail="Trip not found or not in Dispatched state")
        
    try:
        trip.status = TripStatus.Completed
        trip.completed_at = func.now()
        trip.end_odometer = payload.end_odometer
        trip.actual_distance = payload.actual_distance
        
        vehicle = trip.vehicle
        driver = trip.driver
        
        vehicle.status = VehicleStatus.Available
        vehicle.odometer = payload.end_odometer
        driver.status = DriverStatus.Available
        
        db.commit()
        db.refresh(trip)
        return trip
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=f"Failed to complete trip: {str(e)}")

def cancel_trip(db: Session, trip_id: int):
    trip = db.query(Trip).filter(Trip.id == trip_id).first()
    if not trip or trip.status in [TripStatus.Completed, TripStatus.Cancelled]:
        raise HTTPException(status_code=400, detail="Cannot cancel this trip")
        
    try:
        if trip.status == TripStatus.Dispatched:
            trip.vehicle.status = VehicleStatus.Available
            trip.driver.status = DriverStatus.Available
            
        trip.status = TripStatus.Cancelled
        trip.cancelled_at = func.now()
        
        db.commit()
        db.refresh(trip)
        return trip
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=f"Failed to cancel trip: {str(e)}")
