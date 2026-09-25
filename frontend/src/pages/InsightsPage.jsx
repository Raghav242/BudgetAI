import { useState, useEffect } from 'react'
import {
  PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis,
  CartesianGrid, Tooltip, Legend, ResponsiveContainer,
} from 'recharts'
import { insightsAPI, budgetsAPI } from '../services/api'
import AIInsights from '../components/AI/AIInsights'
import AIChat from '../components/AI/AIChat'
import { MessageCircle, BarChart2, Sparkles, TrendingDown } from 'lucide-react'
import toast from 'react-hot-toast'

const CHART_COLORS = ['#6366f1', '#8b5cf6', '#ec4899', '#f59e0b', '#10b981', '#3b82f6', '#ef4444', '#06b6d4']

const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null
  return (
    <div className="bg-surface-700 border border-surface-500 rounded-xl p-3 shadow-xl">
      {label && <p className="text-xs text-slate-400 mb-1">{label}</p>}
      {payload.map((p, i) => (
        <p key={i} className="text-sm font-medium" style={{ color: p.color }}>
          {p.name}: ${Number(p.value).toFixed(2)}
        </p>
      ))}
    </div>
  )
}

export default function InsightsPage() {
  const [activeTab, setActiveTab] = useState('charts')
  const [chartData, setChartData] = useState(null)
  const [budgets, setBudgets] = useState([])
  const [loading, setLoading] = useState(true)
  const [showChat, setShowChat] = useState(false)
  const [view, setView] = useState('category') // category | trends

  useEffect(() => {
    Promise.all([insightsAPI.getCharts(), budgetsAPI.getAll()])
      .then(([chartsRes, budgetsRes]) => {
        setChartData(chartsRes.data)
        setBudgets(budgetsRes.data)
      })
      .catch(() => toast.error('Failed to load charts'))
      .finally(() => setLoading(false))
  }, [])

  const tabs = [
    { id: 'charts', label: 'Charts', icon: BarChart2 },
    { id: 'ai', label: 'AI Insights', icon: Sparkles },
  ]

  return (
    <div className="px-4 pt-4 pb-2 space-y-5 animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold text-slate-100">Insights</h1>
        <button
          onClick={() => setShowChat(true)}
          className="flex items-center gap-2 px-3 py-2 gradient-primary rounded-xl text-white text-sm font-medium
                     active:scale-95 transition-transform shadow-md"
        >
          <MessageCircle className="w-4 h-4" />
          Ask AI
        </button>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 bg-surface-700 p-1 rounded-xl">
        {tabs.map(({ id, label, icon: Icon }) => (
          <button
            key={id}
            onClick={() => setActiveTab(id)}
            className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg text-sm font-medium transition-all ${
              activeTab === id
                ? 'bg-surface-800 text-primary-400 shadow-sm'
                : 'text-slate-400 hover:text-slate-300'
            }`}
          >
            <Icon className="w-4 h-4" />
            {label}
          </button>
        ))}
      </div>

      {activeTab === 'charts' && (
        <div className="space-y-5">
          {/* View Toggle */}
          <div className="flex gap-2">
            {['category', 'trends'].map((v) => (
              <button
                key={v}
                onClick={() => setView(v)}
                className={`px-4 py-1.5 rounded-lg text-xs font-medium capitalize transition-all ${
                  view === v
                    ? 'bg-primary-500/20 text-primary-400 border border-primary-500/30'
                    : 'bg-surface-700 text-slate-400 border border-surface-600'
                }`}
              >
                {v === 'category' ? 'By Category' : 'Monthly Trend'}
              </button>
            ))}
          </div>

          {view === 'category' && (
            <div className="card p-4">
              <h3 className="text-sm font-semibold text-slate-200 mb-4">Spending by Category</h3>
              {loading ? (
                <div className="h-56 flex items-center justify-center">
                  <div className="w-8 h-8 border-2 border-surface-600 border-t-primary-500 rounded-full animate-spin" />
                </div>
              ) : !chartData?.category_breakdown?.length ? (
                <div className="h-40 flex flex-col items-center justify-center text-slate-400">
                  <TrendingDown className="w-8 h-8 mb-2 opacity-30" />
                  <p className="text-sm">No expenses this month</p>
                </div>
              ) : (
                <>
                  <ResponsiveContainer width="100%" height={220}>
                    <PieChart>
                      <Pie
                        data={chartData.category_breakdown}
                        cx="50%" cy="50%"
                        innerRadius={60} outerRadius={90}
                        paddingAngle={3}
                        dataKey="value"
                      >
                        {chartData.category_breakdown.map((_, i) => (
                          <Cell key={i} fill={CHART_COLORS[i % CHART_COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip content={<CustomTooltip />} />
                    </PieChart>
                  </ResponsiveContainer>
                  <div className="grid grid-cols-2 gap-1.5 mt-3">
                    {chartData.category_breakdown.slice(0, 6).map((item, i) => (
                      <div key={i} className="flex items-center gap-2 text-xs text-slate-300">
                        <span className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ backgroundColor: CHART_COLORS[i % CHART_COLORS.length] }} />
                        <span className="truncate">{item.name}</span>
                        <span className="text-slate-500 ml-auto font-medium">${item.value.toFixed(0)}</span>
                      </div>
                    ))}
                  </div>
                </>
              )}
            </div>
          )}

          {view === 'trends' && (
            <div className="card p-4">
              <h3 className="text-sm font-semibold text-slate-200 mb-4">Monthly Overview</h3>
              {loading ? (
                <div className="h-56 flex items-center justify-center">
                  <div className="w-8 h-8 border-2 border-surface-600 border-t-primary-500 rounded-full animate-spin" />
                </div>
              ) : (
                <ResponsiveContainer width="100%" height={220}>
                  <BarChart data={chartData?.monthly_trends || []} barSize={14} barGap={4}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#1e1e30" vertical={false} />
                    <XAxis dataKey="month" tick={{ fill: '#64748b', fontSize: 11 }} axisLine={false} tickLine={false} />
                    <YAxis tick={{ fill: '#64748b', fontSize: 11 }} axisLine={false} tickLine={false} width={40} />
                    <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(99,102,241,0.08)' }} />
                    <Legend wrapperStyle={{ fontSize: '11px', color: '#94a3b8' }} />
                    <Bar dataKey="income" fill="#22c55e" radius={[4, 4, 0, 0]} name="Income" />
                    <Bar dataKey="expenses" fill="#ef4444" radius={[4, 4, 0, 0]} name="Expenses" />
                  </BarChart>
                </ResponsiveContainer>
              )}
            </div>
          )}

          {/* Budget Progress */}
          {budgets.length > 0 && (
            <div className="card p-4">
              <h3 className="text-sm font-semibold text-slate-200 mb-3">Budget Progress</h3>
              <div className="space-y-3">
                {budgets.map((b) => {
                  const pct = Math.min(b.percentage, 100)
                  const isOver = b.percentage > 100
                  const barColor = isOver ? 'bg-red-500' : b.percentage > 80 ? 'bg-amber-500' : 'bg-primary-500'
                  return (
                    <div key={b.id}>
                      <div className="flex justify-between text-xs mb-1.5">
                        <span className="text-slate-300 font-medium capitalize">{b.category}</span>
                        <span className={isOver ? 'text-red-400' : 'text-slate-400'}>
                          ${b.spent.toFixed(0)} / ${b.limit_amount.toFixed(0)}
                          {isOver && ' ⚠️'}
                        </span>
                      </div>
                      <div className="h-2 bg-surface-700 rounded-full overflow-hidden">
                        <div
                          className={`h-full rounded-full transition-all ${barColor}`}
                          style={{ width: `${pct}%` }}
                        />
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          )}
        </div>
      )}

      {activeTab === 'ai' && <AIInsights />}

      <AIChat isOpen={showChat} onClose={() => setShowChat(false)} />
    </div>
  )
}
