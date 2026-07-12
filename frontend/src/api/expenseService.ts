import type { Expense, FuelLog } from '../types';
import { apiClient } from './apiClient';

export const expenseService = {
  async getExpenses(): Promise<Expense[]> {
    return apiClient.get<Expense[]>('/finance/expenses');
  },
  async saveExpense(expense: Partial<Expense>): Promise<Expense> {
    return apiClient.post<Expense>('/finance/expenses', expense);
  },
  
  async getFuelLogs(): Promise<FuelLog[]> {
    return apiClient.get<FuelLog[]>('/finance/fuel-logs');
  },
  async saveFuelLog(log: Partial<FuelLog>): Promise<FuelLog> {
    return apiClient.post<FuelLog>('/finance/fuel-logs', log);
  }
};
