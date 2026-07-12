from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
from app.api.deps import get_db, get_current_user, require_roles
from app.schemas.trip import Trip, TripCreate, TripComplete
from app.crud.crud_trip import get_trips, get_trip
from app.services.trip_service import validate_and_create_trip, dispatch_trip, complete_trip, cancel_trip

router = APIRouter()

@router.post("/", response_model=Trip, dependencies=[Depends(require_roles(["dispatcher", "fleet_manager"]))])
def create_new_trip(trip: TripCreate, db: Session = Depends(get_db), current_user = Depends(get_current_user)):
    return validate_and_create_trip(db, trip, current_user.id)

@router.get("/", response_model=List[Trip])
def read_trips(skip: int = 0, limit: int = 100, status: str = None, vehicle_id: int = None, driver_id: int = None, db: Session = Depends(get_db), current_user = Depends(get_current_user)):
    return get_trips(db, skip=skip, limit=limit, status=status, vehicle_id=vehicle_id, driver_id=driver_id)

@router.get("/{trip_id}", response_model=Trip)
def read_trip(trip_id: int, db: Session = Depends(get_db), current_user = Depends(get_current_user)):
    trip = get_trip(db, trip_id)
    if not trip:
        raise HTTPException(status_code=404, detail="Trip not found")
    return trip

@router.post("/{trip_id}/dispatch", response_model=Trip, dependencies=[Depends(require_roles(["dispatcher", "fleet_manager"]))])
def dispatch_existing_trip(trip_id: int, db: Session = Depends(get_db)):
    return dispatch_trip(db, trip_id)

@router.post("/{trip_id}/complete", response_model=Trip, dependencies=[Depends(require_roles(["dispatcher", "fleet_manager"]))])
def complete_existing_trip(trip_id: int, payload: TripComplete, db: Session = Depends(get_db)):
    return complete_trip(db, trip_id, payload)

@router.post("/{trip_id}/cancel", response_model=Trip, dependencies=[Depends(require_roles(["dispatcher", "fleet_manager"]))])
def cancel_existing_trip(trip_id: int, db: Session = Depends(get_db)):
    return cancel_trip(db, trip_id)

