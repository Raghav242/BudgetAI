import { useState, useEffect } from 'react'
import { useAuth } from '../context/AuthContext'
import { authAPI, budgetsAPI, savingsAPI } from '../services/api'
import Modal from '../components/Common/Modal'
import {
  User, Settings, Target, Wallet, Plus, Trash2,
  LogOut, ChevronRight, Edit2, Check, X,
} from 'lucide-react'
import toast from 'react-hot-toast'
import { format } from 'date-fns'

const CATEGORIES = [
  'Food & Dining', 'Transportation', 'Shopping', 'Entertainment',
  'Housing', 'Healthcare', 'Education', 'Utilities',
  'Personal Care', 'Travel', 'Investment', 'Other',
]

const CURRENCIES = ['USD', 'EUR', 'GBP', 'INR', 'JPY', 'CAD', 'AUD']

const now = new Date()

export default function ProfilePage() {
  const { user, logout, updateUser } = useAuth()
  const [budgets, setBudgets] = useState([])
  const [savings, setSavings] = useState([])
  const [showBudgetModal, setShowBudgetModal] = useState(false)
  const [showSavingsModal, setShowSavingsModal] = useState(false)
  const [editingName, setEditingName] = useState(false)
  const [nameInput, setNameInput] = useState(user?.name || '')
  const [budgetForm, setBudgetForm] = useState({ category: 'overall', limit_amount: '', month: now.getMonth() + 1, year: now.getFullYear() })
  const [savingsForm, setSavingsForm] = useState({ name: '', target_amount: '', current_amount: '0', deadline: '' })

  useEffect(() => {
    Promise.all([budgetsAPI.getAll(), savingsAPI.getAll()])
      .then(([b, s]) => { setBudgets(b.data); setSavings(s.data) })
      .catch(() => toast.error('Failed to load profile data'))
  }, [])

  const handleSaveName = async () => {
    try {
      const res = await authAPI.updateProfile({ name: nameInput })
      updateUser(res.data)
      setEditingName(false)
      toast.success('Name updated')
    } catch {
      toast.error('Failed to update name')
    }
  }

  const handleCurrencyChange = async (currency) => {
    try {
      const res = await authAPI.updateProfile({ currency })
      updateUser(res.data)
      toast.success('Currency updated')
    } catch {
      toast.error('Failed to update currency')
    }
  }

  const handleAddBudget = async (e) => {
    e.preventDefault()
    if (!budgetForm.limit_amount) return toast.error('Enter a budget limit')
    try {
      const res = await budgetsAPI.create({
        ...budgetForm,
        limit_amount: parseFloat(budgetForm.limit_amount),
      })
      setBudgets([...budgets, { ...res.data, spent: 0, percentage: 0 }])
      setShowBudgetModal(false)
      setBudgetForm({ category: 'overall', limit_amount: '', month: now.getMonth() + 1, year: now.getFullYear() })
      toast.success('Budget added')
    } catch (err) {
      toast.error(err.response?.data?.detail || 'Failed to add budget')
    }
  }

  const handleDeleteBudget = async (id) => {
    await budgetsAPI.delete(id)
    setBudgets(budgets.filter((b) => b.id !== id))
    toast.success('Budget deleted')
  }

  const handleAddSavings = async (e) => {
    e.preventDefault()
    if (!savingsForm.name || !savingsForm.target_amount) return toast.error('Fill required fields')
    try {
      const res = await savingsAPI.create({
        name: savingsForm.name,
        target_amount: parseFloat(savingsForm.target_amount),
        current_amount: parseFloat(savingsForm.current_amount || 0),
        deadline: savingsForm.deadline ? new Date(savingsForm.deadline).toISOString() : null,
      })
      setSavings([...savings, res.data])
      setShowSavingsModal(false)
      setSavingsForm({ name: '', target_amount: '', current_amount: '0', deadline: '' })
      toast.success('Savings goal added')
    } catch {
      toast.error('Failed to add savings goal')
    }
  }

  const handleDeleteSavings = async (id) => {
    await savingsAPI.delete(id)
    setSavings(savings.filter((s) => s.id !== id))
    toast.success('Goal deleted')
  }

  const Section = ({ title, children }) => (
    <div>
      <h2 className="text-xs font-semibold text-slate-500 uppercase tracking-wider px-1 mb-2">{title}</h2>
      <div className="card divide-y divide-surface-600/50">{children}</div>
    </div>
  )

  const RowItem = ({ icon: Icon, label, value, onClick, danger }) => (
    <button
      onClick={onClick}
      className={`w-full flex items-center gap-3 p-4 hover:bg-surface-700/50 transition-colors text-left
                  ${danger ? 'text-red-400' : ''}`}
    >
      <Icon className={`w-5 h-5 flex-shrink-0 ${danger ? 'text-red-400' : 'text-slate-400'}`} />
      <span className={`flex-1 text-sm font-medium ${danger ? '' : 'text-slate-200'}`}>{label}</span>
      {value && <span className="text-xs text-slate-500">{value}</span>}
      <ChevronRight className="w-4 h-4 text-slate-600" />
    </button>
  )

  return (
    <div className="px-4 pt-4 pb-2 space-y-5 animate-fade-in">
      <h1 className="text-xl font-bold text-slate-100">Profile</h1>

      {/* User Card */}
      <div className="card p-5">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 gradient-primary rounded-2xl flex items-center justify-center text-xl font-bold text-white flex-shrink-0">
            {(user?.name || user?.email || 'U')[0].toUpperCase()}
          </div>
          <div className="flex-1 min-w-0">
            {editingName ? (
              <div className="flex items-center gap-2">
                <input
                  className="input py-1.5 text-sm"
                  value={nameInput}
                  onChange={(e) => setNameInput(e.target.value)}
                  autoFocus
                />
                <button onClick={handleSaveName} className="text-emerald-400 hover:text-emerald-300">
                  <Check className="w-4 h-4" />
                </button>
                <button onClick={() => setEditingName(false)} className="text-slate-400">
                  <X className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <p className="font-semibold text-slate-100 truncate">{user?.name || 'Set your name'}</p>
                <button onClick={() => { setNameInput(user?.name || ''); setEditingName(true) }}
                  className="text-slate-500 hover:text-slate-300">
                  <Edit2 className="w-3.5 h-3.5" />
                </button>
              </div>
            )}
            <p className="text-sm text-slate-400 truncate">{user?.email}</p>
          </div>
        </div>
      </div>

      {/* Currency */}
      <Section title="Settings">
        <div className="p-4">
          <div className="flex items-center gap-3 mb-3">
            <Settings className="w-5 h-5 text-slate-400" />
            <span className="text-sm font-medium text-slate-200 flex-1">Currency</span>
          </div>
          <div className="flex flex-wrap gap-2">
            {CURRENCIES.map((c) => (
              <button
                key={c}
                onClick={() => handleCurrencyChange(c)}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                  user?.currency === c
                    ? 'bg-primary-500/20 text-primary-400 border border-primary-500/30'
                    : 'bg-surface-700 text-slate-400 border border-surface-600'
                }`}
              >
                {c}
              </button>
            ))}
          </div>
        </div>
      </Section>

      {/* Budgets */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <h2 className="text-xs font-semibold text-slate-500 uppercase tracking-wider px-1">
            Monthly Budgets
          </h2>
          <button onClick={() => setShowBudgetModal(true)}
            className="flex items-center gap-1 text-xs text-primary-400 hover:text-primary-300">
            <Plus className="w-3.5 h-3.5" />Add
          </button>
        </div>
        <div className="card divide-y divide-surface-600/50">
          {budgets.length === 0 ? (
            <div className="py-8 text-center text-slate-500 text-sm">
              <Wallet className="w-6 h-6 mx-auto mb-2 opacity-40" />
              No budgets set
            </div>
          ) : (
            budgets.map((b) => (
              <div key={b.id} className="flex items-center gap-3 p-3.5">
                <div className="flex-1">
                  <p className="text-sm font-medium text-slate-200 capitalize">{b.category}</p>
                  <p className="text-xs text-slate-500">${b.spent?.toFixed(2) || '0.00'} of ${b.limit_amount.toFixed(2)}</p>
                </div>
                <button onClick={() => handleDeleteBudget(b.id)}
                  className="p-1.5 text-slate-500 hover:text-red-400 transition-colors">
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Savings Goals */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <h2 className="text-xs font-semibold text-slate-500 uppercase tracking-wider px-1">Savings Goals</h2>
          <button onClick={() => setShowSavingsModal(true)}
            className="flex items-center gap-1 text-xs text-primary-400 hover:text-primary-300">
            <Plus className="w-3.5 h-3.5" />Add
          </button>
        </div>
        <div className="card divide-y divide-surface-600/50">
          {savings.length === 0 ? (
            <div className="py-8 text-center text-slate-500 text-sm">
              <Target className="w-6 h-6 mx-auto mb-2 opacity-40" />
              No savings goals yet
            </div>
          ) : (
            savings.map((s) => {
              const pct = Math.min((s.current_amount / s.target_amount) * 100, 100)
              return (
                <div key={s.id} className="p-3.5">
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <p className="text-sm font-medium text-slate-200">{s.name}</p>
                      {s.deadline && (
                        <p className="text-xs text-slate-500">{format(new Date(s.deadline), 'MMM d, yyyy')}</p>
                      )}
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-slate-400">${s.current_amount.toFixed(0)} / ${s.target_amount.toFixed(0)}</span>
                      <button onClick={() => handleDeleteSavings(s.id)}
                        className="p-1 text-slate-500 hover:text-red-400">
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                  <div className="h-1.5 bg-surface-700 rounded-full overflow-hidden">
                    <div className="h-full bg-emerald-500 rounded-full" style={{ width: `${pct}%` }} />
                  </div>
                  <p className="text-xs text-emerald-400 mt-1">{pct.toFixed(0)}% reached</p>
                </div>
              )
            })
          )}
        </div>
      </div>

      {/* Logout */}
      <div className="card">
        <RowItem icon={LogOut} label="Sign Out" onClick={logout} danger />
      </div>

      {/* Budget Modal */}
      <Modal isOpen={showBudgetModal} onClose={() => setShowBudgetModal(false)} title="Set Budget">
        <form onSubmit={handleAddBudget} className="p-5 space-y-4">
          <div>
            <label className="text-xs font-medium text-slate-400 uppercase tracking-wider mb-1.5 block">Category</label>
            <select className="input" value={budgetForm.category}
              onChange={(e) => setBudgetForm({ ...budgetForm, category: e.target.value })}>
              <option value="overall">Overall (All Expenses)</option>
              {CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>
          <div>
            <label className="text-xs font-medium text-slate-400 uppercase tracking-wider mb-1.5 block">Monthly Limit</label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">$</span>
              <input className="input pl-8" type="number" step="0.01" min="1" placeholder="0.00"
                value={budgetForm.limit_amount}
                onChange={(e) => setBudgetForm({ ...budgetForm, limit_amount: e.target.value })} required />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-medium text-slate-400 uppercase tracking-wider mb-1.5 block">Month</label>
              <select className="input" value={budgetForm.month}
                onChange={(e) => setBudgetForm({ ...budgetForm, month: parseInt(e.target.value) })}>
                {Array.from({ length: 12 }, (_, i) => (
                  <option key={i + 1} value={i + 1}>
                    {new Date(2024, i).toLocaleString('default', { month: 'short' })}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="text-xs font-medium text-slate-400 uppercase tracking-wider mb-1.5 block">Year</label>
              <select className="input" value={budgetForm.year}
                onChange={(e) => setBudgetForm({ ...budgetForm, year: parseInt(e.target.value) })}>
                {[now.getFullYear() - 1, now.getFullYear(), now.getFullYear() + 1].map((y) => (
                  <option key={y} value={y}>{y}</option>
                ))}
              </select>
            </div>
          </div>
          <button type="submit" className="btn-primary w-full">Add Budget</button>
        </form>
      </Modal>

      {/* Savings Modal */}
      <Modal isOpen={showSavingsModal} onClose={() => setShowSavingsModal(false)} title="Add Savings Goal">
        <form onSubmit={handleAddSavings} className="p-5 space-y-4">
          <div>
            <label className="text-xs font-medium text-slate-400 uppercase tracking-wider mb-1.5 block">Goal Name</label>
            <input className="input" placeholder="e.g. Emergency Fund, Vacation..."
              value={savingsForm.name}
              onChange={(e) => setSavingsForm({ ...savingsForm, name: e.target.value })} required />
          </div>
          <div>
            <label className="text-xs font-medium text-slate-400 uppercase tracking-wider mb-1.5 block">Target Amount</label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">$</span>
              <input className="input pl-8" type="number" step="0.01" min="1" placeholder="0.00"
                value={savingsForm.target_amount}
                onChange={(e) => setSavingsForm({ ...savingsForm, target_amount: e.target.value })} required />
            </div>
          </div>
          <div>
            <label className="text-xs font-medium text-slate-400 uppercase tracking-wider mb-1.5 block">Current Amount Saved</label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">$</span>
              <input className="input pl-8" type="number" step="0.01" min="0" placeholder="0.00"
                value={savingsForm.current_amount}
                onChange={(e) => setSavingsForm({ ...savingsForm, current_amount: e.target.value })} />
            </div>
          </div>
          <div>
            <label className="text-xs font-medium text-slate-400 uppercase tracking-wider mb-1.5 block">
              Deadline <span className="text-slate-600">(optional)</span>
            </label>
            <input className="input" type="date"
              value={savingsForm.deadline}
              onChange={(e) => setSavingsForm({ ...savingsForm, deadline: e.target.value })} />
          </div>
          <button type="submit" className="btn-primary w-full">Add Goal</button>
        </form>
      </Modal>
    </div>
  )
}
