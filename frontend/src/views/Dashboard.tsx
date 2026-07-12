import React, { useEffect, useState } from 'react';
import {
  Truck, Users, Navigation, Wrench, TrendingUp, IndianRupee,
  Activity, BarChart3, Clock, AlertTriangle, CheckCircle, XCircle
} from 'lucide-react';
import {
  LineChart, Line, BarChart, Bar, AreaChart, Area, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend
} from 'recharts';
import { dashboardService } from '../api/dashboardService';
import type { DashboardDTO } from '../types';
import { Card, CardContent, CardHeader, CardTitle } from '../components/card/card';
import { SkeletonLoader } from '../components/states/states';

export const Dashboard: React.FC = () => {
  const [data, setData] = useState<DashboardDTO | null>(null);
  const [loading, setLoading] = useState(true);

  const loadData = async () => {
    setLoading(true);
    const result = await dashboardService.getDashboardData();
    setData(result);
    setLoading(false);
  };

  useEffect(() => { loadData(); }, []);

  if (loading || !data) {
    return (
      <div className="space-y-6">
        <SkeletonLoader type="kpi" />
        <SkeletonLoader type="kpi" />
        <div className="grid grid-cols-2 gap-6">
          <SkeletonLoader type="card" />
          <SkeletonLoader type="card" />
        </div>
        <div className="grid grid-cols-2 gap-6">
          <SkeletonLoader type="table" />
          <SkeletonLoader type="list" />
        </div>
      </div>
    );
  }

  const { kpis, charts, bottom } = data;

  const kpiCards = [
    { label: 'Total Vehicles', value: kpis.totalVehicles, icon: Truck, color: 'text-slate-700', bg: 'bg-slate-50' },
    { label: 'Available', value: kpis.availableVehicles, icon: CheckCircle, color: 'text-emerald-700', bg: 'bg-emerald-50' },
    { label: 'On Trip', value: kpis.vehiclesOnTrip, icon: Navigation, color: 'text-blue-700', bg: 'bg-blue-50' },
    { label: 'In Shop', value: kpis.vehiclesInShop, icon: Wrench, color: 'text-amber-700', bg: 'bg-amber-50' },
    { label: 'Active Trips', value: kpis.activeTrips, icon: Activity, color: 'text-indigo-700', bg: 'bg-indigo-50' },
    { label: 'Available Drivers', value: kpis.availableDrivers, icon: Users, color: 'text-cyan-700', bg: 'bg-cyan-50' },
    { label: 'Fleet Utilization', value: `${kpis.fleetUtilization}%`, icon: TrendingUp, color: 'text-violet-700', bg: 'bg-violet-50' },
    { label: 'Revenue', value: `₹${(kpis.revenue / 1000).toFixed(0)}K`, icon: IndianRupee, color: 'text-emerald-700', bg: 'bg-emerald-50' },
    { label: 'Operational Cost', value: `₹${(kpis.operationalCost / 1000).toFixed(0)}K`, icon: BarChart3, color: 'text-rose-700', bg: 'bg-rose-50' },
    { label: 'Avg. Vehicle ROI', value: `${kpis.vehicleROI}%`, icon: TrendingUp, color: 'text-blue-700', bg: 'bg-blue-50' },
  ];

  const statusIcon = (type: string) => {
    if (type === 'success') return <CheckCircle className="h-3.5 w-3.5 text-emerald-500" />;
    if (type === 'warning') return <AlertTriangle className="h-3.5 w-3.5 text-amber-500" />;
    if (type === 'error') return <XCircle className="h-3.5 w-3.5 text-rose-500" />;
    return <Activity className="h-3.5 w-3.5 text-blue-500" />;
  };

  return (
    <div className="space-y-6">
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

      {/* Charts Row 1: Fleet Utilization (Line) + Fuel Efficiency (Line) + Revenue vs Cost (Bar) */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Fleet Utilization Line */}
        <Card>
          <CardHeader><CardTitle>Fleet Utilization</CardTitle></CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={220}>
              <LineChart data={charts.fleetUtilization}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis dataKey="date" tick={{ fontSize: 11 }} stroke="#94a3b8" />
                <YAxis tick={{ fontSize: 11 }} stroke="#94a3b8" unit="%" />
                <Tooltip contentStyle={{ fontSize: 12, borderRadius: 8, border: '1px solid #e2e8f0' }} />
                <Line type="monotone" dataKey="value" stroke="#2563eb" strokeWidth={2} dot={{ r: 3, fill: '#2563eb' }} activeDot={{ r: 5 }} />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Fuel Efficiency Line */}
        <Card>
          <CardHeader><CardTitle>Fuel Efficiency (km/L)</CardTitle></CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={220}>
              <LineChart data={charts.fuelEfficiency}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis dataKey="date" tick={{ fontSize: 11 }} stroke="#94a3b8" />
                <YAxis tick={{ fontSize: 11 }} stroke="#94a3b8" />
                <Tooltip contentStyle={{ fontSize: 12, borderRadius: 8, border: '1px solid #e2e8f0' }} />
                <Line type="monotone" dataKey="value" stroke="#10b981" strokeWidth={2} dot={{ r: 3, fill: '#10b981' }} activeDot={{ r: 5 }} />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Revenue vs Cost Bar */}
        <Card>
          <CardHeader><CardTitle>Revenue vs Cost</CardTitle></CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={charts.revenueVsCost}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis dataKey="month" tick={{ fontSize: 11 }} stroke="#94a3b8" />
                <YAxis tick={{ fontSize: 11 }} stroke="#94a3b8" tickFormatter={v => `${(v/1000).toFixed(0)}K`} />
                <Tooltip contentStyle={{ fontSize: 12, borderRadius: 8, border: '1px solid #e2e8f0' }} formatter={(value: unknown) => [`₹${Number(value).toLocaleString()}`, '']} />
                <Legend iconSize={10} wrapperStyle={{ fontSize: 11 }} />
                <Bar dataKey="revenue" fill="#2563eb" radius={[4, 4, 0, 0]} name="Revenue" />
                <Bar dataKey="cost" fill="#f97316" radius={[4, 4, 0, 0]} name="Cost" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Charts Row 2: Trip Status (Donut) + Monthly Expenses (Area) + Vehicle ROI (Horizontal Bar) */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Trip Status Donut */}
        <Card>
          <CardHeader><CardTitle>Trip Status</CardTitle></CardHeader>
          <CardContent className="flex items-center justify-center">
            <ResponsiveContainer width="100%" height={220}>
              <PieChart>
                <Pie
                  data={charts.tripStatus}
                  cx="50%"
                  cy="50%"
                  innerRadius={55}
                  outerRadius={80}
                  dataKey="value"
                  paddingAngle={3}
                  strokeWidth={0}
                >
                  {charts.tripStatus.map((entry, index) => (
                    <Cell key={index} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip contentStyle={{ fontSize: 12, borderRadius: 8, border: '1px solid #e2e8f0' }} />
                <Legend iconSize={8} wrapperStyle={{ fontSize: 11 }} />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Monthly Expenses Area */}
        <Card>
          <CardHeader><CardTitle>Monthly Expenses</CardTitle></CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={220}>
              <AreaChart data={charts.monthlyExpenses}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis dataKey="month" tick={{ fontSize: 11 }} stroke="#94a3b8" />
                <YAxis tick={{ fontSize: 11 }} stroke="#94a3b8" tickFormatter={v => `${(v/1000).toFixed(0)}K`} />
                <Tooltip contentStyle={{ fontSize: 12, borderRadius: 8, border: '1px solid #e2e8f0' }} formatter={(value: unknown) => [`₹${Number(value).toLocaleString()}`, '']} />
                <Area type="monotone" dataKey="amount" stroke="#8b5cf6" fill="#8b5cf640" strokeWidth={2} />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Vehicle ROI Horizontal Bar */}
        <Card>
          <CardHeader><CardTitle>Vehicle ROI (Top 5)</CardTitle></CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={charts.vehicleROI} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis type="number" tick={{ fontSize: 11 }} stroke="#94a3b8" unit="%" />
                <YAxis dataKey="plateNumber" type="category" tick={{ fontSize: 10 }} stroke="#94a3b8" width={90} />
                <Tooltip contentStyle={{ fontSize: 12, borderRadius: 8, border: '1px solid #e2e8f0' }} />
                <Bar dataKey="roi" fill="#0ea5e9" radius={[0, 4, 4, 0]} barSize={16} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Bottom Section: 4 panels */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

        {/* Recent Trips */}
        <Card>
          <CardHeader><CardTitle>Recent Trips</CardTitle></CardHeader>
          <CardContent className="p-0">
            <div className="divide-y divide-slate-100">
              {bottom.recentTrips.map(trip => (
                <div key={trip.id} className="flex items-center justify-between px-6 py-3.5 hover:bg-slate-50/50 transition-colors">
                  <div className="flex items-center gap-3 min-w-0">
                    <div className={`h-2 w-2 rounded-full ${
                      trip.status === 'active' ? 'bg-blue-500 animate-pulse' :
                      trip.status === 'completed' ? 'bg-emerald-500' :
                      trip.status === 'scheduled' ? 'bg-indigo-400' : 'bg-slate-300'
                    }`} />
                    <div className="min-w-0">
                      <p className="text-sm font-medium text-slate-900 truncate">{trip.tripNumber}</p>
                      <p className="text-[11px] text-slate-500 truncate">{trip.origin} → {trip.destination}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold ${
                      trip.status === 'active' ? 'bg-blue-50 text-blue-700' :
                      trip.status === 'completed' ? 'bg-emerald-50 text-emerald-700' :
                      trip.status === 'scheduled' ? 'bg-indigo-50 text-indigo-700' :
                      'bg-slate-100 text-slate-600'
                    }`}>
                      {trip.status}
                    </span>
                    {trip.status === 'active' && (
                      <div className="mt-1.5 w-20 bg-slate-100 rounded-full h-1.5 overflow-hidden">
                        <div className="bg-blue-500 h-1.5 rounded-full transition-all" style={{ width: `${trip.currentProgress}%` }} />
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Recent Activities */}
        <Card>
          <CardHeader><CardTitle>Recent Activities</CardTitle></CardHeader>
          <CardContent className="p-0">
            <div className="divide-y divide-slate-100">
              {bottom.recentActivities.map(act => (
                <div key={act.id} className="flex items-start gap-3 px-6 py-3.5 hover:bg-slate-50/50 transition-colors">
                  {statusIcon(act.type)}
                  <div className="min-w-0 flex-1">
                    <p className="text-xs text-slate-700 leading-relaxed">{act.text}</p>
                    <p className="text-[10px] text-slate-400 mt-0.5">
                      <Clock className="h-3 w-3 inline-block mr-1 -mt-0.5" />
                      {new Date(act.time).toLocaleString('en-IN', { timeStyle: 'short', dateStyle: 'medium' })}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Upcoming License Expiry */}
        <Card>
          <CardHeader><CardTitle>Upcoming License Expiry</CardTitle></CardHeader>
          <CardContent className="p-0">
            {bottom.upcomingLicenseExpiry.length === 0 ? (
              <div className="px-6 py-8 text-center text-xs text-slate-400">All driver licenses are up to date.</div>
            ) : (
              <div className="divide-y divide-slate-100">
                {bottom.upcomingLicenseExpiry.map(driver => (
                  <div key={driver.id} className="flex items-center justify-between px-6 py-3.5 hover:bg-slate-50/50 transition-colors">
                    <div className="flex items-center gap-3">
                      <div className="h-8 w-8 rounded-full bg-slate-100 flex items-center justify-center text-xs font-bold text-slate-600">
                        {driver.name.split(' ').map(n => n[0]).join('')}
                      </div>
                      <div>
                        <p className="text-sm font-medium text-slate-900">{driver.name}</p>
                        <p className="text-[11px] text-slate-500">{driver.licenseNumber}</p>
                      </div>
                    </div>
                    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold ${
                      driver.licenseStatus === 'expired' ? 'bg-rose-50 text-rose-700' : 'bg-amber-50 text-amber-700'
                    }`}>
                      {driver.licenseStatus === 'expired' ? 'Expired' : 'Expiring Soon'}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Vehicles in Maintenance */}
        <Card>
          <CardHeader><CardTitle>Vehicles in Maintenance</CardTitle></CardHeader>
          <CardContent className="p-0">
            {bottom.vehiclesInMaintenance.length === 0 ? (
              <div className="px-6 py-8 text-center text-xs text-slate-400">No vehicles currently in maintenance.</div>
            ) : (
              <div className="divide-y divide-slate-100">
                {bottom.vehiclesInMaintenance.map(log => (
                  <div key={log.id} className="px-6 py-3.5 hover:bg-slate-50/50 transition-colors">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-slate-900">{log.vehiclePlate || log.vehicleId}</p>
                        <p className="text-[11px] text-slate-500 mt-0.5">{log.description}</p>
                      </div>
                      <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold ${
                        log.status === 'in-progress' ? 'bg-amber-50 text-amber-700' : 'bg-blue-50 text-blue-700'
                      }`}>
                        {log.status}
                      </span>
                    </div>
                    <div className="mt-2 flex items-center gap-2">
                      <span className="text-[10px] text-slate-400">₹{log.cost.toLocaleString()}</span>
                      <div className="flex-1 bg-slate-100 rounded-full h-1.5 overflow-hidden">
                        <div className={`h-1.5 rounded-full transition-all ${
                          log.status === 'in-progress' ? 'bg-amber-400 w-3/5' : 'bg-blue-400 w-1/4'
                        }`} />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
