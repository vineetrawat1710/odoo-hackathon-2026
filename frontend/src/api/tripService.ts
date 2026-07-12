import type { Trip, MaintenanceLog } from '../types';
import { DB } from '../mocks/db';

const delay = (ms = 600) => new Promise(resolve => setTimeout(resolve, ms));

export const tripService = {
  async getTrips(): Promise<Trip[]> {
    await delay();
    return DB.getTrips();
  },

  async saveTrip(trip: Trip): Promise<Trip> {
    await delay(700);
    return DB.saveTrip(trip);
  },

  async getMaintenanceLogs(): Promise<MaintenanceLog[]> {
    await delay();
    return DB.getMaintenanceLogs();
  },

  async saveMaintenanceLog(log: MaintenanceLog): Promise<MaintenanceLog> {
    await delay(650);
    return DB.saveMaintenanceLog(log);
  }
};
