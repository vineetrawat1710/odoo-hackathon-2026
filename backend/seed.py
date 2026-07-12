"""
Seed script to populate the database with a demo user.
Run: python seed.py
"""
import sys
sys.path.insert(0, ".")

from app.db.session import SessionLocal
from app.models.user import RoleEnum, User
from app.core.security import get_password_hash

def seed():
    db = SessionLocal()
    
    # Create demo users
    demo_users = [
        {"name": "Admin User", "email": "admin@transitops.com", "password": "admin123", "role": RoleEnum.FLEET_MANAGER},
        {"name": "Dispatcher", "email": "dispatch@transitops.com", "password": "dispatch123", "role": RoleEnum.DISPATCHER},
        {"name": "Safety Officer", "email": "safety@transitops.com", "password": "safety123", "role": RoleEnum.SAFETY_OFFICER},
    ]
    
    for user_data in demo_users:
        existing = db.query(User).filter(User.email == user_data["email"]).first()
        if not existing:
            db.add(User(
                name=user_data["name"],
                email=user_data["email"],
                password_hash=get_password_hash(user_data["password"]),
                role=user_data["role"],
            ))
            print(f"  Created user: {user_data['email']} ({user_data['role']})")
    db.commit()
    db.close()
    print("\nSeed completed!")

if __name__ == "__main__":
    seed()
