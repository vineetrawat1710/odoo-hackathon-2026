import type { Vehicle } from '../types';
import { DB } from '../mocks/db';

const delay = (ms = 600) => new Promise(resolve => setTimeout(resolve, ms));

export const vehicleService = {
  async getVehicles(): Promise<Vehicle[]> {
    await delay();
    return DB.getVehicles();
  },

  async getVehicleById(id: string): Promise<Vehicle | undefined> {
    await delay(500);
    return DB.getVehicleById(id);
  },

  async saveVehicle(vehicle: Vehicle): Promise<Vehicle> {
    await delay(700);
    return DB.saveVehicle(vehicle);
  },

  async deleteVehicle(id: string): Promise<void> {
    await delay(600);
    DB.deleteVehicle(id);
  }
};
