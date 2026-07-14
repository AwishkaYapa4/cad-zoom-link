// src/pages/ClassLinks.jsx
import { useEffect, useMemo, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { Plus, CalendarClock, CalendarPlus, CalendarDays, Clock3, Inbox, Loader2, X } from 'lucide-react'
import { collection, onSnapshot, orderBy, query } from 'firebase/firestore'
import { db } from '../firebase/config'
import ClassCard from '../components/ClassCard'
import AddClassModal from '../components/AddClassModal'
import ScheduleSection from '../components/ScheduleSection'
import CourseSelect from '../components/CourseSelect'
import { categorizeClasses } from '../utils/dateHelpers'
import { useClassActions } from '../hooks/useClassActions'

export default function ClassLinks() {
  const [classes, setClasses] = useState([])
  const [courses, setCourses] = useState([])
  const [loading, setLoading] = useState(true)
  const [modalOpen, setModalOpen] = useState(false)
  const [error, setError] = useState('')
  const [searchParams, setSearchParams] = useSearchParams()
  const courseFilter = searchParams.get('course') || ''

  const { addClass, updateClass, deleteClass, toggleComplete, deletingIds, toast } = useClassActions()

  useEffect(() => {
    const classesQuery = query(collection(db, 'classes'), orderBy('startTime', 'asc'))

    const unsubscribe = onSnapshot(
      classesQuery,
      (snapshot) => {
        const data = snapshot.docs.map((docSnap) => ({ id: docSnap.id, ...docSnap.data() }))
        setClasses(data)
        setLoading(false)
      },
      (err) => {
        console.error('Failed to load classes:', err)
        setError('Could not load classes. Please refresh the page.')
        setLoading(false)
      }
    )

    return unsubscribe
  }, [])

  useEffect(() => {
    const unsubscribe = onSnapshot(collection(db, 'courses'), (snapshot) => {
      setCourses(snapshot.docs.map((docSnap) => ({ id: docSnap.id, ...docSnap.data() })))
    })
    return unsubscribe
  }, [])

  const courseMap = useMemo(() => new Map(courses.map((c) => [c.id, c])), [courses])

  const classesWithCourseName = useMemo(
    () => classes.map((c) => ({ ...c, courseName: courseMap.get(c.courseId)?.courseName ?? 'Uncategorized' })),
    [classes, courseMap]
  )

  const visibleClasses = useMemo(
    () => (courseFilter ? classesWithCourseName.filter((c) => c.courseId === courseFilter) : classesWithCourseName),
    [classesWithCourseName, courseFilter]
  )

  const { today, tomorrow, thisWeek, upcoming } = useMemo(() => categorizeClasses(visibleClasses), [visibleClasses])
  const nothingToShow = today.length + tomorrow.length + thisWeek.length + upcoming.length === 0

  function handleFilterChange(courseId) {
    setSearchParams(courseId ? { course: courseId } : {})
  }

  async function handleAddClass(newClass) {
    await addClass(newClass)
  }

  async function handleDeleteClass(classId) {
    setError('')
    try {
      await deleteClass(classId)
    } catch (err) {
      console.error('Failed to delete class:', err)
      setError('Failed to delete class. Please try again.')
    }
  }

  return (
    <>
      <div className="mb-8 flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Class Links</h1>
          <p className="mt-1 text-sm text-slate-500">
            Manage class links, then open View Details for the full schedule and Zoom link.
          </p>
        </div>
        <button
          onClick={() => setModalOpen(true)}
          className="flex items-center gap-2 rounded-xl bg-brand-600 px-4 py-2.5 text-sm font-bold text-white shadow-soft transition hover:bg-brand-700"
        >
          <Plus className="h-4 w-4" />
          Add class
        </button>
      </div>

      <div className="mb-6 flex items-center gap-2">
        <div className="relative w-full max-w-xs">
          <CourseSelect
            courses={courses}
            value={courseFilter}
            onChange={handleFilterChange}
            includeAllOption
            className="w-full rounded-xl border border-slate-200 bg-white py-2 pl-3 pr-8 text-sm font-medium text-slate-600 outline-none transition focus:border-brand-500 focus:ring-2 focus:ring-brand-100"
          />
        </div>
        {courseFilter && (
          <button
            onClick={() => handleFilterChange('')}
            className="flex items-center gap-1 rounded-lg px-2 py-1.5 text-xs font-semibold text-slate-400 transition hover:bg-slate-100 hover:text-slate-600"
          >
            <X className="h-3.5 w-3.5" />
            Clear filter
          </button>
        )}
      </div>

      {error && (
        <div className="mb-6 rounded-xl bg-red-50 px-4 py-3 text-sm text-red-700">{error}</div>
      )}

      {loading ? (
        <div className="flex items-center justify-center py-24">
          <Loader2 className="h-6 w-6 animate-spin text-brand-500" />
        </div>
      ) : nothingToShow ? (
        <EmptyState message="No classes scheduled right now." />
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
                <ClassCard
                  key={cls.id}
                  classData={cls}
                  variant="featured"
                  canManage
                  onDelete={handleDeleteClass}
                  onUpdate={updateClass}
                  onToggleComplete={toggleComplete}
                  isDeleting={deletingIds.has(cls.id)}
                />
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
                <ClassCard
                  key={cls.id}
                  classData={cls}
                  variant="featured"
                  canManage
                  onDelete={handleDeleteClass}
                  onUpdate={updateClass}
                  onToggleComplete={toggleComplete}
                  isDeleting={deletingIds.has(cls.id)}
                />
              ))}
            </div>
          </ScheduleSection>

          <ScheduleSection icon={CalendarDays} title="This Week" count={thisWeek.length}>
            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {thisWeek.map((cls) => (
                <ClassCard
                  key={cls.id}
                  classData={cls}
                  variant="featured"
                  canManage
                  onDelete={handleDeleteClass}
                  onUpdate={updateClass}
                  onToggleComplete={toggleComplete}
                  isDeleting={deletingIds.has(cls.id)}
                />
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
                <ClassCard
                  key={cls.id}
                  classData={cls}
                  variant="compact"
                  canManage
                  onDelete={handleDeleteClass}
                  onUpdate={updateClass}
                  onToggleComplete={toggleComplete}
                  isDeleting={deletingIds.has(cls.id)}
                />
              ))}
            </div>
          </ScheduleSection>
        </>
      )}

      <AddClassModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        onSubmit={handleAddClass}
        courses={courses}
        classes={classes}
        initialCourseId={courseFilter}
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
