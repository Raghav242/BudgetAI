import { useState, useEffect, useCallback } from 'react'
import { Plus, TrendingUp, TrendingDown, Wallet, Search, X, RefreshCw } from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import { transactionsAPI, insightsAPI } from '../services/api'
import TransactionItem from '../components/Transactions/TransactionItem'
import AddTransactionModal from '../components/Transactions/AddTransactionModal'
import HealthScoreWidget from '../components/Dashboard/HealthScoreWidget'
import toast from 'react-hot-toast'
import { format } from 'date-fns'

export default function HomePage() {
  const { user } = useAuth()
  const [transactions, setTransactions] = useState([])
  const [summary, setSummary] = useState(null)
  const [healthScore, setHealthScore] = useState(null)
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [editData, setEditData] = useState(null)
  const [search, setSearch] = useState('')
  const [filter, setFilter] = useState('all') // all | income | expense

  const now = new Date()
  const greeting = now.getHours() < 12 ? 'Good morning' : now.getHours() < 17 ? 'Good afternoon' : 'Good evening'
  const firstName = user?.name?.split(' ')[0] || user?.email?.split('@')[0] || 'there'

  const fetchData = useCallback(async () => {
    setLoading(true)
    try {
      const [txRes, sumRes, hsRes] = await Promise.all([
        transactionsAPI.getAll({ limit: 50 }),
        insightsAPI.getSummary(),
        insightsAPI.getHealthScore(),
      ])
      setTransactions(txRes.data)
      setSummary(sumRes.data)
      setHealthScore(hsRes.data)
    } catch (err) {
      toast.error('Failed to load data')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { fetchData() }, [fetchData])

  const handleSave = async (data) => {
    if (editData) {
      await transactionsAPI.update(editData.id, data)
      toast.success('Transaction updated')
    } else {
      await transactionsAPI.create(data)
      toast.success('Transaction added')
    }
    fetchData()
  }

  const handleDelete = async (id) => {
    if (!confirm('Delete this transaction?')) return
    await transactionsAPI.delete(id)
    toast.success('Transaction deleted')
    fetchData()
  }

  const handleEdit = (t) => { setEditData(t); setShowModal(true) }
  const handleAdd = () => { setEditData(null); setShowModal(true) }

  const filtered = transactions.filter((t) => {
    const matchesFilter = filter === 'all' || t.type === filter
    const matchesSearch = !search ||
      t.category.toLowerCase().includes(search.toLowerCase()) ||
      (t.notes && t.notes.toLowerCase().includes(search.toLowerCase()))
    return matchesFilter && matchesSearch
  })

  const StatCard = ({ label, value, icon: Icon, color }) => (
    <div className={`card-elevated p-3.5 flex flex-col gap-1.5`}>
      <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${color}`}>
        <Icon className="w-4 h-4 text-white" />
      </div>
      <p className="text-xs text-slate-400">{label}</p>
      <p className="text-base font-bold text-slate-100 tabular-nums">
        ${loading ? '—' : (value || 0).toFixed(2)}
      </p>
    </div>
  )

  return (
    <div className="px-4 pt-4 pb-2 space-y-5 animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-slate-400">{greeting},</p>
          <h1 className="text-xl font-bold text-slate-100">{firstName} 👋</h1>
        </div>
        <div className="w-10 h-10 gradient-primary rounded-xl flex items-center justify-center text-lg font-bold text-white">
          {firstName[0]?.toUpperCase()}
        </div>
      </div>

      {/* Balance Card */}
      <div className="gradient-primary rounded-2xl p-5 shadow-lg">
        <p className="text-indigo-200 text-sm font-medium mb-1">{format(now, 'MMMM yyyy')} Balance</p>
        <p className="text-4xl font-bold text-white tabular-nums">
          {loading ? '—' : `$${((summary?.net_savings) || 0).toFixed(2)}`}
        </p>
        <p className="text-indigo-300 text-xs mt-1">
          {summary?.savings_rate !== undefined
            ? `${summary.savings_rate >= 0 ? '+' : ''}${summary.savings_rate}% savings rate`
            : 'No data yet'}
        </p>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-3 gap-2.5">
        <StatCard label="Income" value={summary?.total_income} icon={TrendingUp} color="bg-emerald-600" />
        <StatCard label="Expenses" value={summary?.total_spent} icon={TrendingDown} color="bg-red-600" />
        <StatCard label="Savings" value={Math.max(0, (summary?.net_savings) || 0)} icon={Wallet} color="bg-primary-600" />
      </div>

      {/* Health Score Widget */}
      {healthScore && <HealthScoreWidget score={healthScore} />}

      {/* Transactions Section */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h2 className="font-semibold text-slate-100">Transactions</h2>
          <button onClick={fetchData} className="p-1.5 text-slate-400 hover:text-slate-200 transition-colors">
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>

        {/* Search & Filter */}
        <div className="space-y-2 mb-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
            <input
              className="input pl-9 pr-9"
              placeholder="Search transactions..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
            {search && (
              <button onClick={() => setSearch('')} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400">
                <X className="w-4 h-4" />
              </button>
            )}
          </div>
          <div className="flex gap-2">
            {['all', 'expense', 'income'].map((f) => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium capitalize transition-all ${
                  filter === f
                    ? 'bg-primary-500/20 text-primary-400 border border-primary-500/30'
                    : 'bg-surface-700 text-slate-400 border border-surface-600'
                }`}
              >
                {f}
              </button>
            ))}
          </div>
        </div>

        {/* List */}
        <div className="card divide-y divide-surface-600/50">
          {loading ? (
            Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="flex items-center gap-3 p-3.5">
                <div className="skeleton w-11 h-11 rounded-xl" />
                <div className="flex-1 space-y-1.5">
                  <div className="skeleton h-4 w-32 rounded" />
                  <div className="skeleton h-3 w-20 rounded" />
                </div>
                <div className="skeleton h-4 w-16 rounded" />
              </div>
            ))
          ) : filtered.length === 0 ? (
            <div className="py-12 text-center">
              <p className="text-2xl mb-2">💸</p>
              <p className="text-slate-400 text-sm">No transactions found</p>
              <button onClick={handleAdd} className="text-primary-400 text-sm mt-1 hover:text-primary-300">
                Add your first one
              </button>
            </div>
          ) : (
            filtered.map((t) => (
              <TransactionItem key={t.id} transaction={t} onEdit={handleEdit} onDelete={handleDelete} />
            ))
          )}
        </div>
      </div>

      {/* FAB */}
      <button
        onClick={handleAdd}
        className="fixed bottom-24 right-4 w-14 h-14 gradient-primary rounded-2xl shadow-lg
                   flex items-center justify-center active:scale-95 transition-transform z-30"
      >
        <Plus className="w-7 h-7 text-white" />
      </button>

      <AddTransactionModal
        isOpen={showModal}
        onClose={() => { setShowModal(false); setEditData(null) }}
        onSave={handleSave}
        editData={editData}
      />
    </div>
  )
}
