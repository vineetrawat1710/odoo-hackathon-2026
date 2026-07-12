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
- **Backend:** FastAPI REST API (or Express.js)
- **Frontend:** React + Vite + Tailwind CSS + Recharts

## 🗄️ Database Architecture
Our database (`schema.sql`) is engineered specifically for **scalability, financial accuracy, and strict data integrity**. Key architectural highlights include:
- **Financial Precision:** All monetary values and capacities use `DECIMAL(10,2)` to completely eliminate floating-point rounding errors.
- **Strict Data Integrity:** Custom PostgreSQL `ENUM` types for statuses (e.g., `VEHICLE_STATUS`, `TRIP_STATUS`) to ensure consistent frontend rendering and reliable reporting.
- **Race Condition Defense:** Partial unique indexes on the database layer guarantee that a vehicle or driver can only have one active trip at a time, protecting against concurrent API requests.
- **Robust Constraints:** Database-level `CHECK` constraints prevent logically impossible data (e.g., negative fuel amounts, negative cargo weights, or safety scores outside 0-100).

*See the `schema.sql` file in this repository for the complete database initialization script.*

## 🚀 Quick Start

### 1. Database Setup
Ensure you have PostgreSQL installed. Run the initialization script to generate the tables, enums, constraints, and indexes:
```bash
psql -U your_postgres_user -d your_database_name -f schema.sql
```

## 👥 Roles & Permissions (RBAC)
- **Fleet Manager:** Full system control (CRUD for vehicles, drivers, trips, and maintenance).
- **Dispatcher:** Creates and manages active trips, assigning only currently *Available* vehicles and drivers.
- **Safety Officer:** Monitors driver compliance, license validity, and safety scores.
- **Financial Analyst:** Tracks fleet utilization, fuel efficiency, ROI, and operational costs.

## 📜 License
This project is 100% Open Source and built with zero cloud dependencies or paid APIs.
