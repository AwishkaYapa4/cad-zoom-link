// src/pages/StaffDashboard.jsx
import { useEffect, useMemo, useState } from 'react'
import { CalendarClock, CalendarPlus, CalendarDays, Clock3, Inbox, Loader2 } from 'lucide-react'
import { collection, onSnapshot, orderBy, query } from 'firebase/firestore'
import { db } from '../firebase/config'
import Navbar from '../components/Navbar'
import ClassCard from '../components/ClassCard'
import ScheduleSection from '../components/ScheduleSection'
import { categorizeClasses } from '../utils/dateHelpers'

// Read-only dashboard: staff can view class details and join classes, but cannot add or delete.
export default function StaffDashboard() {
  const [classes, setClasses] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

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

  const { today, tomorrow, thisWeek, upcoming } = useMemo(() => categorizeClasses(classes), [classes])
  const nothingToShow = today.length + tomorrow.length + thisWeek.length + upcoming.length === 0

  return (
    <div className="min-h-screen bg-slate-50">
      <Navbar title="Staff Dashboard" />

      <main className="mx-auto max-w-6xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-slate-900">Class Links</h1>
          <p className="mt-1 text-sm text-slate-500">
            Open View Details on any class for the full schedule and Zoom link.
          </p>
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
      </main>
    </div>
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
