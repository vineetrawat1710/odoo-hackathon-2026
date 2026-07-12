import type { Driver } from '../types';
import { apiClient } from './apiClient';

export const driverService = {
  async getDrivers(): Promise<Driver[]> {
    return apiClient.get<Driver[]>('/drivers');
  },
  async getDriverById(id: number): Promise<Driver | undefined> {
    return apiClient.get<Driver>(`/drivers/${id}`);
  },
  async saveDriver(driver: Partial<Driver>): Promise<Driver> {
    return apiClient.post<Driver>('/drivers', driver);
  }
};
