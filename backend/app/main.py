from fastapi import FastAPI, Request
from fastapi.responses import JSONResponse
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.exc import IntegrityError
from app.api.auth import router as auth_router
from app.api.core import router as core_router
from app.api.trip import router as trip_router
from app.api.finance import router as finance_router

app = FastAPI(
    title="TransitOps API",
    description="Backend for the TransitOps Hackathon Project",
    version="1.0.0",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.exception_handler(IntegrityError)
async def integrity_error_handler(request: Request, exc: IntegrityError):
    # Depending on the driver, we might get a generic message.
    # It's better not to leak SQLAlchemy/DB-specific details.
    return JSONResponse(
        status_code=400,
        content={"success": False, "message": "A database constraint was violated (e.g., duplicate registration or missing reference)."}
    )

app.include_router(auth_router, prefix="/api/auth", tags=["auth"])
app.include_router(core_router, prefix="/api", tags=["core"])
app.include_router(trip_router, prefix="/api/trips", tags=["trips"])
app.include_router(finance_router, prefix="/api/finance", tags=["finance"])

@app.get("/")
def read_root():
    return {"message": "Welcome to the TransitOps API!"}
