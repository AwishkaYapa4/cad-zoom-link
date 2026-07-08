// src/components/ClassDetailsModal.jsx
import { useEffect, useState } from 'react'
import { X, User, Calendar, Clock, MessageSquare, Copy, Check, Video } from 'lucide-react'
import { formatClassDate, formatClassTime } from '../utils/dateHelpers'

// Read-only "Class Details" overlay shown on top of the Class Links page.
// Reuses the classData already fetched by the dashboard's onSnapshot listener —
// no extra Firestore read, no route, no new tab.
export default function ClassDetailsModal({ open, onClose, classData }) {
  const [visible, setVisible] = useState(false)
  const [copied, setCopied] = useState(false)
  const [showToast, setShowToast] = useState(false)

  // Trigger the enter transition a frame after mount.
  useEffect(() => {
    if (open) {
      const raf = requestAnimationFrame(() => setVisible(true))
      return () => cancelAnimationFrame(raf)
    }
    setVisible(false)
  }, [open])

  // Escape-to-close + lock background scroll while open.
  useEffect(() => {
    if (!open) return

    function handleKeyDown(e) {
      if (e.key === 'Escape') onClose()
    }

    document.addEventListener('keydown', handleKeyDown)
    const previousOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'

    return () => {
      document.removeEventListener('keydown', handleKeyDown)
      document.body.style.overflow = previousOverflow
    }
  }, [open, onClose])

  if (!open || !classData) return null

  const { className, tutorName, startTime, zoomUrl, classMessage } = classData
  const hasMessage = Boolean(classMessage && classMessage.trim())

  function handleJoin() {
    if (zoomUrl) window.open(zoomUrl, '_blank', 'noopener,noreferrer')
  }

  async function handleCopyMessage() {
    if (!hasMessage) return
    try {
      await navigator.clipboard.writeText(classMessage)
      setCopied(true)
      setShowToast(true)
      setTimeout(() => setCopied(false), 1600)
      setTimeout(() => setShowToast(false), 2000)
    } catch (err) {
      console.error('Failed to copy class message:', err)
    }
  }

  return (
    <div
      onClick={onClose}
      className={`fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 p-4 backdrop-blur-sm transition-opacity duration-200 ${
        visible ? 'opacity-100' : 'opacity-0'
      }`}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className={`flex max-h-[85vh] w-full max-w-lg flex-col rounded-2xl bg-white shadow-2xl transition-all duration-200 ${
          visible ? 'translate-y-0 scale-100 opacity-100' : 'translate-y-2 scale-95 opacity-0'
        }`}
      >
        <div className="flex items-start justify-between p-6 pb-4 sm:p-7 sm:pb-4">
          <div>
            <h2 className="text-lg font-bold text-slate-900">Class Details</h2>
            <p className="mt-0.5 text-sm text-slate-400">Everything you need to join this class.</p>
          </div>
          <button
            onClick={onClose}
            className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-lg text-slate-400 transition hover:bg-slate-100 hover:text-slate-600"
            aria-label="Close class details"
          >
            <X className="h-[18px] w-[18px]" />
          </button>
        </div>

        <div className="overflow-y-auto px-6 pb-6 sm:px-7 sm:pb-7">
          <div className="mb-5">
            <p className="mb-1.5 text-xs font-semibold uppercase tracking-wide text-slate-400">Class Name</p>
            <p className="text-base font-bold leading-snug text-slate-900">{className}</p>
          </div>

          <div className="mb-5">
            <p className="mb-1.5 text-xs font-semibold uppercase tracking-wide text-slate-400">Tutor</p>
            <div className="flex items-center gap-1.5 text-sm font-medium text-slate-700">
              <User className="h-4 w-4 text-brand-600" />
              {tutorName}
            </div>
          </div>

          <div className="mb-5">
            <p className="mb-1.5 text-xs font-semibold uppercase tracking-wide text-slate-400">Schedule</p>
            <div className="flex flex-wrap items-center gap-3 text-sm">
              <span className="flex items-center gap-1.5 rounded-lg bg-slate-50 px-3 py-2 font-medium text-slate-600">
                <Calendar className="h-4 w-4 text-brand-600" />
                {formatClassDate(startTime)}
              </span>
              <span className="flex items-center gap-1.5 rounded-lg bg-slate-50 px-3 py-2 font-medium text-slate-600">
                <Clock className="h-4 w-4 text-brand-600" />
                {formatClassTime(startTime)}
              </span>
            </div>
          </div>

          {hasMessage && (
            <div className="relative mb-6 rounded-xl border border-slate-100 bg-slate-50 p-4 pr-12">
              <p className="mb-1.5 flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wide text-slate-400">
                <MessageSquare className="h-3.5 w-3.5" />
                Class Message
              </p>
              <p className="whitespace-pre-wrap break-words text-sm leading-relaxed text-slate-600">
                {classMessage}
              </p>
              <button
                onClick={handleCopyMessage}
                aria-label="Copy class message"
                className="absolute right-3 top-3 flex h-8 w-8 items-center justify-center rounded-lg text-slate-400 transition hover:bg-white hover:text-brand-600"
              >
                {copied ? <Check className="h-4 w-4 text-green-600" /> : <Copy className="h-4 w-4" />}
              </button>
            </div>
          )}

          <button
            onClick={handleJoin}
            className="flex w-full items-center justify-center gap-2 rounded-xl bg-brand-600 py-3 text-sm font-bold text-white shadow-soft transition hover:bg-brand-700 active:scale-[0.99]"
          >
            <Video className="h-4 w-4" />
            Join Class
          </button>
        </div>
      </div>

      {showToast && (
        <div className="pointer-events-none fixed bottom-6 left-1/2 z-50 -translate-x-1/2 rounded-full bg-slate-900 px-4 py-2 text-xs font-semibold text-white shadow-lg">
          Message copied
        </div>
      )}
    </div>
  )
}
