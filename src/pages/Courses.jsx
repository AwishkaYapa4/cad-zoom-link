// src/pages/Courses.jsx
import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { Plus, Inbox, Loader2, Pencil, Trash2, User, CalendarDays, Eye } from 'lucide-react'
import {
  collection,
  onSnapshot,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
  serverTimestamp,
  Timestamp,
} from 'firebase/firestore'
import { db } from '../firebase/config'
import CourseModal from '../components/CourseModal'
import ProgressBar from '../components/ProgressBar'
import { TableRowSkeleton } from '../components/Skeleton'
import { formatClassDate } from '../utils/dateHelpers'

export default function Courses() {
  const [courses, setCourses] = useState([])
  const [classes, setClasses] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [deletingIds, setDeletingIds] = useState(() => new Set())
  const [toast, setToast] = useState(null)

  const [modalOpen, setModalOpen] = useState(false)
  const [modalMode, setModalMode] = useState('create')
  const [editingCourse, setEditingCourse] = useState(null)

  useEffect(() => {
    const unsubCourses = onSnapshot(
      collection(db, 'courses'),
      (snapshot) => {
        const data = snapshot.docs.map((docSnap) => ({ id: docSnap.id, ...docSnap.data() }))
        setCourses(data)
        setLoading(false)
      },
      (err) => {
        console.error('Failed to load courses:', err)
        setError('Could not load courses. Please refresh the page.')
        setLoading(false)
      }
    )

    const unsubClasses = onSnapshot(collection(db, 'classes'), (snapshot) => {
      setClasses(snapshot.docs.map((docSnap) => ({ id: docSnap.id, ...docSnap.data() })))
    })

    return () => {
      unsubCourses()
      unsubClasses()
    }
  }, [])

  const classCountByCourse = useMemo(() => {
    const map = new Map()
    for (const cls of classes) {
      if (!cls.courseId) continue
      map.set(cls.courseId, (map.get(cls.courseId) || 0) + 1)
    }
    return map
  }, [classes])

  const completedCountByCourse = useMemo(() => {
    const map = new Map()
    for (const cls of classes) {
      if (!cls.courseId || !cls.completed) continue
      map.set(cls.courseId, (map.get(cls.courseId) || 0) + 1)
    }
    return map
  }, [classes])

  function showToast(message, tone = 'success') {
    setToast({ message, tone })
    setTimeout(() => setToast(null), 2500)
  }

  function openCreateModal() {
    setModalMode('create')
    setEditingCourse(null)
    setModalOpen(true)
  }

  function openEditModal(course) {
    setModalMode('edit')
    setEditingCourse(course)
    setModalOpen(true)
  }

  async function handleSubmitCourse(values) {
    const payload = {
      courseName: values.courseName,
      description: values.description,
      instructorName: values.instructorName,
      startDate: Timestamp.fromDate(values.startDate),
      endDate: Timestamp.fromDate(values.endDate),
      status: values.status,
      totalClasses: values.totalClasses,
      updatedAt: serverTimestamp(),
    }

    if (modalMode === 'edit' && editingCourse) {
      await updateDoc(doc(db, 'courses', editingCourse.id), payload)
      showToast('Course updated successfully', 'success')
    } else {
      await addDoc(collection(db, 'courses'), { ...payload, createdAt: serverTimestamp() })
      showToast('Course added successfully', 'success')
    }
  }

  async function handleDeleteCourse(course) {
    if (deletingIds.has(course.id)) return

    const linkedCount = classCountByCourse.get(course.id) || 0
    const message =
      linkedCount > 0
        ? `"${course.courseName}" has ${linkedCount} linked class${linkedCount === 1 ? '' : 'es'} — they will become uncategorized. Delete this course anyway?`
        : `Are you sure you want to delete "${course.courseName}"?`

    if (!window.confirm(message)) return

    setDeletingIds((prev) => new Set(prev).add(course.id))
    setError('')

    try {
      await deleteDoc(doc(db, 'courses', course.id))
      showToast('Course deleted successfully', 'success')
    } catch (err) {
      console.error('Failed to delete course:', err)
      setError('Failed to delete course. Please try again.')
      showToast('Failed to delete course', 'error')
    } finally {
      setDeletingIds((prev) => {
        const next = new Set(prev)
        next.delete(course.id)
        return next
      })
    }
  }

  return (
    <>
      <div className="mb-8 flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Courses</h1>
          <p className="mt-1 text-sm text-slate-500">Manage courses that classes belong to.</p>
        </div>
        <button
          onClick={openCreateModal}
          className="flex items-center gap-2 rounded-xl bg-brand-600 px-4 py-2.5 text-sm font-bold text-white shadow-soft transition hover:bg-brand-700"
        >
          <Plus className="h-4 w-4" />
          Add course
        </button>
      </div>

      {error && (
        <div className="mb-6 rounded-xl bg-red-50 px-4 py-3 text-sm text-red-700">{error}</div>
      )}

      {!loading && courses.length === 0 ? (
        <EmptyState message="No courses yet. Add your first course to get started." />
      ) : (
        <div className="overflow-hidden rounded-2xl border border-slate-100 bg-white shadow-soft">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[980px] text-left text-sm">
              <thead className="sticky top-0 z-10 bg-white">
                <tr className="border-b border-slate-100 text-xs font-semibold uppercase tracking-wide text-slate-400">
                  <th className="px-5 py-3">Course</th>
                  <th className="px-5 py-3">Instructor</th>
                  <th className="px-5 py-3">Duration</th>
                  <th className="px-5 py-3">Status</th>
                  <th className="px-5 py-3">Total</th>
                  <th className="px-5 py-3">Completed</th>
                  <th className="px-5 py-3">Remaining</th>
                  <th className="px-5 py-3">Progress</th>
                  <th className="px-5 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <TableRowSkeleton rows={4} columns={9} />
                ) : (
                  courses.map((course, i) => {
                  const completed = completedCountByCourse.get(course.id) || 0
                  const total = course.totalClasses || classCountByCourse.get(course.id) || 0
                  const remaining = Math.max(0, total - completed)
                  return (
                  <tr
                    key={course.id}
                    className={`border-b border-slate-50 last:border-0 hover:bg-slate-50/60 ${
                      i % 2 === 1 ? 'bg-slate-50/40' : 'bg-white'
                    }`}
                  >
                    <td className="px-5 py-4">
                      <p className="font-semibold text-slate-800">{course.courseName}</p>
                      {course.description && (
                        <p className="mt-0.5 line-clamp-1 max-w-xs text-xs text-slate-400">{course.description}</p>
                      )}
                    </td>
                    <td className="px-5 py-4 text-slate-600">
                      <span className="flex items-center gap-1.5">
                        <User className="h-3.5 w-3.5 text-slate-400" />
                        {course.instructorName}
                      </span>
                    </td>
                    <td className="px-5 py-4 text-slate-600">
                      <span className="flex items-center gap-1.5 whitespace-nowrap">
                        <CalendarDays className="h-3.5 w-3.5 text-slate-400" />
                        {formatClassDate(course.startDate)} – {formatClassDate(course.endDate)}
                      </span>
                    </td>
                    <td className="px-5 py-4">
                      <span
                        className={`rounded-full px-2.5 py-1 text-xs font-semibold ${
                          course.status === 'active'
                            ? 'bg-green-50 text-green-700'
                            : 'bg-slate-100 text-slate-500'
                        }`}
                      >
                        {course.status === 'active' ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td className="px-5 py-4 text-slate-600">{total}</td>
                    <td className="px-5 py-4 text-green-600">{completed}</td>
                    <td className="px-5 py-4 text-amber-600">{remaining}</td>
                    <td className="px-5 py-4">
                      <ProgressBar value={completed} max={total} />
                    </td>
                    <td className="px-5 py-4">
                      <div className="flex items-center justify-end gap-2">
                        <Link
                          to={`/admin/course/${course.id}`}
                          className="flex h-8 w-8 items-center justify-center rounded-lg text-slate-400 transition hover:bg-brand-50 hover:text-brand-600"
                          aria-label="View classes"
                        >
                          <Eye className="h-4 w-4" />
                        </Link>
                        <button
                          onClick={() => openEditModal(course)}
                          className="flex h-8 w-8 items-center justify-center rounded-lg text-slate-400 transition hover:bg-brand-50 hover:text-brand-600"
                          aria-label="Edit course"
                        >
                          <Pencil className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => handleDeleteCourse(course)}
                          disabled={deletingIds.has(course.id)}
                          className="flex h-8 w-8 items-center justify-center rounded-lg text-slate-400 transition hover:bg-red-50 hover:text-red-500 disabled:cursor-not-allowed disabled:opacity-50"
                          aria-label="Delete course"
                        >
                          {deletingIds.has(course.id) ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                          ) : (
                            <Trash2 className="h-4 w-4" />
                          )}
                        </button>
                      </div>
                    </td>
                  </tr>
                    )
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      <CourseModal
        open={modalOpen}
        mode={modalMode}
        initialCourse={editingCourse}
        courseClasses={editingCourse ? classes.filter((c) => c.courseId === editingCourse.id) : []}
        onClose={() => setModalOpen(false)}
        onSubmit={handleSubmitCourse}
      />

      {toast && (
        <div
          className={`pointer-events-none fixed bottom-6 left-1/2 z-50 -translate-x-1/2 rounded-full px-4 py-2 text-xs font-semibold text-white shadow-lg ${
            toast.tone === 'error' ? 'bg-red-600' : 'bg-slate-900'
          }`}
        >
          {toast.message}
        </div>
      )}
    </>
  )
}

function EmptyState({ message }) {
  return (
    <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-slate-200 bg-white py-14 text-center">
      <Inbox className="mb-2 h-6 w-6 text-slate-300" />
      <p className="text-sm text-slate-400">{message}</p>
    </div>
  )
}
