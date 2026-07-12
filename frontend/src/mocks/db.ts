import type { Vehicle, Driver, Trip, FuelLog, Expense, MaintenanceLog } from '../types';

interface Database {
  vehicles: Vehicle[];
  drivers: Driver[];
  trips: Trip[];
  fuelLogs: FuelLog[];
  expenses: Expense[];
  maintenanceLogs: MaintenanceLog[];
  activities: { id: string; time: string; text: string; type: 'info' | 'success' | 'warning' | 'error' }[];
}

const STORAGE_KEY = 'transitops_db';

const defaultVehicles: Vehicle[] = [
  {
    id: 'v-1',
    plateNumber: 'DL01XY9876',
    model: 'Tata Prima 5530',
    type: 'Truck',
    status: 'available',
    fuelType: 'Diesel',
    mileage: 45200,
    nextService: '2026-08-15',
    roi: 88,
    telemetry: { speed: 0, fuelLevel: 75, batteryStatus: 'Good', coolantTemp: 82, latitude: 28.6139, longitude: 77.2090 }
  },
  {
    id: 'v-2',
    plateNumber: 'MH12AB4567',
    model: 'Ashok Leyland 3520',
    type: 'Truck',
    status: 'active',
    fuelType: 'Diesel',
    mileage: 82400,
    nextService: '2026-07-30',
    roi: 76,
    telemetry: { speed: 65, fuelLevel: 45, batteryStatus: 'Good', coolantTemp: 88, latitude: 19.0760, longitude: 72.8777 }
  },
  {
    id: 'v-3',
    plateNumber: 'KA03MN1234',
    model: 'Mahindra Furio 14',
    type: 'Dumper',
    status: 'maintenance',
    fuelType: 'Diesel',
    mileage: 12100,
    nextService: '2026-07-13',
    roi: 64,
    telemetry: { speed: 0, fuelLevel: 10, batteryStatus: 'Fair', coolantTemp: 98, latitude: 12.9716, longitude: 77.5946 }
  },
  {
    id: 'v-4',
    plateNumber: 'HR55CD8888',
    model: 'Eicher Pro 3015',
    type: 'LCV',
    status: 'available',
    fuelType: 'CNG',
    mileage: 29500,
    nextService: '2026-09-01',
    roi: 92,
    telemetry: { speed: 0, fuelLevel: 90, batteryStatus: 'Good', coolantTemp: 78, latitude: 28.4595, longitude: 77.0266 }
  },
  {
    id: 'v-5',
    plateNumber: 'TS09EF4321',
    model: 'BharatBenz 3523R',
    type: 'Truck',
    status: 'active',
    fuelType: 'Diesel',
    mileage: 68150,
    nextService: '2026-08-20',
    roi: 82,
    telemetry: { speed: 58, fuelLevel: 60, batteryStatus: 'Good', coolantTemp: 85, latitude: 17.3850, longitude: 78.4867 }
  },
  {
    id: 'v-6',
    plateNumber: 'UP16GH8765',
    model: 'Tata Ultra 1918',
    type: 'LCV',
    status: 'available',
    fuelType: 'CNG',
    mileage: 31200,
    nextService: '2026-08-05',
    roi: 80,
    telemetry: { speed: 0, fuelLevel: 82, batteryStatus: 'Good', coolantTemp: 80, latitude: 28.5355, longitude: 77.3910 }
  },
  {
    id: 'v-7',
    plateNumber: 'GJ01JK7654',
    model: 'Ashok Leyland Partner',
    type: 'LCV',
    status: 'available',
    fuelType: 'Diesel',
    mileage: 21800,
    nextService: '2026-09-10',
    roi: 78,
    telemetry: { speed: 0, fuelLevel: 55, batteryStatus: 'Good', coolantTemp: 81, latitude: 23.0225, longitude: 72.5714 }
  },
  {
    id: 'v-8',
    plateNumber: 'WB02LM5432',
    model: 'Eicher Pro 6028',
    type: 'Truck',
    status: 'active',
    fuelType: 'Diesel',
    mileage: 105400,
    nextService: '2026-07-28',
    roi: 72,
    telemetry: { speed: 70, fuelLevel: 32, batteryStatus: 'Fair', coolantTemp: 91, latitude: 22.5726, longitude: 88.3639 }
  },
  {
    id: 'v-9',
    plateNumber: 'KA51PQ9081',
    model: 'Tata Ace EV',
    type: 'LCV',
    status: 'available',
    fuelType: 'Electric',
    mileage: 4500,
    nextService: '2026-10-15',
    roi: 94,
    telemetry: { speed: 0, fuelLevel: 98, batteryStatus: 'Good', coolantTemp: 35, latitude: 12.9141, longitude: 77.6412 }
  },
  {
    id: 'v-10',
    plateNumber: 'DL03ST6543',
    model: 'Ashok Leyland BADA DOST',
    type: 'LCV',
    status: 'active',
    fuelType: 'CNG',
    mileage: 15300,
    nextService: '2026-08-11',
    roi: 85,
    telemetry: { speed: 45, fuelLevel: 50, batteryStatus: 'Good', coolantTemp: 83, latitude: 28.7041, longitude: 77.1025 }
  },
  {
    id: 'v-11',
    plateNumber: 'MH15UV4321',
    model: 'Tata Signa 4825',
    type: 'Truck',
    status: 'maintenance',
    fuelType: 'Diesel',
    mileage: 124300,
    nextService: '2026-07-14',
    roi: 70,
    telemetry: { speed: 0, fuelLevel: 15, batteryStatus: 'Replace', coolantTemp: 99, latitude: 19.9975, longitude: 73.7898 }
  },
  {
    id: 'v-12',
    plateNumber: 'KA04WX8765',
    model: 'BharatBenz 1917R',
    type: 'Truck',
    status: 'available',
    fuelType: 'Diesel',
    mileage: 54100,
    nextService: '2026-08-30',
    roi: 81,
    telemetry: { speed: 0, fuelLevel: 68, batteryStatus: 'Good', coolantTemp: 82, latitude: 13.0827, longitude: 80.2707 }
  },
  {
    id: 'v-13',
    plateNumber: 'HR38YZ5432',
    model: 'Mahindra Blazo X 35',
    type: 'Truck',
    status: 'active',
    fuelType: 'Diesel',
    mileage: 40500,
    nextService: '2026-08-25',
    roi: 75,
    telemetry: { speed: 60, fuelLevel: 40, batteryStatus: 'Good', coolantTemp: 86, latitude: 26.9124, longitude: 75.7873 }
  },
  {
    id: 'v-14',
    plateNumber: 'UP14AB6543',
    model: 'Ashok Leyland Ecomet',
    type: 'Dumper',
    status: 'available',
    fuelType: 'Diesel',
    mileage: 29100,
    nextService: '2026-09-05',
    roi: 83,
    telemetry: { speed: 0, fuelLevel: 70, batteryStatus: 'Good', coolantTemp: 79, latitude: 28.9845, longitude: 77.7064 }
  },
  {
    id: 'v-15',
    plateNumber: 'GJ03CD9876',
    model: 'Eicher Pro 2049',
    type: 'LCV',
    status: 'available',
    fuelType: 'CNG',
    mileage: 92300,
    nextService: '2026-08-01',
    roi: 74,
    telemetry: { speed: 0, fuelLevel: 58, batteryStatus: 'Good', coolantTemp: 81, latitude: 22.3072, longitude: 73.1812 }
  }
];

