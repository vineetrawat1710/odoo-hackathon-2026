import React, { useEffect, useState } from 'react';
import { Plus, Navigation, Truck, Users, ChevronRight, X } from 'lucide-react';
import { tripService } from '../api/tripService';
import { vehicleService } from '../api/vehicleService';
import { driverService } from '../api/driverService';
import type { Trip, Vehicle, Driver } from '../types';
import { Card, CardContent, CardHeader, CardTitle } from '../components/card/card';
import { Button } from '../components/button/button';
import { Dialog } from '../components/dialog/dialog';
import { SkeletonLoader, EmptyState } from '../components/states/states';
import { useToast } from '../components/toast/toast';
import { StatusBadge } from '../components/badge/StatusBadge';

export const Trips: React.FC = () => {
  const { success, error } = useToast();
  const [trips, setTrips] = useState<Trip[]>([]);
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [drivers, setDrivers] = useState<Driver[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [saving, setSaving] = useState(false);
  const [drawerTrip, setDrawerTrip] = useState<Trip | null>(null);
  
  const [form, setForm] = useState({
    source: '', destination: '', cargo_weight: 0,
    planned_distance: 0, revenue: 0,
    driver_id: '', vehicle_id: ''
  });

  const loadData = async () => {
    setLoading(true);
    try {
      const [t, v, d] = await Promise.all([
        tripService.getTrips(), vehicleService.getVehicles(), driverService.getDrivers()
      ]);
      setTrips(t); setVehicles(v); setDrivers(d);
    } catch (e: any) {
      error(e.message || 'Failed to load trips');
    }
    setLoading(false);
  };

  useEffect(() => { loadData(); }, []);

  const todaysTrips = trips.filter(t => t.status === 'DISPATCHED');
  const dispatchQueue = trips.filter(t => t.status === 'DRAFT');
  const availableVehicles = vehicles.filter(v => v.status === 'AVAILABLE');
  const availableDrivers = drivers.filter(d => d.status === 'AVAILABLE' || d.status === 'OFF_DUTY');

  const getVehicleReg = (id: number) => vehicles.find(v => v.id === id)?.registration_number || id;
  const getDriverName = (id: number) => drivers.find(d => d.id === id)?.name || id;

  const handleCreate = async () => {
    if (!form.source || !form.destination || !form.driver_id || !form.vehicle_id) {
      error('Origin, destination, driver, and vehicle are required.');
      return;
    }
    setSaving(true);
    try {
      await tripService.saveTrip({
        ...form,
        driver_id: Number(form.driver_id),
        vehicle_id: Number(form.vehicle_id),
      });
      success(`Trip scheduled: ${form.source} → ${form.destination}`);
      setShowForm(false);
      loadData();
    } catch (e: any) {
      error(e.message || 'Failed to create trip');
    }
    setSaving(false);
  };

  const handleDispatch = async (trip_id: number) => {
    try {
      await tripService.dispatchTrip(trip_id);
      success(`Trip ${trip_id} dispatched!`);
      setDrawerTrip(null);
      loadData();
    } catch (e: any) {
      error(e.message || 'Failed to dispatch trip');
    }
  };

  const handleComplete = async (trip: Trip) => {
    try {
      // In a real app we'd ask for end odometer, etc. Using defaults for demo.
      await tripService.completeTrip(trip.id, { actual_distance: trip.planned_distance || 1, end_odometer: 0 });
      success(`Trip ${trip.id} completed!`);
      setDrawerTrip(null);
      loadData();
    } catch (e: any) {
      error(e.message || 'Failed to complete trip');
    }
  };

  const selectedVehicle = form.vehicle_id ? vehicles.find(v => v.id === Number(form.vehicle_id)) : null;
  const maxCapacity = selectedVehicle?.max_load_capacity || 0;
  const isOverweight = form.cargo_weight > maxCapacity;

  const inputClass = 'w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all';
  const labelClass = 'block text-xs font-semibold text-slate-700 mb-1';

  if (loading) return <div className="space-y-6"><SkeletonLoader type="kpi" /><SkeletonLoader type="table" /></div>;

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Active Trips</CardTitle>
            <span className="text-[10px] bg-indigo-50 text-indigo-700 px-2 py-0.5 rounded-full font-semibold">{todaysTrips.length} active</span>
          </CardHeader>
          <CardContent className="p-0">
            {todaysTrips.length === 0 ? (
              <div className="px-6 py-8 text-center text-xs text-slate-400">No active trips right now.</div>
            ) : (
              <div className="divide-y divide-slate-100">
                {todaysTrips.map(trip => (
                  <div key={trip.id} className="px-6 py-3.5 hover:bg-slate-50/50 transition-colors cursor-pointer" onClick={() => setDrawerTrip(trip)}>
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <Navigation className="h-3.5 w-3.5 text-indigo-500" />
                        <span className="text-sm font-semibold text-slate-900">Trip {trip.id}</span>
                      </div>
                      <StatusBadge status={trip.status} />
                    </div>
                    <p className="text-xs text-slate-500">{trip.source} → {trip.destination}</p>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Draft Queue</CardTitle>
            <Button size="sm" leftIcon={<Plus className="h-3.5 w-3.5" />} onClick={() => setShowForm(true)}>New Trip</Button>
          </CardHeader>
          <CardContent className="p-0">
            {dispatchQueue.length === 0 ? (
              <div className="px-6 py-8 text-center text-xs text-slate-400">No trips in queue. Create one to get started.</div>
            ) : (
              <div className="divide-y divide-slate-100">
                {dispatchQueue.map(trip => (
                  <div key={trip.id} className="px-6 py-3.5 flex items-center justify-between hover:bg-slate-50/50 transition-colors cursor-pointer" onClick={() => setDrawerTrip(trip)}>
                    <div>
                      <p className="text-sm font-semibold text-slate-900">Trip {trip.id}</p>
                      <p className="text-[11px] text-slate-500">{trip.source} → {trip.destination}</p>
                      <p className="text-[10px] text-slate-400 mt-0.5">{trip.cargo_weight}T</p>
                    </div>
                    <ChevronRight className="h-4 w-4 text-slate-400" />
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader><CardTitle>All Trips</CardTitle></CardHeader>
        <div className="overflow-x-auto">
          {trips.length === 0 ? (
            <EmptyState title="No trips recorded" description="Dispatch your first trip to get started." actionText="New Trip" onAction={() => setShowForm(true)} />
          ) : (
            <table className="w-full text-sm text-left">
              <thead className="bg-slate-50 border-b border-slate-200">
                <tr>
                  <th className="px-6 py-3 text-[11px] font-semibold text-slate-500 uppercase tracking-wider">Trip ID</th>
                  <th className="px-6 py-3 text-[11px] font-semibold text-slate-500 uppercase tracking-wider">Route</th>
                  <th className="px-6 py-3 text-[11px] font-semibold text-slate-500 uppercase tracking-wider">Driver</th>
                  <th className="px-6 py-3 text-[11px] font-semibold text-slate-500 uppercase tracking-wider">Vehicle</th>
                  <th className="px-6 py-3 text-[11px] font-semibold text-slate-500 uppercase tracking-wider">Revenue</th>
                  <th className="px-6 py-3 text-[11px] font-semibold text-slate-500 uppercase tracking-wider">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {trips.map(trip => (
                  <tr key={trip.id} className="hover:bg-slate-50/50 transition-colors cursor-pointer" onClick={() => setDrawerTrip(trip)}>
                    <td className="px-6 py-3.5 font-semibold text-slate-900">Trip {trip.id}</td>
                    <td className="px-6 py-3.5 text-slate-600">{trip.source} → {trip.destination}</td>
                    <td className="px-6 py-3.5 text-slate-600">{getDriverName(trip.driver_id)}</td>
                    <td className="px-6 py-3.5 text-slate-600">{getVehicleReg(trip.vehicle_id)}</td>
                    <td className="px-6 py-3.5 text-slate-600">₹{Number(trip.revenue).toLocaleString()}</td>
                    <td className="px-6 py-3.5"><StatusBadge status={trip.status} /></td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </Card>

      {drawerTrip && (
        <div className="fixed inset-0 z-40">
          <div className="fixed inset-0 bg-slate-900/30 backdrop-blur-xs" onClick={() => setDrawerTrip(null)} />
          <div className="fixed right-0 top-0 h-full w-full max-w-md bg-white border-l border-slate-200 shadow-2xl overflow-y-auto animate-slide-in-right z-50">
            <div className="sticky top-0 bg-white border-b border-slate-100 px-6 py-4 flex items-center justify-between z-10">
              <div>
                <h3 className="text-base font-bold text-slate-900">Trip {drawerTrip.id}</h3>
                <p className="text-xs text-slate-500">{drawerTrip.source} → {drawerTrip.destination}</p>
              </div>
              <button onClick={() => setDrawerTrip(null)} className="text-slate-400 hover:text-slate-600"><X className="h-5 w-5" /></button>
            </div>
            <div className="p-6 space-y-6">
              <div className="flex gap-3">
                <StatusBadge status={drawerTrip.status} />
                <span className="text-xs text-slate-500">{drawerTrip.planned_distance} km planned</span>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="bg-slate-50 border border-slate-200 rounded-lg p-3">
                  <p className="text-[10px] text-slate-400 uppercase">Driver</p>
                  <p className="text-sm font-bold text-slate-900 flex items-center gap-1"><Users className="h-3.5 w-3.5" /> {getDriverName(drawerTrip.driver_id)}</p>
                </div>
                <div className="bg-slate-50 border border-slate-200 rounded-lg p-3">
                  <p className="text-[10px] text-slate-400 uppercase">Vehicle</p>
                  <p className="text-sm font-bold text-slate-900 flex items-center gap-1"><Truck className="h-3.5 w-3.5" /> {getVehicleReg(drawerTrip.vehicle_id)}</p>
                </div>
                <div className="bg-slate-50 border border-slate-200 rounded-lg p-3">
                  <p className="text-[10px] text-slate-400 uppercase">Weight</p>
                  <p className="text-sm font-bold text-slate-900">{drawerTrip.cargo_weight} Tons</p>
                </div>
              </div>
              <div>
                <h4 className="text-xs font-semibold text-slate-900 uppercase tracking-wide mb-3">Financials</h4>
                <div className="space-y-2">
                  <div className="flex items-center justify-between py-1.5 border-b border-slate-50">
                    <span className="text-xs text-slate-500">Planned Revenue</span>
                    <span className="text-xs font-semibold text-slate-800">₹{Number(drawerTrip.revenue).toLocaleString()}</span>
                  </div>
                </div>
              </div>

              {drawerTrip.status === 'DRAFT' && (
                <div className="pt-4 border-t border-slate-100">
                  <Button className="w-full" onClick={() => handleDispatch(drawerTrip.id)}>Dispatch Trip Now</Button>
                </div>
              )}
              {drawerTrip.status === 'DISPATCHED' && (
                <div className="pt-4 border-t border-slate-100">
                  <Button className="w-full bg-emerald-600 hover:bg-emerald-700 text-white" onClick={() => handleComplete(drawerTrip)}>Mark Completed</Button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      <Dialog isOpen={showForm} onClose={() => setShowForm(false)} title="Create Trip Draft"
        footerActions={<>
          <Button variant="outline" onClick={() => setShowForm(false)}>Cancel</Button>
          <Button isLoading={saving} onClick={handleCreate}>Save Draft</Button>
        </>}
      >
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className={labelClass}>Origin *</label>
              <input className={inputClass} placeholder="Delhi" value={form.source} onChange={e => setForm({ ...form, source: e.target.value })} />
            </div>
            <div>
              <label className={labelClass}>Destination *</label>
              <input className={inputClass} placeholder="Jaipur" value={form.destination} onChange={e => setForm({ ...form, destination: e.target.value })} />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className={labelClass}>Assign Driver *</label>
              <select className={inputClass} value={form.driver_id} onChange={e => setForm({ ...form, driver_id: e.target.value })}>
                <option value="">Select driver…</option>
                {availableDrivers.map(d => <option key={d.id} value={d.id}>{d.name}</option>)}
              </select>
            </div>
            <div>
              <label className={labelClass}>Assign Vehicle *</label>
              <select className={inputClass} value={form.vehicle_id} onChange={e => setForm({ ...form, vehicle_id: e.target.value })}>
                <option value="">Select vehicle…</option>
                {availableVehicles.map(v => <option key={v.id} value={v.id}>{v.registration_number} ({v.name})</option>)}
              </select>
            </div>
          </div>
          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className={labelClass}>Weight (Tons) *</label>
              <input type="number" className={`${inputClass} ${isOverweight ? 'border-rose-300 focus:ring-rose-500 bg-rose-50' : ''}`} placeholder="e.g. 15" value={form.cargo_weight === 0 ? '' : form.cargo_weight} onChange={e => setForm({ ...form, cargo_weight: e.target.value === '' ? 0 : Number(e.target.value) })} />
              {selectedVehicle && (
                <p className={`text-[10px] mt-1 font-medium ${isOverweight ? 'text-rose-600' : 'text-slate-500'}`}>
                  Max capacity: {maxCapacity} Tons
                </p>
              )}
            </div>
            <div>
              <label className={labelClass}>Distance (km) *</label>
              <input type="number" className={inputClass} placeholder="e.g. 280" value={form.planned_distance === 0 ? '' : form.planned_distance} onChange={e => setForm({ ...form, planned_distance: e.target.value === '' ? 0 : Number(e.target.value) })} />
            </div>
            <div>
              <label className={labelClass}>Revenue (₹)</label>
              <input type="number" className={inputClass} placeholder="e.g. 45000" value={form.revenue === 0 ? '' : form.revenue} onChange={e => setForm({ ...form, revenue: e.target.value === '' ? 0 : Number(e.target.value) })} />
            </div>
          </div>
        </div>
      </Dialog>
    </div>
  );
};
