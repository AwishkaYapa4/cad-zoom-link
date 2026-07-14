// src/pages/CalendarPage.jsx
import { useEffect, useMemo, useState } from 'react'
import { collection, onSnapshot } from 'firebase/firestore'
import { ChevronLeft, ChevronRight, Loader2, Video, Inbox } from 'lucide-react'
import { db } from '../firebase/config'
import { useClassActions } from '../hooks/useClassActions'
import ClassDetailsModal from '../components/ClassDetailsModal'
import { getMonthGrid, toDateInputString, toJsDate, formatClassTime } from '../utils/dateHelpers'

const WEEKDAY_LABELS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']

export default function CalendarPage() {
  const [classes, setClasses] = useState([])
  const [courses, setCourses] = useState([])
  const [loading, setLoading] = useState(true)

  const today = useMemo(() => new Date(), [])
  const [viewedYear, setViewedYear] = useState(today.getFullYear())
  const [viewedMonth, setViewedMonth] = useState(today.getMonth())
  const [selectedDay, setSelectedDay] = useState(toDateInputString(today))
  const [selectedClass, setSelectedClass] = useState(null)

  const { updateClass, toggleComplete } = useClassActions()

  useEffect(() => {
    const unsubscribe = onSnapshot(collection(db, 'classes'), (snapshot) => {
      setClasses(snapshot.docs.map((docSnap) => ({ id: docSnap.id, ...docSnap.data() })))
      setLoading(false)
    })
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

  const classesByDay = useMemo(() => {
    const map = new Map()
    for (const cls of classesWithCourseName) {
      const date = toJsDate(cls.startTime)
      if (!date) continue
      const key = toDateInputString(date)
      if (!map.has(key)) map.set(key, [])
      map.get(key).push(cls)
    }
    for (const list of map.values()) {
      list.sort((a, b) => toJsDate(a.startTime) - toJsDate(b.startTime))
    }
    return map
  }, [classesWithCourseName])

  const weeks = useMemo(() => getMonthGrid(viewedYear, viewedMonth), [viewedYear, viewedMonth])
  const selectedClasses = classesByDay.get(selectedDay) || []
  const todayKey = toDateInputString(today)

  function goToPrevMonth() {
    const prev = new Date(viewedYear, viewedMonth - 1, 1)
    setViewedYear(prev.getFullYear())
    setViewedMonth(prev.getMonth())
  }

  function goToNextMonth() {
    const next = new Date(viewedYear, viewedMonth + 1, 1)
    setViewedYear(next.getFullYear())
    setViewedMonth(next.getMonth())
  }

  function goToToday() {
    setViewedYear(today.getFullYear())
    setViewedMonth(today.getMonth())
    setSelectedDay(todayKey)
  }

  const monthLabel = new Date(viewedYear, viewedMonth, 1).toLocaleDateString('en-US', {
    month: 'long',
    year: 'numeric',
  })

  if (loading) {
    return (
      <div className="flex items-center justify-center py-24">
        <Loader2 className="h-6 w-6 animate-spin text-brand-500" />
      </div>
    )
  }

  return (
    <>
      <div className="mb-8 flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Calendar</h1>
          <p className="mt-1 text-sm text-slate-500">Browse scheduled classes by month.</p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={goToToday}
            className="rounded-xl border border-slate-200 px-3 py-2 text-sm font-semibold text-slate-600 transition hover:bg-slate-50"
          >
            Today
          </button>
          <div className="flex items-center rounded-xl border border-slate-200">
            <button onClick={goToPrevMonth} className="p-2 text-slate-500 hover:bg-slate-50" aria-label="Previous month">
              <ChevronLeft className="h-4 w-4" />
            </button>
            <span className="min-w-[9rem] px-2 text-center text-sm font-semibold text-slate-800">{monthLabel}</span>
            <button onClick={goToNextMonth} className="p-2 text-slate-500 hover:bg-slate-50" aria-label="Next month">
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>

      <div className="grid gap-5 lg:grid-cols-3">
        <div className="overflow-hidden rounded-2xl border border-slate-100 bg-white shadow-soft lg:col-span-2">
          <div className="grid grid-cols-7 border-b border-slate-100 bg-slate-50">
            {WEEKDAY_LABELS.map((d) => (
              <div key={d} className="px-2 py-2 text-center text-xs font-semibold uppercase tracking-wide text-slate-400">
                {d}
              </div>
            ))}
          </div>
          <div className="grid grid-cols-7">
            {weeks.flat().map(({ date, inMonth }) => {
              const key = toDateInputString(date)
              const dayClasses = classesByDay.get(key) || []
              const isToday = key === todayKey
              const isSelected = key === selectedDay
              return (
                <button
                  key={key}
                  onClick={() => setSelectedDay(key)}
                  className={`flex min-h-[76px] flex-col items-start gap-1 border-b border-r border-slate-50 p-2 text-left transition hover:bg-slate-50 ${
                    !inMonth ? 'bg-slate-50/40 text-slate-300' : 'text-slate-700'
                  } ${isSelected ? 'ring-2 ring-inset ring-brand-500' : ''}`}
                >
                  <span
                    className={`flex h-6 w-6 items-center justify-center rounded-full text-xs font-semibold ${
                      isToday ? 'bg-brand-600 text-white' : ''
                    }`}
                  >
                    {date.getDate()}
                  </span>
                  {dayClasses.length > 0 && (
                    <span className="rounded-full bg-brand-50 px-1.5 py-0.5 text-[10px] font-semibold text-brand-700">
                      {dayClasses.length} class{dayClasses.length === 1 ? '' : 'es'}
                    </span>
                  )}
                </button>
              )
            })}
          </div>
        </div>

        <div className="rounded-2xl border border-slate-100 bg-white p-5 shadow-soft">
          <h2 className="mb-4 text-sm font-bold text-slate-900">
            {new Date(`${selectedDay}T00:00:00`).toLocaleDateString('en-US', {
              weekday: 'long',
              month: 'short',
              day: 'numeric',
            })}
          </h2>
          {selectedClasses.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-10 text-center">
              <Inbox className="mb-2 h-5 w-5 text-slate-300" />
              <p className="text-sm text-slate-400">No classes on this day.</p>
            </div>
          ) : (
            <ul className="space-y-2">
              {selectedClasses.map((cls) => (
                <li key={cls.id}>
                  <button
                    onClick={() => setSelectedClass(cls)}
                    className="flex w-full items-center gap-3 rounded-xl border border-slate-100 p-3 text-left transition hover:border-brand-200 hover:bg-brand-50/40"
                  >
                    <div className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-lg bg-brand-600">
                      <Video className="h-4 w-4 text-white" />
                    </div>
                    <div className="min-w-0">
                      <p className="truncate text-sm font-semibold text-slate-800">{cls.className}</p>
                      <p className="truncate text-xs text-slate-400">
                        {cls.courseName} · {formatClassTime(cls.startTime)}
                      </p>
                    </div>
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>

      <ClassDetailsModal
        open={Boolean(selectedClass)}
        onClose={() => setSelectedClass(null)}
        classData={selectedClass}
        canEdit
        onUpdate={updateClass}
        onToggleComplete={toggleComplete}
      />
    </>
  )
}