const defaultDrivers: Driver[] = [
  { id: 'd-1', name: 'Rahul Sharma', licenseNumber: 'DL-1420180098765', licenseStatus: 'valid', status: 'active', phone: '+91 98765 43210', rating: 4.8, vehicleId: 'v-2', shift: 'Morning' },
  { id: 'd-2', name: 'Amit Verma', licenseNumber: 'MH-1220190012345', licenseStatus: 'valid', status: 'active', phone: '+91 98123 45678', rating: 4.6, vehicleId: 'v-5', shift: 'Evening' },
  { id: 'd-3', name: 'Rakesh Singh', licenseNumber: 'KA-0320150054321', licenseStatus: 'warning', status: 'active', phone: '+91 97456 12390', rating: 4.2, vehicleId: 'v-8', shift: 'Night' },
  { id: 'd-4', name: 'Vikram Malhotra', licenseNumber: 'HR-2620200087654', licenseStatus: 'valid', status: 'active', phone: '+91 99988 77665', rating: 4.9, vehicleId: 'v-10', shift: 'Morning' },
  { id: 'd-5', name: 'Sunita Rao', licenseNumber: 'TS-0920210045678', licenseStatus: 'valid', status: 'off-duty', phone: '+91 95432 10987', rating: 4.7, shift: 'Morning' },
  { id: 'd-6', name: 'Harpreet Singh', licenseNumber: 'PB-1020120023456', licenseStatus: 'expired', status: 'suspended', phone: '+91 96543 21876', rating: 3.8, shift: 'Night' },
  { id: 'd-7', name: 'Rajesh Kumar', licenseNumber: 'UP-1620170067890', licenseStatus: 'valid', status: 'active', phone: '+91 98760 12345', rating: 4.5, vehicleId: 'v-13', shift: 'Evening' },
  { id: 'd-8', name: 'Anand Patel', licenseNumber: 'GJ-0120220098765', licenseStatus: 'valid', status: 'active', phone: '+91 91234 56789', rating: 4.4, shift: 'Night' },
  { id: 'd-9', name: 'Suresh Raina', licenseNumber: 'UP-1420160087654', licenseStatus: 'warning', status: 'active', phone: '+91 92345 67890', rating: 4.1, shift: 'Evening' },
  { id: 'd-10', name: 'Manoj Tiwari', licenseNumber: 'BR-0120140034567', licenseStatus: 'valid', status: 'off-duty', phone: '+91 93456 78901', rating: 4.3, shift: 'Morning' }
];

