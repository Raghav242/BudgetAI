export default function LoadingSpinner({ fullScreen, size = 'md' }) {
  const sizes = { sm: 'w-4 h-4', md: 'w-8 h-8', lg: 'w-12 h-12' }
  const spinner = (
    <div className={`${sizes[size]} border-2 border-surface-600 border-t-primary-500 rounded-full animate-spin`} />
  )

  if (fullScreen) {
    return (
      <div className="fixed inset-0 bg-surface-900 flex items-center justify-center z-50">
        <div className="flex flex-col items-center gap-4">
          {spinner}
          <p className="text-slate-400 text-sm">Loading...</p>
        </div>
      </div>
    )
  }

  return spinner
}
