import type { MaintenanceLog } from '../types';
import { apiClient } from './apiClient';

export const maintenanceService = {
  async getMaintenanceLogs(): Promise<MaintenanceLog[]> {
    return apiClient.get<MaintenanceLog[]>('/maintenance');
  },
  async createMaintenanceLog(log: { vehicle_id: number; type: string; description?: string; cost: number }): Promise<MaintenanceLog> {
    return apiClient.post<MaintenanceLog>('/maintenance', log);
  },
  async closeMaintenanceLog(id: number): Promise<MaintenanceLog> {
    return apiClient.post<MaintenanceLog>(`/maintenance/${id}/close`, {});
  }
};