const defaultTrips: Trip[] = [
  { id: 't-1', tripNumber: 'TRIP-9021', driverId: 'd-1', origin: 'Delhi', destination: 'Jaipur', cargo: 'Automobile Parts', cargoWeight: 14.5, distance: 270, revenue: 38000, fuelCost: 12000, otherExpenses: 3000, status: 'active', currentProgress: 45, vehicleId: 'v-2' },
  { id: 't-2', tripNumber: 'TRIP-9022', driverId: 'd-2', origin: 'Mumbai', destination: 'Pune', cargo: 'Electronics', cargoWeight: 8.2, distance: 150, revenue: 22000, fuelCost: 6500, otherExpenses: 1500, status: 'completed', currentProgress: 100, vehicleId: 'v-5' },
  { id: 't-3', tripNumber: 'TRIP-9023', driverId: 'd-3', origin: 'Bengaluru', destination: 'Mysuru', cargo: 'Agricultural Produce', cargoWeight: 10.0, distance: 140, revenue: 19000, fuelCost: 5800, otherExpenses: 1200, status: 'completed', currentProgress: 100, vehicleId: 'v-8' },
  { id: 't-4', tripNumber: 'TRIP-9024', driverId: 'd-4', origin: 'Chennai', destination: 'Hyderabad', cargo: 'Pharma supplies', cargoWeight: 12.0, distance: 630, revenue: 75000, fuelCost: 28000, otherExpenses: 6000, status: 'scheduled', currentProgress: 0, vehicleId: 'v-10' },
  { id: 't-5', tripNumber: 'TRIP-9025', driverId: 'd-7', origin: 'Kolkata', destination: 'Patna', cargo: 'FMCG Goods', cargoWeight: 15.0, distance: 580, revenue: 65000, fuelCost: 24000, otherExpenses: 5000, status: 'active', currentProgress: 80, vehicleId: 'v-13' },
  { id: 't-6', tripNumber: 'TRIP-9026', driverId: 'd-8', origin: 'Delhi', destination: 'Agra', cargo: 'Industrial machinery', cargoWeight: 18.0, distance: 230, revenue: 32000, fuelCost: 11000, otherExpenses: 2500, status: 'completed', currentProgress: 100, vehicleId: 'v-12' },
  { id: 't-7', tripNumber: 'TRIP-9027', driverId: 'd-9', origin: 'Ahmedabad', destination: 'Mumbai', cargo: 'Textiles', cargoWeight: 11.2, distance: 520, revenue: 58000, fuelCost: 22000, otherExpenses: 4500, status: 'scheduled', currentProgress: 0, vehicleId: 'v-7' },
  { id: 't-8', tripNumber: 'TRIP-9028', driverId: 'd-1', origin: 'Pune', destination: 'Bengaluru', cargo: 'Chemical barrels', cargoWeight: 16.5, distance: 840, revenue: 95000, fuelCost: 35000, otherExpenses: 8000, status: 'completed', currentProgress: 100, vehicleId: 'v-2' },
  { id: 't-9', tripNumber: 'TRIP-9029', driverId: 'd-2', origin: 'Lucknow', destination: 'Kanpur', cargo: 'Leather goods', cargoWeight: 6.0, distance: 90, revenue: 12000, fuelCost: 4000, otherExpenses: 800, status: 'completed', currentProgress: 100, vehicleId: 'v-5' },
  { id: 't-10', tripNumber: 'TRIP-9030', driverId: 'd-3', origin: 'Jaipur', destination: 'Ajmer', cargo: 'Marble blocks', cargoWeight: 22.0, distance: 135, revenue: 25000, fuelCost: 9000, otherExpenses: 2000, status: 'completed', currentProgress: 100, vehicleId: 'v-8' },
  { id: 't-11', tripNumber: 'TRIP-9031', driverId: 'd-4', origin: 'Hyderabad', destination: 'Vijayawada', cargo: 'Steel rolls', cargoWeight: 20.0, distance: 275, revenue: 42000, fuelCost: 14000, otherExpenses: 3000, status: 'completed', currentProgress: 100, vehicleId: 'v-10' },
  { id: 't-12', tripNumber: 'TRIP-9032', driverId: 'd-7', origin: 'Chandigarh', destination: 'Delhi', cargo: 'Dairy Products', cargoWeight: 9.5, distance: 250, revenue: 28000, fuelCost: 9500, otherExpenses: 2000, status: 'completed', currentProgress: 100, vehicleId: 'v-13' }
];

