import type { Expense, FuelLog } from '../types';
import { DB } from '../mocks/db';

const delay = (ms = 600) => new Promise(resolve => setTimeout(resolve, ms));

export const expenseService = {
  async getExpenses(): Promise<Expense[]> {
    await delay();
    return DB.getExpenses();
  },

  async saveExpense(expense: Expense): Promise<Expense> {
    await delay(600);
    return DB.saveExpense(expense);
  },

  async getFuelLogs(): Promise<FuelLog[]> {
    await delay();
    return DB.getFuelLogs();
  },

  async saveFuelLog(log: FuelLog): Promise<FuelLog> {
    await delay(700);
    return DB.saveFuelLog(log);
  }
};
