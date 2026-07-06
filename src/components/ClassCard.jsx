// src/components/ClassCard.jsx
import { Video, User, Clock, Calendar, Trash2, ExternalLink } from 'lucide-react'
import { formatClassDate, formatClassTime } from '../utils/dateHelpers'

// `variant="featured"` -> large card used for "This Week's Classes"
// `variant="compact"`  -> small list-row card used for "Upcoming Classes"
export default function ClassCard({ classData, variant = 'featured', canManage = false, onDelete }) {
  const { className, tutorName, startTime, zoomUrl } = classData

  function handleJoin() {
    window.open(zoomUrl, '_blank', 'noopener,noreferrer')
  }

  if (variant === 'compact') {
    return (
      <div className="group flex items-center justify-between gap-4 rounded-xl border border-slate-100 bg-white px-4 py-3.5 shadow-card transition hover:border-brand-200 hover:shadow-soft">
        <div className="flex min-w-0 items-center gap-3">
          <div className="flex h-10 w-10 flex-shrink-0 flex-col items-center justify-center rounded-lg bg-slate-50 text-slate-500">
            <span className="text-[10px] font-semibold uppercase leading-none">
              {formatClassDate(startTime).split(' ')[0]}
            </span>
            <span className="text-xs font-bold leading-tight">
              {formatClassDate(startTime).split(' ')[2]}
            </span>
          </div>
          <div className="min-w-0">
            <p className="truncate text-sm font-semibold text-slate-800">{className}</p>
            <p className="truncate text-xs text-slate-400">
              {tutorName} · {formatClassTime(startTime)}
            </p>
          </div>
        </div>

        <div className="flex flex-shrink-0 items-center gap-2">
          <button
            onClick={handleJoin}
            className="flex items-center gap-1 rounded-lg bg-brand-50 px-2.5 py-1.5 text-xs font-semibold text-brand-700 transition hover:bg-brand-100"
          >
            Join
            <ExternalLink className="h-3 w-3" />
          </button>
          {canManage && (
            <button
              onClick={() => onDelete?.(classData.id)}
              className="flex h-7 w-7 items-center justify-center rounded-lg text-slate-300 transition hover:bg-red-50 hover:text-red-500"
              aria-label="Delete class"
            >
              <Trash2 className="h-3.5 w-3.5" />
            </button>
          )}
        </div>
      </div>
    )
  }

  // Featured / large card
  return (
    <div className="relative flex flex-col justify-between overflow-hidden rounded-2xl border border-slate-100 bg-white p-6 shadow-soft transition hover:-translate-y-0.5 hover:shadow-lg">
      <div className="absolute -right-8 -top-8 h-28 w-28 rounded-full bg-brand-50" />

      {canManage && (
        <button
          onClick={() => onDelete?.(classData.id)}
          className="absolute right-4 top-4 z-10 flex h-8 w-8 items-center justify-center rounded-lg text-slate-300 transition hover:bg-red-50 hover:text-red-500"
          aria-label="Delete class"
        >
          <Trash2 className="h-4 w-4" />
        </button>
      )}

      <div className="relative z-10">
        <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-xl bg-brand-600 shadow-soft">
          <Video className="h-5 w-5 text-white" />
        </div>

        <h3 className="mb-1 text-lg font-bold leading-snug text-slate-900">{className}</h3>

        <div className="mb-4 flex items-center gap-1.5 text-sm text-slate-500">
          <User className="h-3.5 w-3.5" />
          <span>{tutorName}</span>
        </div>

        <div className="mb-5 flex flex-wrap items-center gap-3 text-sm">
          <span className="flex items-center gap-1.5 rounded-lg bg-slate-50 px-2.5 py-1.5 font-medium text-slate-600">
            <Calendar className="h-3.5 w-3.5 text-brand-600" />
            {formatClassDate(startTime)}
          </span>
          <span className="flex items-center gap-1.5 rounded-lg bg-slate-50 px-2.5 py-1.5 font-medium text-slate-600">
            <Clock className="h-3.5 w-3.5 text-brand-600" />
            {formatClassTime(startTime)}
          </span>
        </div>
      </div>

      <button
        onClick={handleJoin}
        className="relative z-10 flex w-full items-center justify-center gap-2 rounded-xl bg-brand-600 py-3 text-sm font-bold text-white shadow-soft transition hover:bg-brand-700 active:scale-[0.99]"
      >
        <Video className="h-4 w-4" />
        Join Class
      </button>
    </div>
  )
}