const defaultMaintenance: MaintenanceLog[] = [
  { id: 'm-1', vehicleId: 'v-3', serviceType: 'Repair', description: 'Engine overheating inspection and coolant flush', cost: 12500, status: 'in-progress', startDate: '2026-07-11' },
  { id: 'm-2', vehicleId: 'v-11', serviceType: 'Breakdown', description: 'Starter motor replacement & battery diagnostic', cost: 18500, status: 'in-progress', startDate: '2026-07-12' },
  { id: 'm-3', vehicleId: 'v-1', serviceType: 'Routine', description: 'Standard 40k km oil change and brake pads replacement', cost: 8400, status: 'completed', startDate: '2026-06-15', completionDate: '2026-06-16' },
  { id: 'm-4', vehicleId: 'v-2', serviceType: 'Inspection', description: 'Pollution check certificate renewal and tail light wiring', cost: 1500, status: 'completed', startDate: '2026-07-02', completionDate: '2026-07-02' }
];

const defaultExpenses: Expense[] = [
  { id: 'e-1', date: '2026-07-01', category: 'insurance', amount: 48000, description: 'Annual commercial insurance renewal for Tata Prima (DL01XY9876)', vehicleId: 'v-1' },
  { id: 'e-2', date: '2026-07-05', category: 'payout', amount: 15000, description: 'Shift allowance and trip bonus payout for driver Rahul Sharma', vehicleId: 'v-2' },
  { id: 'e-3', date: '2026-07-10', category: 'toll', amount: 2450, description: 'NH48 FASTag automatic toll deduction - Jaipur to Delhi route' },
  { id: 'e-4', date: '2026-07-11', category: 'maintenance', amount: 12500, description: 'Engine check and coolant pump repair charge', vehicleId: 'v-3' },
  { id: 'e-5', date: '2026-07-12', category: 'fuel', amount: 8400, description: 'Diesel refill 100L - Indian Oil bunk MH12', vehicleId: 'v-2' }
];

const defaultFuelLogs: FuelLog[] = [
  { id: 'f-1', vehicleId: 'v-1', date: '2026-07-05', odometer: 44200, fuelAmount: 110, cost: 9240, efficiency: 4.1 },
  { id: 'f-2', vehicleId: 'v-2', date: '2026-07-12', odometer: 82400, fuelAmount: 100, cost: 8400, efficiency: 3.8 },
  { id: 'f-3', vehicleId: 'v-5', date: '2026-07-08', odometer: 67800, fuelAmount: 150, cost: 12600, efficiency: 3.9 },
  { id: 'f-4', vehicleId: 'v-8', date: '2026-07-10', odometer: 105200, fuelAmount: 180, cost: 15120, efficiency: 3.5 }
];

const defaultActivities = [
  { id: 'a-1', time: '2026-07-12T11:45:00Z', text: 'Trip TRIP-9021 reached Gurugram toll gate (Delhi ➔ Jaipur)', type: 'info' as const },
  { id: 'a-2', time: '2026-07-12T10:15:00Z', text: 'Tata Signa 4825 (MH15UV4321) admitted to workshop for starter motor repair', type: 'warning' as const },
  { id: 'a-3', time: '2026-07-12T09:30:00Z', text: 'Expense logged: INR 8,400 fuel purchase for MH12AB4567', type: 'success' as const },
  { id: 'a-4', time: '2026-07-12T08:00:00Z', text: 'Driver License expiration alert triggered for Harpreet Singh', type: 'error' as const }
];

