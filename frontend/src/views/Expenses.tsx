import React, { useEffect, useState } from 'react';
import { Plus } from 'lucide-react';
import { expenseService } from '../api/expenseService';
import type { Expense } from '../types';
import { Card, CardContent } from '../components/card/card';
import { Button } from '../components/button/button';
import { Dialog } from '../components/dialog/dialog';
import { SkeletonLoader, EmptyState } from '../components/states/states';
import { useToast } from '../components/toast/toast';

const CATEGORIES = ['fuel', 'maintenance', 'toll', 'insurance', 'payout', 'other'] as const;
const categoryColors: Record<string, string> = {
  fuel: 'bg-blue-50 text-blue-700',
  maintenance: 'bg-amber-50 text-amber-700',
  toll: 'bg-slate-100 text-slate-700',
  insurance: 'bg-indigo-50 text-indigo-700',
  payout: 'bg-emerald-50 text-emerald-700',
  other: 'bg-rose-50 text-rose-700'
};

export const Expenses: React.FC = () => {
  const { success, error } = useToast();
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [loading, setLoading] = useState(true);
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [showForm, setShowForm] = useState(false);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({ date: '', category: 'fuel' as Expense['category'], amount: 0, description: '' });

  const loadData = async () => {
    setLoading(true);
    const data = await expenseService.getExpenses();
    setExpenses(data);
    setLoading(false);
  };

  useEffect(() => { loadData(); }, []);

  const filtered = expenses.filter(e => categoryFilter === 'all' || e.category === categoryFilter);
  const total = filtered.reduce((s, e) => s + e.amount, 0);

  const handleSave = async () => {
    if (!form.date || !form.description || !form.amount) { error('All fields are required.'); return; }
    setSaving(true);
    const expense: Expense = { id: `e-${Date.now()}`, ...form };
    await expenseService.saveExpense(expense);
    success(`Expense of ₹${expense.amount.toLocaleString()} logged under ${expense.category}.`);
    setSaving(false); setShowForm(false);
    setForm({ date: '', category: 'fuel', amount: 0, description: '' });
    loadData();
  };

  const inputClass = 'w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all';
  const labelClass = 'block text-xs font-semibold text-slate-700 mb-1';

  if (loading) return <div className="space-y-6"><SkeletonLoader type="kpi" /><SkeletonLoader type="table" /></div>;

  // Group by category for summary
  const categorySums = CATEGORIES.map(cat => ({
    category: cat,
    total: expenses.filter(e => e.category === cat).reduce((s, e) => s + e.amount, 0)
  }));

  return (
    <div className="space-y-6">
      {/* Category Summary Cards */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
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

      {/* Controls */}
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

      {/* Table */}
      {filtered.length === 0 ? (
        <EmptyState title="No expenses found" description="Log an expense to start tracking." actionText="Log Expense" onAction={() => setShowForm(true)} />
      ) : (
        <Card>
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="bg-slate-50 border-b border-slate-200">
                <tr>
                  <th className="px-6 py-3 text-[11px] font-semibold text-slate-500 uppercase tracking-wider">Date</th>
                  <th className="px-6 py-3 text-[11px] font-semibold text-slate-500 uppercase tracking-wider">Category</th>
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
                      <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold capitalize ${categoryColors[exp.category]}`}>
                        {exp.category}
                      </span>
                    </td>
                    <td className="px-6 py-3.5 text-slate-600 max-w-xs truncate">{exp.description}</td>
                    <td className="px-6 py-3.5 text-slate-500">{exp.vehiclePlate || '—'}</td>
                    <td className="px-6 py-3.5 text-right font-semibold text-slate-900">₹{exp.amount.toLocaleString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      )}

      {/* Add Form */}
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
              <label className={labelClass}>Category</label>
              <select className={inputClass} value={form.category} onChange={e => setForm({ ...form, category: e.target.value as Expense['category'] })}>
                {CATEGORIES.map(c => <option key={c} value={c} className="capitalize">{c}</option>)}
              </select>
            </div>
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
