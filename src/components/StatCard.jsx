// src/components/StatCard.jsx

// Dashboard summary card: icon badge + title + big number + unit caption
// (e.g. "12 Courses"). Used 4x in a grid.
export default function StatCard({ icon: Icon, label, value, unit, accent = 'brand' }) {
  const accentStyles = {
    brand: 'bg-brand-50 text-brand-600',
    sky: 'bg-sky-50 text-sky-600',
    green: 'bg-green-50 text-green-600',
    amber: 'bg-amber-50 text-amber-600',
  }

  return (
    <div className="rounded-2xl border border-slate-100 bg-white p-5 shadow-soft">
      <div className="mb-4 flex items-center justify-between">
        <p className="text-sm font-semibold text-slate-500">{label}</p>
        <div className={`flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-xl ${accentStyles[accent]}`}>
          <Icon className="h-4 w-4" />
        </div>
      </div>
      <p className="text-2xl font-bold leading-tight text-slate-900">
        {value} <span className="text-base font-semibold text-slate-400">{unit}</span>
      </p>
    </div>
  )
}
