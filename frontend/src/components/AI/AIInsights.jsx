import { useState } from 'react'
import { aiAPI } from '../../services/api'
import { Sparkles, TrendingUp, AlertTriangle, Lightbulb, CheckCircle, AlertCircle, RefreshCw } from 'lucide-react'
import toast from 'react-hot-toast'

const ICON_MAP = {
  trending_up: TrendingUp,
  warning: AlertTriangle,
  lightbulb: Lightbulb,
  check_circle: CheckCircle,
  alert_circle: AlertCircle,
}

const TYPE_STYLES = {
  warning: { border: 'border-amber-500/30', bg: 'bg-amber-500/10', text: 'text-amber-400', dot: 'bg-amber-400' },
  tip: { border: 'border-primary-500/30', bg: 'bg-primary-500/10', text: 'text-primary-400', dot: 'bg-primary-400' },
  achievement: { border: 'border-emerald-500/30', bg: 'bg-emerald-500/10', text: 'text-emerald-400', dot: 'bg-emerald-400' },
  alert: { border: 'border-red-500/30', bg: 'bg-red-500/10', text: 'text-red-400', dot: 'bg-red-400' },
}

export default function AIInsights() {
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(false)
  const [generated, setGenerated] = useState(false)

  const generateInsights = async () => {
    setLoading(true)
    try {
      const res = await aiAPI.analyze({})
      setData(res.data)
      setGenerated(true)
    } catch {
      toast.error('Failed to generate AI insights')
    } finally {
      setLoading(false)
    }
  }

  if (!generated) {
    return (
      <div className="card p-8 text-center space-y-4">
        <div className="w-16 h-16 gradient-primary rounded-2xl flex items-center justify-center mx-auto">
          <Sparkles className="w-8 h-8 text-white" />
        </div>
        <div>
          <h3 className="text-lg font-semibold text-slate-100">AI Financial Insights</h3>
          <p className="text-sm text-slate-400 mt-1">
            Get personalized insights about your spending patterns and savings opportunities
          </p>
        </div>
        <button onClick={generateInsights} disabled={loading} className="btn-primary mx-auto flex items-center gap-2">
          {loading ? (
            <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
          ) : <Sparkles className="w-4 h-4" />}
          {loading ? 'Analyzing...' : 'Generate Insights'}
        </button>
      </div>
    )
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-primary-400" />
          <span className="text-sm font-semibold text-slate-200">AI Insights</span>
        </div>
        <button
          onClick={generateInsights}
          disabled={loading}
          className="flex items-center gap-1.5 text-xs text-slate-400 hover:text-slate-200 transition-colors"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
          Refresh
        </button>
      </div>

      {data?.overall_assessment && (
        <div className="card p-3.5 border-primary-500/20 bg-primary-500/5">
          <p className="text-sm text-slate-300 leading-relaxed">{data.overall_assessment}</p>
        </div>
      )}

      {data?.insights?.map((insight, i) => {
        const styles = TYPE_STYLES[insight.type] || TYPE_STYLES.tip
        const Icon = ICON_MAP[insight.icon] || Lightbulb
        return (
          <div key={i} className={`card p-4 border ${styles.border} ${styles.bg}`}>
            <div className="flex gap-3">
              <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${styles.bg} border ${styles.border} flex-shrink-0`}>
                <Icon className={`w-4 h-4 ${styles.text}`} />
              </div>
              <div>
                <p className={`text-sm font-semibold ${styles.text}`}>{insight.title}</p>
                <p className="text-sm text-slate-300 mt-1 leading-relaxed">{insight.message}</p>
              </div>
            </div>
          </div>
        )
      })}
    </div>
  )
}
