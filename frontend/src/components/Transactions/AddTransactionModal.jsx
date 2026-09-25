import { useState, useEffect } from 'react'
import Modal from '../Common/Modal'
import { format } from 'date-fns'
import toast from 'react-hot-toast'

const CATEGORIES = [
  'Food & Dining', 'Transportation', 'Shopping', 'Entertainment',
  'Housing', 'Healthcare', 'Education', 'Utilities',
  'Personal Care', 'Travel', 'Investment', 'Other',
]

const RECURRING_INTERVALS = ['weekly', 'monthly', 'yearly']

const DEFAULTS = {
  amount: '',
  category: 'Food & Dining',
  type: 'expense',
  date: format(new Date(), 'yyyy-MM-dd'),
  notes: '',
  is_recurring: false,
  recurring_interval: 'monthly',
}

export default function AddTransactionModal({ isOpen, onClose, onSave, editData }) {
  const [form, setForm] = useState(DEFAULTS)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (editData) {
      setForm({
        amount: editData.amount.toString(),
        category: editData.category,
        type: editData.type,
        date: format(new Date(editData.date), 'yyyy-MM-dd'),
        notes: editData.notes || '',
        is_recurring: editData.is_recurring,
        recurring_interval: editData.recurring_interval || 'monthly',
      })
    } else {
      setForm(DEFAULTS)
    }
  }, [editData, isOpen])

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!form.amount || parseFloat(form.amount) <= 0) return toast.error('Enter a valid amount')

    setLoading(true)
    try {
      await onSave({
        amount: parseFloat(form.amount),
        category: form.category,
        type: form.type,
        date: new Date(form.date).toISOString(),
        notes: form.notes || null,
        is_recurring: form.is_recurring,
        recurring_interval: form.is_recurring ? form.recurring_interval : null,
      })
      onClose()
    } catch (err) {
      toast.error(err.response?.data?.detail || 'Failed to save transaction')
    } finally {
      setLoading(false)
    }
  }

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={editData ? 'Edit Transaction' : 'Add Transaction'}>
      <form onSubmit={handleSubmit} className="p-5 space-y-4">
        {/* Type Toggle */}
        <div className="flex gap-2 bg-surface-700 p-1 rounded-xl">
          {['expense', 'income'].map((t) => (
            <button
              key={t}
              type="button"
              onClick={() => setForm({ ...form, type: t })}
              className={`flex-1 py-2 rounded-lg text-sm font-medium capitalize transition-all ${
                form.type === t
                  ? t === 'expense'
                    ? 'bg-red-500/20 text-red-400 border border-red-500/30'
                    : 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                  : 'text-slate-400'
              }`}
            >
              {t}
            </button>
          ))}
        </div>

        {/* Amount */}
        <div>
          <label className="text-xs font-medium text-slate-400 uppercase tracking-wider mb-1.5 block">Amount</label>
          <div className="relative">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 font-medium">$</span>
            <input
              className="input pl-8"
              type="number"
              step="0.01"
              min="0.01"
              placeholder="0.00"
              value={form.amount}
              onChange={(e) => setForm({ ...form, amount: e.target.value })}
              required
              autoFocus
            />
          </div>
        </div>

        {/* Category */}
        <div>
          <label className="text-xs font-medium text-slate-400 uppercase tracking-wider mb-1.5 block">Category</label>
          <select
            className="input"
            value={form.category}
            onChange={(e) => setForm({ ...form, category: e.target.value })}
          >
            {CATEGORIES.map((c) => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>
        </div>

        {/* Date */}
        <div>
          <label className="text-xs font-medium text-slate-400 uppercase tracking-wider mb-1.5 block">Date</label>
          <input
            className="input"
            type="date"
            value={form.date}
            onChange={(e) => setForm({ ...form, date: e.target.value })}
            required
          />
        </div>

        {/* Notes */}
        <div>
          <label className="text-xs font-medium text-slate-400 uppercase tracking-wider mb-1.5 block">
            Notes <span className="text-slate-600">(optional)</span>
          </label>
          <input
            className="input"
            type="text"
            placeholder="Add a note..."
            value={form.notes}
            onChange={(e) => setForm({ ...form, notes: e.target.value })}
          />
        </div>

        {/* Recurring */}
        <div className="flex items-center justify-between p-3 bg-surface-700 rounded-xl">
          <div>
            <p className="text-sm font-medium text-slate-200">Recurring</p>
            <p className="text-xs text-slate-500">Repeats automatically</p>
          </div>
          <button
            type="button"
            onClick={() => setForm({ ...form, is_recurring: !form.is_recurring })}
            className={`w-11 h-6 rounded-full transition-all relative ${
              form.is_recurring ? 'bg-primary-500' : 'bg-surface-500'
            }`}
          >
            <span className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-all shadow-sm ${
              form.is_recurring ? 'left-6' : 'left-1'
            }`} />
          </button>
        </div>

        {form.is_recurring && (
          <div>
            <label className="text-xs font-medium text-slate-400 uppercase tracking-wider mb-1.5 block">Interval</label>
            <div className="flex gap-2">
              {RECURRING_INTERVALS.map((i) => (
                <button
                  key={i}
                  type="button"
                  onClick={() => setForm({ ...form, recurring_interval: i })}
                  className={`flex-1 py-2 rounded-xl text-xs font-medium capitalize border transition-all ${
                    form.recurring_interval === i
                      ? 'border-primary-500 bg-primary-500/15 text-primary-400'
                      : 'border-surface-500 text-slate-400'
                  }`}
                >
                  {i}
                </button>
              ))}
            </div>
          </div>
        )}

        <button
          type="submit"
          disabled={loading}
          className="btn-primary w-full flex items-center justify-center gap-2"
        >
          {loading ? (
            <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
          ) : editData ? 'Update Transaction' : 'Add Transaction'}
        </button>
      </form>
    </Modal>
  )
}
