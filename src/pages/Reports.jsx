// src/pages/Reports.jsx
import { useEffect, useMemo, useState } from 'react'
import { collection, onSnapshot } from 'firebase/firestore'
import { BookOpen, CalendarDays, CheckCircle2, Percent, Loader2 } from 'lucide-react'
import { db } from '../firebase/config'
import StatCard from '../components/StatCard'
import DonutChart from '../components/DonutChart'
import ProgressBar from '../components/ProgressBar'
import { StatCardSkeletonGrid, Skeleton } from '../components/Skeleton'
import { getCourseCompletion } from '../utils/courseProgress'

export default function Reports() {
  const [courses, setCourses] = useState([])
  const [classes, setClasses] = useState([])
  const [loading, setLoading] = useState(true)

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
    const remainingClasses = totalClasses - completedClasses
    const completionPct = totalClasses > 0 ? Math.round((completedClasses / totalClasses) * 100) : 0
    return { totalCourses, totalClasses, completedClasses, remainingClasses, completionPct }
  }, [courses, classes])

  const courseRows = useMemo(() => {
    return courses
      .map((course) => {
        const { total, completed } = getCourseCompletion(course, classes)
        return { id: course.id, courseName: course.courseName, completed, total }
      })
      .sort((a, b) => b.total - a.total)
  }, [courses, classes])

  if (loading) {
    return (
      <>
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-slate-900">Reports</h1>
          <p className="mt-1 text-sm text-slate-500">A live summary of course and class completion across the platform.</p>
        </div>
        <div className="mb-8">
          <StatCardSkeletonGrid />
        </div>
        <div className="grid gap-5 lg:grid-cols-3">
          <div className="flex items-center justify-center rounded-2xl border border-slate-100 bg-white p-6 shadow-soft">
            <Skeleton className="h-40 w-40 rounded-full" />
          </div>
          <div className="space-y-4 rounded-2xl border border-slate-100 bg-white p-6 shadow-soft lg:col-span-2">
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-full" />
          </div>
        </div>
      </>
    )
  }

  return (
    <>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-slate-900">Reports</h1>
        <p className="mt-1 text-sm text-slate-500">A live summary of course and class completion across the platform.</p>
      </div>

      <div className="mb-8 grid grid-cols-2 gap-5 lg:grid-cols-4">
        <StatCard icon={BookOpen} label="Total Courses" value={stats.totalCourses} unit="Courses" accent="brand" />
        <StatCard icon={CheckCircle2} label="Completed Classes" value={stats.completedClasses} unit="Completed" accent="green" />
        <StatCard icon={CalendarDays} label="Remaining Classes" value={stats.remainingClasses} unit="Remaining" accent="amber" />
        <StatCard icon={Percent} label="Completion Rate" value={`${stats.completionPct}%`} unit="Complete" accent="sky" />
      </div>

      <div className="grid gap-5 lg:grid-cols-3">
        <div className="flex flex-col items-center justify-center rounded-2xl border border-slate-100 bg-white p-6 shadow-soft">
          <h2 className="mb-4 self-start text-sm font-bold text-slate-900">Overall Completion</h2>
          <DonutChart value={stats.completedClasses} max={stats.totalClasses} label="of all classes completed" />
        </div>

        <div className="rounded-2xl border border-slate-100 bg-white p-6 shadow-soft lg:col-span-2">
          <h2 className="mb-5 text-sm font-bold text-slate-900">Course Progress</h2>
          {courseRows.length === 0 ? (
            <p className="text-sm text-slate-400">No courses yet.</p>
          ) : (
            <div className="space-y-4">
              {courseRows.map((row) => (
                <div key={row.id}>
                  <div className="mb-1.5 flex items-center justify-between text-sm">
                    <span className="font-medium text-slate-700">{row.courseName}</span>
                    <span className="text-xs text-slate-400">
                      {row.completed}/{row.total}
                    </span>
                  </div>
                  <ProgressBar value={row.completed} max={row.total} showLabel={false} barClassName="w-full" />
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </>
  )
}
