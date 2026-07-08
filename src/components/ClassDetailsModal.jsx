// src/components/ClassDetailsModal.jsx
import { useEffect, useState } from 'react'
import {
  X,
  User,
  Calendar,
  Clock,
  MessageSquare,
  Copy,
  Check,
  Video,
  Pencil,
  BookOpen,
  CalendarClock,
  Link2,
  Loader2,
} from 'lucide-react'
import { formatClassDate, formatClassTime, toJsDate, toDateTimeLocalString } from '../utils/dateHelpers'
import { isValidZoomUrl } from '../utils/validators'

// "Class Details" overlay shown on top of the Class Links page. Reuses the
// classData already fetched by the dashboard's onSnapshot listener — no
// extra Firestore read, no route, no new tab.
//
// Admins (canEdit) get an "Edit Details" button that swaps the read-only
// view for an edit form in place, and saves via the existing `onUpdate`
// callback (which performs the actual Firestore updateDoc upstream).
export default function ClassDetailsModal({ open, onClose, classData, canEdit = false, onUpdate }) {
  const [visible, setVisible] = useState(false)
  const [copied, setCopied] = useState(false)
  const [showToast, setShowToast] = useState(false)

  const [editing, setEditing] = useState(false)
  const [form, setForm] = useState(null)
  const [editError, setEditError] = useState('')
  const [submitting, setSubmitting] = useState(false)

  // Trigger the enter transition a frame after mount.
  useEffect(() => {
    if (open) {
      const raf = requestAnimationFrame(() => setVisible(true))
      return () => cancelAnimationFrame(raf)
    }
    setVisible(false)
  }, [open])

  // Always start in view mode when the modal is (re)opened, or when it's
  // opened for a different class.
  useEffect(() => {
    if (open) {
      setEditing(false)
      setEditError('')
    }
  }, [open, classData?.id])

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

  function handleStartEditing() {
    setForm({
      className: className || '',
      tutorName: tutorName || '',
      startTime: toDateTimeLocalString(toJsDate(startTime)),
      zoomUrl: zoomUrl || '',
      classMessage: classMessage || '',
    })
    setEditError('')
    setEditing(true)
  }

  function handleCancelEdit() {
    setEditing(false)
    setEditError('')
  }

  function updateField(field, value) {
    setForm((prev) => ({ ...prev, [field]: value }))
  }

  async function handleSave(e) {
    e.preventDefault()
    setEditError('')

    if (!form.className.trim() || !form.tutorName.trim() || !form.startTime || !form.zoomUrl.trim()) {
      setEditError('Please fill in every field.')
      return
    }

    if (!isValidZoomUrl(form.zoomUrl)) {
      setEditError('Zoom link must be a valid URL (starting with http:// or https://).')
      return
    }

    setSubmitting(true)
    try {
      await onUpdate?.(classData.id, {
        className: form.className.trim(),
        tutorName: form.tutorName.trim(),
        startTime: new Date(form.startTime),
        zoomUrl: form.zoomUrl.trim(),
        classMessage: form.classMessage.trim(),
      })
      setEditing(false)
    } catch (err) {
      console.error('Failed to update class:', err)
      setEditError('Failed to update class. Please try again.')
    } finally {
      setSubmitting(false)
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
            <p className="mt-0.5 text-sm text-slate-400">
              {editing ? 'Update this class’s details.' : 'Everything you need to join this class.'}
            </p>
          </div>
          <div className="flex flex-shrink-0 items-center gap-2">
            {canEdit && !editing && (
              <button
                onClick={handleStartEditing}
                className="flex items-center gap-1.5 rounded-lg border border-slate-200 px-3 py-1.5 text-xs font-semibold text-slate-600 transition hover:border-brand-200 hover:bg-brand-50 hover:text-brand-700"
              >
                <Pencil className="h-3.5 w-3.5" />
                Edit Details
              </button>
            )}
            <button
              onClick={onClose}
              className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-lg text-slate-400 transition hover:bg-slate-100 hover:text-slate-600"
              aria-label="Close class details"
            >
              <X className="h-[18px] w-[18px]" />
            </button>
          </div>
        </div>

        <div className="overflow-y-auto px-6 pb-6 sm:px-7 sm:pb-7">
          {editing ? (
            <form onSubmit={handleSave} className="space-y-4">
              {editError && (
                <div className="rounded-xl bg-red-50 px-4 py-2.5 text-sm text-red-700">{editError}</div>
              )}

              <div>
                <label className="mb-1.5 block text-sm font-medium text-slate-700">Class name</label>
                <div className="relative">
                  <BookOpen className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                  <input
                    type="text"
                    value={form.className}
                    onChange={(e) => updateField('className', e.target.value)}
                    className="w-full rounded-xl border border-slate-200 bg-slate-50 py-2.5 pl-10 pr-3 text-sm outline-none transition focus:border-brand-500 focus:bg-white focus:ring-2 focus:ring-brand-100"
                  />
                </div>
              </div>

              <div>
                <label className="mb-1.5 block text-sm font-medium text-slate-700">Tutor name</label>
                <div className="relative">
                  <User className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                  <input
                    type="text"
                    value={form.tutorName}
                    onChange={(e) => updateField('tutorName', e.target.value)}
                    className="w-full rounded-xl border border-slate-200 bg-slate-50 py-2.5 pl-10 pr-3 text-sm outline-none transition focus:border-brand-500 focus:bg-white focus:ring-2 focus:ring-brand-100"
                  />
                </div>
              </div>

              <div>
                <label className="mb-1.5 block text-sm font-medium text-slate-700">Date &amp; time</label>
                <div className="relative">
                  <CalendarClock className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                  <input
                    type="datetime-local"
                    value={form.startTime}
                    onChange={(e) => updateField('startTime', e.target.value)}
                    className="w-full rounded-xl border border-slate-200 bg-slate-50 py-2.5 pl-10 pr-3 text-sm outline-none transition focus:border-brand-500 focus:bg-white focus:ring-2 focus:ring-brand-100"
                  />
                </div>
              </div>

              <div>
                <label className="mb-1.5 block text-sm font-medium text-slate-700">Zoom link</label>
                <div className="relative">
                  <Link2 className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                  <input
                    type="url"
                    value={form.zoomUrl}
                    onChange={(e) => updateField('zoomUrl', e.target.value)}
                    className="w-full rounded-xl border border-slate-200 bg-slate-50 py-2.5 pl-10 pr-3 text-sm outline-none transition focus:border-brand-500 focus:bg-white focus:ring-2 focus:ring-brand-100"
                  />
                </div>
              </div>

              <div>
                <label className="mb-1.5 block text-sm font-medium text-slate-700">Class message</label>
                <div className="relative">
                  <MessageSquare className="pointer-events-none absolute left-3 top-3 h-4 w-4 text-slate-400" />
                  <textarea
                    rows={3}
                    value={form.classMessage}
                    onChange={(e) => updateField('classMessage', e.target.value)}
                    placeholder="Enter a message or class instructions for students..."
                    className="w-full resize-none rounded-xl border border-slate-200 bg-slate-50 py-2.5 pl-10 pr-3 text-sm outline-none transition focus:border-brand-500 focus:bg-white focus:ring-2 focus:ring-brand-100"
                  />
                </div>
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={handleCancelEdit}
                  disabled={submitting}
                  className="flex-1 rounded-xl border border-slate-200 py-2.5 text-sm font-semibold text-slate-600 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-brand-600 py-2.5 text-sm font-bold text-white shadow-soft transition hover:bg-brand-700 disabled:cursor-not-allowed disabled:opacity-70"
                >
                  {submitting && <Loader2 className="h-4 w-4 animate-spin" />}
                  {submitting ? 'Saving...' : 'Save Changes'}
                </button>
              </div>
            </form>
          ) : (
            <>
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
            </>
          )}
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