export class DB {
  private static getDB(): Database {
    const data = localStorage.getItem(STORAGE_KEY);
    if (!data) {
      const initialDb: Database = {
        vehicles: defaultVehicles,
        drivers: defaultDrivers,
        trips: defaultTrips,
        fuelLogs: defaultFuelLogs,
        expenses: defaultExpenses,
        maintenanceLogs: defaultMaintenance,
        activities: defaultActivities
      };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(initialDb));
      return initialDb;
    }
    return JSON.parse(data);
  }

  private static saveDB(db: Database) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(db));
  }

  // Vehicles
  static getVehicles(): Vehicle[] {
    return this.getDB().vehicles;
  }

  static getVehicleById(id: string): Vehicle | undefined {
    return this.getDB().vehicles.find(v => v.id === id);
  }

  static saveVehicle(vehicle: Vehicle): Vehicle {
    const db = this.getDB();
    const index = db.vehicles.findIndex(v => v.id === vehicle.id);
    if (index > -1) {
      db.vehicles[index] = vehicle;
      this.addActivity(`Vehicle ${vehicle.plateNumber} profile updated`, 'info', db);
    } else {
      db.vehicles.push(vehicle);
      this.addActivity(`New Vehicle ${vehicle.plateNumber} added to fleet`, 'success', db);
    }
    this.saveDB(db);
    return vehicle;
  }

  static deleteVehicle(id: string) {
    const db = this.getDB();
    const vehicle = db.vehicles.find(v => v.id === id);
    db.vehicles = db.vehicles.filter(v => v.id !== id);
    if (vehicle) {
      this.addActivity(`Vehicle ${vehicle.plateNumber} removed from fleet`, 'warning', db);
    }
    this.saveDB(db);
  }

  // Drivers
  static getDrivers(): Driver[] {
    return this.getDB().drivers;
  }

  static saveDriver(driver: Driver): Driver {
    const db = this.getDB();
    const index = db.drivers.findIndex(d => d.id === driver.id);
    if (index > -1) {
      db.drivers[index] = driver;
      this.addActivity(`Driver ${driver.name} information updated`, 'info', db);
    } else {
      db.drivers.push(driver);
      this.addActivity(`New operator ${driver.name} onboarded`, 'success', db);
    }
    this.saveDB(db);
    return driver;
  }

  static deleteDriver(id: string) {
    const db = this.getDB();
    const driver = db.drivers.find(d => d.id === id);
    db.drivers = db.drivers.filter(d => d.id !== id);
    if (driver) {
      this.addActivity(`Driver ${driver.name} de-registered`, 'warning', db);
    }
    this.saveDB(db);
  }

  // Trips
  static getTrips(): Trip[] {
    const db = this.getDB();
    return db.trips.map(trip => {
      const driver = db.drivers.find(d => d.id === trip.driverId);
      const vehicle = db.vehicles.find(v => v.id === trip.vehicleId);
      return {
        ...trip,
        driverName: driver ? driver.name : 'Unknown Driver',
        vehiclePlate: vehicle ? vehicle.plateNumber : 'Unknown Plate'
      };
    });
  }

  static saveTrip(trip: Trip): Trip {
    const db = this.getDB();
    const index = db.trips.findIndex(t => t.id === trip.id);
    if (index > -1) {
      const oldTrip = db.trips[index];
      db.trips[index] = trip;

      // Handle status changes
      if (oldTrip.status !== trip.status) {
        this.addActivity(`Trip ${trip.tripNumber} status changed to ${trip.status}`, trip.status === 'completed' ? 'success' : 'info', db);
        
        // Auto update vehicle/driver status if needed
        const vehicleIndex = db.vehicles.findIndex(v => v.id === trip.vehicleId);
        const driverIndex = db.drivers.findIndex(d => d.id === trip.driverId);
        if (trip.status === 'active') {
          if (vehicleIndex > -1) db.vehicles[vehicleIndex].status = 'active';
          if (driverIndex > -1) db.drivers[driverIndex].status = 'active';
        } else if (trip.status === 'completed' || trip.status === 'cancelled') {
          if (vehicleIndex > -1) db.vehicles[vehicleIndex].status = 'available';
          if (driverIndex > -1) db.drivers[driverIndex].status = 'off-duty';
        }
      }
    } else {
      db.trips.push(trip);
      this.addActivity(`New Trip ${trip.tripNumber} dispatched from ${trip.origin} to ${trip.destination}`, 'success', db);
      
      // Update vehicle and driver status
      const vehicleIndex = db.vehicles.findIndex(v => v.id === trip.vehicleId);
      const driverIndex = db.drivers.findIndex(d => d.id === trip.driverId);
      if (trip.status === 'active') {
        if (vehicleIndex > -1) db.vehicles[vehicleIndex].status = 'active';
        if (driverIndex > -1) db.drivers[driverIndex].status = 'active';
      } else if (trip.status === 'scheduled') {
        if (vehicleIndex > -1) db.vehicles[vehicleIndex].status = 'available';
        if (driverIndex > -1) db.drivers[driverIndex].status = 'active';
      }
    }
    this.saveDB(db);
    return trip;
  }

  // Maintenance
  static getMaintenanceLogs(): MaintenanceLog[] {
    const db = this.getDB();
    return db.maintenanceLogs.map(m => {
      const v = db.vehicles.find(vh => vh.id === m.vehicleId);
      return { ...m, vehiclePlate: v ? v.plateNumber : 'Unknown' };
    });
  }

  static saveMaintenanceLog(log: MaintenanceLog): MaintenanceLog {
    const db = this.getDB();
    const index = db.maintenanceLogs.findIndex(m => m.id === log.id);
    if (index > -1) {
      db.maintenanceLogs[index] = log;
      this.addActivity(`Maintenance log for vehicle updated to ${log.status}`, 'info', db);
      
      // Sync vehicle status
      const vehicleIndex = db.vehicles.findIndex(v => v.id === log.vehicleId);
      if (vehicleIndex > -1) {
        if (log.status === 'in-progress') {
          db.vehicles[vehicleIndex].status = 'maintenance';
        } else if (log.status === 'completed') {
          db.vehicles[vehicleIndex].status = 'available';
        }
      }
    } else {
      db.maintenanceLogs.push(log);
      this.addActivity(`Scheduled ${log.serviceType} maintenance for vehicle`, 'warning', db);
      
      const vehicleIndex = db.vehicles.findIndex(v => v.id === log.vehicleId);
      if (vehicleIndex > -1 && log.status === 'in-progress') {
        db.vehicles[vehicleIndex].status = 'maintenance';
      }
    }
    this.saveDB(db);
    return log;
  }

  // Expenses
  static getExpenses(): Expense[] {
    const db = this.getDB();
    return db.expenses.map(e => {
      if (e.vehicleId) {
        const v = db.vehicles.find(vh => vh.id === e.vehicleId);
        return { ...e, vehiclePlate: v ? v.plateNumber : 'Unknown' };
      }
      return e;
    });
  }

  static saveExpense(expense: Expense): Expense {
    const db = this.getDB();
    db.expenses.push(expense);
    this.addActivity(`Expense logged: INR ${expense.amount.toLocaleString()} for ${expense.category}`, 'success', db);
    this.saveDB(db);
    return expense;
  }

  // Fuel Logs
  static getFuelLogs(): FuelLog[] {
    const db = this.getDB();
    return db.fuelLogs.map(f => {
      const v = db.vehicles.find(vh => vh.id === f.vehicleId);
      return { ...f, vehiclePlate: v ? v.plateNumber : 'Unknown' };
    });
  }

  static saveFuelLog(log: FuelLog): FuelLog {
    const db = this.getDB();
    db.fuelLogs.push(log);
    
    // Add corresponding expense
    const expense: Expense = {
      id: `e-${Date.now()}`,
      date: log.date,
      category: 'fuel',
      amount: log.cost,
      description: `Fuel fill-up: ${log.fuelAmount}L at ${log.odometer} km`,
      vehicleId: log.vehicleId
    };
    db.expenses.push(expense);

    // Update vehicle mileage
    const vIdx = db.vehicles.findIndex(v => v.id === log.vehicleId);
    if (vIdx > -1) {
      if (log.odometer > db.vehicles[vIdx].mileage) {
        db.vehicles[vIdx].mileage = log.odometer;
      }
    }

    this.addActivity(`Fuel fill log added for vehicle`, 'success', db);
    this.saveDB(db);
    return log;
  }

  // Activities
  static getActivities() {
    return this.getDB().activities;
  }

  private static addActivity(text: string, type: 'info' | 'success' | 'warning' | 'error', db: Database) {
    db.activities.unshift({
      id: `act-${Date.now()}`,
      time: new Date().toISOString(),
      text,
      type
    });
    // Limit to 20 activities
    if (db.activities.length > 20) {
      db.activities.pop();
    }
  }
}
