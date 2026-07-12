import type { Trip } from '../types';
import { apiClient } from './apiClient';

export const tripService = {
  async getTrips(): Promise<Trip[]> {
    return apiClient.get<Trip[]>('/trips');
  },
  async getTripById(id: number): Promise<Trip | undefined> {
    return apiClient.get<Trip>(`/trips/${id}`);
  },
  async saveTrip(trip: Partial<Trip>): Promise<Trip> {
    return apiClient.post<Trip>('/trips', trip);
  },
  async dispatchTrip(id: number): Promise<Trip> {
    return apiClient.post<Trip>(`/trips/${id}/dispatch`, {});
  },
  async completeTrip(id: number, data: { actual_distance: number, end_odometer: number }): Promise<Trip> {
    return apiClient.post<Trip>(`/trips/${id}/complete`, data);
  },
  async cancelTrip(id: number): Promise<Trip> {
    return apiClient.post<Trip>(`/trips/${id}/cancel`, {});
  }
};
