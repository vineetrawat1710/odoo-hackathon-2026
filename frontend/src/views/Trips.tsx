import React, { useEffect, useState } from 'react';
import { Plus, Navigation, Truck, Users, Package, ChevronRight, X } from 'lucide-react';
import { tripService } from '../api/tripService';
import { vehicleService } from '../api/vehicleService';
import { driverService } from '../api/driverService';
import type { Trip, Vehicle, Driver } from '../types';
import { Card, CardContent, CardHeader, CardTitle } from '../components/card/card';
import { Button } from '../components/button/button';
import { Dialog } from '../components/dialog/dialog';
import { SkeletonLoader, EmptyState } from '../components/states/states';
import { useToast } from '../components/toast/toast';

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
    origin: '', destination: '', cargo: '', cargoWeight: 0,
    distance: 0, revenue: 0, fuelCost: 0, otherExpenses: 0,
    driverId: '', vehicleId: '', status: 'scheduled' as Trip['status']
  });

  const loadData = async () => {
    setLoading(true);
    const [t, v, d] = await Promise.all([
      tripService.getTrips(), vehicleService.getVehicles(), driverService.getDrivers()
    ]);
    setTrips(t); setVehicles(v); setDrivers(d);
    setLoading(false);
  };

  useEffect(() => { loadData(); }, []);

  const todaysTrips = trips.filter(t => t.status === 'active');
  const dispatchQueue = trips.filter(t => t.status === 'scheduled');
  const availableVehicles = vehicles.filter(v => v.status === 'available');
  const availableDrivers = drivers.filter(d => d.status === 'active' || d.status === 'off-duty');

  const handleDispatch = async () => {
    if (!form.origin || !form.destination || !form.driverId || !form.vehicleId) {
      error('Origin, destination, driver, and vehicle are required.');
      return;
    }
    setSaving(true);
    const trip: Trip = {
      id: `t-${Date.now()}`,
      tripNumber: `TRIP-${Math.floor(9000 + Math.random() * 1000)}`,
      ...form,
      currentProgress: form.status === 'active' ? 5 : 0
    };
    await tripService.saveTrip(trip);
    success(`Trip ${trip.tripNumber} dispatched: ${trip.origin} → ${trip.destination}`);
    setSaving(false);
    setShowForm(false);
    loadData();
  };

  const statusBadge = (status: string) => {
    const s: Record<string, string> = {
      scheduled: 'bg-indigo-50 text-indigo-700', active: 'bg-blue-50 text-blue-700',
      completed: 'bg-emerald-50 text-emerald-700', cancelled: 'bg-slate-100 text-slate-600'
    };
    return <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold ${s[status]}`}>{status}</span>;
  };

  const inputClass = 'w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all';
  const labelClass = 'block text-xs font-semibold text-slate-700 mb-1';

  if (loading) return <div className="space-y-6"><SkeletonLoader type="kpi" /><SkeletonLoader type="table" /></div>;

  return (
    <div className="space-y-6">
      {/* Top: Today's Trips + Dispatch Queue */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Today's Active Trips */}
        <Card>
          <CardHeader>
            <CardTitle>Today's Active Trips</CardTitle>
            <span className="text-[10px] bg-blue-50 text-blue-700 px-2 py-0.5 rounded-full font-semibold">{todaysTrips.length} active</span>
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
                        <Navigation className="h-3.5 w-3.5 text-blue-500" />
                        <span className="text-sm font-semibold text-slate-900">{trip.tripNumber}</span>
                      </div>
                      {statusBadge(trip.status)}
                    </div>
                    <p className="text-xs text-slate-500">{trip.origin} → {trip.destination}</p>
                    <div className="mt-2 flex items-center gap-2">
                      <div className="flex-1 bg-slate-100 rounded-full h-1.5">
                        <div className="bg-blue-500 h-1.5 rounded-full transition-all" style={{ width: `${trip.currentProgress}%` }} />
                      </div>
                      <span className="text-[10px] font-semibold text-slate-500">{trip.currentProgress}%</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Dispatch Queue */}
        <Card>
          <CardHeader>
            <CardTitle>Dispatch Queue</CardTitle>
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
                      <p className="text-sm font-semibold text-slate-900">{trip.tripNumber}</p>
                      <p className="text-[11px] text-slate-500">{trip.origin} → {trip.destination}</p>
                      <p className="text-[10px] text-slate-400 mt-0.5">{trip.cargo} • {trip.cargoWeight}T</p>
                    </div>
                    <ChevronRight className="h-4 w-4 text-slate-400" />
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Static Transit Map */}
      {todaysTrips.length > 0 && (
        <Card>
          <CardHeader><CardTitle>Transit Route Monitor</CardTitle></CardHeader>
          <CardContent>
            <div className="bg-slate-50 border border-slate-200 rounded-xl p-6 relative overflow-hidden" style={{ height: 200 }}>
              <svg viewBox="0 0 600 140" className="w-full h-full" preserveAspectRatio="xMidYMid meet">
                {/* Route line */}
                <line x1="60" y1="70" x2="540" y2="70" stroke="#cbd5e1" strokeWidth="3" strokeDasharray="8 4" />
                <line x1="60" y1="70" x2={60 + (todaysTrips[0].currentProgress / 100) * 480} y2="70" stroke="#2563eb" strokeWidth="3" />

                {/* Origin */}
                <circle cx="60" cy="70" r="8" fill="#10b981" />
                <text x="60" y="100" textAnchor="middle" className="text-[10px] fill-slate-600 font-semibold">{todaysTrips[0].origin}</text>

                {/* Moving vehicle indicator */}
                <g transform={`translate(${60 + (todaysTrips[0].currentProgress / 100) * 480}, 70)`}>
                  <circle r="12" fill="#2563eb" opacity="0.2">
                    <animate attributeName="r" values="12;18;12" dur="2s" repeatCount="indefinite" />
                  </circle>
                  <circle r="6" fill="#2563eb" />
                </g>

                {/* Destination */}
                <circle cx="540" cy="70" r="8" fill="#ef4444" />
                <text x="540" y="100" textAnchor="middle" className="text-[10px] fill-slate-600 font-semibold">{todaysTrips[0].destination}</text>

                {/* Labels */}
                <text x="300" y="40" textAnchor="middle" className="text-[11px] fill-slate-400 font-medium">
                  {todaysTrips[0].distance} km • {todaysTrips[0].driverName || 'Driver'} • {todaysTrips[0].vehiclePlate || 'Vehicle'}
                </text>
              </svg>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Full Trip Table */}
      <Card>
        <CardHeader><CardTitle>All Trips</CardTitle></CardHeader>
        <div className="overflow-x-auto">
          {trips.length === 0 ? (
            <EmptyState title="No trips recorded" description="Dispatch your first trip to get started." actionText="New Trip" onAction={() => setShowForm(true)} />
          ) : (
            <table className="w-full text-sm text-left">
              <thead className="bg-slate-50 border-b border-slate-200">
                <tr>
                  <th className="px-6 py-3 text-[11px] font-semibold text-slate-500 uppercase tracking-wider">Trip #</th>
                  <th className="px-6 py-3 text-[11px] font-semibold text-slate-500 uppercase tracking-wider">Route</th>
                  <th className="px-6 py-3 text-[11px] font-semibold text-slate-500 uppercase tracking-wider">Driver</th>
                  <th className="px-6 py-3 text-[11px] font-semibold text-slate-500 uppercase tracking-wider">Vehicle</th>
                  <th className="px-6 py-3 text-[11px] font-semibold text-slate-500 uppercase tracking-wider">Cargo</th>
                  <th className="px-6 py-3 text-[11px] font-semibold text-slate-500 uppercase tracking-wider">Revenue</th>
                  <th className="px-6 py-3 text-[11px] font-semibold text-slate-500 uppercase tracking-wider">Status</th>
                  <th className="px-6 py-3 text-[11px] font-semibold text-slate-500 uppercase tracking-wider">Progress</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {trips.map(trip => (
                  <tr key={trip.id} className="hover:bg-slate-50/50 transition-colors cursor-pointer" onClick={() => setDrawerTrip(trip)}>
                    <td className="px-6 py-3.5 font-semibold text-slate-900">{trip.tripNumber}</td>
                    <td className="px-6 py-3.5 text-slate-600">{trip.origin} → {trip.destination}</td>
                    <td className="px-6 py-3.5 text-slate-600">{trip.driverName || trip.driverId}</td>
                    <td className="px-6 py-3.5 text-slate-600">{trip.vehiclePlate || trip.vehicleId}</td>
                    <td className="px-6 py-3.5 text-slate-600">{trip.cargo}</td>
                    <td className="px-6 py-3.5 text-slate-600">₹{trip.revenue.toLocaleString()}</td>
                    <td className="px-6 py-3.5">{statusBadge(trip.status)}</td>
                    <td className="px-6 py-3.5">
                      <div className="flex items-center gap-2 min-w-[80px]">
                        <div className="flex-1 bg-slate-100 rounded-full h-1.5">
                          <div className={`h-1.5 rounded-full ${trip.status === 'completed' ? 'bg-emerald-500' : 'bg-blue-500'}`}
                            style={{ width: `${trip.currentProgress}%` }} />
                        </div>
                        <span className="text-[10px] text-slate-500 w-8">{trip.currentProgress}%</span>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </Card>

      {/* Trip Detail Drawer */}
      {drawerTrip && (
        <div className="fixed inset-0 z-40">
          <div className="fixed inset-0 bg-slate-900/30 backdrop-blur-xs" onClick={() => setDrawerTrip(null)} />
          <div className="fixed right-0 top-0 h-full w-full max-w-md bg-white border-l border-slate-200 shadow-2xl overflow-y-auto animate-slide-in-right z-50">
            <div className="sticky top-0 bg-white border-b border-slate-100 px-6 py-4 flex items-center justify-between z-10">
              <div>
                <h3 className="text-base font-bold text-slate-900">{drawerTrip.tripNumber}</h3>
                <p className="text-xs text-slate-500">{drawerTrip.origin} → {drawerTrip.destination}</p>
              </div>
              <button onClick={() => setDrawerTrip(null)} className="text-slate-400 hover:text-slate-600"><X className="h-5 w-5" /></button>
            </div>
            <div className="p-6 space-y-6">
              <div className="flex gap-3">
                {statusBadge(drawerTrip.status)}
                <span className="text-xs text-slate-500">{drawerTrip.distance} km</span>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="bg-slate-50 border border-slate-200 rounded-lg p-3">
                  <p className="text-[10px] text-slate-400 uppercase">Driver</p>
                  <p className="text-sm font-bold text-slate-900 flex items-center gap-1"><Users className="h-3.5 w-3.5" /> {drawerTrip.driverName || drawerTrip.driverId}</p>
                </div>
                <div className="bg-slate-50 border border-slate-200 rounded-lg p-3">
                  <p className="text-[10px] text-slate-400 uppercase">Vehicle</p>
                  <p className="text-sm font-bold text-slate-900 flex items-center gap-1"><Truck className="h-3.5 w-3.5" /> {drawerTrip.vehiclePlate || drawerTrip.vehicleId}</p>
                </div>
                <div className="bg-slate-50 border border-slate-200 rounded-lg p-3">
                  <p className="text-[10px] text-slate-400 uppercase">Cargo</p>
                  <p className="text-sm font-bold text-slate-900 flex items-center gap-1"><Package className="h-3.5 w-3.5" /> {drawerTrip.cargo}</p>
                </div>
                <div className="bg-slate-50 border border-slate-200 rounded-lg p-3">
                  <p className="text-[10px] text-slate-400 uppercase">Weight</p>
                  <p className="text-sm font-bold text-slate-900">{drawerTrip.cargoWeight} Tons</p>
                </div>
              </div>
              <div>
                <h4 className="text-xs font-semibold text-slate-900 uppercase tracking-wide mb-3">Financials</h4>
                <div className="space-y-2">
                  {[
                    ['Revenue', `₹${drawerTrip.revenue.toLocaleString()}`],
                    ['Fuel Cost', `₹${drawerTrip.fuelCost.toLocaleString()}`],
                    ['Other Expenses', `₹${drawerTrip.otherExpenses.toLocaleString()}`],
                    ['Net Profit', `₹${(drawerTrip.revenue - drawerTrip.fuelCost - drawerTrip.otherExpenses).toLocaleString()}`]
                  ].map(([label, val]) => (
                    <div key={label} className="flex items-center justify-between py-1.5 border-b border-slate-50">
                      <span className="text-xs text-slate-500">{label}</span>
                      <span className="text-xs font-semibold text-slate-800">{val}</span>
                    </div>
                  ))}
                </div>
              </div>
              {drawerTrip.status === 'active' && (
                <div>
                  <h4 className="text-xs font-semibold text-slate-900 uppercase tracking-wide mb-2">Progress</h4>
                  <div className="flex items-center gap-2">
                    <div className="flex-1 bg-slate-100 rounded-full h-2.5">
                      <div className="bg-blue-500 h-2.5 rounded-full transition-all" style={{ width: `${drawerTrip.currentProgress}%` }} />
                    </div>
                    <span className="text-sm font-bold text-blue-600">{drawerTrip.currentProgress}%</span>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Dispatch Form */}
      <Dialog isOpen={showForm} onClose={() => setShowForm(false)} title="Dispatch New Trip"
        footerActions={<>
          <Button variant="outline" onClick={() => setShowForm(false)}>Cancel</Button>
          <Button isLoading={saving} onClick={handleDispatch}>Dispatch Trip</Button>
        </>}
      >
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className={labelClass}>Origin *</label>
              <input className={inputClass} placeholder="Delhi" value={form.origin} onChange={e => setForm({ ...form, origin: e.target.value })} />
            </div>
            <div>
              <label className={labelClass}>Destination *</label>
              <input className={inputClass} placeholder="Jaipur" value={form.destination} onChange={e => setForm({ ...form, destination: e.target.value })} />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className={labelClass}>Assign Driver *</label>
              <select className={inputClass} value={form.driverId} onChange={e => setForm({ ...form, driverId: e.target.value })}>
                <option value="">Select driver…</option>
                {availableDrivers.map(d => <option key={d.id} value={d.id}>{d.name} ({d.shift})</option>)}
              </select>
            </div>
            <div>
              <label className={labelClass}>Assign Vehicle *</label>
              <select className={inputClass} value={form.vehicleId} onChange={e => setForm({ ...form, vehicleId: e.target.value })}>
                <option value="">Select vehicle…</option>
                {availableVehicles.map(v => <option key={v.id} value={v.id}>{v.plateNumber} ({v.model})</option>)}
              </select>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className={labelClass}>Cargo</label>
              <input className={inputClass} placeholder="Automobile Parts" value={form.cargo} onChange={e => setForm({ ...form, cargo: e.target.value })} />
            </div>
            <div>
              <label className={labelClass}>Cargo Weight (T)</label>
              <input type="number" className={inputClass} value={form.cargoWeight} onChange={e => setForm({ ...form, cargoWeight: Number(e.target.value) })} />
            </div>
          </div>
          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className={labelClass}>Distance (km)</label>
              <input type="number" className={inputClass} value={form.distance} onChange={e => setForm({ ...form, distance: Number(e.target.value) })} />
            </div>
            <div>
              <label className={labelClass}>Revenue (₹)</label>
              <input type="number" className={inputClass} value={form.revenue} onChange={e => setForm({ ...form, revenue: Number(e.target.value) })} />
            </div>
            <div>
              <label className={labelClass}>Fuel Cost (₹)</label>
              <input type="number" className={inputClass} value={form.fuelCost} onChange={e => setForm({ ...form, fuelCost: Number(e.target.value) })} />
            </div>
          </div>
          <div>
            <label className={labelClass}>Initial Status</label>
            <select className={inputClass} value={form.status} onChange={e => setForm({ ...form, status: e.target.value as Trip['status'] })}>
              <option value="scheduled">Scheduled (Queue)</option>
              <option value="active">Active (Dispatch Now)</option>
            </select>
          </div>
        </div>
      </Dialog>
    </div>
  );
};
