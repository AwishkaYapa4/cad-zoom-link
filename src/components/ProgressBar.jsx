// src/components/ProgressBar.jsx

// Simple colored progress bar: value/max clamped to 0-100%.
export default function ProgressBar({ value, max, showLabel = true, barClassName = 'w-24' }) {
  const pct = max > 0 ? Math.min(100, Math.max(0, Math.round((value / max) * 100))) : 0
  const colorClassName = pct === 100 ? 'bg-green-500' : pct >= 50 ? 'bg-brand-500' : 'bg-amber-500'

  return (
    <div className="flex items-center gap-2">
      <div className={`h-2 ${barClassName} flex-shrink-0 overflow-hidden rounded-full bg-slate-100`}>
        <div className={`h-full rounded-full transition-all ${colorClassName}`} style={{ width: `${pct}%` }} />
      </div>
      {showLabel && <span className="text-xs font-semibold text-slate-500">{pct}%</span>}
    </div>
  )
}
