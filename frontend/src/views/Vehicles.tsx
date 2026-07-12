import React, { useEffect, useState } from 'react';
import {
  Search, Plus, X, Grid3X3, List,
  Truck, ChevronRight
} from 'lucide-react';
import { vehicleService } from '../api/vehicleService';
import type { Vehicle } from '../types';
import { Card, CardContent } from '../components/card/card';
import { Button } from '../components/button/button';
import { Dialog } from '../components/dialog/dialog';
import { SkeletonLoader, EmptyState } from '../components/states/states';
import { useToast } from '../components/toast/toast';
import { StatusBadge } from '../components/badge/StatusBadge';

export const Vehicles: React.FC = () => {
  const { success, error } = useToast();
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState<'grid' | 'table'>('grid');
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [showForm, setShowForm] = useState(false);
  const [drawerVehicle, setDrawerVehicle] = useState<Vehicle | null>(null);
  const [saving, setSaving] = useState(false);

  // Form state
  const [form, setForm] = useState({
    registration_number: '', name: '', type: 'TRUCK' as Vehicle['type'],
    max_load_capacity: 0, acquisition_cost: 0, region: ''
  });

  const loadData = async () => {
    setLoading(true);
    try {
      const v = await vehicleService.getVehicles();
      setVehicles(v);
    } catch (e: any) {
      error(e.message || 'Failed to load vehicles');
    }
    setLoading(false);
  };

  useEffect(() => { loadData(); }, []);

  const filtered = vehicles.filter(v => {
    const matchSearch = v.registration_number.toLowerCase().includes(search.toLowerCase()) ||
      v.name.toLowerCase().includes(search.toLowerCase());
    const matchStatus = statusFilter === 'all' || v.status === statusFilter;
    return matchSearch && matchStatus;
  });

  const openForm = () => {
    setForm({ registration_number: '', name: '', type: 'TRUCK', max_load_capacity: 0, acquisition_cost: 0, region: '' });
    setShowForm(true);
  };

  const handleSave = async () => {
    if (!form.registration_number || !form.name) { error('Registration number and name are required.'); return; }
    setSaving(true);
    try {
      await vehicleService.saveVehicle(form);
      success(`Vehicle ${form.registration_number} added to fleet.`);
      setShowForm(false);
      loadData();
    } catch (e: any) {
      error(e.message || 'Failed to save vehicle');
    }
    setSaving(false);
  };

  const handleRetire = async (id: number, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    try {
      await vehicleService.retireVehicle(id);
      success('Vehicle marked as RETIRED.');
      setDrawerVehicle(null);
      loadData();
    } catch (e: any) {
      error(e.message || 'Failed to retire vehicle');
    }
  };

  const handleStatusChange = async (id: number, newStatus: string) => {
    try {
      await vehicleService.updateVehicleStatus(id, newStatus);
      success(`Vehicle status updated to ${newStatus}.`);
      setDrawerVehicle(null);
      loadData();
    } catch (e: any) {
      error(e.message || 'Failed to update status');
    }
  };

  const inputClass = 'w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all';

  const labelClass = 'block text-xs font-semibold text-slate-700 mb-1';

  if (loading) {
    return <div className="space-y-6"><SkeletonLoader type="kpi" /><SkeletonLoader type="table" /></div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="flex items-center gap-3 flex-1">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <input className={`${inputClass} pl-9`} placeholder="Search by registration or name…" value={search} onChange={e => setSearch(e.target.value)} />
          </div>
          <select className={`${inputClass} w-auto`} value={statusFilter} onChange={e => setStatusFilter(e.target.value)}>
            <option value="all">All Status</option>
            <option value="AVAILABLE">Available</option>
            <option value="ON_TRIP">On Trip</option>
            <option value="IN_SHOP">In Shop</option>
            <option value="RETIRED">Retired</option>
          </select>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex border border-slate-300 rounded-lg overflow-hidden">
            <button onClick={() => setViewMode('grid')} className={`p-2 ${viewMode === 'grid' ? 'bg-indigo-50 text-indigo-600' : 'text-slate-400 hover:text-slate-600'}`}>
              <Grid3X3 className="h-4 w-4" />
            </button>
            <button onClick={() => setViewMode('table')} className={`p-2 ${viewMode === 'table' ? 'bg-indigo-50 text-indigo-600' : 'text-slate-400 hover:text-slate-600'}`}>
              <List className="h-4 w-4" />
            </button>
          </div>
          <Button leftIcon={<Plus className="h-4 w-4" />} onClick={() => openForm()}>Add Vehicle</Button>
        </div>
      </div>

      {filtered.length === 0 ? (
        <EmptyState title="No vehicles found" description="Try adjusting your search or filter criteria." actionText="Add Vehicle" onAction={() => openForm()} />
      ) : viewMode === 'grid' ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map(v => (
            <Card key={v.id} className="hover:shadow-md transition-shadow cursor-pointer" onClick={() => setDrawerVehicle(v)}>
              <CardContent className="p-5">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <div className="bg-slate-100 p-2.5 rounded-xl">
                      <Truck className="h-5 w-5 text-slate-600" />
                    </div>
                    <div>
                      <p className="text-sm font-bold text-slate-900">{v.registration_number}</p>
                      <p className="text-xs text-slate-500">{v.name}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <StatusBadge status={v.status} />
                    {v.status !== 'RETIRED' && v.status !== 'ON_TRIP' && (
                      <button
                        onClick={(e) => handleRetire(v.id, e)}
                        className="text-xs font-bold text-rose-600 bg-rose-50 hover:bg-rose-100 px-2.5 py-1 rounded-lg border border-rose-200 transition-colors"
                        title="Retire Vehicle"
                      >
                        Retire
                      </button>
                    )}
                  </div>
                </div>
                <div className="grid grid-cols-3 gap-3 pt-3 border-t border-slate-100">
                  <div>
                    <p className="text-[10px] text-slate-400 uppercase">Type</p>
                    <p className="text-xs font-semibold text-slate-700">{v.type}</p>
                  </div>
                  <div>
                    <p className="text-[10px] text-slate-400 uppercase">Capacity</p>
                    <p className="text-xs font-semibold text-slate-700">{v.max_load_capacity} kg</p>
                  </div>
                  <div>
                    <p className="text-[10px] text-slate-400 uppercase">Odometer</p>
                    <p className="text-xs font-semibold text-slate-700">{Number(v.odometer).toLocaleString()} km</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <Card>
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="bg-slate-50 border-b border-slate-200">
                <tr>
                  <th className="px-6 py-3 text-[11px] font-semibold text-slate-500 uppercase tracking-wider">Reg Number</th>
                  <th className="px-6 py-3 text-[11px] font-semibold text-slate-500 uppercase tracking-wider">Name</th>
                  <th className="px-6 py-3 text-[11px] font-semibold text-slate-500 uppercase tracking-wider">Type</th>
                  <th className="px-6 py-3 text-[11px] font-semibold text-slate-500 uppercase tracking-wider">Capacity</th>
                  <th className="px-6 py-3 text-[11px] font-semibold text-slate-500 uppercase tracking-wider">Odometer</th>
                  <th className="px-6 py-3 text-[11px] font-semibold text-slate-500 uppercase tracking-wider">Status</th>
                  <th className="px-6 py-3 text-[11px] font-semibold text-slate-500 uppercase tracking-wider text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filtered.map(v => (
                  <tr key={v.id} className="hover:bg-slate-50/50 transition-colors cursor-pointer" onClick={() => setDrawerVehicle(v)}>
                    <td className="px-6 py-3.5 font-semibold text-slate-900">{v.registration_number}</td>
                    <td className="px-6 py-3.5 text-slate-600">{v.name}</td>
                    <td className="px-6 py-3.5 text-slate-600">{v.type}</td>
                    <td className="px-6 py-3.5 text-slate-600">{v.max_load_capacity} kg</td>
                    <td className="px-6 py-3.5 text-slate-600">{Number(v.odometer).toLocaleString()} km</td>
                    <td className="px-6 py-3.5"><StatusBadge status={v.status} /></td>
                    <td className="px-6 py-3.5 text-right flex items-center justify-end gap-2" onClick={(e) => e.stopPropagation()}>
                      {v.status !== 'RETIRED' && v.status !== 'ON_TRIP' && (
                        <button
                          onClick={(e) => handleRetire(v.id, e)}
                          className="text-xs font-bold text-rose-600 bg-rose-50 hover:bg-rose-100 px-2.5 py-1 rounded-lg border border-rose-200 transition-colors"
                        >
                          Retire
                        </button>
                      )}
                      <ChevronRight className="h-4 w-4 text-slate-400 cursor-pointer" onClick={() => setDrawerVehicle(v)} />
                    </td>
                  </tr>
                ))}
              </tbody>

            </table>
          </div>
        </Card>
      )}

      <Dialog isOpen={showForm} onClose={() => setShowForm(false)} title="Add New Vehicle"
        footerActions={<>
          <Button variant="outline" onClick={() => setShowForm(false)}>Cancel</Button>
          <Button isLoading={saving} onClick={handleSave}>Add Vehicle</Button>
        </>}
      >
        <div className="space-y-4">
          <div>
            <label className={labelClass}>Registration Number *</label>
            <input className={inputClass} placeholder="KA-01-EQ-9999" value={form.registration_number} onChange={e => setForm({ ...form, registration_number: e.target.value })} />
          </div>
          <div>
            <label className={labelClass}>Vehicle Name *</label>
            <input className={inputClass} placeholder="Tata Prima 2026" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className={labelClass}>Vehicle Type</label>
              <select className={inputClass} value={form.type} onChange={e => setForm({ ...form, type: e.target.value as Vehicle['type'] })}>
                <option value="TRUCK">Truck</option>
                <option value="VAN">Van</option>
                <option value="CAR">Car</option>
              </select>
            </div>
            <div>
              <label className={labelClass}>Max Load Capacity (kg) *</label>
              <input type="number" className={inputClass} placeholder="e.g. 25000" value={form.max_load_capacity === 0 ? '' : form.max_load_capacity} onChange={e => setForm({ ...form, max_load_capacity: e.target.value === '' ? 0 : Number(e.target.value) })} />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className={labelClass}>Acquisition Cost (₹) *</label>
              <input type="number" className={inputClass} placeholder="e.g. 4500000" value={form.acquisition_cost === 0 ? '' : form.acquisition_cost} onChange={e => setForm({ ...form, acquisition_cost: e.target.value === '' ? 0 : Number(e.target.value) })} />
            </div>
            <div>
              <label className={labelClass}>Region</label>
              <input type="text" className={inputClass} placeholder="e.g. North Zone" value={form.region} onChange={e => setForm({ ...form, region: e.target.value })} />
            </div>
          </div>
        </div>
      </Dialog>

      {drawerVehicle && (
        <div className="fixed inset-0 z-40">
          <div className="fixed inset-0 bg-slate-900/30 backdrop-blur-xs" onClick={() => setDrawerVehicle(null)} />
          <div className="fixed right-0 top-0 h-full w-full max-w-md bg-white border-l border-slate-200 shadow-2xl overflow-y-auto animate-slide-in-right z-50">
            <div className="sticky top-0 bg-white border-b border-slate-100 px-6 py-4 flex items-center justify-between z-10">
              <div>
                <h3 className="text-base font-bold text-slate-900">{drawerVehicle.registration_number}</h3>
                <p className="text-xs text-slate-500">{drawerVehicle.name}</p>
              </div>
              <div className="flex items-center gap-2">
                <button onClick={() => setDrawerVehicle(null)} className="text-slate-400 hover:text-slate-600 transition-colors"><X className="h-5 w-5" /></button>
              </div>
            </div>
            <div className="p-6 space-y-6">
              <div className="flex items-center gap-3">
                <StatusBadge status={drawerVehicle.status} />
                <span className="text-xs text-slate-500">{drawerVehicle.type}</span>
              </div>
              <div>
                <h4 className="text-xs font-semibold text-slate-900 uppercase tracking-wide mb-3">Vehicle Details</h4>
                <div className="space-y-2.5">
                  {[
                    ['Odometer', `${Number(drawerVehicle.odometer).toLocaleString()} km`],
                    ['Max Capacity', `${drawerVehicle.max_load_capacity} kg`],
                    ['Cost', `₹${Number(drawerVehicle.acquisition_cost).toLocaleString()}`],
                    ['Region', drawerVehicle.region || 'N/A']
                  ].map(([label, val]) => (
                    <div key={label} className="flex items-center justify-between py-2 border-b border-slate-50">
                      <span className="text-xs text-slate-500">{label}</span>
                      <span className="text-xs font-semibold text-slate-800">{val}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="pt-4 border-t border-slate-100 space-y-4">
                <h4 className="text-xs font-semibold text-slate-900 uppercase tracking-wide">Change Vehicle Status</h4>
                <div className="flex items-center gap-2">
                  <select
                    className="flex-1 px-3 py-2 text-xs font-semibold bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    value={drawerVehicle.status}
                    onChange={(e) => handleStatusChange(drawerVehicle.id, e.target.value)}
                    disabled={drawerVehicle.status === 'ON_TRIP'}
                  >
                    <option value="AVAILABLE">AVAILABLE</option>
                    <option value="IN_SHOP">IN_SHOP</option>
                    <option value="RETIRED">RETIRED</option>
                  </select>
                </div>

                {drawerVehicle.status !== 'RETIRED' && drawerVehicle.status !== 'ON_TRIP' && (
                  <Button
                    variant="outline"
                    className="w-full text-rose-600 border-rose-200 hover:bg-rose-50 font-bold"
                    onClick={() => handleRetire(drawerVehicle.id)}
                  >
                    Retire Vehicle
                  </Button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

