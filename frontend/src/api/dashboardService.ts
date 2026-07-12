import type { DashboardDTO } from '../types';
import { DB } from '../mocks/db';

const delay = (ms = 700) => new Promise(resolve => setTimeout(resolve, ms));

export const dashboardService = {
  async getDashboardData(): Promise<DashboardDTO> {
    await delay();

    const vehicles = DB.getVehicles();
    const drivers = DB.getDrivers();
    const trips = DB.getTrips();
    const maintenance = DB.getMaintenanceLogs();
    const expenses = DB.getExpenses();
    const fuelLogs = DB.getFuelLogs();
    const activities = DB.getActivities();

    // KPIs
    const totalVehicles = vehicles.length;
    const availableVehicles = vehicles.filter(v => v.status === 'available').length;
    const vehiclesOnTrip = vehicles.filter(v => v.status === 'active').length;
    const vehiclesInShop = vehicles.filter(v => v.status === 'maintenance').length;
    
    const activeTrips = trips.filter(t => t.status === 'active').length;
    const availableDrivers = drivers.filter(d => d.status === 'active' && !d.vehicleId).length;
    
    const fleetUtilization = totalVehicles > 0 ? Math.round((vehiclesOnTrip / totalVehicles) * 100) : 0;
    
    // Revenue
    const revenue = trips.reduce((sum, t) => sum + (t.status === 'completed' || t.status === 'active' ? t.revenue : 0), 0);
    
    // Operational Cost
    const baseExpenses = expenses.reduce((sum, e) => sum + e.amount, 0);
    const activeTripCosts = trips.reduce((sum, t) => {
      if (t.status === 'active') {
        return sum + t.fuelCost + t.otherExpenses;
      }
      return sum;
    }, 0);
    const operationalCost = baseExpenses + activeTripCosts;

    // Vehicle ROI (average ROI)
    const validRoiVehicles = vehicles.filter(v => v.roi > 0);
    const averageRoi = validRoiVehicles.length > 0 
      ? Math.round(validRoiVehicles.reduce((sum, v) => sum + v.roi, 0) / validRoiVehicles.length) 
      : 0;

    // Charts
    // 1. Fleet Utilization (historical Line chart)
    const fleetUtilizationChart = [
      { date: '07-06', value: 65 },
      { date: '07-07', value: 70 },
      { date: '07-08', value: 72 },
      { date: '07-09', value: 68 },
      { date: '07-10', value: 75 },
      { date: '07-11', value: 78 },
      { date: '07-12', value: fleetUtilization }
    ];

    // 2. Fuel Efficiency (historical Line chart in MPG/KMPL)
    const avgFuelEfficiency = fuelLogs.length > 0 
      ? Number((fuelLogs.reduce((sum, f) => sum + f.efficiency, 0) / fuelLogs.length).toFixed(1)) 
      : 4.0;
    
    const fuelEfficiencyChart = [
      { date: '07-06', value: 3.9 },
      { date: '07-07', value: 4.1 },
      { date: '07-08', value: 4.0 },
      { date: '07-09', value: 3.8 },
      { date: '07-10', value: 4.2 },
      { date: '07-11', value: 3.9 },
      { date: '07-12', value: avgFuelEfficiency }
    ];

    // 3. Revenue vs Operational Cost (Bar chart)
    const revenueVsCost = [
      { month: 'May', revenue: 420000, cost: 210000 },
      { month: 'Jun', revenue: 580000, cost: 310000 },
      { month: 'Jul', revenue: revenue, cost: operationalCost }
    ];

    // 4. Trip Status (Donut)
    const scheduled = trips.filter(t => t.status === 'scheduled').length;
    const active = trips.filter(t => t.status === 'active').length;
    const completed = trips.filter(t => t.status === 'completed').length;
    const cancelled = trips.filter(t => t.status === 'cancelled').length;
    
    const tripStatusChart = [
      { name: 'Scheduled', value: scheduled, color: '#6366f1' },
      { name: 'Active', value: active, color: '#3b82f6' },
      { name: 'Completed', value: completed, color: '#10b981' },
      { name: 'Cancelled', value: cancelled, color: '#ef4444' }
    ];

    // 5. Monthly Expenses (Area)
    const monthlyExpenses = [
      { month: 'May', amount: 198000 },
      { month: 'Jun', amount: 285000 },
      { month: 'Jul', amount: baseExpenses }
    ];

    // 6. Vehicle ROI (Horizontal Bar, top 5)
    const vehicleROIChart = vehicles
      .map(v => ({ id: v.id, plateNumber: v.plateNumber, roi: v.roi }))
      .sort((a, b) => b.roi - a.roi)
      .slice(0, 5);

    // Bottom
    const recentTrips = trips.slice(0, 5);
    const upcomingLicenseExpiry = drivers.filter(d => d.licenseStatus === 'warning' || d.licenseStatus === 'expired');
    const vehiclesInMaintenance = maintenance.filter(m => m.status === 'in-progress' || m.status === 'scheduled');

    return {
      kpis: {
        totalVehicles,
        availableVehicles,
        vehiclesOnTrip,
        vehiclesInShop,
        activeTrips,
        availableDrivers,
        fleetUtilization,
        revenue,
        operationalCost,
        vehicleROI: averageRoi
      },
      charts: {
        fleetUtilization: fleetUtilizationChart,
        fuelEfficiency: fuelEfficiencyChart,
        revenueVsCost,
        tripStatus: tripStatusChart,
        monthlyExpenses,
        vehicleROI: vehicleROIChart
      },
      bottom: {
        recentTrips,
        recentActivities: activities.slice(0, 6),
        upcomingLicenseExpiry,
        vehiclesInMaintenance
      }
    };
  }
};
