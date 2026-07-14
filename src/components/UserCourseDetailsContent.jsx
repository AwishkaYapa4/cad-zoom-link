// src/components/UserCourseDetailsContent.jsx
//
// Read-only course details content for staff: course info, stats/progress,
// and every class in a table — same visual structure as the admin course
// details view, minus every mutation affordance (no Add Class button, no
// Edit/Delete/Mark Completed/Mark Pending, no Actions column at all).
// Deliberately does not import useClassActions or any mutation helper —
// there is no code path here that can add, edit, delete, or complete a
// class, independent of the admin-only CourseDetailsContent.jsx. Shared by
// two call sites:
//   - src/pages/UserCourseDetails.jsx (route /staff/course/:courseId, shows
//     a "Back to Dashboard" link since it's a full page)
//   - src/components/UserCourseDetailsModal.jsx (opened as an overlay from
//     the Staff Dashboard's "View Details" button, shows a close (X) button)
// Pass `onClose` to switch into modal mode; omit it for page mode.
import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { collection, onSnapshot, doc, query, where } from 'firebase/firestore'
import { ArrowLeft, X, Eye, Loader2, User, CalendarDays, Inbox, ExternalLink } from 'lucide-react'
import { db } from '../firebase/config'
import ProgressBar from './ProgressBar'
import ClassDetailsModal from './ClassDetailsModal'
import { formatClassDate, formatClassTime } from '../utils/dateHelpers'

const STATUS_LABELS = { scheduled: 'Scheduled', rescheduled: 'Rescheduled', cancelled: 'Cancelled', completed: 'Completed' }
const STATUS_STYLES = {
  scheduled: 'bg-brand-50 text-brand-700',
  rescheduled: 'bg-amber-50 text-amber-700',
  cancelled: 'bg-red-50 text-red-700',
  completed: 'bg-green-50 text-green-700',
}

