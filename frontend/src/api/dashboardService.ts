import type { DashboardDTO } from '../types';
import { apiClient } from './apiClient';

export const dashboardService = {
  async getDashboard(): Promise<DashboardDTO> {
    return apiClient.get<DashboardDTO>('/finance/dashboard');
  }
};
