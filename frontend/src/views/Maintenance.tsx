import React, { useEffect, useState } from 'react';
import { Wrench, Plus, Search, CheckCircle2, AlertCircle, Truck, Calendar, IndianRupee } from 'lucide-react';
import { maintenanceService } from '../api/maintenanceService';
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
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'OPEN' | 'CLOSED'>('all');
  const [showForm, setShowForm] = useState(false);
  const [saving, setSaving] = useState(false);

  const [form, setForm] = useState({
    vehicle_id: '',
    type: 'ROUTINE',
    description: '',
    cost: 0
  });

  const loadData = async () => {
    setLoading(true);
    try {
      const vList = await vehicleService.getVehicles().catch(err => {
        console.error("Failed loading vehicles:", err);
        return [];
      });
      setVehicles(vList);
      
      const mLogs = await maintenanceService.getMaintenanceLogs().catch(err => {
        console.error("Failed loading maintenance logs:", err);
        return [];
      });
      setLogs(mLogs);
    } catch (e: any) {
      error(e.message || 'Failed to load maintenance data');
    }
    setLoading(false);
  };

  useEffect(() => { loadData(); }, []);

  const getVehicleReg = (vid: number) => {
    const v = vehicles.find(vec => vec.id === vid);
    return v ? `${v.registration_number} (${v.name})` : `Vehicle #${vid}`;
  };

  const filteredLogs = logs.filter(log => {
    const reg = getVehicleReg(log.vehicle_id).toLowerCase();
    const desc = (log.description || '').toLowerCase();
    const matchSearch = reg.includes(search.toLowerCase()) || desc.includes(search.toLowerCase()) || log.type.toLowerCase().includes(search.toLowerCase());
    const matchStatus = statusFilter === 'all' || log.status === statusFilter;
    return matchSearch && matchStatus;
  });

  const handleSave = async () => {
    if (!form.vehicle_id) {
      error('Please select a vehicle.');
      return;
    }
    setSaving(true);
    try {
      await maintenanceService.createMaintenanceLog({
        vehicle_id: Number(form.vehicle_id),
        type: form.type,
        description: form.description || 'General Service',
        cost: Number(form.cost)
      });
      success('Maintenance scheduled. Vehicle marked IN_SHOP.');
      setShowForm(false);
      setForm({ vehicle_id: '', type: 'ROUTINE', description: '', cost: 0 });
      loadData();
    } catch (e: any) {
      error(e.message || 'Failed to create maintenance log');
    }
    setSaving(false);
  };

  const handleClose = async (id: number) => {
    try {
      await maintenanceService.closeMaintenanceLog(id);
      success('Maintenance completed! Vehicle released back to fleet as AVAILABLE.');
      loadData();
    } catch (e: any) {
      error(e.message || 'Failed to complete maintenance log');
    }
  };

  const totalCost = logs.reduce((acc, curr) => acc + Number(curr.cost || 0), 0);
  const openCount = logs.filter(l => l.status === 'OPEN').length;
  const inShopVehicles = vehicles.filter(v => v.status === 'IN_SHOP').length;

  const inputClass = 'w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all';
  const labelClass = 'block text-xs font-semibold text-slate-700 mb-1';

  if (loading) {
    return <div className="space-y-6"><SkeletonLoader type="kpi" /><SkeletonLoader type="table" /></div>;
  }

  return (
    <div className="space-y-6">
      {/* Header & KPI Summary */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Fleet Maintenance & Repairs</h1>
          <p className="text-xs text-slate-500 mt-1">Manage routine servicing, emergency repairs, and shop work orders.</p>
        </div>
        <Button onClick={() => setShowForm(true)} className="flex items-center gap-1.5 shadow-crystal-btn">
          <Plus className="h-4 w-4" /> Schedule Service
        </Button>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        <Card className="border-l-4 border-l-amber-500">
          <CardContent className="p-5 flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Active Shop Orders</p>
              <p className="text-2xl font-bold text-slate-900 mt-1">{openCount}</p>
            </div>
            <div className="bg-amber-50 p-3 rounded-xl text-amber-600">
              <AlertCircle className="h-6 w-6" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-indigo-500">
          <CardContent className="p-5 flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Vehicles Currently In Shop</p>
              <p className="text-2xl font-bold text-slate-900 mt-1">{inShopVehicles}</p>
            </div>
            <div className="bg-indigo-50 p-3 rounded-xl text-indigo-600">
              <Truck className="h-6 w-6" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-emerald-500">
          <CardContent className="p-5 flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Total Maintenance Expenditure</p>
              <p className="text-2xl font-bold text-slate-900 mt-1">₹{totalCost.toLocaleString()}</p>
            </div>
            <div className="bg-emerald-50 p-3 rounded-xl text-emerald-600">
              <IndianRupee className="h-6 w-6" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters & Search */}
      <Card>
        <CardContent className="p-4 flex flex-col md:flex-row items-center justify-between gap-4 border-b border-slate-100">
          <div className="relative w-full md:w-80">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <input
              type="text"
              placeholder="Search by vehicle or description…"
              className="w-full pl-10 pr-4 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all bg-slate-50/50"
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
          </div>
          <div className="flex items-center gap-2 w-full md:w-auto">
            <span className="text-xs font-semibold text-slate-500">Filter Status:</span>
            {(['all', 'OPEN', 'CLOSED'] as const).map(st => (
              <button
                key={st}
                onClick={() => setStatusFilter(st)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                  statusFilter === st
                    ? 'bg-indigo-600 text-white shadow-crystal-btn'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                {st === 'all' ? 'All Orders' : st === 'OPEN' ? 'In Progress' : 'Completed'}
              </button>
            ))}
          </div>
        </CardContent>

        <div className="overflow-x-auto">
          {filteredLogs.length === 0 ? (
            <EmptyState
              title="No maintenance records found"
              description="Schedule routine maintenance or repairs using the button above."
              action={<Button onClick={() => setShowForm(true)}>+ Schedule Service</Button>}
            />
          ) : (
            <table className="w-full text-sm text-left">
              <thead className="bg-slate-50 border-b border-slate-200">
                <tr>
                  <th className="px-6 py-3 text-[11px] font-semibold text-slate-500 uppercase tracking-wider">Order ID</th>
                  <th className="px-6 py-3 text-[11px] font-semibold text-slate-500 uppercase tracking-wider">Vehicle</th>
                  <th className="px-6 py-3 text-[11px] font-semibold text-slate-500 uppercase tracking-wider">Service Type</th>
                  <th className="px-6 py-3 text-[11px] font-semibold text-slate-500 uppercase tracking-wider">Description</th>
                  <th className="px-6 py-3 text-[11px] font-semibold text-slate-500 uppercase tracking-wider">Cost</th>
                  <th className="px-6 py-3 text-[11px] font-semibold text-slate-500 uppercase tracking-wider">Status</th>
                  <th className="px-6 py-3 text-[11px] font-semibold text-slate-500 uppercase tracking-wider text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredLogs.map(log => (
                  <tr key={log.id} className="hover:bg-slate-50/50 transition-colors">
                    <td className="px-6 py-3.5 font-bold text-slate-900">#REP-{log.id}</td>
                    <td className="px-6 py-3.5 font-semibold text-indigo-600">{getVehicleReg(log.vehicle_id)}</td>
                    <td className="px-6 py-3.5">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wide bg-slate-100 text-slate-800 border border-slate-200">
                        {log.type}
                      </span>
                    </td>
                    <td className="px-6 py-3.5 text-slate-600 max-w-xs truncate">{log.description || 'General Service'}</td>
                    <td className="px-6 py-3.5 font-semibold text-slate-900">₹{Number(log.cost || 0).toLocaleString()}</td>
                    <td className="px-6 py-3.5">
                      {log.status === 'OPEN' ? (
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-amber-50 text-amber-700 border border-amber-200">
                          <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse" />
                          In Shop (Open)
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                          <CheckCircle2 className="h-3.5 w-3.5" />
                          Completed
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-3.5 text-right">
                      {log.status === 'OPEN' ? (
                        <Button
                          size="sm"
                          className="bg-emerald-600 hover:bg-emerald-700 text-white shadow-xs"
                          onClick={() => handleClose(log.id)}
                        >
                          Mark Completed
                        </Button>
                      ) : (
                        <span className="text-xs text-slate-400 italic">Released to Fleet</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </Card>

      {/* Schedule Maintenance Modal */}
      <Dialog
        isOpen={showForm}
        onClose={() => setShowForm(false)}
        title="Schedule Vehicle Maintenance"
        footerActions={<>
          <Button variant="outline" onClick={() => setShowForm(false)}>Cancel</Button>
          <Button isLoading={saving} onClick={handleSave}>Confirm & Move to Shop</Button>
        </>}
      >
        <div className="space-y-4">
          <div>
            <label className={labelClass}>Select Vehicle *</label>
            <select
              className={inputClass}
              value={form.vehicle_id}
              onChange={e => setForm({ ...form, vehicle_id: e.target.value })}
            >
              <option value="">Choose vehicle for service…</option>
              {vehicles.map(v => (
                <option key={v.id} value={v.id} disabled={v.status === 'IN_SHOP'}>
                  {v.registration_number} ({v.name}) - {v.status === 'IN_SHOP' ? 'Already in Shop' : v.status}
                </option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className={labelClass}>Service Type</label>
              <select
                className={inputClass}
                value={form.type}
                onChange={e => setForm({ ...form, type: e.target.value })}
              >
                <option value="ROUTINE">Routine Servicing</option>
                <option value="REPAIR">Mechanical / Electrical Repair</option>
                <option value="INSPECTION">Safety / Fitness Inspection</option>
                <option value="EMERGENCY">Emergency Breakdown</option>
              </select>
            </div>
            <div>
              <label className={labelClass}>Estimated / Actual Cost (₹) *</label>
              <input
                type="number"
                className={inputClass}
                placeholder="e.g. 12500"
                value={form.cost === 0 ? '' : form.cost}
                onChange={e => setForm({ ...form, cost: e.target.value === '' ? 0 : Number(e.target.value) })}
              />
            </div>
          </div>

          <div>
            <label className={labelClass}>Work Order Description *</label>
            <textarea
              className={`${inputClass} resize-none`}
              rows={3}
              placeholder="e.g. Engine tune-up, brake pad replacement, and wheel balancing…"
              value={form.description}
              onChange={e => setForm({ ...form, description: e.target.value })}
            />
          </div>
        </div>
      </Dialog>
    </div>
  );
};
