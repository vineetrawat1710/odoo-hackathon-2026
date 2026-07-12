import React, { useEffect, useState } from 'react';
import { Plus } from 'lucide-react';
import { expenseService } from '../api/expenseService';
import { vehicleService } from '../api/vehicleService';
import type { FuelLog, Vehicle } from '../types';
import { Card, CardContent } from '../components/card/card';
import { Button } from '../components/button/button';
import { Dialog } from '../components/dialog/dialog';
import { SkeletonLoader, EmptyState } from '../components/states/states';
import { useToast } from '../components/toast/toast';

export const FuelLogs: React.FC = () => {
  const { success, error } = useToast();
  const [logs, setLogs] = useState<FuelLog[]>([]);
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({ vehicleId: '', date: '', odometer: 0, fuelAmount: 0, cost: 0 });

  const loadData = async () => {
    setLoading(true);
    const [f, v] = await Promise.all([expenseService.getFuelLogs(), vehicleService.getVehicles()]);
    setLogs(f); setVehicles(v);
    setLoading(false);
  };

  useEffect(() => { loadData(); }, []);

  const handleSave = async () => {
    if (!form.vehicleId || !form.date || !form.fuelAmount || !form.cost) {
      error('All fields are required.'); return;
    }
    setSaving(true);
    const efficiency = form.odometer > 0 && form.fuelAmount > 0 ? Number((form.odometer / form.fuelAmount).toFixed(1)) : 0;
    const log: FuelLog = { id: `f-${Date.now()}`, ...form, efficiency };
    await expenseService.saveFuelLog(log);
    success('Fuel log entry recorded. Expense auto-logged.');
    setSaving(false); setShowForm(false);
    setForm({ vehicleId: '', date: '', odometer: 0, fuelAmount: 0, cost: 0 });
    loadData();
  };

  const totalFuel = logs.reduce((s, l) => s + l.fuelAmount, 0);
  const totalCost = logs.reduce((s, l) => s + l.cost, 0);
  const avgEfficiency = logs.length > 0 ? (logs.reduce((s, l) => s + l.efficiency, 0) / logs.length).toFixed(1) : '0';

  const inputClass = 'w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all';
  const labelClass = 'block text-xs font-semibold text-slate-700 mb-1';

  if (loading) return <div className="space-y-6"><SkeletonLoader type="kpi" /><SkeletonLoader type="table" /></div>;

  return (
    <div className="space-y-6">
      {/* Summary */}
      <div className="grid grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-4">
            <p className="text-[10px] text-slate-400 uppercase">Total Fuel Consumed</p>
            <p className="text-2xl font-bold text-slate-900 mt-1">{totalFuel.toLocaleString()} L</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <p className="text-[10px] text-slate-400 uppercase">Total Fuel Cost</p>
            <p className="text-2xl font-bold text-slate-900 mt-1">₹{totalCost.toLocaleString()}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <p className="text-[10px] text-slate-400 uppercase">Avg. Fuel Efficiency</p>
            <p className="text-2xl font-bold text-slate-900 mt-1">{avgEfficiency} km/L</p>
          </CardContent>
        </Card>
      </div>

      {/* Controls */}
      <div className="flex justify-end">
        <Button leftIcon={<Plus className="h-4 w-4" />} onClick={() => setShowForm(true)}>Log Fuel Entry</Button>
      </div>

      {/* Table */}
      {logs.length === 0 ? (
        <EmptyState title="No fuel logs" description="Record your first fuel stop." actionText="Log Entry" onAction={() => setShowForm(true)} />
      ) : (
        <Card>
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="bg-slate-50 border-b border-slate-200">
                <tr>
                  <th className="px-6 py-3 text-[11px] font-semibold text-slate-500 uppercase tracking-wider">Vehicle</th>
                  <th className="px-6 py-3 text-[11px] font-semibold text-slate-500 uppercase tracking-wider">Date</th>
                  <th className="px-6 py-3 text-[11px] font-semibold text-slate-500 uppercase tracking-wider">Odometer</th>
                  <th className="px-6 py-3 text-[11px] font-semibold text-slate-500 uppercase tracking-wider">Fuel (L)</th>
                  <th className="px-6 py-3 text-[11px] font-semibold text-slate-500 uppercase tracking-wider">Cost</th>
                  <th className="px-6 py-3 text-[11px] font-semibold text-slate-500 uppercase tracking-wider">Efficiency</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {logs.map(log => (
                  <tr key={log.id} className="hover:bg-slate-50/50 transition-colors">
                    <td className="px-6 py-3.5 font-semibold text-slate-900">{log.vehiclePlate || log.vehicleId}</td>
                    <td className="px-6 py-3.5 text-slate-600">{log.date}</td>
                    <td className="px-6 py-3.5 text-slate-600">{log.odometer.toLocaleString()} km</td>
                    <td className="px-6 py-3.5 text-slate-600">{log.fuelAmount} L</td>
                    <td className="px-6 py-3.5 text-slate-600">₹{log.cost.toLocaleString()}</td>
                    <td className="px-6 py-3.5">
                      <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold ${
                        log.efficiency >= 4 ? 'bg-emerald-50 text-emerald-700' : log.efficiency >= 3 ? 'bg-amber-50 text-amber-700' : 'bg-rose-50 text-rose-700'
                      }`}>
                        {log.efficiency} km/L
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      )}

      {/* Add Form */}
      <Dialog isOpen={showForm} onClose={() => setShowForm(false)} title="Log Fuel Entry"
        footerActions={<>
          <Button variant="outline" onClick={() => setShowForm(false)}>Cancel</Button>
          <Button isLoading={saving} onClick={handleSave}>Save Entry</Button>
        </>}
      >
        <div className="space-y-4">
          <div>
            <label className={labelClass}>Vehicle *</label>
            <select className={inputClass} value={form.vehicleId} onChange={e => setForm({ ...form, vehicleId: e.target.value })}>
              <option value="">Select vehicle…</option>
              {vehicles.map(v => <option key={v.id} value={v.id}>{v.plateNumber} - {v.model}</option>)}
            </select>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className={labelClass}>Date *</label>
              <input type="date" className={inputClass} value={form.date} onChange={e => setForm({ ...form, date: e.target.value })} />
            </div>
            <div>
              <label className={labelClass}>Odometer (km)</label>
              <input type="number" className={inputClass} value={form.odometer} onChange={e => setForm({ ...form, odometer: Number(e.target.value) })} />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className={labelClass}>Fuel Amount (L) *</label>
              <input type="number" className={inputClass} value={form.fuelAmount} onChange={e => setForm({ ...form, fuelAmount: Number(e.target.value) })} />
            </div>
            <div>
              <label className={labelClass}>Cost (₹) *</label>
              <input type="number" className={inputClass} value={form.cost} onChange={e => setForm({ ...form, cost: Number(e.target.value) })} />
            </div>
          </div>
        </div>
      </Dialog>
    </div>
  );
};
