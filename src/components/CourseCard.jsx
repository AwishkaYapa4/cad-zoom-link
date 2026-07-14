// src/components/CourseCard.jsx
import { Link } from 'react-router-dom'
import { ArrowUpRight, BookOpen, CheckCircle2 } from 'lucide-react'
import ProgressBar from './ProgressBar'

// One course, rendered as a self-contained card. Stats are computed
// upstream (Dashboard.jsx) from live Firestore data — this component is
// purely presentational.
export default function CourseCard({
  courseId,
  courseName,
  totalClasses,
  completedClasses,
  remainingClasses,
  detailsTo = `/admin/course/${courseId}`,
}) {
  const progressPct = totalClasses > 0 ? Math.min(100, Math.round((completedClasses / totalClasses) * 100)) : 0
  const isComplete = totalClasses > 0 && completedClasses >= totalClasses

  return (
    <div className="flex flex-col rounded-2xl border border-slate-100 bg-white p-5 shadow-soft transition hover:-translate-y-0.5 hover:shadow-lg">
      <div className="mb-4 flex items-start justify-between gap-2">
        <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl bg-brand-50 text-brand-600">
          <BookOpen className="h-5 w-5" />
        </div>
        {isComplete && (
          <span className="flex items-center gap-1 rounded-full bg-green-50 px-2.5 py-1 text-xs font-semibold text-green-700">
            <CheckCircle2 className="h-3.5 w-3.5" />
            Completed
          </span>
        )}
      </div>

      <h3 className="mb-4 line-clamp-2 text-base font-bold leading-snug text-slate-900">{courseName}</h3>

      <div className="mb-4 grid grid-cols-3 gap-2 text-center">
        <div className="rounded-xl bg-slate-50 py-2.5">
          <p className="text-lg font-bold text-slate-900">{totalClasses}</p>
          <p className="text-[11px] font-medium text-slate-400">Total</p>
        </div>
        <div className="rounded-xl bg-slate-50 py-2.5">
          <p className="text-lg font-bold text-green-600">{completedClasses}</p>
          <p className="text-[11px] font-medium text-slate-400">Completed</p>
        </div>
        <div className="rounded-xl bg-slate-50 py-2.5">
          <p className="text-lg font-bold text-amber-600">{remainingClasses}</p>
          <p className="text-[11px] font-medium text-slate-400">Remaining</p>
        </div>
      </div>

      <div className="mb-5">
        <div className="mb-1.5 flex items-center justify-between text-xs font-semibold text-slate-500">
          <span>Progress</span>
          <span>{progressPct}%</span>
        </div>
        <ProgressBar value={completedClasses} max={totalClasses} showLabel={false} barClassName="w-full" />
      </div>

      <Link
        to={detailsTo}
        className="mt-auto flex items-center justify-center gap-2 rounded-xl bg-brand-600 py-2.5 text-sm font-bold text-white shadow-soft transition hover:bg-brand-700 active:scale-[0.99]"
      >
        View Details
        <ArrowUpRight className="h-4 w-4" />
      </Link>
    </div>
  )
}
