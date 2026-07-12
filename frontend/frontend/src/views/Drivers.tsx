import React, { useEffect, useState } from 'react';
import { Search, Plus, Star, Phone, Shield, Calendar } from 'lucide-react';
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
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    name: '', license_number: '', contact_number: '', 
    license_category: 'C' as Driver['license_category'], 
    license_expiry_date: '', status: 'AVAILABLE' as Driver['status'],
    safety_score: 5.0
  });

  const loadData = async () => {
    setLoading(true);
    try {
      const data = await driverService.getDrivers();
      setDrivers(data);
    } catch (e: any) {
      error(e.message || 'Failed to load drivers');
    }
    setLoading(false);
  };

  useEffect(() => { loadData(); }, []);

  const filtered = drivers.filter(d => {
    const matchSearch = d.name.toLowerCase().includes(search.toLowerCase()) ||
      d.license_number.toLowerCase().includes(search.toLowerCase());
    const matchStatus = statusFilter === 'all' || d.status === statusFilter;
    return matchSearch && matchStatus;
  });

  const openForm = () => {
    setForm({ name: '', license_number: '', contact_number: '', license_category: 'C', license_expiry_date: '', status: 'AVAILABLE', safety_score: 5.0 });
    setShowForm(true);
  };

  const handleSave = async () => {
    if (!form.name || !form.license_number) { error('Name and License Number are required.'); return; }
    setSaving(true);
    try {
      await driverService.saveDriver(form);
      success(`Driver ${form.name} onboarded.`);
      setShowForm(false);
      loadData();
    } catch (e: any) {
      error(e.message || 'Failed to onboard driver');
    }
    setSaving(false);
  };

  const statusBadge = (status: string) => {
    const styles: Record<string, string> = {
      AVAILABLE: 'bg-emerald-50 text-emerald-700',
      ON_TRIP: 'bg-blue-50 text-blue-700',
      OFF_DUTY: 'bg-slate-100 text-slate-600',
      SUSPENDED: 'bg-rose-50 text-rose-700'
    };
    return <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold ${styles[status]}`}>{status}</span>;
  };

  const inputClass = 'w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all';
  const labelClass = 'block text-xs font-semibold text-slate-700 mb-1';

  if (loading) return <div className="space-y-6"><SkeletonLoader type="kpi" /><SkeletonLoader type="table" /></div>;

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="flex items-center gap-3 flex-1">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <input className={`${inputClass} pl-9`} placeholder="Search by name or license…" value={search} onChange={e => setSearch(e.target.value)} />
          </div>
          <select className={`${inputClass} w-auto`} value={statusFilter} onChange={e => setStatusFilter(e.target.value)}>
            <option value="all">All Status</option>
            <option value="AVAILABLE">Available</option>
            <option value="ON_TRIP">On Trip</option>
            <option value="OFF_DUTY">Off-Duty</option>
            <option value="SUSPENDED">Suspended</option>
          </select>
        </div>
        <Button leftIcon={<Plus className="h-4 w-4" />} onClick={() => openForm()}>Add Driver</Button>
      </div>

      {filtered.length === 0 ? (
        <EmptyState title="No drivers found" description="Adjust search or add a new operator." actionText="Add Driver" onAction={() => openForm()} />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map(d => (
            <Card key={d.id} className="hover:shadow-md transition-shadow cursor-pointer">
              <CardContent className="p-5">
                <div className="flex items-start gap-4">
                  <div className="h-11 w-11 rounded-full bg-blue-100 flex items-center justify-center font-bold text-blue-800 text-sm flex-shrink-0">
                    {d.name.split(' ').map(n => n[0]).join('').slice(0,2).toUpperCase()}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <p className="text-sm font-bold text-slate-900 truncate">{d.name}</p>
                      {statusBadge(d.status)}
                    </div>
                    <p className="text-[11px] text-slate-500 mt-0.5">{d.license_number}</p>
                    <div className="flex items-center gap-4 mt-3 pt-3 border-t border-slate-100">
                      <div className="flex items-center gap-1 text-[11px] text-slate-500">
                        <Shield className="h-3 w-3" />
                        Cat: <span className="font-semibold text-slate-700">{d.license_category}</span>
                      </div>
                      <div className="flex items-center gap-1 text-[11px] text-slate-500">
                        <Calendar className="h-3 w-3" />
                        Exp: <span className="font-semibold text-slate-700">{d.license_expiry_date?.split('T')[0]}</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-3 mt-2">
                      <div className="flex items-center gap-1 text-[11px] text-slate-500">
                        <Phone className="h-3 w-3" />
                        {d.contact_number}
                      </div>
                      <div className="flex items-center gap-0.5 text-[11px] text-amber-500">
                        <Star className="h-3 w-3 fill-current" />
                        {Number(d.safety_score).toFixed(1)}
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <Dialog isOpen={showForm} onClose={() => setShowForm(false)} title="Onboard New Operator"
        footerActions={<>
          <Button variant="outline" onClick={() => setShowForm(false)}>Cancel</Button>
          <Button isLoading={saving} onClick={handleSave}>Onboard Driver</Button>
        </>}
      >
        <div className="space-y-4">
          <div>
            <label className={labelClass}>Full Name *</label>
            <input className={inputClass} placeholder="Rahul Sharma" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} />
          </div>
          <div>
            <label className={labelClass}>License Number *</label>
            <input className={inputClass} placeholder="DL-1420180098765" value={form.license_number} onChange={e => setForm({ ...form, license_number: e.target.value })} />
          </div>
          <div>
            <label className={labelClass}>Phone Number</label>
            <input className={inputClass} placeholder="+91 98765 43210" value={form.contact_number} onChange={e => setForm({ ...form, contact_number: e.target.value })} />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className={labelClass}>License Category</label>
              <select className={inputClass} value={form.license_category} onChange={e => setForm({ ...form, license_category: e.target.value as Driver['license_category'] })}>
                <option value="B">B</option>
                <option value="C">C</option>
                <option value="CE">CE</option>
                <option value="D">D</option>
              </select>
            </div>
            <div>
              <label className={labelClass}>Expiry Date</label>
              <input type="date" className={inputClass} value={form.license_expiry_date} onChange={e => setForm({ ...form, license_expiry_date: e.target.value })} />
            </div>
          </div>
        </div>
      </Dialog>
    </div>
  );
};
