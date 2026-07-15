// src/components/CourseModal.jsx
import { useEffect, useMemo, useState } from 'react'
import { doc, updateDoc, arrayUnion, arrayRemove, serverTimestamp } from 'firebase/firestore'
import { X, BookOpen, User, FileText, CalendarDays, ToggleLeft, Hash, Loader2, ListChecks } from 'lucide-react'
import { db } from '../firebase/config'
import { toDateInputString, fromDateInputString } from '../utils/dateHelpers'

const emptyForm = {
  courseName: '',
  description: '',
  instructorName: '',
  startDate: '',
  endDate: '',
  status: 'active',
  totalClasses: '',
}

const MAX_PROGRESS_ROWS = 200

// Single modal for both creating and editing a course.
//   mode: 'create' | 'edit'
//   initialCourse: existing course doc (id + fields) when mode === 'edit'
//
// The "Course Progress" checklist below is a standalone bookkeeping tool
// scoped to the course document itself (`completedClassNumbers`, a plain
// array of numbers) — it deliberately never reads or writes the `classes`
// collection. Checking a box here must never create, update, or otherwise
// affect a real class record, so it can't leak onto the Class Links page.
// Class Links' completion state is only ever changed by marking a class
// complete directly, on that page.
export default function CourseModal({ open, mode = 'create', initialCourse, onClose, onSubmit }) {
  const [form, setForm] = useState(emptyForm)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')
  const [pendingNumbers, setPendingNumbers] = useState(() => new Set())

  const completedNumbers = useMemo(
    () => new Set((initialCourse?.completedClassNumbers || []).map(Number)),
    [initialCourse]
  )

  // (Re)populate the form whenever the modal opens, or when the course being edited changes.
  useEffect(() => {
    if (!open) return
    setError('')
    if (mode === 'edit' && initialCourse) {
      setForm({
        courseName: initialCourse.courseName || '',
        description: initialCourse.description || '',
        instructorName: initialCourse.instructorName || '',
        startDate: toDateInputString(initialCourse.startDate?.toDate?.() ?? initialCourse.startDate),
        endDate: toDateInputString(initialCourse.endDate?.toDate?.() ?? initialCourse.endDate),
        status: initialCourse.status || 'active',
        totalClasses: initialCourse.totalClasses != null ? String(initialCourse.totalClasses) : '',
      })
    } else {
      setForm(emptyForm)
    }
  }, [open, mode, initialCourse])

  if (!open) return null

  const progressRowCount = Math.min(Math.max(0, Number(form.totalClasses) || 0), MAX_PROGRESS_ROWS)
  const showProgress = mode === 'edit' && initialCourse && progressRowCount > 0

  function update(field, value) {
    setForm((prev) => ({ ...prev, [field]: value }))
  }

  async function handleToggleClassNumber(classNumber, nextChecked) {
    if (!initialCourse || pendingNumbers.has(classNumber)) return
    setPendingNumbers((prev) => new Set(prev).add(classNumber))
    try {
      await updateDoc(doc(db, 'courses', initialCourse.id), {
        completedClassNumbers: nextChecked ? arrayUnion(classNumber) : arrayRemove(classNumber),
        updatedAt: serverTimestamp(),
      })
    } catch (err) {
      console.error(err)
    } finally {
      setPendingNumbers((prev) => {
        const next = new Set(prev)
        next.delete(classNumber)
        return next
      })
    }
  }

  async function handleSubmit(e) {
    e.preventDefault()
    setError('')

    if (
      !form.courseName.trim() ||
      !form.instructorName.trim() ||
      !form.startDate ||
      !form.endDate ||
      form.totalClasses === ''
    ) {
      setError('Please fill in every required field.')
      return
    }

    const totalClasses = Number(form.totalClasses)
    if (!Number.isInteger(totalClasses) || totalClasses < 0) {
      setError('Total classes must be a whole number, 0 or greater.')
      return
    }

    const startDate = fromDateInputString(form.startDate)
    const endDate = fromDateInputString(form.endDate)
    if (endDate < startDate) {
      setError('End date must be on or after the start date.')
      return
    }

    setSubmitting(true)
    try {
      await onSubmit({
        courseName: form.courseName.trim(),
        description: form.description.trim(),
        instructorName: form.instructorName.trim(),
        startDate,
        endDate,
        status: form.status,
        totalClasses,
      })
      onClose()
    } catch (err) {
      console.error(err)
      setError('Failed to save course. Please try again.')
    } finally {
      setSubmitting(false)
    }
  }

  function handleClose() {
    setError('')
    onClose()
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 p-4 backdrop-blur-sm">
      <div className="max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-2xl bg-white p-6 shadow-2xl sm:p-7">
        <div className="mb-6 flex items-start justify-between">
          <div>
            <h2 className="text-lg font-bold text-slate-900">
              {mode === 'edit' ? 'Edit course' : 'Add a new course'}
            </h2>
            <p className="mt-0.5 text-sm text-slate-400">
              {mode === 'edit' ? 'Update this course’s details.' : 'Set up a new course for classes to belong to.'}
            </p>
          </div>
          <button
            onClick={handleClose}
            className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-lg text-slate-400 transition hover:bg-slate-100 hover:text-slate-600"
          >
            <X className="h-[18px] w-[18px]" />
          </button>
        </div>

        {error && (
          <div className="mb-4 rounded-xl bg-red-50 px-4 py-2.5 text-sm text-red-700">{error}</div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="mb-1.5 block text-sm font-medium text-slate-700">Course name</label>
            <div className="relative">
              <BookOpen className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                value={form.courseName}
                onChange={(e) => update('courseName', e.target.value)}
                placeholder="React Development"
                className="w-full rounded-xl border border-slate-200 bg-slate-50 py-2.5 pl-10 pr-3 text-sm outline-none transition focus:border-brand-500 focus:bg-white focus:ring-2 focus:ring-brand-100"
              />
            </div>
          </div>

          <div>
            <label className="mb-1.5 block text-sm font-medium text-slate-700">Description</label>
            <div className="relative">
              <FileText className="pointer-events-none absolute left-3 top-3 h-4 w-4 text-slate-400" />
              <textarea
                rows={3}
                value={form.description}
                onChange={(e) => update('description', e.target.value)}
                placeholder="What this course covers..."
                className="w-full resize-none rounded-xl border border-slate-200 bg-slate-50 py-2.5 pl-10 pr-3 text-sm outline-none transition focus:border-brand-500 focus:bg-white focus:ring-2 focus:ring-brand-100"
              />
            </div>
          </div>

          <div>
            <label className="mb-1.5 block text-sm font-medium text-slate-700">Instructor name</label>
            <div className="relative">
              <User className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                value={form.instructorName}
                onChange={(e) => update('instructorName', e.target.value)}
                placeholder="Chamika"
                className="w-full rounded-xl border border-slate-200 bg-slate-50 py-2.5 pl-10 pr-3 text-sm outline-none transition focus:border-brand-500 focus:bg-white focus:ring-2 focus:ring-brand-100"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="mb-1.5 block text-sm font-medium text-slate-700">Start date</label>
              <div className="relative">
                <CalendarDays className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                <input
                  type="date"
                  value={form.startDate}
                  onChange={(e) => update('startDate', e.target.value)}
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 py-2.5 pl-10 pr-3 text-sm outline-none transition focus:border-brand-500 focus:bg-white focus:ring-2 focus:ring-brand-100"
                />
              </div>
            </div>
            <div>
              <label className="mb-1.5 block text-sm font-medium text-slate-700">End date</label>
              <div className="relative">
                <CalendarDays className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                <input
                  type="date"
                  value={form.endDate}
                  onChange={(e) => update('endDate', e.target.value)}
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 py-2.5 pl-10 pr-3 text-sm outline-none transition focus:border-brand-500 focus:bg-white focus:ring-2 focus:ring-brand-100"
                />
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="mb-1.5 block text-sm font-medium text-slate-700">Status</label>
              <div className="relative">
                <ToggleLeft className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                <select
                  value={form.status}
                  onChange={(e) => update('status', e.target.value)}
                  className="w-full appearance-none rounded-xl border border-slate-200 bg-slate-50 py-2.5 pl-10 pr-3 text-sm outline-none transition focus:border-brand-500 focus:bg-white focus:ring-2 focus:ring-brand-100"
                >
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                </select>
              </div>
            </div>
            <div>
              <label className="mb-1.5 block text-sm font-medium text-slate-700">Total classes</label>
              <div className="relative">
                <Hash className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                <input
                  type="number"
                  min="0"
                  step="1"
                  value={form.totalClasses}
                  onChange={(e) => update('totalClasses', e.target.value)}
                  placeholder="24"
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 py-2.5 pl-10 pr-3 text-sm outline-none transition focus:border-brand-500 focus:bg-white focus:ring-2 focus:ring-brand-100"
                />
              </div>
            </div>
          </div>

          {showProgress && (
            <div>
              <label className="mb-1.5 flex items-center gap-1.5 text-sm font-medium text-slate-700">
                <ListChecks className="h-4 w-4 text-slate-400" />
                Course Progress
              </label>
              <div className="max-h-56 space-y-1 overflow-y-auto rounded-xl border border-slate-200 bg-slate-50 p-3">
                {Array.from({ length: progressRowCount }, (_, i) => i + 1).map((classNumber) => {
                  const completed = completedNumbers.has(classNumber)
                  const isPending = pendingNumbers.has(classNumber)
                  return (
                    <label
                      key={classNumber}
                      className="flex items-center gap-2.5 rounded-lg px-2 py-1.5 text-sm text-slate-700 transition hover:bg-white"
                    >
                      <input
                        type="checkbox"
                        checked={completed}
                        disabled={isPending}
                        onChange={(e) => handleToggleClassNumber(classNumber, e.target.checked)}
                        className="h-4 w-4 rounded border-slate-300 text-brand-600 focus:ring-brand-500 disabled:cursor-not-allowed disabled:opacity-50"
                      />
                      <span className={completed ? 'font-medium text-slate-800' : ''}>Class {classNumber}</span>
                      {isPending && <Loader2 className="h-3.5 w-3.5 animate-spin text-slate-400" />}
                    </label>
                  )
                })}
              </div>
              <p className="mt-1.5 text-xs text-slate-400">
                This is a separate checklist for your own reference — it saves immediately, but doesn't create or
                change any class on the Class Links page.
              </p>
            </div>
          )}

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
              {submitting ? 'Saving...' : mode === 'edit' ? 'Save changes' : 'Add course'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
