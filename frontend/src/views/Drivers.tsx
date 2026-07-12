import React, { useEffect, useState } from 'react';
import { Search, Plus, Star, Phone, Shield, Clock } from 'lucide-react';
import { driverService } from '../api/driverService';
import type { Driver } from '../types';
import { Card, CardContent } from '../components/card/card';
import { Button } from '../components/button/button';
import { Dialog } from '../components/dialog/dialog';
import { SkeletonLoader, EmptyState } from '../components/states/states';
import { useToast } from '../components/toast/toast';

export const Drivers: React.FC = () => {
  const { success, error } = useToast();
  const [drivers, setDrivers] = useState<Driver[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [showForm, setShowForm] = useState(false);
  const [editDriver, setEditDriver] = useState<Driver | null>(null);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    name: '', licenseNumber: '', phone: '', shift: 'Morning' as Driver['shift'],
    licenseStatus: 'valid' as Driver['licenseStatus'], status: 'active' as Driver['status']
  });

  const loadData = async () => {
    setLoading(true);
    const data = await driverService.getDrivers();
    setDrivers(data);
    setLoading(false);
  };

  useEffect(() => { loadData(); }, []);

  const filtered = drivers.filter(d => {
    const matchSearch = d.name.toLowerCase().includes(search.toLowerCase()) ||
      d.licenseNumber.toLowerCase().includes(search.toLowerCase());
    const matchStatus = statusFilter === 'all' || d.status === statusFilter;
    return matchSearch && matchStatus;
  });

  const openForm = (driver?: Driver) => {
    if (driver) {
      setEditDriver(driver);
      setForm({ name: driver.name, licenseNumber: driver.licenseNumber, phone: driver.phone,
        shift: driver.shift, licenseStatus: driver.licenseStatus, status: driver.status });
    } else {
      setEditDriver(null);
      setForm({ name: '', licenseNumber: '', phone: '', shift: 'Morning', licenseStatus: 'valid', status: 'active' });
    }
    setShowForm(true);
  };

  const handleSave = async () => {
    if (!form.name || !form.licenseNumber) { error('Name and License Number are required.'); return; }
    setSaving(true);
    const driver: Driver = {
      id: editDriver ? editDriver.id : `d-${Date.now()}`,
      ...form,
      rating: editDriver ? editDriver.rating : 4.0,
      vehicleId: editDriver?.vehicleId
    };
    await driverService.saveDriver(driver);
    success(editDriver ? `Driver ${driver.name} updated.` : `Operator ${driver.name} onboarded.`);
    setSaving(false);
    setShowForm(false);
    loadData();
  };

  const licenseBadge = (status: string) => {
    const styles: Record<string, string> = {
      valid: 'bg-emerald-50 text-emerald-700',
      warning: 'bg-amber-50 text-amber-700',
      expired: 'bg-rose-50 text-rose-700'
    };
    return <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold ${styles[status]}`}>{status}</span>;
  };

  const statusBadge = (status: string) => {
    const styles: Record<string, string> = {
      active: 'bg-blue-50 text-blue-700',
      'off-duty': 'bg-slate-100 text-slate-600',
      suspended: 'bg-rose-50 text-rose-700'
    };
    return <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold ${styles[status]}`}>{status}</span>;
  };

  const inputClass = 'w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all';
  const labelClass = 'block text-xs font-semibold text-slate-700 mb-1';

  if (loading) return <div className="space-y-6"><SkeletonLoader type="kpi" /><SkeletonLoader type="table" /></div>;

  return (
    <div className="space-y-6">
      {/* Controls */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="flex items-center gap-3 flex-1">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <input className={`${inputClass} pl-9`} placeholder="Search by name or license…" value={search} onChange={e => setSearch(e.target.value)} />
          </div>
          <select className={`${inputClass} w-auto`} value={statusFilter} onChange={e => setStatusFilter(e.target.value)}>
            <option value="all">All Status</option>
            <option value="active">Active</option>
            <option value="off-duty">Off-Duty</option>
            <option value="suspended">Suspended</option>
          </select>
        </div>
        <Button leftIcon={<Plus className="h-4 w-4" />} onClick={() => openForm()}>Add Driver</Button>
      </div>

      {/* Driver Cards */}
      {filtered.length === 0 ? (
        <EmptyState title="No drivers found" description="Adjust search or add a new operator." actionText="Add Driver" onAction={() => openForm()} />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map(d => (
            <Card key={d.id} className="hover:shadow-md transition-shadow cursor-pointer" onClick={() => openForm(d)}>
              <CardContent className="p-5">
                <div className="flex items-start gap-4">
                  <div className="h-11 w-11 rounded-full bg-blue-100 flex items-center justify-center font-bold text-blue-800 text-sm flex-shrink-0">
                    {d.name.split(' ').map(n => n[0]).join('')}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <p className="text-sm font-bold text-slate-900 truncate">{d.name}</p>
                      {statusBadge(d.status)}
                    </div>
                    <p className="text-[11px] text-slate-500 mt-0.5">{d.licenseNumber}</p>
                    <div className="flex items-center gap-4 mt-3 pt-3 border-t border-slate-100">
                      <div className="flex items-center gap-1 text-[11px] text-slate-500">
                        <Shield className="h-3 w-3" />
                        License: {licenseBadge(d.licenseStatus)}
                      </div>
                      <div className="flex items-center gap-1 text-[11px] text-slate-500">
                        <Clock className="h-3 w-3" />
                        {d.shift}
                      </div>
                    </div>
                    <div className="flex items-center gap-3 mt-2">
                      <div className="flex items-center gap-1 text-[11px] text-slate-500">
                        <Phone className="h-3 w-3" />
                        {d.phone}
                      </div>
                      <div className="flex items-center gap-0.5 text-[11px] text-amber-500">
                        <Star className="h-3 w-3 fill-current" />
                        {d.rating.toFixed(1)}
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Add/Edit Dialog */}
      <Dialog isOpen={showForm} onClose={() => setShowForm(false)} title={editDriver ? 'Edit Driver' : 'Onboard New Operator'}
        footerActions={<>
          <Button variant="outline" onClick={() => setShowForm(false)}>Cancel</Button>
          <Button isLoading={saving} onClick={handleSave}>{editDriver ? 'Update' : 'Onboard Driver'}</Button>
        </>}
      >
        <div className="space-y-4">
          <div>
            <label className={labelClass}>Full Name *</label>
            <input className={inputClass} placeholder="Rahul Sharma" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} />
          </div>
          <div>
            <label className={labelClass}>License Number *</label>
            <input className={inputClass} placeholder="DL-1420180098765" value={form.licenseNumber} onChange={e => setForm({ ...form, licenseNumber: e.target.value })} />
          </div>
          <div>
            <label className={labelClass}>Phone Number</label>
            <input className={inputClass} placeholder="+91 98765 43210" value={form.phone} onChange={e => setForm({ ...form, phone: e.target.value })} />
          </div>
          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className={labelClass}>Shift</label>
              <select className={inputClass} value={form.shift} onChange={e => setForm({ ...form, shift: e.target.value as Driver['shift'] })}>
                <option value="Morning">Morning</option>
                <option value="Evening">Evening</option>
                <option value="Night">Night</option>
              </select>
            </div>
            <div>
              <label className={labelClass}>License Status</label>
              <select className={inputClass} value={form.licenseStatus} onChange={e => setForm({ ...form, licenseStatus: e.target.value as Driver['licenseStatus'] })}>
                <option value="valid">Valid</option>
                <option value="warning">Warning</option>
                <option value="expired">Expired</option>
              </select>
            </div>
            <div>
              <label className={labelClass}>Duty Status</label>
              <select className={inputClass} value={form.status} onChange={e => setForm({ ...form, status: e.target.value as Driver['status'] })}>
                <option value="active">Active</option>
                <option value="off-duty">Off-Duty</option>
                <option value="suspended">Suspended</option>
              </select>
            </div>
          </div>
        </div>
      </Dialog>
    </div>
  );
};
