// src/components/AddClassModal.jsx
import { useState } from 'react'
import { X, BookOpen, User, CalendarClock, Link2, MessageSquare, Loader2 } from 'lucide-react'

const emptyForm = { className: '', tutorName: '', startTime: '', zoomUrl: '', classMessage: '' }

export default function AddClassModal({ open, onClose, onSubmit }) {
  const [form, setForm] = useState(emptyForm)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')

  if (!open) return null

  function update(field, value) {
    setForm((prev) => ({ ...prev, [field]: value }))
  }

  async function handleSubmit(e) {
    e.preventDefault()
    setError('')

    if (!form.className.trim() || !form.tutorName.trim() || !form.startTime || !form.zoomUrl.trim()) {
      setError('Please fill in every field.')
      return
    }

    if (!/^https?:\/\/.+/i.test(form.zoomUrl.trim())) {
      setError('Zoom link must be a valid URL (starting with http:// or https://).')
      return
    }

    setSubmitting(true)
    try {
      await onSubmit({
        className: form.className.trim(),
        tutorName: form.tutorName.trim(),
        startTime: new Date(form.startTime),
        zoomUrl: form.zoomUrl.trim(),
        classMessage: form.classMessage.trim(),
      })
      setForm(emptyForm)
      onClose()
    } catch (err) {
      console.error(err)
      setError('Failed to save class. Please try again.')
    } finally {
      setSubmitting(false)
    }
  }

  function handleClose() {
    setForm(emptyForm)
    setError('')
    onClose()
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 p-4 backdrop-blur-sm">
      <div className="w-full max-w-lg rounded-2xl bg-white p-6 shadow-2xl sm:p-7">
        <div className="mb-6 flex items-start justify-between">
          <div>
            <h2 className="text-lg font-bold text-slate-900">Add a new class</h2>
            <p className="mt-0.5 text-sm text-slate-400">Create a Zoom class link for students and staff.</p>
          </div>
          <button
            onClick={handleClose}
            className="flex h-8 w-8 items-center justify-center rounded-lg text-slate-400 transition hover:bg-slate-100 hover:text-slate-600"
          >
            <X className="h-[18px] w-[18px]" />
          </button>
        </div>

        {error && (
          <div className="mb-4 rounded-xl bg-red-50 px-4 py-2.5 text-sm text-red-700">{error}</div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="mb-1.5 block text-sm font-medium text-slate-700">Class name</label>
            <div className="relative">
              <BookOpen className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                value={form.className}
                onChange={(e) => update('className', e.target.value)}
                placeholder="Name eka dapn"
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
                onChange={(e) => update('tutorName', e.target.value)}
                placeholder="Chamika"
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
                onChange={(e) => update('startTime', e.target.value)}
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
                onChange={(e) => update('zoomUrl', e.target.value)}
                placeholder="https://zoom.us/j/..."
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
                onChange={(e) => update('classMessage', e.target.value)}
                placeholder="Enter a message or class instructions for students..."
                className="w-full resize-none rounded-xl border border-slate-200 bg-slate-50 py-2.5 pl-10 pr-3 text-sm outline-none transition focus:border-brand-500 focus:bg-white focus:ring-2 focus:ring-brand-100"
              />
            </div>
            <p className="mt-1 text-xs text-slate-400">Optional. Shown to students on the class card.</p>
          </div>

          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={handleClose}
              className="flex-1 rounded-xl border border-slate-200 py-2.5 text-sm font-semibold text-slate-600 transition hover:bg-slate-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-brand-600 py-2.5 text-sm font-bold text-white shadow-soft transition hover:bg-brand-700 disabled:cursor-not-allowed disabled:opacity-70"
            >
              {submitting && <Loader2 className="h-4 w-4 animate-spin" />}
              {submitting ? 'Saving...' : 'Add class'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