export default function UserCourseDetailsContent({ courseId, onClose }) {
  const [course, setCourse] = useState(null)
  const [courseLoading, setCourseLoading] = useState(true)
  const [classes, setClasses] = useState([])
  const [classesLoading, setClassesLoading] = useState(true)
  const [selectedClass, setSelectedClass] = useState(null)

  useEffect(() => {
    const unsubscribe = onSnapshot(doc(db, 'courses', courseId), (snap) => {
      setCourse(snap.exists() ? { id: snap.id, ...snap.data() } : null)
      setCourseLoading(false)
    })
    return unsubscribe
  }, [courseId])

  useEffect(() => {
    const classesQuery = query(collection(db, 'classes'), where('courseId', '==', courseId))
    const unsubscribe = onSnapshot(classesQuery, (snapshot) => {
      setClasses(snapshot.docs.map((docSnap) => ({ id: docSnap.id, ...docSnap.data() })))
      setClassesLoading(false)
    })
    return unsubscribe
  }, [courseId])

  const sortedClasses = useMemo(
    () =>
      [...classes].sort(
        (a, b) => (a.classNumber ?? Number.MAX_SAFE_INTEGER) - (b.classNumber ?? Number.MAX_SAFE_INTEGER)
      ),
    [classes]
  )

  const completedCount = useMemo(() => classes.filter((c) => c.completed).length, [classes])
  const totalCount = course?.totalClasses || classes.length
  const remainingCount = Math.max(0, totalCount - completedCount)

  const loading = courseLoading || classesLoading

  if (loading) {
    return (
      <div className="flex items-center justify-center py-24">
        <Loader2 className="h-6 w-6 animate-spin text-brand-500" />
      </div>
    )
  }

  if (!course) {
    return (
      <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-slate-200 bg-white py-14 text-center">
        <Inbox className="mb-2 h-6 w-6 text-slate-300" />
        <p className="mb-4 text-sm text-slate-400">This course could not be found.</p>
        {onClose ? (
          <button
            onClick={onClose}
            className="flex items-center gap-1.5 rounded-lg bg-brand-50 px-3 py-2 text-xs font-semibold text-brand-700 transition hover:bg-brand-100"
          >
            Close
          </button>
        ) : (
          <Link
            to="/staff/dashboard"
            className="flex items-center gap-1.5 rounded-lg bg-brand-50 px-3 py-2 text-xs font-semibold text-brand-700 transition hover:bg-brand-100"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            Back to Dashboard
          </Link>
        )}
      </div>
    )
  }

  return (
    <>
      {onClose ? (
        <button
          onClick={onClose}
          className="mb-4 inline-flex items-center gap-1.5 text-xs font-semibold text-slate-400 transition hover:text-slate-600"
        >
          <X className="h-3.5 w-3.5" />
          Close
        </button>
      ) : (
        <Link
          to="/staff/dashboard"
          className="mb-4 inline-flex items-center gap-1.5 text-xs font-semibold text-slate-400 transition hover:text-slate-600"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          Back to Dashboard
        </Link>
      )}

      <div className="mb-8">
        <div className="mb-1.5 flex flex-wrap items-center gap-2">
          <h1 className="text-2xl font-bold text-slate-900">{course.courseName}</h1>
          <span
            className={`rounded-full px-2.5 py-1 text-xs font-semibold ${
              course.status === 'active' ? 'bg-green-50 text-green-700' : 'bg-slate-100 text-slate-500'
            }`}
          >
            {course.status === 'active' ? 'Active' : 'Inactive'}
          </span>
        </div>
        {course.description && <p className="mb-1.5 max-w-xl text-sm text-slate-500">{course.description}</p>}
        <div className="flex flex-wrap items-center gap-3 text-xs text-slate-400">
          <span className="flex items-center gap-1">
            <User className="h-3.5 w-3.5" />
            {course.instructorName}
          </span>
          <span className="flex items-center gap-1">
            <CalendarDays className="h-3.5 w-3.5" />
            {formatClassDate(course.startDate)} – {formatClassDate(course.endDate)}
          </span>
        </div>
      </div>

      <div className="mb-8 rounded-2xl border border-slate-100 bg-white p-5 shadow-soft">
        <div className="mb-4 grid grid-cols-3 gap-3 text-center sm:max-w-md">
          <div className="rounded-xl bg-slate-50 py-3">
            <p className="text-xl font-bold text-slate-900">{totalCount}</p>
            <p className="text-[11px] font-medium text-slate-400">Total Classes</p>
          </div>
          <div className="rounded-xl bg-slate-50 py-3">
            <p className="text-xl font-bold text-green-600">{completedCount}</p>
            <p className="text-[11px] font-medium text-slate-400">Completed</p>
          </div>
          <div className="rounded-xl bg-slate-50 py-3">
            <p className="text-xl font-bold text-amber-600">{remainingCount}</p>
            <p className="text-[11px] font-medium text-slate-400">Remaining</p>
          </div>
        </div>
        <ProgressBar value={completedCount} max={totalCount} barClassName="w-full" />
      </div>

      <div className="overflow-hidden rounded-2xl border border-slate-100 bg-white shadow-soft">
        <div className="border-b border-slate-100 px-5 py-4">
          <h2 className="text-base font-bold text-slate-900">Classes</h2>
        </div>

        {sortedClasses.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-14 text-center">
            <Inbox className="mb-2 h-6 w-6 text-slate-300" />
            <p className="text-sm text-slate-400">No classes scheduled for this course yet.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[760px] text-left text-sm">
              <thead className="sticky top-0 z-10 bg-white">
                <tr className="border-b border-slate-100 text-xs font-semibold uppercase tracking-wide text-slate-400">
                  <th className="px-5 py-3">#</th>
                  <th className="px-5 py-3">Title</th>
                  <th className="px-5 py-3">Date</th>
                  <th className="px-5 py-3">Time</th>
                  <th className="px-5 py-3">Zoom Link</th>
                  <th className="px-5 py-3">Status</th>
                  <th className="px-5 py-3 text-right">View</th>
                </tr>
              </thead>
              <tbody>
                {sortedClasses.map((cls, i) => {
                  const statusKey = cls.status || 'scheduled'
                  return (
                    <tr
                      key={cls.id}
                      className={`border-b border-slate-50 last:border-0 hover:bg-slate-50/60 ${
                        i % 2 === 1 ? 'bg-slate-50/40' : 'bg-white'
                      }`}
                    >
                      <td className="px-5 py-4 font-semibold text-slate-500">{cls.classNumber ?? '—'}</td>
                      <td className="px-5 py-4 font-semibold text-slate-800">{cls.className}</td>
                      <td className="px-5 py-4 text-slate-600 whitespace-nowrap">{formatClassDate(cls.startTime)}</td>
                      <td className="px-5 py-4 text-slate-600 whitespace-nowrap">{formatClassTime(cls.startTime)}</td>
                      <td className="px-5 py-4">
                        {cls.zoomUrl ? (
                          <a
                            href={cls.zoomUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center gap-1 text-xs font-semibold text-brand-600 hover:underline"
                          >
                            Open
                            <ExternalLink className="h-3 w-3" />
                          </a>
                        ) : (
                          <span className="text-xs text-slate-300">—</span>
                        )}
                      </td>
                      <td className="px-5 py-4">
                        <span className={`rounded-full px-2 py-0.5 text-[10px] font-semibold ${STATUS_STYLES[statusKey]}`}>
                          {STATUS_LABELS[statusKey]}
                        </span>
                      </td>
                      <td className="px-5 py-4 text-right">
                        <button
                          onClick={() => setSelectedClass(cls)}
                          className="inline-flex h-8 w-8 items-center justify-center rounded-lg text-slate-400 transition hover:bg-slate-100 hover:text-slate-600"
                          aria-label="View class details"
                        >
                          <Eye className="h-4 w-4" />
                        </button>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <ClassDetailsModal
        open={Boolean(selectedClass)}
        onClose={() => setSelectedClass(null)}
        classData={selectedClass ? { ...selectedClass, courseName: course.courseName } : null}
        canEdit={false}
      />
    </>
  )
}
