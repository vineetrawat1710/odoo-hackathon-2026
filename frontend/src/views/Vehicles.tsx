import React, { useEffect, useState } from 'react';
import {
  Search, Plus, X, Grid3X3, List,
  Truck, Fuel, Gauge, Thermometer, Battery, Calendar, ChevronRight
} from 'lucide-react';
import { vehicleService } from '../api/vehicleService';
import { tripService } from '../api/tripService';
import type { Vehicle, MaintenanceLog } from '../types';
import { Card, CardContent } from '../components/card/card';
import { Button } from '../components/button/button';
import { Dialog } from '../components/dialog/dialog';
import { SkeletonLoader, EmptyState } from '../components/states/states';
import { useToast } from '../components/toast/toast';

export const Vehicles: React.FC = () => {
  const { success, error } = useToast();
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [maintenance, setMaintenance] = useState<MaintenanceLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState<'grid' | 'table'>('grid');
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [fuelFilter, setFuelFilter] = useState<string>('all');
  const [showForm, setShowForm] = useState(false);
  const [editVehicle, setEditVehicle] = useState<Vehicle | null>(null);
  const [drawerVehicle, setDrawerVehicle] = useState<Vehicle | null>(null);
  const [saving, setSaving] = useState(false);

  // Form state
  const [form, setForm] = useState({
    plateNumber: '', model: '', type: 'Truck' as Vehicle['type'],
    fuelType: 'Diesel' as Vehicle['fuelType'], mileage: 0, nextService: '', roi: 0
  });

  const loadData = async () => {
    setLoading(true);
    const [v, m] = await Promise.all([vehicleService.getVehicles(), tripService.getMaintenanceLogs()]);
    setVehicles(v);
    setMaintenance(m);
    setLoading(false);
  };

  useEffect(() => { loadData(); }, []);

  const filtered = vehicles.filter(v => {
    const matchSearch = v.plateNumber.toLowerCase().includes(search.toLowerCase()) ||
      v.model.toLowerCase().includes(search.toLowerCase());
    const matchStatus = statusFilter === 'all' || v.status === statusFilter;
    const matchFuel = fuelFilter === 'all' || v.fuelType === fuelFilter;
    return matchSearch && matchStatus && matchFuel;
  });

  const openForm = (vehicle?: Vehicle) => {
    if (vehicle) {
      setEditVehicle(vehicle);
      setForm({
        plateNumber: vehicle.plateNumber, model: vehicle.model, type: vehicle.type,
        fuelType: vehicle.fuelType, mileage: vehicle.mileage, nextService: vehicle.nextService, roi: vehicle.roi
      });
    } else {
      setEditVehicle(null);
      setForm({ plateNumber: '', model: '', type: 'Truck', fuelType: 'Diesel', mileage: 0, nextService: '', roi: 0 });
    }
    setShowForm(true);
  };

  const handleSave = async () => {
    if (!form.plateNumber || !form.model) { error('Plate number and model are required.'); return; }
    setSaving(true);
    const vehicle: Vehicle = {
      id: editVehicle ? editVehicle.id : `v-${Date.now()}`,
      ...form,
      status: editVehicle ? editVehicle.status : 'available',
      telemetry: editVehicle ? editVehicle.telemetry : { speed: 0, fuelLevel: 100, batteryStatus: 'Good', coolantTemp: 75, latitude: 28.6139, longitude: 77.2090 }
    };
    await vehicleService.saveVehicle(vehicle);
    success(editVehicle ? `Vehicle ${vehicle.plateNumber} updated.` : `Vehicle ${vehicle.plateNumber} added to fleet.`);
    setSaving(false);
    setShowForm(false);
    loadData();
  };

  const handleDelete = async (id: string) => {
    await vehicleService.deleteVehicle(id);
    success('Vehicle removed from fleet registry.');
    loadData();
    setDrawerVehicle(null);
  };

  const statusBadge = (status: string) => {
    const styles: Record<string, string> = {
      available: 'bg-emerald-50 text-emerald-700',
      active: 'bg-blue-50 text-blue-700',
      maintenance: 'bg-amber-50 text-amber-700'
    };
    return <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold ${styles[status] || 'bg-slate-100 text-slate-600'}`}>{status}</span>;
  };

  const inputClass = 'w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all';
  const labelClass = 'block text-xs font-semibold text-slate-700 mb-1';

  const vehicleMaintenance = (vehicleId: string) => maintenance.filter(m => m.vehicleId === vehicleId);

  if (loading) {
    return <div className="space-y-6"><SkeletonLoader type="kpi" /><SkeletonLoader type="table" /></div>;
  }

  return (
    <div className="space-y-6">
      {/* Top Controls */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="flex items-center gap-3 flex-1">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <input className={`${inputClass} pl-9`} placeholder="Search by plate or model…" value={search} onChange={e => setSearch(e.target.value)} />
          </div>
          <select className={`${inputClass} w-auto`} value={statusFilter} onChange={e => setStatusFilter(e.target.value)}>
            <option value="all">All Status</option>
            <option value="available">Available</option>
            <option value="active">Active</option>
            <option value="maintenance">Maintenance</option>
          </select>
          <select className={`${inputClass} w-auto`} value={fuelFilter} onChange={e => setFuelFilter(e.target.value)}>
            <option value="all">All Fuel Types</option>
            <option value="Diesel">Diesel</option>
            <option value="CNG">CNG</option>
            <option value="Electric">Electric</option>
          </select>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex border border-slate-300 rounded-lg overflow-hidden">
            <button onClick={() => setViewMode('grid')} className={`p-2 ${viewMode === 'grid' ? 'bg-blue-50 text-blue-600' : 'text-slate-400 hover:text-slate-600'}`}>
              <Grid3X3 className="h-4 w-4" />
            </button>
            <button onClick={() => setViewMode('table')} className={`p-2 ${viewMode === 'table' ? 'bg-blue-50 text-blue-600' : 'text-slate-400 hover:text-slate-600'}`}>
              <List className="h-4 w-4" />
            </button>
          </div>
          <Button leftIcon={<Plus className="h-4 w-4" />} onClick={() => openForm()}>Add Vehicle</Button>
        </div>
      </div>

      {/* Content */}
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
                      <p className="text-sm font-bold text-slate-900">{v.plateNumber}</p>
                      <p className="text-xs text-slate-500">{v.model}</p>
                    </div>
                  </div>
                  {statusBadge(v.status)}
                </div>
                <div className="grid grid-cols-3 gap-3 pt-3 border-t border-slate-100">
                  <div>
                    <p className="text-[10px] text-slate-400 uppercase">Type</p>
                    <p className="text-xs font-semibold text-slate-700">{v.type}</p>
                  </div>
                  <div>
                    <p className="text-[10px] text-slate-400 uppercase">Fuel</p>
                    <p className="text-xs font-semibold text-slate-700">{v.fuelType}</p>
                  </div>
                  <div>
                    <p className="text-[10px] text-slate-400 uppercase">Mileage</p>
                    <p className="text-xs font-semibold text-slate-700">{v.mileage.toLocaleString()} km</p>
                  </div>
                </div>
                <div className="mt-3 flex items-center gap-2">
                  <div className="flex-1 bg-slate-100 rounded-full h-1.5">
                    <div className="bg-blue-500 h-1.5 rounded-full transition-all" style={{ width: `${v.roi}%` }} />
                  </div>
                  <span className="text-[10px] font-semibold text-slate-500">{v.roi}% ROI</span>
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
                  <th className="px-6 py-3 text-[11px] font-semibold text-slate-500 uppercase tracking-wider">Plate</th>
                  <th className="px-6 py-3 text-[11px] font-semibold text-slate-500 uppercase tracking-wider">Model</th>
                  <th className="px-6 py-3 text-[11px] font-semibold text-slate-500 uppercase tracking-wider">Type</th>
                  <th className="px-6 py-3 text-[11px] font-semibold text-slate-500 uppercase tracking-wider">Fuel</th>
                  <th className="px-6 py-3 text-[11px] font-semibold text-slate-500 uppercase tracking-wider">Mileage</th>
                  <th className="px-6 py-3 text-[11px] font-semibold text-slate-500 uppercase tracking-wider">Status</th>
                  <th className="px-6 py-3 text-[11px] font-semibold text-slate-500 uppercase tracking-wider">ROI</th>
                  <th className="px-6 py-3"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filtered.map(v => (
                  <tr key={v.id} className="hover:bg-slate-50/50 transition-colors cursor-pointer" onClick={() => setDrawerVehicle(v)}>
                    <td className="px-6 py-3.5 font-semibold text-slate-900">{v.plateNumber}</td>
                    <td className="px-6 py-3.5 text-slate-600">{v.model}</td>
                    <td className="px-6 py-3.5 text-slate-600">{v.type}</td>
                    <td className="px-6 py-3.5 text-slate-600">{v.fuelType}</td>
                    <td className="px-6 py-3.5 text-slate-600">{v.mileage.toLocaleString()} km</td>
                    <td className="px-6 py-3.5">{statusBadge(v.status)}</td>
                    <td className="px-6 py-3.5 text-slate-600">{v.roi}%</td>
                    <td className="px-6 py-3.5"><ChevronRight className="h-4 w-4 text-slate-400" /></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      )}

      {/* Add/Edit Dialog */}
      <Dialog isOpen={showForm} onClose={() => setShowForm(false)} title={editVehicle ? 'Edit Vehicle' : 'Add New Vehicle'}
        footerActions={<>
          <Button variant="outline" onClick={() => setShowForm(false)}>Cancel</Button>
          <Button isLoading={saving} onClick={handleSave}>{editVehicle ? 'Update' : 'Add Vehicle'}</Button>
        </>}
      >
        <div className="space-y-4">
          <div>
            <label className={labelClass}>Plate Number *</label>
            <input className={inputClass} placeholder="MH12AB4567" value={form.plateNumber} onChange={e => setForm({ ...form, plateNumber: e.target.value })} />
          </div>
          <div>
            <label className={labelClass}>Model Name *</label>
            <input className={inputClass} placeholder="Tata Prima 5530" value={form.model} onChange={e => setForm({ ...form, model: e.target.value })} />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className={labelClass}>Vehicle Type</label>
              <select className={inputClass} value={form.type} onChange={e => setForm({ ...form, type: e.target.value as Vehicle['type'] })}>
                <option value="Truck">Truck</option>
                <option value="Trailer">Trailer</option>
                <option value="LCV">LCV</option>
                <option value="Dumper">Dumper</option>
              </select>
            </div>
            <div>
              <label className={labelClass}>Fuel Type</label>
              <select className={inputClass} value={form.fuelType} onChange={e => setForm({ ...form, fuelType: e.target.value as Vehicle['fuelType'] })}>
                <option value="Diesel">Diesel</option>
                <option value="CNG">CNG</option>
                <option value="Electric">Electric</option>
              </select>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className={labelClass}>Current Mileage (km)</label>
              <input type="number" className={inputClass} value={form.mileage} onChange={e => setForm({ ...form, mileage: Number(e.target.value) })} />
            </div>
            <div>
              <label className={labelClass}>Next Service Date</label>
              <input type="date" className={inputClass} value={form.nextService} onChange={e => setForm({ ...form, nextService: e.target.value })} />
            </div>
          </div>
        </div>
      </Dialog>

      {/* Vehicle Detail Drawer */}
      {drawerVehicle && (
        <div className="fixed inset-0 z-40">
          <div className="fixed inset-0 bg-slate-900/30 backdrop-blur-xs" onClick={() => setDrawerVehicle(null)} />
          <div className="fixed right-0 top-0 h-full w-full max-w-md bg-white border-l border-slate-200 shadow-2xl overflow-y-auto animate-slide-in-right z-50">
            <div className="sticky top-0 bg-white border-b border-slate-100 px-6 py-4 flex items-center justify-between z-10">
              <div>
                <h3 className="text-base font-bold text-slate-900">{drawerVehicle.plateNumber}</h3>
                <p className="text-xs text-slate-500">{drawerVehicle.model}</p>
              </div>
              <div className="flex items-center gap-2">
                <Button size="sm" variant="outline" onClick={() => { openForm(drawerVehicle); setDrawerVehicle(null); }}>Edit</Button>
                <button onClick={() => setDrawerVehicle(null)} className="text-slate-400 hover:text-slate-600 transition-colors"><X className="h-5 w-5" /></button>
              </div>
            </div>

            <div className="p-6 space-y-6">
              {/* Status + Type */}
              <div className="flex items-center gap-3">
                {statusBadge(drawerVehicle.status)}
                <span className="text-xs text-slate-500">{drawerVehicle.type} • {drawerVehicle.fuelType}</span>
              </div>

              {/* Telemetry Gauges */}
              <div>
                <h4 className="text-xs font-semibold text-slate-900 uppercase tracking-wide mb-3">Live Telemetry</h4>
                <div className="grid grid-cols-2 gap-3">
                  <div className="bg-slate-50 border border-slate-200 rounded-lg p-3 flex items-center gap-3">
                    <Gauge className="h-4 w-4 text-blue-500" />
                    <div><p className="text-[10px] text-slate-400">Speed</p><p className="text-sm font-bold text-slate-900">{drawerVehicle.telemetry.speed} km/h</p></div>
                  </div>
                  <div className="bg-slate-50 border border-slate-200 rounded-lg p-3 flex items-center gap-3">
                    <Fuel className="h-4 w-4 text-emerald-500" />
                    <div><p className="text-[10px] text-slate-400">Fuel Level</p><p className="text-sm font-bold text-slate-900">{drawerVehicle.telemetry.fuelLevel}%</p></div>
                  </div>
                  <div className="bg-slate-50 border border-slate-200 rounded-lg p-3 flex items-center gap-3">
                    <Battery className="h-4 w-4 text-amber-500" />
                    <div><p className="text-[10px] text-slate-400">Battery</p><p className="text-sm font-bold text-slate-900">{drawerVehicle.telemetry.batteryStatus}</p></div>
                  </div>
                  <div className="bg-slate-50 border border-slate-200 rounded-lg p-3 flex items-center gap-3">
                    <Thermometer className="h-4 w-4 text-rose-500" />
                    <div><p className="text-[10px] text-slate-400">Coolant</p><p className="text-sm font-bold text-slate-900">{drawerVehicle.telemetry.coolantTemp}°C</p></div>
                  </div>
                </div>
              </div>

              {/* Details */}
              <div>
                <h4 className="text-xs font-semibold text-slate-900 uppercase tracking-wide mb-3">Vehicle Details</h4>
                <div className="space-y-2.5">
                  {[
                    ['Odometer', `${drawerVehicle.mileage.toLocaleString()} km`],
                    ['Next Service', drawerVehicle.nextService],
                    ['ROI', `${drawerVehicle.roi}%`],
                    ['GPS', `${drawerVehicle.telemetry.latitude.toFixed(4)}, ${drawerVehicle.telemetry.longitude.toFixed(4)}`]
                  ].map(([label, val]) => (
                    <div key={label} className="flex items-center justify-between py-2 border-b border-slate-50">
                      <span className="text-xs text-slate-500">{label}</span>
                      <span className="text-xs font-semibold text-slate-800">{val}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Maintenance Timeline */}
              <div>
                <h4 className="text-xs font-semibold text-slate-900 uppercase tracking-wide mb-3">Maintenance Timeline</h4>
                {vehicleMaintenance(drawerVehicle.id).length === 0 ? (
                  <p className="text-xs text-slate-400 text-center py-4">No maintenance records for this vehicle.</p>
                ) : (
                  <div className="relative pl-6 border-l-2 border-slate-200 space-y-4">
                    {vehicleMaintenance(drawerVehicle.id).map(log => (
                      <div key={log.id} className="relative">
                        <div className={`absolute -left-[25px] h-3 w-3 rounded-full border-2 border-white ${
                          log.status === 'completed' ? 'bg-emerald-500' :
                          log.status === 'in-progress' ? 'bg-amber-500' : 'bg-blue-400'
                        }`} />
                        <div className="bg-slate-50 border border-slate-200 rounded-lg p-3">
                          <div className="flex items-center justify-between mb-1">
                            <span className="text-xs font-semibold text-slate-800">{log.serviceType}</span>
                            {statusBadge(log.status)}
                          </div>
                          <p className="text-[11px] text-slate-500">{log.description}</p>
                          <div className="flex items-center gap-3 mt-2 text-[10px] text-slate-400">
                            <span className="flex items-center gap-1"><Calendar className="h-3 w-3" /> {log.startDate}</span>
                            <span>₹{log.cost.toLocaleString()}</span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Danger Zone */}
              <div className="border-t border-slate-100 pt-4">
                <Button variant="danger" size="sm" onClick={() => handleDelete(drawerVehicle.id)}>
                  Remove Vehicle from Fleet
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
