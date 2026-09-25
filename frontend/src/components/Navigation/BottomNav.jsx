import { NavLink } from 'react-router-dom'
import { Home, BarChart2, User } from 'lucide-react'

const tabs = [
  { path: '/', icon: Home, label: 'Home' },
  { path: '/insights', icon: BarChart2, label: 'Insights' },
  { path: '/profile', icon: User, label: 'Profile' },
]

export default function BottomNav() {
  return (
    <nav className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-md
                    bg-surface-800/95 backdrop-blur-xl border-t border-surface-600
                    bottom-nav z-40">
      <div className="flex items-center justify-around px-4 pt-3">
        {tabs.map(({ path, icon: Icon, label }) => (
          <NavLink
            key={path}
            to={path}
            end={path === '/'}
            className={({ isActive }) =>
              `flex flex-col items-center gap-1 px-6 py-1 rounded-xl transition-all ${
                isActive
                  ? 'text-primary-400'
                  : 'text-slate-500 hover:text-slate-300'
              }`
            }
          >
            {({ isActive }) => (
              <>
                <div className={`p-1.5 rounded-xl transition-all ${isActive ? 'bg-primary-500/15' : ''}`}>
                  <Icon className="w-5 h-5" strokeWidth={isActive ? 2.5 : 2} />
                </div>
                <span className={`text-xs font-medium ${isActive ? 'opacity-100' : 'opacity-60'}`}>
                  {label}
                </span>
              </>
            )}
          </NavLink>
        ))}
      </div>
    </nav>
  )
}
