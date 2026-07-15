// src/pages/Dashboard.jsx
import { useEffect, useMemo, useState } from 'react'
import { collection, onSnapshot } from 'firebase/firestore'
import { BookOpen, CalendarDays, CheckCircle2, Clock3, Inbox, Loader2, Sparkles } from 'lucide-react'
import { db } from '../firebase/config'
import StatCard from '../components/StatCard'
import CourseCard from '../components/CourseCard'
import CourseDetailsModal from '../components/CourseDetailsModal'
import UserCourseDetailsModal from '../components/UserCourseDetailsModal'
import { StatCardSkeletonGrid, CourseCardSkeletonGrid } from '../components/Skeleton'
import { useAuth } from '../context/AuthContext'
import { toJsDate, formatClassDate, formatClassTime } from '../utils/dateHelpers'
import { getCourseCompletion } from '../utils/courseProgress'

export default function Dashboard() {
  const { isAdmin } = useAuth()
  const [courses, setCourses] = useState([])
  const [classes, setClasses] = useState([])
  const [loading, setLoading] = useState(true)
  const [modalCourseId, setModalCourseId] = useState(null)

  useEffect(() => {
    let coursesLoaded = false
    let classesLoaded = false
    function checkLoaded() {
      if (coursesLoaded && classesLoaded) setLoading(false)
    }

    const unsubCourses = onSnapshot(collection(db, 'courses'), (snapshot) => {
      setCourses(snapshot.docs.map((docSnap) => ({ id: docSnap.id, ...docSnap.data() })))
      coursesLoaded = true
      checkLoaded()
    })

    const unsubClasses = onSnapshot(collection(db, 'classes'), (snapshot) => {
      setClasses(snapshot.docs.map((docSnap) => ({ id: docSnap.id, ...docSnap.data() })))
      classesLoaded = true
      checkLoaded()
    })

    return () => {
      unsubCourses()
      unsubClasses()
    }
  }, [])

  const stats = useMemo(() => {
    const totalCourses = courses.length
    const totalClasses = classes.length
    const completedClasses = classes.filter((c) => c.completed === true).length
    const upcomingClasses = totalClasses - completedClasses
    return { totalCourses, totalClasses, completedClasses, upcomingClasses }
  }, [courses, classes])

  const courseProgressRows = useMemo(() => {
    return courses.map((course) => {
      const { total, completed, remaining } = getCourseCompletion(course, classes)
      return {
        courseId: course.id,
        courseName: course.courseName,
        totalClasses: total,
        completedClasses: completed,
        remainingClasses: remaining,
        // Both roles open a details popup in place now — admin gets the
        // full manage view (CourseDetailsModal), staff gets the read-only
        // schedule view (UserCourseDetailsModal). Which one actually
        // renders is decided below, gated by role.
        onViewDetails: setModalCourseId,
      }
    })
  }, [courses, classes])

  const recentCourses = useMemo(
    () =>
      [...courses]
        .sort((a, b) => (toJsDate(b.createdAt)?.getTime() || 0) - (toJsDate(a.createdAt)?.getTime() || 0))
        .slice(0, 5),
    [courses]
  )

  const upcomingClassesList = useMemo(() => {
    const now = Date.now()
    return [...classes]
      .filter((c) => (toJsDate(c.startTime)?.getTime() || 0) >= now)
      .sort((a, b) => toJsDate(a.startTime) - toJsDate(b.startTime))
      .slice(0, 5)
  }, [classes])

  if (loading) {
    if (!isAdmin) {
      return (
        <div className="flex items-center justify-center py-24">
          <Loader2 className="h-6 w-6 animate-spin text-brand-500" />
        </div>
      )
    }
    return (
      <>
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-slate-900">Dashboard</h1>
          <p className="mt-1 text-sm text-slate-500">A live overview of your courses and classes.</p>
        </div>
        <div className="mb-8">
          <StatCardSkeletonGrid />
        </div>
        <CourseCardSkeletonGrid />
      </>
    )
  }

  return (
    <>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-slate-900">Dashboard</h1>
        <p className="mt-1 text-sm text-slate-500">A live overview of your courses and classes.</p>
      </div>

      <div className="mb-8 grid grid-cols-2 gap-5 lg:grid-cols-4">
        <StatCard icon={BookOpen} label="Total Courses" value={stats.totalCourses} unit="Courses" accent="brand" />
        <StatCard icon={CalendarDays} label="Total Classes" value={stats.totalClasses} unit="Classes" accent="sky" />
        <StatCard
          icon={CheckCircle2}
          label="Completed Classes"
          value={stats.completedClasses}
          unit="Completed"
          accent="green"
        />
        <StatCard
          icon={Clock3}
          label="Upcoming Classes"
          value={stats.upcomingClasses}
          unit="Remaining"
          accent="amber"
        />
      </div>

      <div className="mb-8">
        <h2 className="mb-4 text-base font-bold text-slate-900">Course Progress</h2>
        {courseProgressRows.length === 0 ? (
          <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-slate-200 bg-white py-14 text-center">
            <Inbox className="mb-2 h-6 w-6 text-slate-300" />
            <p className="text-sm text-slate-400">No courses yet. Add a course to see its progress here.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {courseProgressRows.map((row) => (
              <CourseCard key={row.courseId} {...row} />
            ))}
          </div>
        )}
      </div>

      <div className="grid gap-5 lg:grid-cols-2">
        <div className="rounded-2xl border border-slate-100 bg-white p-5 shadow-soft">
          <h2 className="mb-4 flex items-center gap-1.5 text-sm font-bold text-slate-900">
            <Sparkles className="h-4 w-4 text-brand-600" />
            Recent Courses
          </h2>
          {recentCourses.length === 0 ? (
            <p className="text-sm text-slate-400">No courses yet.</p>
          ) : (
            <ul className="space-y-3">
              {recentCourses.map((course, i) => (
                <li key={course.id} className="flex items-center justify-between gap-2">
                  <span className="min-w-0 truncate text-sm font-medium text-slate-700">{course.courseName}</span>
                  {i === 0 && (
                    <span className="flex-shrink-0 rounded-full bg-brand-50 px-2 py-0.5 text-[10px] font-semibold text-brand-700">
                      Latest
                    </span>
                  )}
                </li>
              ))}
            </ul>
          )}
        </div>

        <div className="rounded-2xl border border-slate-100 bg-white p-5 shadow-soft">
          <h2 className="mb-4 flex items-center gap-1.5 text-sm font-bold text-slate-900">
            <CalendarDays className="h-4 w-4 text-brand-600" />
            Upcoming Classes
          </h2>
          {upcomingClassesList.length === 0 ? (
            <p className="text-sm text-slate-400">No upcoming classes.</p>
          ) : (
            <ul className="space-y-3">
              {upcomingClassesList.map((cls) => (
                <li key={cls.id} className="min-w-0">
                  <p className="truncate text-sm font-medium text-slate-700">{cls.className}</p>
                  <p className="text-xs text-slate-400">
                    {formatClassDate(cls.startTime)} · {formatClassTime(cls.startTime)}
                  </p>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>

      {isAdmin ? (
        <CourseDetailsModal
          open={Boolean(modalCourseId)}
          courseId={modalCourseId}
          onClose={() => setModalCourseId(null)}
        />
      ) : (
        <UserCourseDetailsModal
          open={Boolean(modalCourseId)}
          courseId={modalCourseId}
          onClose={() => setModalCourseId(null)}
        />
      )}
    </>
  )
}
