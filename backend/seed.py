"""
Seed script to populate the database with initial roles and a demo user.
Run: python seed.py
"""
import sys
sys.path.insert(0, ".")

from app.db.session import SessionLocal
from app.models.user import Role, User
from app.core.security import get_password_hash

def seed():
    db = SessionLocal()
    
    # Create roles
    roles = ["fleet_manager", "dispatcher", "safety_officer", "driver", "viewer"]
    for role_name in roles:
        existing = db.query(Role).filter(Role.name == role_name).first()
        if not existing:
            db.add(Role(name=role_name))
            print(f"  Created role: {role_name}")
    db.commit()
    
    # Create demo users
    demo_users = [
        {"name": "Admin User", "email": "admin@transitops.com", "password": "admin123", "role": "fleet_manager"},
        {"name": "Dispatcher", "email": "dispatch@transitops.com", "password": "dispatch123", "role": "dispatcher"},
        {"name": "Safety Officer", "email": "safety@transitops.com", "password": "safety123", "role": "safety_officer"},
    ]
    
    for user_data in demo_users:
        existing = db.query(User).filter(User.email == user_data["email"]).first()
        if not existing:
            role = db.query(Role).filter(Role.name == user_data["role"]).first()
            db.add(User(
                name=user_data["name"],
                email=user_data["email"],
                password_hash=get_password_hash(user_data["password"]),
                role_id=role.id,
            ))
            print(f"  Created user: {user_data['email']} ({user_data['role']})")
    db.commit()
    db.close()
    print("\nSeed completed!")

if __name__ == "__main__":
    seed()
