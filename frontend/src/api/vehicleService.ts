import type { Vehicle } from '../types';
import { apiClient } from './apiClient';

export const vehicleService = {
  async getVehicles(): Promise<Vehicle[]> {
    return apiClient.get<Vehicle[]>('/vehicles');
  },

  async getVehicleById(id: number): Promise<Vehicle | undefined> {
    return apiClient.get<Vehicle>(`/vehicles/${id}`);
  },

  async saveVehicle(vehicle: Partial<Vehicle>): Promise<Vehicle> {
    return apiClient.post<Vehicle>('/vehicles', vehicle);
  },

  async retireVehicle(id: number): Promise<Vehicle> {
    return apiClient.patch<Vehicle>(`/vehicles/${id}/retire`);
  },

  async updateVehicleStatus(id: number, status: string): Promise<Vehicle> {
    return apiClient.patch<Vehicle>(`/vehicles/${id}/status?status=${status}`);
  },

  async deleteVehicle(id: number): Promise<void> {
    return apiClient.delete(`/vehicles/${id}`);
  }
};

