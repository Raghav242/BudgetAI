import { Activity } from 'lucide-react'

const GRADE_COLORS = {
  A: { bg: 'bg-emerald-500/15', border: 'border-emerald-500/30', text: 'text-emerald-400', ring: '#22c55e' },
  B: { bg: 'bg-blue-500/15', border: 'border-blue-500/30', text: 'text-blue-400', ring: '#3b82f6' },
  C: { bg: 'bg-amber-500/15', border: 'border-amber-500/30', text: 'text-amber-400', ring: '#f59e0b' },
  D: { bg: 'bg-orange-500/15', border: 'border-orange-500/30', text: 'text-orange-400', ring: '#f97316' },
  F: { bg: 'bg-red-500/15', border: 'border-red-500/30', text: 'text-red-400', ring: '#ef4444' },
}

export default function HealthScoreWidget({ score }) {
  const colors = GRADE_COLORS[score.grade] || GRADE_COLORS.C
  const pct = score.score

  return (
    <div className={`card p-4 border ${colors.border} ${colors.bg}`}>
      <div className="flex items-center gap-3">
        <div className="relative w-14 h-14 flex-shrink-0">
          <svg className="w-14 h-14 -rotate-90" viewBox="0 0 56 56">
            <circle cx="28" cy="28" r="24" fill="none" stroke="#1e1e30" strokeWidth="6" />
            <circle
              cx="28" cy="28" r="24" fill="none"
              stroke={colors.ring} strokeWidth="6"
              strokeDasharray={`${2 * Math.PI * 24}`}
              strokeDashoffset={`${2 * Math.PI * 24 * (1 - pct / 100)}`}
              strokeLinecap="round"
            />
          </svg>
          <span className={`absolute inset-0 flex items-center justify-center text-sm font-bold ${colors.text}`}>
            {score.grade}
          </span>
        </div>

        <div className="flex-1">
          <div className="flex items-center gap-2">
            <Activity className={`w-4 h-4 ${colors.text}`} />
            <span className="text-sm font-semibold text-slate-200">Financial Health</span>
          </div>
          <p className={`text-lg font-bold ${colors.text}`}>{score.label}</p>
          <p className="text-xs text-slate-500">{score.score}/100 score</p>
        </div>

        <div className="text-right text-xs text-slate-500 space-y-1">
          <div className="flex items-center gap-1 justify-end">
            <span>Budget</span>
            <span className="text-slate-300 font-medium">{score.breakdown.budget_adherence}/40</span>
          </div>
          <div className="flex items-center gap-1 justify-end">
            <span>Savings</span>
            <span className="text-slate-300 font-medium">{score.breakdown.savings_rate}/30</span>
          </div>
          <div className="flex items-center gap-1 justify-end">
            <span>Consistency</span>
            <span className="text-slate-300 font-medium">{score.breakdown.spending_consistency}/30</span>
          </div>
        </div>
      </div>
    </div>
  )
}
