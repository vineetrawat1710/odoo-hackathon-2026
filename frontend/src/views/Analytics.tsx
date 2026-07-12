import React, { useEffect, useState } from 'react';
import { Download, Filter, Lightbulb, TrendingUp } from 'lucide-react';
import {
  BarChart, Bar, PieChart, Pie, Cell, ScatterChart, Scatter,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend
} from 'recharts';
import { dashboardService } from '../api/dashboardService';
import { vehicleService } from '../api/vehicleService';
import type { DashboardDTO, Vehicle } from '../types';
import { Card, CardContent, CardHeader, CardTitle } from '../components/card/card';
import { Button } from '../components/button/button';
import { SkeletonLoader } from '../components/states/states';
import { useToast } from '../components/toast/toast';

const EXPENSE_BREAKDOWN_COLORS = ['#2563eb', '#f59e0b', '#64748b', '#6366f1', '#10b981', '#ef4444'];

export const Analytics: React.FC = () => {
  const { success } = useToast();
  const [data, setData] = useState<DashboardDTO | null>(null);
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [loading, setLoading] = useState(true);

  const loadData = async () => {
    setLoading(true);
    const [d, v] = await Promise.all([dashboardService.getDashboardData(), vehicleService.getVehicles()]);
    setData(d); setVehicles(v);
    setLoading(false);
  };

  useEffect(() => { loadData(); }, []);

  const handleExportCSV = () => {
    if (!data) return;
    const rows = [
      ['Metric', 'Value'],
      ['Total Vehicles', String(data.kpis.totalVehicles)],
      ['Fleet Utilization', `${data.kpis.fleetUtilization}%`],
      ['Revenue', `₹${data.kpis.revenue}`],
      ['Operational Cost', `₹${data.kpis.operationalCost}`],
      ['Avg ROI', `${data.kpis.vehicleROI}%`],
      [],
      ['Vehicle', 'Model', 'Mileage', 'ROI', 'Status'],
      ...vehicles.map(v => [v.plateNumber, v.model, String(v.mileage), `${v.roi}%`, v.status])
    ];
    const csv = rows.map(r => r.join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url; a.download = 'transitops_analytics_export.csv'; a.click();
    URL.revokeObjectURL(url);
    success('Analytics report downloaded as CSV.');
  };

  if (loading || !data) {
    return <div className="space-y-6"><SkeletonLoader type="kpi" /><SkeletonLoader type="card" /><SkeletonLoader type="card" /></div>;
  }

  const { kpis, charts } = data;

  // Derived KPIs
  const totalTrips = charts.tripStatus.reduce((s, t) => s + t.value, 0);
  const costPerMile = kpis.operationalCost > 0 && totalTrips > 0 ? (kpis.operationalCost / (totalTrips * 300)).toFixed(1) : '0';
  const profitMargin = kpis.revenue > 0 ? (((kpis.revenue - kpis.operationalCost) / kpis.revenue) * 100).toFixed(1) : '0';

  // Expense breakdown for donut
  const expenseBreakdown = [
    { name: 'Fuel', value: 45200, color: EXPENSE_BREAKDOWN_COLORS[0] },
    { name: 'Maintenance', value: 31000, color: EXPENSE_BREAKDOWN_COLORS[1] },
    { name: 'Tolls', value: 12450, color: EXPENSE_BREAKDOWN_COLORS[2] },
    { name: 'Insurance', value: 48000, color: EXPENSE_BREAKDOWN_COLORS[3] },
    { name: 'Payouts', value: 15000, color: EXPENSE_BREAKDOWN_COLORS[4] },
    { name: 'Other', value: 5000, color: EXPENSE_BREAKDOWN_COLORS[5] }
  ];

  // Vehicle ROI vs Mileage scatter
  const scatterData = vehicles.map(v => ({
    x: v.mileage,
    y: v.roi,
    name: v.plateNumber
  }));

  // Insights
  const insights = [
    { text: `Fleet utilization is at ${kpis.fleetUtilization}%. Consider dispatching ${kpis.availableVehicles} idle vehicles to improve asset utilization.`, type: 'info' },
    { text: `Profit margin is ${profitMargin}%. Revenue exceeds operational costs indicating healthy financial performance.`, type: 'success' },
    { text: `Vehicle MH15UV4321 (Tata Signa) shows 15% higher fuel consumption than fleet average — check tire pressure and engine diagnostics.`, type: 'warning' },
    { text: `3 driver licenses will expire within the next 30 days. Initiate renewal process to avoid compliance penalties.`, type: 'warning' }
  ];

  return (
    <div className="space-y-6">
      {/* Top Controls */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Filter className="h-4 w-4 text-slate-400" />
          <span className="text-sm text-slate-600 font-medium">Performance Analytics Dashboard</span>
        </div>
        <Button variant="outline" leftIcon={<Download className="h-4 w-4" />} onClick={handleExportCSV}>
          Export CSV
        </Button>
      </div>

      {/* Analytics KPIs */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: 'Cost per km', value: `₹${costPerMile}` },
          { label: 'Profit Margin', value: `${profitMargin}%` },
          { label: 'Total Revenue', value: `₹${(kpis.revenue / 1000).toFixed(0)}K` },
          { label: 'Total Expenses', value: `₹${(kpis.operationalCost / 1000).toFixed(0)}K` }
        ].map((kpi, i) => (
          <Card key={i}>
            <CardContent className="p-4">
              <p className="text-[10px] text-slate-400 uppercase tracking-wide">{kpi.label}</p>
              <p className="text-2xl font-bold text-slate-900 mt-1">{kpi.value}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Expense Breakdown Donut */}
        <Card>
          <CardHeader><CardTitle>Expense Breakdown by Category</CardTitle></CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={260}>
              <PieChart>
                <Pie data={expenseBreakdown} cx="50%" cy="50%" innerRadius={60} outerRadius={90} dataKey="value" paddingAngle={2} strokeWidth={0}>
                  {expenseBreakdown.map((entry, idx) => (
                    <Cell key={idx} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip contentStyle={{ fontSize: 12, borderRadius: 8, border: '1px solid #e2e8f0' }} formatter={(value: unknown) => [`₹${Number(value).toLocaleString()}`, '']} />
                <Legend iconSize={8} wrapperStyle={{ fontSize: 11 }} />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Vehicle ROI vs Mileage Scatter */}
        <Card>
          <CardHeader><CardTitle>Vehicle ROI vs Mileage</CardTitle></CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={260}>
              <ScatterChart>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis dataKey="x" name="Mileage" unit=" km" tick={{ fontSize: 10 }} stroke="#94a3b8" />
                <YAxis dataKey="y" name="ROI" unit="%" tick={{ fontSize: 10 }} stroke="#94a3b8" />
                <Tooltip contentStyle={{ fontSize: 12, borderRadius: 8, border: '1px solid #e2e8f0' }} cursor={{ strokeDasharray: '3 3' }} />
                <Scatter data={scatterData} fill="#2563eb" />
              </ScatterChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Revenue vs Cost Over Time */}
        <Card>
          <CardHeader><CardTitle>Revenue vs Operational Cost</CardTitle></CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={260}>
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

        {/* Vehicle ROI Ranking */}
        <Card>
          <CardHeader><CardTitle>Top Vehicles by ROI</CardTitle></CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={260}>
              <BarChart data={charts.vehicleROI} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis type="number" tick={{ fontSize: 11 }} stroke="#94a3b8" unit="%" />
                <YAxis dataKey="plateNumber" type="category" tick={{ fontSize: 10 }} stroke="#94a3b8" width={90} />
                <Tooltip contentStyle={{ fontSize: 12, borderRadius: 8, border: '1px solid #e2e8f0' }} />
                <Bar dataKey="roi" fill="#10b981" radius={[0, 4, 4, 0]} barSize={16} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* AI Insights */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Lightbulb className="h-4 w-4 text-amber-500" />
            Operational Insights
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <div className="divide-y divide-slate-100">
            {insights.map((insight, idx) => (
              <div key={idx} className="px-6 py-3.5 flex items-start gap-3 hover:bg-slate-50/50 transition-colors">
                <TrendingUp className={`h-4 w-4 mt-0.5 flex-shrink-0 ${
                  insight.type === 'success' ? 'text-emerald-500' :
                  insight.type === 'warning' ? 'text-amber-500' : 'text-blue-500'
                }`} />
                <p className="text-xs text-slate-700 leading-relaxed">{insight.text}</p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
