export interface Vehicle {
  id: string;
  plateNumber: string;
  model: string;
  type: 'Truck' | 'Trailer' | 'LCV' | 'Dumper';
  status: 'available' | 'active' | 'maintenance';
  fuelType: 'Diesel' | 'CNG' | 'Electric';
  mileage: number; // in km
  nextService: string; // date string
  roi: number; // percentage
  telemetry: {
    speed: number; // km/h
    fuelLevel: number; // percentage
    batteryStatus: 'Good' | 'Fair' | 'Replace';
    coolantTemp: number; // °C
    latitude: number;
    longitude: number;
  };
}

export interface Driver {
  id: string;
  name: string;
  licenseNumber: string;
  licenseStatus: 'valid' | 'warning' | 'expired';
  status: 'active' | 'off-duty' | 'suspended';
  phone: string;
  rating: number; // 0.0 - 5.0
  vehicleId?: string; // currently assigned vehicle
  shift: 'Morning' | 'Evening' | 'Night';
}

export interface Trip {
  id: string;
  tripNumber: string;
  driverId: string;
  driverName?: string;
  vehicleId: string;
  vehiclePlate?: string;
  origin: string;
  destination: string;
  cargo: string;
  cargoWeight: number; // in tons
  distance: number; // in km
  revenue: number; // in INR
  fuelCost: number; // in INR
  otherExpenses: number; // in INR
  status: 'scheduled' | 'active' | 'completed' | 'cancelled';
  currentProgress: number; // 0 to 100 percentage
}

export interface FuelLog {
  id: string;
  vehicleId: string;
  vehiclePlate?: string;
  date: string;
  odometer: number; // in km
  fuelAmount: number; // in liters
  cost: number; // in INR
  efficiency: number; // km/l or L/100km computed
}

export interface Expense {
  id: string;
  date: string;
  category: 'fuel' | 'maintenance' | 'toll' | 'insurance' | 'payout' | 'other';
  amount: number; // in INR
  description: string;
  vehicleId?: string;
  vehiclePlate?: string;
}

export interface MaintenanceLog {
  id: string;
  vehicleId: string;
  vehiclePlate?: string;
  serviceType: 'Routine' | 'Repair' | 'Inspection' | 'Breakdown';
  description: string;
  cost: number; // in INR
  status: 'scheduled' | 'in-progress' | 'completed';
  startDate: string;
  completionDate?: string;
}

export interface DashboardDTO {
  kpis: {
    totalVehicles: number;
    availableVehicles: number;
    vehiclesOnTrip: number;
    vehiclesInShop: number;
    activeTrips: number;
    availableDrivers: number;
    fleetUtilization: number; // percentage
    revenue: number; // in INR
    operationalCost: number; // in INR
    vehicleROI: number; // average ROI percentage
  };
  charts: {
    fleetUtilization: { date: string; value: number }[];
    fuelEfficiency: { date: string; value: number }[];
    revenueVsCost: { month: string; revenue: number; cost: number }[];
    tripStatus: { name: string; value: number; color: string }[];
    monthlyExpenses: { month: string; amount: number }[];
    vehicleROI: { id: string; plateNumber: string; roi: number }[];
  };
  bottom: {
    recentTrips: Trip[];
    recentActivities: { id: string; time: string; text: string; type: 'info' | 'success' | 'warning' | 'error' }[];
    upcomingLicenseExpiry: Driver[];
    vehiclesInMaintenance: MaintenanceLog[];
  };
}
