# TransitOps – Smart Transport Operations Platform 🚚

> **Built during the Odoo Hackathon 2026 (8-Hour Challenge)**

TransitOps is a scalable, open-source Fleet Management & Transport Operations platform built to solve real-world logistical challenges. It provides complete operational visibility, smart dispatching with strict business rules, and precise financial tracking for fleets of any size.

## 🏆 Problem & Solution

| Problem | Our Solution |
|---------|--------------|
| **Scheduling Conflicts** | Real-time status flags + database-level unique indexes to prevent double-dispatching |
| **Underutilized Vehicles** | Fleet Utilization KPIs + comprehensive dashboard analytics |
| **Inaccurate Expense Tracking** | Linked fuel logs and strict decimal-precision financial data tables |
| **Poor Operational Visibility** | Role-Based Access Control (RBAC) with tailored reports for managers, dispatchers, and analysts |

## 🛠 Tech Stack
- **Database:** PostgreSQL (Strict Relational Schema, 3NF)
- **Backend:** FastAPI REST API (SQLAlchemy ORM, Pydantic validation, JWT Authentication)
- **Frontend:** React + Vite + Tailwind CSS + Recharts

## 🗄️ Database Architecture
Our database (`schema.sql`) is engineered specifically for **scalability, financial accuracy, and strict data integrity**. Key architectural highlights include:
- **Financial Precision:** All monetary values and capacities use `DECIMAL(10,2)` to completely eliminate floating-point rounding errors.
- **Strict Data Integrity:** Custom PostgreSQL `ENUM` types for statuses (e.g., `VEHICLE_STATUS`, `TRIP_STATUS`) to ensure consistent frontend rendering and reliable reporting.
- **Race Condition Defense:** Partial unique indexes on the database layer guarantee that a vehicle or driver can only have one active trip at a time, protecting against concurrent API requests.
- **Robust Constraints:** Database-level `CHECK` constraints prevent logically impossible data (e.g., negative fuel amounts, negative cargo weights, or safety scores outside 0-100).

*See the `schema.sql` file in this repository for the complete database initialization script.*

## ⚙️ Backend Architecture
The backend is built with **FastAPI, SQLAlchemy 2.0, and Pydantic v2**, designed for high performance, transaction safety, and clean separation of concerns.

- **Domain-Grouped Structure:** Routes, schemas, and models are flattened by domain (core, finance, trip) to prevent circular imports and allow rapid feature development.
- **Transactional Integrity:** State machine transitions (e.g., dispatching a trip, logging maintenance) are wrapped in strict `try...except` SQLAlchemy transactional blocks. This prevents partial state corruption (e.g., a vehicle getting locked in `IN_SHOP` status if a maintenance log insertion fails).
- **Advanced DB Aggregations:** The Analytics Dashboard performs multi-table KPI aggregation (Fleet Utilization, Vehicle ROI, Fuel Efficiency) directly in PostgreSQL. By using optimized `func.sum` and constant O(1) `group_by` queries, the system completely avoids N+1 problems in Python.
- **Robust Exception Handling:** Pydantic Field boundaries (e.g., `gt=0` for distances/weights) enforce data sanity before reaching the database. SQLAlchemy `IntegrityError` constraints are intercepted by a global exception handler and cleanly returned as HTTP 400 Bad Requests.
- **Stateless RBAC:** JSON Web Tokens (JWTs) track and authenticate specific roles (Fleet Manager, Dispatcher, Safety Officer, Financial Analyst) via route dependencies.

## 🚀 Quick Start

### 1. Database Setup
Ensure you have PostgreSQL installed. Run the initialization script to generate the tables, enums, constraints, and indexes:
```bash
psql -U your_postgres_user -d your_database_name -f schema.sql
```

### 2. Backend Setup
Navigate into the `backend` folder and start the FastAPI server:
```bash
cd backend
python -m venv venv
source venv/bin/activate  # On Windows use `venv\Scripts\activate`
pip install -r requirements.txt
uvicorn app.main:app --reload
```

## 👥 Roles & Permissions (RBAC)
- **Fleet Manager:** Full system control (CRUD for vehicles, drivers, trips, and maintenance).
- **Dispatcher:** Creates and manages active trips, assigning only currently *Available* vehicles and drivers.
- **Safety Officer:** Monitors driver compliance, license validity, and safety scores.
- **Financial Analyst:** Tracks fleet utilization, fuel efficiency, ROI, and operational costs.

## 📜 License
This project is 100% Open Source and built with zero cloud dependencies or paid APIs.
