import type { Driver } from '../types';
import { DB } from '../mocks/db';

const delay = (ms = 600) => new Promise(resolve => setTimeout(resolve, ms));

export const driverService = {
  async getDrivers(): Promise<Driver[]> {
    await delay();
    return DB.getDrivers();
  },

  async saveDriver(driver: Driver): Promise<Driver> {
    await delay(750);
    return DB.saveDriver(driver);
  },

  async deleteDriver(id: string): Promise<void> {
    await delay(600);
    DB.deleteDriver(id);
  }
};
