import { format } from 'date-fns'
import { Pencil, Trash2, RefreshCw } from 'lucide-react'

const CATEGORY_ICONS = {
  'Food & Dining': '🍔',
  Transportation: '🚗',
  Shopping: '🛍️',
  Entertainment: '🎬',
  Housing: '🏠',
  Healthcare: '🏥',
  Education: '📚',
  Utilities: '⚡',
  'Personal Care': '💄',
  Travel: '✈️',
  Investment: '📈',
  Income: '💰',
  Other: '📦',
}

export default function TransactionItem({ transaction, onEdit, onDelete }) {
  const isIncome = transaction.type === 'income'
  const icon = CATEGORY_ICONS[transaction.category] || '💳'

  return (
    <div className="flex items-center gap-3 p-3.5 rounded-xl hover:bg-surface-700/50 transition-colors group">
      <div className="w-11 h-11 rounded-xl bg-surface-700 flex items-center justify-center text-xl flex-shrink-0">
        {icon}
      </div>

      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-slate-200 truncate">{transaction.category}</p>
        <p className="text-xs text-slate-500 mt-0.5 flex items-center gap-1">
          {format(new Date(transaction.date), 'MMM d, yyyy')}
          {transaction.is_recurring && (
            <span className="flex items-center gap-0.5 text-primary-400">
              <RefreshCw className="w-3 h-3" />
              {transaction.recurring_interval}
            </span>
          )}
        </p>
        {transaction.notes && (
          <p className="text-xs text-slate-600 truncate mt-0.5">{transaction.notes}</p>
        )}
      </div>

      <div className="flex items-center gap-2">
        <span className={`text-sm font-semibold tabular-nums ${isIncome ? 'amount-income' : 'amount-expense'}`}>
          {isIncome ? '+' : '-'}${transaction.amount.toFixed(2)}
        </span>

        <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
          <button
            onClick={() => onEdit(transaction)}
            className="p-1.5 rounded-lg hover:bg-surface-600 text-slate-400 hover:text-slate-200 transition-colors"
          >
            <Pencil className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={() => onDelete(transaction.id)}
            className="p-1.5 rounded-lg hover:bg-red-500/20 text-slate-400 hover:text-red-400 transition-colors"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  )
}
