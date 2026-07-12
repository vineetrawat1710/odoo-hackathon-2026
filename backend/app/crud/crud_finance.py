from sqlalchemy.orm import Session
from app.models.finance import Expense, FuelLog
from app.schemas.finance import ExpenseCreate, FuelLogCreate

def create_expense(db: Session, expense: ExpenseCreate):
    db_expense = Expense(**expense.model_dump())
    db.add(db_expense)
    db.commit()
    db.refresh(db_expense)
    return db_expense

def get_expenses(db: Session, skip: int = 0, limit: int = 100, trip_id: int = None, vehicle_id: int = None):
    query = db.query(Expense)
    if trip_id:
        query = query.filter(Expense.trip_id == trip_id)
    if vehicle_id:
        query = query.filter(Expense.vehicle_id == vehicle_id)
    return query.offset(skip).limit(limit).all()

def get_expense(db: Session, expense_id: int):
    return db.query(Expense).filter(Expense.id == expense_id).first()

def create_fuel_log(db: Session, fuel_log: FuelLogCreate):
    db_log = FuelLog(**fuel_log.model_dump())
    db.add(db_log)
    db.commit()
    db.refresh(db_log)
    return db_log

def get_fuel_logs(db: Session, skip: int = 0, limit: int = 100, vehicle_id: int = None):
    query = db.query(FuelLog)
    if vehicle_id:
        query = query.filter(FuelLog.vehicle_id == vehicle_id)
    return query.offset(skip).limit(limit).all()

def get_fuel_log(db: Session, fuel_log_id: int):
    return db.query(FuelLog).filter(FuelLog.id == fuel_log_id).first()
