import React, { useEffect, useState } from 'react';
import { Download, Filter, Lightbulb, TrendingUp } from 'lucide-react';
import { dashboardService } from '../api/dashboardService';
import { vehicleService } from '../api/vehicleService';
import type { DashboardDTO, Vehicle } from '../types';
import { Card, CardContent, CardHeader, CardTitle } from '../components/card/card';
import { Button } from '../components/button/button';
import { SkeletonLoader } from '../components/states/states';
import { useToast } from '../components/toast/toast';

export const Analytics: React.FC = () => {
  const { success } = useToast();
  const [data, setData] = useState<DashboardDTO | null>(null);
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [loading, setLoading] = useState(true);

  const loadData = async () => {
    setLoading(true);
    try {
      const [d, v] = await Promise.all([dashboardService.getDashboard(), vehicleService.getVehicles()]);
      setData(d); setVehicles(v);
    } catch (e) {
      console.error(e);
    }
    setLoading(false);
  };

  useEffect(() => { loadData(); }, []);

  const handleExportCSV = () => {
    if (!data) return;
    const rows = [
      ['Metric', 'Value'],
      ['Total Vehicles', String(data.total_vehicles)],
      ['Fleet Utilization', `${data.fleet_utilization}%`],
      ['Revenue', `₹${data.total_revenue}`],
      ['Operational Cost', `₹${data.operational_cost}`],
      ['Avg ROI', `${data.vehicle_roi}%`],
      [],
      ['Vehicle', 'Status', 'ROI'],
      ...vehicles.map(v => [v.registration_number, v.status, data.individual_vehicle_rois[v.id] || 0])
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

  // Derived KPIs
  const totalTrips = data.active_trips + data.completed_trips;
  const costPerMile = data.operational_cost > 0 && totalTrips > 0 ? (data.operational_cost / (totalTrips * 300)).toFixed(1) : '0';
  const profitMargin = data.total_revenue > 0 ? (((data.total_revenue - data.operational_cost) / data.total_revenue) * 100).toFixed(1) : '0';

  // Insights
  const insights = [
    { text: `Fleet utilization is at ${data.fleet_utilization}%. Consider dispatching ${data.available_vehicles} idle vehicles to improve asset utilization.`, type: 'info' },
    { text: `Profit margin is ${profitMargin}%. Revenue exceeds operational costs indicating healthy financial performance.`, type: 'success' },
    { text: `Check vehicle maintenance schedules. ${data.vehicles_in_shop} vehicles are currently in the shop.`, type: 'warning' }
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Filter className="h-4 w-4 text-slate-400" />
          <span className="text-sm text-slate-600 font-medium">Performance Analytics Dashboard</span>
        </div>
        <Button variant="outline" leftIcon={<Download className="h-4 w-4" />} onClick={handleExportCSV}>
          Export CSV
        </Button>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: 'Cost per km', value: `₹${costPerMile}` },
          { label: 'Profit Margin', value: `${profitMargin}%` },
          { label: 'Total Revenue', value: `₹${(data.total_revenue / 1000).toFixed(1)}K` },
          { label: 'Total Expenses', value: `₹${(data.operational_cost / 1000).toFixed(1)}K` }
        ].map((kpi, i) => (
          <Card key={i}>
            <CardContent className="p-4">
              <p className="text-[10px] text-slate-400 uppercase tracking-wide">{kpi.label}</p>
              <p className="text-2xl font-bold text-slate-900 mt-1">{kpi.value}</p>
            </CardContent>
          </Card>
        ))}
      </div>

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
                  insight.type === 'warning' ? 'text-amber-500' : 'text-indigo-500'
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
