from pydantic import BaseModel, EmailStr, field_validator
from typing import Optional
from datetime import datetime
import re
from app.models.user import RoleEnum

class UserBase(BaseModel):
    email: EmailStr
    name: str

class UserCreate(UserBase):
    password: str
    role: RoleEnum

    @field_validator("password")
    @classmethod
    def validate_password_strength(cls, value: str) -> str:
        if len(value) < 8:
            raise ValueError("Password must be at least 8 characters long")
        if not re.search(r"[A-Z]", value):
            raise ValueError("Password must contain at least one uppercase letter")
        if not re.search(r"[a-z]", value):
            raise ValueError("Password must contain at least one lowercase letter")
        if not re.search(r"[0-9]", value):
            raise ValueError("Password must contain at least one number")
        if not re.search(r"[!@#$%^&*(),.?\":{}|<>+_\-\=\/\[\]\\]", value):
            raise ValueError("Password must contain at least one special character")
        return value

class UserLogin(BaseModel):
    email: EmailStr
    password: str

class User(UserBase):
    id: int
    role: RoleEnum
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True

class Token(BaseModel):
    access_token: str
    token_type: str

class TokenData(BaseModel):
    email: Optional[str] = None
