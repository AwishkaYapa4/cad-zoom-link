// src/pages/UserCourseDetails.jsx
//
// Read-only course details page for staff. Reached from the Staff
// Dashboard's "View Details" button via /staff/course/:courseId, nested
// under the /staff ProtectedRoute (allowedRole="staff"). Deliberately does
// not import useClassActions or any mutation helper — there is no code path
// here that can add, edit, delete, or complete a class, independent of the
// admin-only AdminCourseDetails.jsx page. Users only see course info,
// today's/upcoming classes, and — via the existing read-only
// ClassDetailsModal opened from ClassCard — the Zoom link and schedule.
import { useEffect, useMemo, useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { collection, onSnapshot, doc, query, where } from 'firebase/firestore'
import { ArrowLeft, Loader2, User, CalendarDays, Inbox, CalendarClock, CalendarPlus, Clock3 } from 'lucide-react'
import { db } from '../firebase/config'
import ClassCard from '../components/ClassCard'
import ScheduleSection from '../components/ScheduleSection'
import { categorizeClasses, formatClassDate } from '../utils/dateHelpers'

export default function UserCourseDetails() {
  const { courseId } = useParams()
  const [course, setCourse] = useState(null)
  const [courseLoading, setCourseLoading] = useState(true)
  const [classes, setClasses] = useState([])
  const [classesLoading, setClassesLoading] = useState(true)

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

  const { today, tomorrow, thisWeek, upcoming } = useMemo(() => categorizeClasses(classes), [classes])
  const nothingToShow = today.length + tomorrow.length + thisWeek.length + upcoming.length === 0

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
        <Link
          to="/staff/dashboard"
          className="flex items-center gap-1.5 rounded-lg bg-brand-50 px-3 py-2 text-xs font-semibold text-brand-700 transition hover:bg-brand-100"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          Back to Dashboard
        </Link>
      </div>
    )
  }

  return (
    <>
      <Link
        to="/staff/dashboard"
        className="mb-4 inline-flex items-center gap-1.5 text-xs font-semibold text-slate-400 transition hover:text-slate-600"
      >
        <ArrowLeft className="h-3.5 w-3.5" />
        Back to Dashboard
      </Link>

      <div className="mb-8">
        <h1 className="mb-1.5 text-2xl font-bold text-slate-900">{course.courseName}</h1>
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

      {nothingToShow ? (
        <EmptyState message="No classes scheduled for this course right now." />
      ) : (
        <>
          <ScheduleSection
            icon={CalendarClock}
            title="Today's Classes"
            count={today.length}
            badge={{ label: 'Today', className: 'bg-brand-600 text-white' }}
            countClassName="bg-white text-brand-700 shadow-sm"
            wrapperClassName="rounded-xl border border-brand-100 bg-brand-50/70 px-4 py-3"
          >
            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {today.map((cls) => (
                <ClassCard key={cls.id} classData={cls} variant="featured" canManage={false} />
              ))}
            </div>
          </ScheduleSection>

          <ScheduleSection
            icon={CalendarPlus}
            iconClassName="h-5 w-5 text-sky-600"
            title="Tomorrow's Classes"
            count={tomorrow.length}
            badge={{ label: 'Tomorrow', className: 'bg-sky-100 text-sky-700' }}
            countClassName="bg-white text-sky-700 shadow-sm"
            wrapperClassName="rounded-xl bg-sky-50/70 px-4 py-3"
          >
            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {tomorrow.map((cls) => (
                <ClassCard key={cls.id} classData={cls} variant="featured" canManage={false} />
              ))}
            </div>
          </ScheduleSection>

          <ScheduleSection icon={CalendarDays} title="This Week" count={thisWeek.length}>
            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {thisWeek.map((cls) => (
                <ClassCard key={cls.id} classData={cls} variant="featured" canManage={false} />
              ))}
            </div>
          </ScheduleSection>

          <ScheduleSection
            icon={Clock3}
            iconClassName="h-[18px] w-[18px] text-slate-400"
            title="Upcoming Classes"
            titleClassName="text-base font-bold text-slate-700"
            count={upcoming.length}
            countClassName="bg-slate-100 text-slate-500"
          >
            <div className="space-y-2.5">
              {upcoming.map((cls) => (
                <ClassCard key={cls.id} classData={cls} variant="compact" canManage={false} />
              ))}
            </div>
          </ScheduleSection>
        </>
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
