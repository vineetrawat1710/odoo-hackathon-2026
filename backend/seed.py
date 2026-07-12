"""
Seed script to populate the database with initial demo users for all 4 roles,
plus 5 realistic mock vehicles, 5 mock drivers, trips, fuel logs, and expenses.
Run: python seed.py
"""
import sys
sys.path.insert(0, ".")

from datetime import date, datetime, timedelta
from app.db.session import SessionLocal
from app.models.user import User, RoleEnum
from app.models.core import Vehicle, Driver, VehicleType, VehicleStatus, DriverStatus, LicenseCategory, MaintenanceLog, MaintenanceStatus
from app.models.trip import Trip, TripStatus
from app.models.finance import FuelLog, Expense, ExpenseType
from app.core.security import get_password_hash

def seed():
    db = SessionLocal()
    
    # 1. Create demo users for all 4 roles
    demo_users = [
        {"name": "Admin User", "email": "admin@transitops.com", "password": "admin123", "role": RoleEnum.FLEET_MANAGER},
        {"name": "Dispatcher", "email": "dispatch@transitops.com", "password": "dispatch123", "role": RoleEnum.DISPATCHER},
        {"name": "Safety Officer", "email": "safety@transitops.com", "password": "safety123", "role": RoleEnum.SAFETY_OFFICER},
        {"name": "Financial Analyst", "email": "finance@transitops.com", "password": "finance123", "role": RoleEnum.FINANCIAL_ANALYST},
    ]
    
    admin_user = None
    for user_data in demo_users:
        existing = db.query(User).filter(User.email == user_data["email"]).first()
        if not existing:
            new_user = User(
                name=user_data["name"],
                email=user_data["email"],
                password_hash=get_password_hash(user_data["password"]),
                role=user_data["role"],
            )
            db.add(new_user)
            db.flush()
            if user_data["role"] == RoleEnum.FLEET_MANAGER:
                admin_user = new_user
            print(f"  Created user: {user_data['email']} ({user_data['role'].value})")
        else:
            if user_data["role"] == RoleEnum.FLEET_MANAGER:
                admin_user = existing
            print(f"  User already exists: {user_data['email']} ({user_data['role'].value})")
            
    # 2. Create exactly 5 Mock Vehicles
    print("\nSeeding 5 Mock Vehicles...")
    mock_vehicles = [
        {"reg": "DL-01-EQ-1001", "name": "Tata Prima 5530", "type": VehicleType.TRUCK, "cap": 25000.0, "cost": 4500000.0, "odo": 12450.0, "region": "North Hub"},
        {"reg": "MH-12-TX-2002", "name": "Ashok Leyland Ecomet", "type": VehicleType.TRUCK, "cap": 18000.0, "cost": 3200000.0, "odo": 8900.0, "region": "West Yard"},
        {"reg": "KA-03-VN-3003", "name": "Mahindra Furio 7", "type": VehicleType.VAN, "cap": 5000.0, "cost": 1650000.0, "odo": 4520.0, "region": "South Node"},
        {"reg": "GJ-04-TR-4004", "name": "BharatBenz 2823C", "type": VehicleType.TRUCK, "cap": 28000.0, "cost": 5200000.0, "odo": 19800.0, "region": "West Yard"},
        {"reg": "TN-05-CR-5005", "name": "Maruti Swift Dzire Fleet", "type": VehicleType.CAR, "cap": 450.0, "cost": 780000.0, "odo": 2100.0, "region": "Chennai Depot"},
    ]
    
    vehicles = []
    for mv in mock_vehicles:
        v = db.query(Vehicle).filter(Vehicle.registration_number == mv["reg"]).first()
        if not v:
            v = Vehicle(
                registration_number=mv["reg"],
                name=mv["name"],
                type=mv["type"],
                max_load_capacity=mv["cap"],
                acquisition_cost=mv["cost"],
                odometer=mv["odo"],
                status=VehicleStatus.AVAILABLE,
                region=mv["region"]
            )
            db.add(v)
            db.flush()
            print(f"  Added vehicle: {mv['reg']} ({mv['name']})")
        vehicles.append(v)

    # 3. Create exactly 5 Mock Drivers
    print("\nSeeding 5 Mock Drivers...")
    mock_drivers = [
        {"name": "Vikram Singh", "lic": "DL-04-2020-11111", "cat": LicenseCategory.CE, "exp": date(2032, 5, 15), "phone": "+91 98111 22222", "score": 96.5},
        {"name": "Suresh Patil", "lic": "MH-12-2018-22222", "cat": LicenseCategory.C, "exp": date(2030, 8, 20), "phone": "+91 98222 33333", "score": 92.0},
        {"name": "Arun Kumar", "lic": "KA-03-2021-33333", "cat": LicenseCategory.B, "exp": date(2033, 11, 10), "phone": "+91 98333 44444", "score": 98.0},
        {"name": "Jignesh Shah", "lic": "GJ-04-2019-44444", "cat": LicenseCategory.CE, "exp": date(2031, 3, 25), "phone": "+91 98444 55555", "score": 88.5},
        {"name": "Manoj Sharma", "lic": "TN-05-2022-55555", "cat": LicenseCategory.B, "exp": date(2034, 7, 12), "phone": "+91 98555 66666", "score": 94.0},
    ]
    
    drivers = []
    for md in mock_drivers:
        d = db.query(Driver).filter(Driver.license_number == md["lic"]).first()
        if not d:
            d = Driver(
                name=md["name"],
                license_number=md["lic"],
                license_category=md["cat"],
                license_expiry_date=md["exp"],
                contact_number=md["phone"],
                safety_score=md["score"],
                status=DriverStatus.AVAILABLE
            )
            db.add(d)
            db.flush()
            print(f"  Added driver: {md['name']} ({md['lic']})")
        drivers.append(d)

    # 4. Create sample completed trips, fuel logs, and expenses so Dashboard KPI / ROI looks vibrant & complete!
    print("\nSeeding Trips, Fuel Logs, and Expenses for vibrant dashboard analytics...")
    admin_id = admin_user.id if admin_user else 1
    
    # Check if trips already exist
    existing_trips = db.query(Trip).count()
    if existing_trips == 0 and len(vehicles) >= 5 and len(drivers) >= 5:
        # Trip 1 (Completed)
        t1 = Trip(
            source="Delhi Hub Node",
            destination="Jaipur Distribution Center",
            vehicle_id=vehicles[0].id,
            driver_id=drivers[0].id,
            cargo_weight=18000.0,
            planned_distance=280.0,
            actual_distance=285.0,
            start_odometer=12165.0,
            end_odometer=12450.0,
            status=TripStatus.COMPLETED,
            revenue=65000.0,
            created_by_id=admin_id,
            dispatched_at=datetime.now() - timedelta(days=5),
            completed_at=datetime.now() - timedelta(days=4)
        )
        # Trip 2 (Completed)
        t2 = Trip(
            source="Mumbai Yard",
            destination="Pune Industrial Hub",
            vehicle_id=vehicles[1].id,
            driver_id=drivers[1].id,
            cargo_weight=14000.0,
            planned_distance=150.0,
            actual_distance=152.0,
            start_odometer=8748.0,
            end_odometer=8900.0,
            status=TripStatus.COMPLETED,
            revenue=42000.0,
            created_by_id=admin_id,
            dispatched_at=datetime.now() - timedelta(days=3),
            completed_at=datetime.now() - timedelta(days=2)
        )
        # Trip 3 (Dispatched - Active)
        t3 = Trip(
            source="Bangalore Depot",
            destination="Chennai Terminal",
            vehicle_id=vehicles[2].id,
            driver_id=drivers[2].id,
            cargo_weight=4200.0,
            planned_distance=345.0,
            start_odometer=4520.0,
            status=TripStatus.DISPATCHED,
            revenue=38000.0,
            created_by_id=admin_id,
            dispatched_at=datetime.now() - timedelta(hours=6)
        )
        # Update vehicle & driver status for the active trip
        vehicles[2].status = VehicleStatus.ON_TRIP
        drivers[2].status = DriverStatus.ON_TRIP
        
        db.add_all([t1, t2, t3])
        db.flush()

        # Add fuel logs
        db.add_all([
            FuelLog(vehicle_id=vehicles[0].id, date=date.today() - timedelta(days=5), liters=180.0, cost=17100.0, logged_by_id=admin_id),
            FuelLog(vehicle_id=vehicles[1].id, date=date.today() - timedelta(days=3), liters=110.0, cost=10450.0, logged_by_id=admin_id),
            FuelLog(vehicle_id=vehicles[3].id, date=date.today() - timedelta(days=2), liters=220.0, cost=20900.0, logged_by_id=admin_id),
        ])

        # Add operating expenses
        db.add_all([
            Expense(trip_id=t1.id, vehicle_id=vehicles[0].id, type=ExpenseType.TOLLS, amount=3200.0, description="Highway tolls Delhi-Jaipur", logged_by_id=admin_id),
            Expense(trip_id=t1.id, vehicle_id=vehicles[0].id, type=ExpenseType.MAINTENANCE, amount=8500.0, description="Routine oil check & brake pad alignment", logged_by_id=admin_id),
            Expense(trip_id=t2.id, vehicle_id=vehicles[1].id, type=ExpenseType.TOLLS, amount=1450.0, description="Expressway toll Pune", logged_by_id=admin_id),
            Expense(trip_id=t2.id, vehicle_id=vehicles[1].id, type=ExpenseType.MISC, amount=2100.0, description="Driver night halt & unloading stipend", logged_by_id=admin_id),
        ])

        # Add maintenance logs
        db.add_all([
            MaintenanceLog(vehicle_id=vehicles[1].id, type="REPAIR", description="Engine diagnostics & clutch plate overhaul", cost=18500.0, status=MaintenanceStatus.OPEN),
            MaintenanceLog(vehicle_id=vehicles[0].id, type="ROUTINE", description="Annual safety check & tire balancing", cost=6500.0, status=MaintenanceStatus.CLOSED, closed_at=datetime.now() - timedelta(days=2)),
        ])
        vehicles[1].status = VehicleStatus.IN_SHOP

    db.commit()
    db.close()
    print("\nDatabase seeded successfully with 5 vehicles, 5 drivers, maintenance logs, and dashboard analytics!")

if __name__ == "__main__":
    seed()
