import React, { useEffect, useState } from 'react';
import { Plus } from 'lucide-react';
import { expenseService } from '../api/expenseService';
import { vehicleService } from '../api/vehicleService';
import type { Expense, Vehicle } from '../types';
import { Card, CardContent } from '../components/card/card';
import { Button } from '../components/button/button';
import { Dialog } from '../components/dialog/dialog';
import { SkeletonLoader, EmptyState } from '../components/states/states';
import { useToast } from '../components/toast/toast';

const CATEGORIES = ['TOLL', 'MAINTENANCE', 'MISCELLANEOUS'] as const;
const categoryColors: Record<string, string> = {
  TOLL: 'bg-slate-100 text-slate-700',
  MAINTENANCE: 'bg-amber-50 text-amber-700',
  MISCELLANEOUS: 'bg-rose-50 text-rose-700'
};

export const Expenses: React.FC = () => {
  const { success, error } = useToast();
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [loading, setLoading] = useState(true);
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [showForm, setShowForm] = useState(false);
  const [saving, setSaving] = useState(false);
  
  const [form, setForm] = useState({ date: '', type: 'TOLL' as Expense['type'], amount: 0, description: '', vehicle_id: '' });

  const loadData = async () => {
    setLoading(true);
    try {
      const [data, v] = await Promise.all([expenseService.getExpenses(), vehicleService.getVehicles()]);
      setExpenses(data);
      setVehicles(v);
    } catch (e: any) {
      error(e.message || 'Failed to load expenses');
    }
    setLoading(false);
  };

  useEffect(() => { loadData(); }, []);

  const filtered = expenses.filter(e => categoryFilter === 'all' || e.type === categoryFilter);
  const total = filtered.reduce((s, e) => s + e.amount, 0);

  const getVehicleReg = (id: number) => vehicles.find(v => v.id === id)?.registration_number || id;

  const handleSave = async () => {
    if (!form.date || !form.description || !form.amount || !form.vehicle_id) { error('Date, Description, Amount, and Vehicle are required.'); return; }
    setSaving(true);
    try {
      const expense = await expenseService.saveExpense({
        ...form,
        vehicle_id: Number(form.vehicle_id)
      });
      success(`Expense of ₹${expense.amount.toLocaleString()} logged under ${expense.type}.`);
      setShowForm(false);
      setForm({ date: '', type: 'TOLL', amount: 0, description: '', vehicle_id: '' });
      loadData();
    } catch (e: any) {
      error(e.message || 'Failed to save expense');
    }
    setSaving(false);
  };

  const inputClass = 'w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all';
  const labelClass = 'block text-xs font-semibold text-slate-700 mb-1';

  if (loading) return <div className="space-y-6"><SkeletonLoader type="kpi" /><SkeletonLoader type="table" /></div>;

  const categorySums = CATEGORIES.map(cat => ({
    category: cat,
    total: expenses.filter(e => e.type === cat).reduce((s, e) => s + e.amount, 0)
  }));

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {categorySums.map(cs => (
          <Card key={cs.category} className="cursor-pointer hover:shadow-md transition-shadow" onClick={() => setCategoryFilter(cs.category)}>
            <CardContent className="p-4 text-center">
              <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-[10px] font-semibold capitalize ${categoryColors[cs.category]}`}>
                {cs.category}
              </span>
              <p className="text-lg font-bold text-slate-900 mt-2">₹{cs.total.toLocaleString()}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <select className={`${inputClass} w-auto`} value={categoryFilter} onChange={e => setCategoryFilter(e.target.value)}>
            <option value="all">All Categories</option>
            {CATEGORIES.map(c => <option key={c} value={c} className="capitalize">{c}</option>)}
          </select>
          <div className="text-sm text-slate-500 font-medium">
            Total: <span className="font-bold text-slate-900">₹{total.toLocaleString()}</span>
          </div>
        </div>
        <Button leftIcon={<Plus className="h-4 w-4" />} onClick={() => setShowForm(true)}>Log Expense</Button>
      </div>

      {filtered.length === 0 ? (
        <EmptyState title="No expenses found" description="Log an expense to start tracking." actionText="Log Expense" onAction={() => setShowForm(true)} />
      ) : (
        <Card>
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="bg-slate-50 border-b border-slate-200">
                <tr>
                  <th className="px-6 py-3 text-[11px] font-semibold text-slate-500 uppercase tracking-wider">Date</th>
                  <th className="px-6 py-3 text-[11px] font-semibold text-slate-500 uppercase tracking-wider">Type</th>
                  <th className="px-6 py-3 text-[11px] font-semibold text-slate-500 uppercase tracking-wider">Description</th>
                  <th className="px-6 py-3 text-[11px] font-semibold text-slate-500 uppercase tracking-wider">Vehicle</th>
                  <th className="px-6 py-3 text-[11px] font-semibold text-slate-500 uppercase tracking-wider text-right">Amount</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filtered.map(exp => (
                  <tr key={exp.id} className="hover:bg-slate-50/50 transition-colors">
                    <td className="px-6 py-3.5 text-slate-600">{exp.date}</td>
                    <td className="px-6 py-3.5">
                      <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold capitalize ${categoryColors[exp.type]}`}>
                        {exp.type}
                      </span>
                    </td>
                    <td className="px-6 py-3.5 text-slate-600 max-w-xs truncate">{exp.description}</td>
                    <td className="px-6 py-3.5 text-slate-500">{getVehicleReg(exp.vehicle_id)}</td>
                    <td className="px-6 py-3.5 text-right font-semibold text-slate-900">₹{Number(exp.amount).toLocaleString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      )}

      <Dialog isOpen={showForm} onClose={() => setShowForm(false)} title="Log Operating Expense"
        footerActions={<>
          <Button variant="outline" onClick={() => setShowForm(false)}>Cancel</Button>
          <Button isLoading={saving} onClick={handleSave}>Log Expense</Button>
        </>}
      >
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className={labelClass}>Date *</label>
              <input type="date" className={inputClass} value={form.date} onChange={e => setForm({ ...form, date: e.target.value })} />
            </div>
            <div>
              <label className={labelClass}>Type</label>
              <select className={inputClass} value={form.type} onChange={e => setForm({ ...form, type: e.target.value as Expense['type'] })}>
                {CATEGORIES.map(c => <option key={c} value={c} className="capitalize">{c}</option>)}
              </select>
            </div>
          </div>
          <div>
            <label className={labelClass}>Vehicle *</label>
            <select className={inputClass} value={form.vehicle_id} onChange={e => setForm({ ...form, vehicle_id: e.target.value })}>
              <option value="">Select vehicle…</option>
              {vehicles.map(v => <option key={v.id} value={v.id}>{v.registration_number}</option>)}
            </select>
          </div>
          <div>
            <label className={labelClass}>Description *</label>
            <textarea className={`${inputClass} resize-none`} rows={2} placeholder="Describe the expense…" value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} />
          </div>
          <div>
            <label className={labelClass}>Amount (₹) *</label>
            <input type="number" className={inputClass} value={form.amount} onChange={e => setForm({ ...form, amount: Number(e.target.value) })} />
          </div>
        </div>
      </Dialog>
    </div>
  );
};
