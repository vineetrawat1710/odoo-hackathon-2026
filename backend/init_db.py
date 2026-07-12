import sys
sys.path.insert(0, ".")
from app.db.base_class import Base
from app.db.session import engine
from app.models.user import User
from app.models.core import Vehicle, Driver, MaintenanceLog
from app.models.finance import Expense, FuelLog
from app.models.trip import Trip

print("Creating database tables...")
Base.metadata.create_all(bind=engine)
print("Done!")
