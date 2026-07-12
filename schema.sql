CREATE TYPE role_enum AS ENUM ('FLEET_MANAGER', 'DISPATCHER', 'SAFETY_OFFICER', 'FINANCIAL_ANALYST');
CREATE TYPE vehicle_status AS ENUM ('AVAILABLE', 'ON_TRIP', 'IN_SHOP', 'RETIRED');
CREATE TYPE vehicle_type AS ENUM ('TRUCK', 'VAN', 'BIKE', 'CAR', 'BUS');
CREATE TYPE driver_status AS ENUM ('AVAILABLE', 'ON_TRIP', 'OFF_DUTY', 'SUSPENDED');
CREATE TYPE license_category AS ENUM ('A', 'B', 'C', 'D', 'CE');
CREATE TYPE trip_status AS ENUM ('DRAFT', 'DISPATCHED', 'COMPLETED', 'CANCELLED');
CREATE TYPE maintenance_status AS ENUM ('ACTIVE', 'CLOSED');
CREATE TYPE expense_type AS ENUM ('TOLL', 'MAINTENANCE', 'MISCELLANEOUS');

CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    role role_enum NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE vehicles (
    id SERIAL PRIMARY KEY,
    registration_number VARCHAR(100) UNIQUE NOT NULL,
    name VARCHAR(255) NOT NULL,
    type vehicle_type NOT NULL,
    max_load_capacity DECIMAL(10,2) NOT NULL,
    odometer DECIMAL(12,2) DEFAULT 0 NOT NULL,
    acquisition_cost DECIMAL(12,2) NOT NULL,
    status vehicle_status DEFAULT 'AVAILABLE' NOT NULL,
    region VARCHAR(100),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    
    CONSTRAINT chk_vehicle_capacity CHECK (max_load_capacity > 0)
);

CREATE TABLE drivers (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    license_number VARCHAR(100) UNIQUE NOT NULL,
    license_category license_category NOT NULL,
    license_expiry_date DATE NOT NULL,
    contact_number VARCHAR(50) NOT NULL,
    safety_score DECIMAL(5,2) DEFAULT 100.00 NOT NULL,
    status driver_status DEFAULT 'AVAILABLE' NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    
    CONSTRAINT chk_driver_safety_score CHECK (safety_score BETWEEN 0 AND 100)
);

CREATE TABLE trips (
    id SERIAL PRIMARY KEY,
    source VARCHAR(255) NOT NULL,
    destination VARCHAR(255) NOT NULL,
    vehicle_id INT NOT NULL,
    driver_id INT NOT NULL,
    cargo_weight DECIMAL(10,2) NOT NULL,
    planned_distance DECIMAL(10,2) NOT NULL,
    actual_distance DECIMAL(10,2),
    start_odometer DECIMAL(12,2),
    end_odometer DECIMAL(12,2),
    status trip_status DEFAULT 'DRAFT' NOT NULL,
    revenue DECIMAL(12,2) DEFAULT 0 NOT NULL,
    created_by_id INT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    dispatched_at TIMESTAMP WITH TIME ZONE,
    completed_at TIMESTAMP WITH TIME ZONE,
    cancelled_at TIMESTAMP WITH TIME ZONE,
    
    CONSTRAINT fk_trip_user FOREIGN KEY (created_by_id) REFERENCES users(id) ON DELETE SET NULL,
    CONSTRAINT fk_trip_vehicle FOREIGN KEY (vehicle_id) REFERENCES vehicles(id) ON DELETE RESTRICT,
    CONSTRAINT fk_trip_driver FOREIGN KEY (driver_id) REFERENCES drivers(id) ON DELETE RESTRICT,
    
    CONSTRAINT chk_odometer CHECK (end_odometer IS NULL OR start_odometer IS NULL OR end_odometer >= start_odometer),
    CONSTRAINT chk_cargo_weight CHECK (cargo_weight > 0)
);

CREATE TABLE maintenance_logs (
    id SERIAL PRIMARY KEY,
    vehicle_id INT NOT NULL,
    type VARCHAR(100) NOT NULL,
    description TEXT,
    cost DECIMAL(10,2) DEFAULT 0 NOT NULL,
    status maintenance_status DEFAULT 'ACTIVE' NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    closed_at TIMESTAMP WITH TIME ZONE,
    
    CONSTRAINT fk_maint_vehicle FOREIGN KEY (vehicle_id) REFERENCES vehicles(id) ON DELETE RESTRICT
);

CREATE TABLE fuel_logs (
    id SERIAL PRIMARY KEY,
    vehicle_id INT NOT NULL,
    trip_id INT,
    liters DECIMAL(10,2) NOT NULL,
    cost DECIMAL(10,2) NOT NULL,
    date DATE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    
    CONSTRAINT fk_fuel_vehicle FOREIGN KEY (vehicle_id) REFERENCES vehicles(id) ON DELETE RESTRICT,
    CONSTRAINT fk_fuel_trip FOREIGN KEY (trip_id) REFERENCES trips(id) ON DELETE SET NULL,
    
    CONSTRAINT chk_fuel_liters CHECK (liters > 0)
);

CREATE TABLE expenses (
    id SERIAL PRIMARY KEY,
    vehicle_id INT NOT NULL,
    trip_id INT,
    type expense_type NOT NULL,
    amount DECIMAL(10,2) NOT NULL,
    description TEXT,
    date DATE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    
    CONSTRAINT fk_expense_vehicle FOREIGN KEY (vehicle_id) REFERENCES vehicles(id) ON DELETE RESTRICT,
    CONSTRAINT fk_expense_trip FOREIGN KEY (trip_id) REFERENCES trips(id) ON DELETE SET NULL,
    
    CONSTRAINT chk_expense_amount CHECK (amount >= 0)
);

CREATE INDEX idx_trips_vehicle_id ON trips(vehicle_id);
CREATE INDEX idx_trips_driver_id ON trips(driver_id);
CREATE INDEX idx_vehicles_status ON vehicles(status);
CREATE INDEX idx_drivers_status ON drivers(status);
CREATE INDEX idx_trips_status ON trips(status);
