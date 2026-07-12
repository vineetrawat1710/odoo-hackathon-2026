import React, { useState } from 'react';
import { Save, Database, Trash2, Shield, Bell } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '../components/card/card';
import { Button } from '../components/button/button';
import { useToast } from '../components/toast/toast';

export const Settings: React.FC = () => {
  const { success, warning } = useToast();
  const [saving, setSaving] = useState(false);

  const [thresholds, setThresholds] = useState({
    minFuelEfficiency: 3.2,
    serviceIntervalKm: 40000,
    licenseWarningDays: 30,
    utilizationTarget: 75,
  });

  const [company, setCompany] = useState({
    name: 'TransitOps Logistics Pvt. Ltd.',
    gstNumber: '27AAACT2727Q1ZW',
    address: 'Plot 14, Transport Nagar, New Delhi – 110021',
    contactEmail: 'ops@transitops.in',
    contactPhone: '+91 11 4567 8900',
  });

  const handleSaveThresholds = async () => {
    setSaving(true);
    await new Promise(r => setTimeout(r, 700));
    setSaving(false);
    success('Fleet thresholds updated successfully.');
  };

  const handleSaveCompany = async () => {
    setSaving(true);
    await new Promise(r => setTimeout(r, 700));
    setSaving(false);
    success('Company profile saved.');
  };

  const handleClearDB = () => {
    if (window.confirm('This will reset all fleet data to the original seed data. Continue?')) {
      localStorage.removeItem('transitops_db');
      warning('Database reset. Reload the page to restore seed data.');
    }
  };

  const inputClass = 'w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all';
  const labelClass = 'block text-xs font-semibold text-slate-700 mb-1';

  return (
    <div className="space-y-6 max-w-3xl">

      {/* Company Profile */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-4 w-4 text-blue-500" />
            Company Profile
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className={labelClass}>Organization Name</label>
              <input className={inputClass} value={company.name} onChange={e => setCompany({ ...company, name: e.target.value })} />
            </div>
            <div>
              <label className={labelClass}>GST Number</label>
              <input className={inputClass} value={company.gstNumber} onChange={e => setCompany({ ...company, gstNumber: e.target.value })} />
            </div>
          </div>
          <div>
            <label className={labelClass}>Registered Address</label>
            <input className={inputClass} value={company.address} onChange={e => setCompany({ ...company, address: e.target.value })} />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className={labelClass}>Contact Email</label>
              <input type="email" className={inputClass} value={company.contactEmail} onChange={e => setCompany({ ...company, contactEmail: e.target.value })} />
            </div>
            <div>
              <label className={labelClass}>Contact Phone</label>
              <input className={inputClass} value={company.contactPhone} onChange={e => setCompany({ ...company, contactPhone: e.target.value })} />
            </div>
          </div>
          <div className="flex justify-end pt-2">
            <Button isLoading={saving} leftIcon={<Save className="h-4 w-4" />} onClick={handleSaveCompany}>
              Save Profile
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Fleet Thresholds */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Bell className="h-4 w-4 text-amber-500" />
            Fleet Alert Thresholds
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className={labelClass}>Min. Fuel Efficiency (km/L)</label>
              <input type="number" step="0.1" className={inputClass} value={thresholds.minFuelEfficiency}
                onChange={e => setThresholds({ ...thresholds, minFuelEfficiency: Number(e.target.value) })} />
              <p className="text-[10px] text-slate-400 mt-1">Vehicles below this trigger a warning alert.</p>
            </div>
            <div>
              <label className={labelClass}>Service Interval (km)</label>
              <input type="number" className={inputClass} value={thresholds.serviceIntervalKm}
                onChange={e => setThresholds({ ...thresholds, serviceIntervalKm: Number(e.target.value) })} />
              <p className="text-[10px] text-slate-400 mt-1">Distance after which maintenance is flagged.</p>
            </div>
            <div>
              <label className={labelClass}>License Expiry Warning (days)</label>
              <input type="number" className={inputClass} value={thresholds.licenseWarningDays}
                onChange={e => setThresholds({ ...thresholds, licenseWarningDays: Number(e.target.value) })} />
              <p className="text-[10px] text-slate-400 mt-1">Days before expiry to show warning badge.</p>
            </div>
            <div>
              <label className={labelClass}>Fleet Utilization Target (%)</label>
              <input type="number" className={inputClass} value={thresholds.utilizationTarget}
                onChange={e => setThresholds({ ...thresholds, utilizationTarget: Number(e.target.value) })} />
              <p className="text-[10px] text-slate-400 mt-1">Target utilization percentage for the fleet.</p>
            </div>
          </div>
          <div className="flex justify-end pt-2">
            <Button isLoading={saving} leftIcon={<Save className="h-4 w-4" />} onClick={handleSaveThresholds}>
              Save Thresholds
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Data Management */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Database className="h-4 w-4 text-slate-500" />
            Data Management
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between p-4 bg-slate-50 rounded-lg border border-slate-200">
            <div>
              <p className="text-sm font-semibold text-slate-900">Local Database</p>
              <p className="text-xs text-slate-500 mt-0.5">All fleet data is persisted in your browser's localStorage.</p>
            </div>
            <div className="flex items-center gap-2">
              <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse"></span>
              <span className="text-xs font-medium text-emerald-700">Active</span>
            </div>
          </div>
          <div className="flex items-center justify-between p-4 bg-rose-50 rounded-lg border border-rose-200">
            <div>
              <p className="text-sm font-semibold text-rose-900">Reset to Seed Data</p>
              <p className="text-xs text-rose-600 mt-0.5">Clears all custom entries and restores the original mock fleet data.</p>
            </div>
            <Button variant="danger" size="sm" leftIcon={<Trash2 className="h-4 w-4" />} onClick={handleClearDB}>
              Reset Database
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* About */}
      <Card>
        <CardContent className="p-5">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-semibold text-slate-900">TransitOps Fleet OS</p>
              <p className="text-xs text-slate-500 mt-0.5">Version 1.0.0 • Built with Vite + React + TypeScript + Tailwind</p>
            </div>
            <span className="text-[10px] bg-blue-50 text-blue-700 border border-blue-100 px-2.5 py-1 rounded-full font-semibold">
              Production Build
            </span>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
