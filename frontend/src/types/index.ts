export interface Vehicle {
  id: number;
  registration_number: string;
  name: string;
  type: 'TRUCK' | 'VAN' | 'CAR';
  max_load_capacity: number;
  acquisition_cost: number;
  region?: string;
  odometer: number;
  status: 'AVAILABLE' | 'ON_TRIP' | 'IN_SHOP' | 'RETIRED';
  created_at: string;
  updated_at: string;
}

export interface Driver {
  id: number;
  name: string;
  license_number: string;
  license_category: 'B' | 'C' | 'CE' | 'D';
  license_expiry_date: string;
  contact_number: string;
  safety_score: number;
  status: 'AVAILABLE' | 'ON_TRIP' | 'OFF_DUTY' | 'SUSPENDED';
  created_at: string;
  updated_at: string;
}

export interface Trip {
  id: number;
  source: string;
  destination: string;
  vehicle_id: number;
  driver_id: number;
  cargo_weight: number;
  planned_distance: number;
  actual_distance?: number;
  revenue: number;
  start_odometer?: number;
  end_odometer?: number;
  status: 'DRAFT' | 'DISPATCHED' | 'COMPLETED' | 'CANCELLED';
  created_by_id?: number;
  created_at: string;
  updated_at: string;
  dispatched_at?: string;
  completed_at?: string;
  cancelled_at?: string;
}

export interface FuelLog {
  id: number;
  vehicle_id: number;
  trip_id?: number;
  liters: number;
  cost: number;
  date: string;
  created_at: string;
  updated_at: string;
}

export interface Expense {
  id: number;
  vehicle_id: number;
  trip_id?: number;
  type: 'TOLL' | 'MAINTENANCE' | 'MISCELLANEOUS';
  amount: number;
  description?: string;
  date: string;
  created_at: string;
  updated_at: string;
}

export interface MaintenanceLog {
  id: number;
  vehicle_id: number;
  type: string;
  description?: string;
  cost: number;
  status: 'SCHEDULED' | 'IN_PROGRESS' | 'CLOSED';
  created_at: string;
  updated_at: string;
  closed_at?: string;
}

export interface DashboardDTO {
  total_vehicles: number;
  available_vehicles: number;
  vehicles_on_trip: number;
  vehicles_in_shop: number;
  total_drivers: number;
  available_drivers: number;
  active_trips: number;
  completed_trips: number;
  fleet_utilization: number;
  fuel_efficiency: number;
  operational_cost: number;
  vehicle_roi: number;
  total_revenue: number;
  individual_vehicle_rois: Record<string, number>;
}
