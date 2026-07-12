import React, { useEffect, useState, useMemo } from 'react';
import {
  Truck, Users, Navigation, Wrench, TrendingUp, IndianRupee,
  Activity, BarChart3, CheckCircle, Clock, Fuel, Filter
} from 'lucide-react';
import {
  BarChart, Bar,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer
} from 'recharts';
import { dashboardService } from '../api/dashboardService';
import { tripService } from '../api/tripService';
import { vehicleService } from '../api/vehicleService';
import type { DashboardDTO, Trip, Vehicle } from '../types';
import { Card, CardContent, CardHeader, CardTitle } from '../components/card/card';
import { SkeletonLoader } from '../components/states/states';
import { StatusBadge } from '../components/badge/StatusBadge';

export const Dashboard: React.FC = () => {
  const [data, setData] = useState<DashboardDTO | null>(null);
  const [recentTrips, setRecentTrips] = useState<Trip[]>([]);
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [loading, setLoading] = useState(true);

  // Filters for Section 3.2 requirement
  const [filterType, setFilterType] = useState<string>('ALL');
  const [filterStatus, setFilterStatus] = useState<string>('ALL');
  const [filterRegion, setFilterRegion] = useState<string>('ALL');

  const loadData = async () => {
    setLoading(true);
    try {
      const [db, trips, v] = await Promise.all([
        dashboardService.getDashboard(),
        tripService.getTrips(),
        vehicleService.getVehicles()
      ]);
      setData(db);
      setRecentTrips(trips.slice(-5).reverse());
      setVehicles(v);
    } catch (e) {
      console.error(e);
    }
    setLoading(false);
  };

  useEffect(() => { loadData(); }, []);

  const filteredVehicles = useMemo(() => {
    return vehicles.filter(v => {
      const matchType = filterType === 'ALL' || v.type?.toUpperCase() === filterType;
      const matchStatus = filterStatus === 'ALL' || v.status?.toUpperCase() === filterStatus;
      // Mock region matching based on registration number prefix or region
      const matchRegion = filterRegion === 'ALL' || (v.registration_number && v.registration_number.toUpperCase().includes(filterRegion));
      return matchType && matchStatus && matchRegion;
    });
  }, [vehicles, filterType, filterStatus, filterRegion]);

  if (loading || !data) {
    return (
      <div className="space-y-6">
        <SkeletonLoader type="kpi" />
        <SkeletonLoader type="kpi" />
        <div className="grid grid-cols-2 gap-6">
          <SkeletonLoader type="card" />
          <SkeletonLoader type="card" />
        </div>
      </div>
    );
  }

  const kpiCards = [
    { label: 'Active Vehicles', value: data.vehicles_on_trip, icon: Navigation, color: 'text-indigo-700', bg: 'bg-indigo-50' },
    { label: 'Available Vehicles', value: data.available_vehicles, icon: CheckCircle, color: 'text-emerald-700', bg: 'bg-emerald-50' },
    { label: 'In Maintenance', value: data.vehicles_in_shop, icon: Wrench, color: 'text-amber-700', bg: 'bg-amber-50' },
    { label: 'Active Trips', value: data.active_trips, icon: Activity, color: 'text-indigo-700', bg: 'bg-indigo-50' },
    { label: 'Pending Trips', value: data.pending_trips || 0, icon: Clock, color: 'text-amber-700', bg: 'bg-amber-50' },
    { label: 'Drivers On Duty', value: data.drivers_on_duty || data.available_drivers, icon: Users, color: 'text-cyan-700', bg: 'bg-cyan-50' },
    { label: 'Fleet Utilization', value: `${data.fleet_utilization}%`, icon: TrendingUp, color: 'text-violet-700', bg: 'bg-violet-50' },
    { label: 'Fuel Efficiency', value: `${data.fuel_efficiency} km/L`, icon: Fuel, color: 'text-teal-700', bg: 'bg-teal-50' },
    { label: 'Operational Cost', value: `₹${(data.operational_cost / 1000).toFixed(1)}K`, icon: BarChart3, color: 'text-rose-700', bg: 'bg-rose-50' },
    { label: 'Avg. Vehicle ROI', value: `${data.vehicle_roi}%`, icon: TrendingUp, color: 'text-indigo-700', bg: 'bg-indigo-50' },
  ];

  const roiChartData = filteredVehicles.map(v => ({
    plateNumber: v.registration_number,
    roi: data.individual_vehicle_rois?.[v.id] ?? 0
  }));

  return (
    <div className="space-y-6">
      {/* Dashboard Filters Bar (Requirement 3.2) */}
      <Card className="bg-white/80 backdrop-blur-sm border-slate-200 shadow-sm">
        <CardContent className="p-4 flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-2 text-sm font-medium text-slate-700">
            <Filter className="h-4 w-4 text-indigo-600" />
            <span>Dashboard Filters:</span>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <div className="flex items-center gap-1.5">
              <label className="text-xs text-slate-500 font-medium">Type:</label>
              <select 
                value={filterType} 
                onChange={e => setFilterType(e.target.value)}
                className="text-xs border border-slate-200 rounded-lg px-2.5 py-1.5 bg-slate-50 text-slate-800 font-medium focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                <option value="ALL">All Types</option>
                <option value="TRUCK">Truck</option>
                <option value="VAN">Van</option>
                <option value="BIKE">Bike</option>
              </select>
            </div>

            <div className="flex items-center gap-1.5">
              <label className="text-xs text-slate-500 font-medium">Status:</label>
              <select 
                value={filterStatus} 
                onChange={e => setFilterStatus(e.target.value)}
                className="text-xs border border-slate-200 rounded-lg px-2.5 py-1.5 bg-slate-50 text-slate-800 font-medium focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                <option value="ALL">All Statuses</option>
                <option value="AVAILABLE">Available</option>
                <option value="ON_TRIP">On Trip</option>
                <option value="IN_SHOP">In Shop</option>
              </select>
            </div>

            <div className="flex items-center gap-1.5">
              <label className="text-xs text-slate-500 font-medium">Region:</label>
              <select 
                value={filterRegion} 
                onChange={e => setFilterRegion(e.target.value)}
                className="text-xs border border-slate-200 rounded-lg px-2.5 py-1.5 bg-slate-50 text-slate-800 font-medium focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                <option value="ALL">All Regions</option>
                <option value="DL">Delhi (DL)</option>
                <option value="MH">Maharashtra (MH)</option>
                <option value="KA">Karnataka (KA)</option>
                <option value="TN">Tamil Nadu (TN)</option>
              </select>
            </div>

            {(filterType !== 'ALL' || filterStatus !== 'ALL' || filterRegion !== 'ALL') && (
              <button 
                onClick={() => { setFilterType('ALL'); setFilterStatus('ALL'); setFilterRegion('ALL'); }}
                className="text-xs text-indigo-600 font-medium hover:underline ml-1"
              >
                Reset
              </button>
            )}
          </div>
        </CardContent>
      </Card>

      {/* KPI Cards */}

      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        {kpiCards.map((kpi, idx) => {
          const Icon = kpi.icon;
          return (
            <Card key={idx}>
              <CardContent className="p-4">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-[11px] font-medium text-slate-500 uppercase tracking-wide">{kpi.label}</p>
                    <p className="text-2xl font-bold text-slate-900 mt-1 tracking-tight">{kpi.value}</p>
                  </div>
                  <div className={`p-2 rounded-lg ${kpi.bg}`}>
                    <Icon className={`h-4.5 w-4.5 ${kpi.color}`} />
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Vehicle ROI Horizontal Bar */}
        <Card>
          <CardHeader><CardTitle>Individual Vehicle ROI (%)</CardTitle></CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={roiChartData} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis type="number" tick={{ fontSize: 11 }} stroke="#94a3b8" unit="%" />
                <YAxis dataKey="plateNumber" type="category" tick={{ fontSize: 10 }} stroke="#94a3b8" width={90} />
                <Tooltip contentStyle={{ fontSize: 12, borderRadius: 8, border: '1px solid #e2e8f0' }} />
                <Bar dataKey="roi" fill="#0ea5e9" radius={[0, 4, 4, 0]} barSize={20} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Recent Trips */}
        <Card>
          <CardHeader><CardTitle>Recent Trips</CardTitle></CardHeader>
          <CardContent className="p-0">
            <div className="divide-y divide-slate-100">
              {recentTrips.length === 0 ? (
                <div className="px-6 py-8 text-center text-xs text-slate-400">No recent trips.</div>
              ) : (
                recentTrips.map(trip => (
                  <div key={trip.id} className="flex items-center justify-between px-6 py-3.5 hover:bg-slate-50/50 transition-colors">
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="min-w-0">
                        <p className="text-sm font-medium text-slate-900 truncate">Trip {trip.id}</p>
                        <p className="text-[11px] text-slate-500 truncate">{trip.source} → {trip.destination}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <StatusBadge status={trip.status} />
                    </div>
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
