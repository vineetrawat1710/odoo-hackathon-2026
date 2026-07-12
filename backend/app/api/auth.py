from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.api.deps import get_db, get_current_user
from app.crud.crud_user import get_user_by_email, create_user
from app.core.security import verify_password, create_access_token
from app.schemas.user import Token, User, UserCreate, UserLogin

router = APIRouter()

@router.post("/signup", response_model=User)
def signup(user_in: UserCreate, db: Session = Depends(get_db)):
    user = get_user_by_email(db, email=user_in.email)
    if user:
        raise HTTPException(status_code=400, detail="Email already registered")
    return create_user(db, user_in)

@router.post("/login", response_model=Token)
def login_access_token(user_credentials: UserLogin, db: Session = Depends(get_db)):
    user = get_user_by_email(db, email=user_credentials.email)
    if not user or not verify_password(user_credentials.password, user.password_hash):
        raise HTTPException(status_code=400, detail="Incorrect email or password")
    
    access_token = create_access_token(data={"sub": user.email, "role": user.role.value})
    return {"access_token": access_token, "token_type": "bearer"}

@router.get("/me", response_model=User)
def read_current_user(current_user: User = Depends(get_current_user)):
    return current_user
