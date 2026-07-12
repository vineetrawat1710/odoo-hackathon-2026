import React, { useEffect, useState } from 'react';
import { Plus, Wrench, Calendar, CheckCircle } from 'lucide-react';
import { tripService } from '../api/tripService';
import { vehicleService } from '../api/vehicleService';
import type { MaintenanceLog, Vehicle } from '../types';
import { Card, CardContent } from '../components/card/card';
import { Button } from '../components/button/button';
import { Dialog } from '../components/dialog/dialog';
import { SkeletonLoader, EmptyState } from '../components/states/states';
import { useToast } from '../components/toast/toast';

export const Maintenance: React.FC = () => {
  const { success, error } = useToast();
  const [logs, setLogs] = useState<MaintenanceLog[]>([]);
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [saving, setSaving] = useState(false);
  const [statusFilter, setStatusFilter] = useState('all');
  const [form, setForm] = useState({
    vehicleId: '', serviceType: 'Routine' as MaintenanceLog['serviceType'],
    description: '', cost: 0, status: 'scheduled' as MaintenanceLog['status'], startDate: ''
  });

  const loadData = async () => {
    setLoading(true);
    const [m, v] = await Promise.all([tripService.getMaintenanceLogs(), vehicleService.getVehicles()]);
    setLogs(m); setVehicles(v);
    setLoading(false);
  };

  useEffect(() => { loadData(); }, []);

  const filtered = logs.filter(l => statusFilter === 'all' || l.status === statusFilter);

  const handleSave = async () => {
    if (!form.vehicleId || !form.description) { error('Vehicle and description are required.'); return; }
    setSaving(true);
    const log: MaintenanceLog = { id: `m-${Date.now()}`, ...form };
    await tripService.saveMaintenanceLog(log);
    success('Maintenance entry logged successfully.');
    setSaving(false); setShowForm(false);
    loadData();
  };

  const handleComplete = async (log: MaintenanceLog) => {
    const updated = { ...log, status: 'completed' as MaintenanceLog['status'], completionDate: new Date().toISOString().split('T')[0] };
    await tripService.saveMaintenanceLog(updated);
    success(`Service completed for ${log.vehiclePlate || log.vehicleId}.`);
    loadData();
  };

  const statusBadge = (status: string) => {
    const s: Record<string, string> = {
      scheduled: 'bg-blue-50 text-blue-700', 'in-progress': 'bg-amber-50 text-amber-700', completed: 'bg-emerald-50 text-emerald-700'
    };
    return <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold ${s[status]}`}>{status}</span>;
  };

  const inputClass = 'w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all';
  const labelClass = 'block text-xs font-semibold text-slate-700 mb-1';

  if (loading) return <div className="space-y-6"><SkeletonLoader type="table" /></div>;

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-4 flex items-center gap-3">
            <div className="bg-amber-50 p-2 rounded-lg"><Wrench className="h-5 w-5 text-amber-600" /></div>
            <div><p className="text-[10px] text-slate-400 uppercase">In Progress</p><p className="text-xl font-bold text-slate-900">{logs.filter(l => l.status === 'in-progress').length}</p></div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 flex items-center gap-3">
            <div className="bg-blue-50 p-2 rounded-lg"><Calendar className="h-5 w-5 text-blue-600" /></div>
            <div><p className="text-[10px] text-slate-400 uppercase">Scheduled</p><p className="text-xl font-bold text-slate-900">{logs.filter(l => l.status === 'scheduled').length}</p></div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 flex items-center gap-3">
            <div className="bg-emerald-50 p-2 rounded-lg"><CheckCircle className="h-5 w-5 text-emerald-600" /></div>
            <div><p className="text-[10px] text-slate-400 uppercase">Completed</p><p className="text-xl font-bold text-slate-900">{logs.filter(l => l.status === 'completed').length}</p></div>
          </CardContent>
        </Card>
      </div>

      {/* Controls */}
      <div className="flex items-center justify-between">
        <select className={`${inputClass} w-auto`} value={statusFilter} onChange={e => setStatusFilter(e.target.value)}>
          <option value="all">All Status</option>
          <option value="scheduled">Scheduled</option>
          <option value="in-progress">In Progress</option>
          <option value="completed">Completed</option>
        </select>
        <Button leftIcon={<Plus className="h-4 w-4" />} onClick={() => setShowForm(true)}>Schedule Service</Button>
      </div>

      {/* Table */}
      {filtered.length === 0 ? (
        <EmptyState title="No maintenance records" description="Schedule a service to start tracking." actionText="Schedule Service" onAction={() => setShowForm(true)} />
      ) : (
        <Card>
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="bg-slate-50 border-b border-slate-200">
                <tr>
                  <th className="px-6 py-3 text-[11px] font-semibold text-slate-500 uppercase tracking-wider">Vehicle</th>
                  <th className="px-6 py-3 text-[11px] font-semibold text-slate-500 uppercase tracking-wider">Service Type</th>
                  <th className="px-6 py-3 text-[11px] font-semibold text-slate-500 uppercase tracking-wider">Description</th>
                  <th className="px-6 py-3 text-[11px] font-semibold text-slate-500 uppercase tracking-wider">Cost</th>
                  <th className="px-6 py-3 text-[11px] font-semibold text-slate-500 uppercase tracking-wider">Start Date</th>
                  <th className="px-6 py-3 text-[11px] font-semibold text-slate-500 uppercase tracking-wider">Status</th>
                  <th className="px-6 py-3"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filtered.map(log => (
                  <tr key={log.id} className="hover:bg-slate-50/50 transition-colors">
                    <td className="px-6 py-3.5 font-semibold text-slate-900">{log.vehiclePlate || log.vehicleId}</td>
                    <td className="px-6 py-3.5 text-slate-600">{log.serviceType}</td>
                    <td className="px-6 py-3.5 text-slate-600 max-w-xs truncate">{log.description}</td>
                    <td className="px-6 py-3.5 text-slate-600">₹{log.cost.toLocaleString()}</td>
                    <td className="px-6 py-3.5 text-slate-600">{log.startDate}</td>
                    <td className="px-6 py-3.5">{statusBadge(log.status)}</td>
                    <td className="px-6 py-3.5">
                      {log.status !== 'completed' && (
                        <Button size="sm" variant="outline" onClick={() => handleComplete(log)}>
                          Complete
                        </Button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      )}

      {/* Add Form */}
      <Dialog isOpen={showForm} onClose={() => setShowForm(false)} title="Schedule Maintenance Service"
        footerActions={<>
          <Button variant="outline" onClick={() => setShowForm(false)}>Cancel</Button>
          <Button isLoading={saving} onClick={handleSave}>Schedule Service</Button>
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
              <label className={labelClass}>Service Type</label>
              <select className={inputClass} value={form.serviceType} onChange={e => setForm({ ...form, serviceType: e.target.value as MaintenanceLog['serviceType'] })}>
                <option value="Routine">Routine</option>
                <option value="Repair">Repair</option>
                <option value="Inspection">Inspection</option>
                <option value="Breakdown">Breakdown</option>
              </select>
            </div>
            <div>
              <label className={labelClass}>Status</label>
              <select className={inputClass} value={form.status} onChange={e => setForm({ ...form, status: e.target.value as MaintenanceLog['status'] })}>
                <option value="scheduled">Scheduled</option>
                <option value="in-progress">In Progress</option>
              </select>
            </div>
          </div>
          <div>
            <label className={labelClass}>Description *</label>
            <textarea className={`${inputClass} resize-none`} rows={3} placeholder="Engine overhaul and coolant flush…" value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className={labelClass}>Estimated Cost (₹)</label>
              <input type="number" className={inputClass} value={form.cost} onChange={e => setForm({ ...form, cost: Number(e.target.value) })} />
            </div>
            <div>
              <label className={labelClass}>Start Date</label>
              <input type="date" className={inputClass} value={form.startDate} onChange={e => setForm({ ...form, startDate: e.target.value })} />
            </div>
          </div>
        </div>
      </Dialog>
    </div>
  );
};
