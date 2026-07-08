// src/components/ClassCard.jsx
import { useState } from 'react'
import { Video, User, Clock, Calendar, Trash2, Loader2, ArrowUpRight } from 'lucide-react'
import { formatClassDate, formatClassTime } from '../utils/dateHelpers'
import ClassDetailsModal from './ClassDetailsModal'

// `variant="featured"` -> large card used for "This Week's Classes"
// `variant="compact"`  -> small list-row card used for "Upcoming Classes"
//
// The card is intentionally minimal: it never shows the Zoom link or the
// class message. Both live in the Class Details modal, opened in place
// (no new tab, no route change) via "View Details".
export default function ClassCard({
  classData,
  variant = 'featured',
  canManage = false,
  onDelete,
  onUpdate,
  isDeleting = false,
}) {
  const { className, tutorName, startTime } = classData
  const [detailsOpen, setDetailsOpen] = useState(false)

  // Stops the click from bubbling to (or firing alongside) the "View Details"
  // button/card, and ignores repeat clicks while a delete is already in flight.
  function handleDeleteClick(e) {
    e.stopPropagation()
    e.preventDefault()
    if (isDeleting) return
    onDelete?.(classData.id)
  }

  if (variant === 'compact') {
    return (
      <>
        <div className="flex items-center justify-between gap-4 rounded-xl border border-slate-100 bg-white px-4 py-3.5 shadow-card transition hover:border-brand-200 hover:shadow-soft">
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
              onClick={() => setDetailsOpen(true)}
              className="flex items-center gap-1 rounded-lg bg-brand-50 px-2.5 py-1.5 text-xs font-semibold text-brand-700 transition hover:bg-brand-100"
            >
              View Details
              <ArrowUpRight className="h-3 w-3" />
            </button>
            {canManage && (
              <button
                type="button"
                onClick={handleDeleteClick}
                disabled={isDeleting}
                className="flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-lg text-slate-300 transition hover:bg-red-50 hover:text-red-500 disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:bg-transparent disabled:hover:text-slate-300"
                aria-label="Delete class"
              >
                {isDeleting ? (
                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                ) : (
                  <Trash2 className="h-3.5 w-3.5" />
                )}
              </button>
            )}
          </div>
        </div>

        <ClassDetailsModal
          open={detailsOpen}
          onClose={() => setDetailsOpen(false)}
          classData={classData}
          canEdit={canManage}
          onUpdate={onUpdate}
        />
      </>
    )
  }

  // Featured / large card. Uses a flex column with `flex-1` on the content
  // block and `mt-auto` on the button wrapper so the button always sits at
  // the bottom with a guaranteed gap, however short or long the content is.
  // The card relies on the parent grid's default row-stretch behavior (plus
  // a min-height floor) to stay the same height as its row neighbors.
  return (
    <>
      <div className="relative flex h-full min-h-[300px] flex-col overflow-hidden rounded-2xl border border-slate-100 bg-white p-6 shadow-soft transition hover:-translate-y-0.5 hover:shadow-lg">
        <div className="absolute -right-8 -top-8 h-28 w-28 rounded-full bg-brand-50" />

        {canManage && (
          <button
            type="button"
            onClick={handleDeleteClick}
            disabled={isDeleting}
            className="absolute right-4 top-4 z-20 flex h-8 w-8 items-center justify-center rounded-lg text-slate-300 transition hover:bg-red-50 hover:text-red-500 disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:bg-transparent disabled:hover:text-slate-300"
            aria-label="Delete class"
          >
            {isDeleting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Trash2 className="h-4 w-4" />}
          </button>
        )}

        <div className="relative z-10 flex flex-1 flex-col">
          <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-xl bg-brand-600 shadow-soft">
            <Video className="h-5 w-5 text-white" />
          </div>

          <h3 className="mb-2 line-clamp-2 min-h-[3.25rem] text-lg font-bold leading-snug text-slate-900">
            {className}
          </h3>

          <div className="mb-4 flex items-center gap-1.5 text-sm text-slate-500">
            <User className="h-3.5 w-3.5 flex-shrink-0" />
            <span className="truncate">{tutorName}</span>
          </div>

          <div className="flex flex-wrap items-center gap-3 text-sm">
            <span className="flex items-center gap-1.5 rounded-lg bg-slate-50 px-2.5 py-1.5 font-medium text-slate-600">
              <Calendar className="h-3.5 w-3.5 text-brand-600" />
              {formatClassDate(startTime)}
            </span>
            <span className="flex items-center gap-1.5 rounded-lg bg-slate-50 px-2.5 py-1.5 font-medium text-slate-600">
              <Clock className="h-3.5 w-3.5 text-brand-600" />
              {formatClassTime(startTime)}
            </span>
          </div>

          <div className="mt-auto pt-6">
            <button
              onClick={() => setDetailsOpen(true)}
              className="flex w-full items-center justify-center gap-2 rounded-xl bg-brand-600 py-3 text-sm font-bold text-white shadow-soft transition hover:bg-brand-700 active:scale-[0.99]"
            >
              View Details
              <ArrowUpRight className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>

      <ClassDetailsModal
        open={detailsOpen}
        onClose={() => setDetailsOpen(false)}
        classData={classData}
        canEdit={canManage}
        onUpdate={onUpdate}
      />
    </>
  )
}
