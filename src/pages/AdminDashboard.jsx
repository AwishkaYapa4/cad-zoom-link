// src/pages/AdminDashboard.jsx
import { useEffect, useMemo, useState } from 'react'
import { Plus, CalendarDays, Clock3, Inbox, Loader2 } from 'lucide-react'
import {
  collection,
  onSnapshot,
  addDoc,
  deleteDoc,
  doc,
  serverTimestamp,
  Timestamp,
  orderBy,
  query,
} from 'firebase/firestore'
import { db } from '../firebase/config'
import Navbar from '../components/Navbar'
import ClassCard from '../components/ClassCard'
import AddClassModal from '../components/AddClassModal'
import { splitClassesByWeek } from '../utils/dateHelpers'

export default function AdminDashboard() {
  const [classes, setClasses] = useState([])
  const [loading, setLoading] = useState(true)
  const [modalOpen, setModalOpen] = useState(false)
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

  const { thisWeek, upcoming } = useMemo(() => splitClassesByWeek(classes), [classes])

  async function handleAddClass(newClass) {
    await addDoc(collection(db, 'classes'), {
      className: newClass.className,
      tutorName: newClass.tutorName,
      startTime: Timestamp.fromDate(newClass.startTime),
      zoomUrl: newClass.zoomUrl,
      createdAt: serverTimestamp(),
    })
  }

  async function handleDeleteClass(classId) {
    if (!window.confirm('Delete this class link? This cannot be undone.')) return
    try {
      await deleteDoc(doc(db, 'classes', classId))
    } catch (err) {
      console.error('Failed to delete class:', err)
      setError('Failed to delete class. Please try again.')
    }
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <Navbar title="Admin Dashboard" />

      <main className="mx-auto max-w-6xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="mb-8 flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center">
          <div>
            <h1 className="text-2xl font-bold text-slate-900">Class Links</h1>
            <p className="mt-1 text-sm text-slate-500">Manage Zoom links for all upcoming classes.</p>
          </div>
          <button
            onClick={() => setModalOpen(true)}
            className="flex items-center gap-2 rounded-xl bg-brand-600 px-4 py-2.5 text-sm font-bold text-white shadow-soft transition hover:bg-brand-700"
          >
            <Plus className="h-4 w-4" />
            Add class
          </button>
        </div>

        {error && (
          <div className="mb-6 rounded-xl bg-red-50 px-4 py-3 text-sm text-red-700">{error}</div>
        )}

        {loading ? (
          <div className="flex items-center justify-center py-24">
            <Loader2 className="h-6 w-6 animate-spin text-brand-500" />
          </div>
        ) : (
          <>
            <section className="mb-10">
              <div className="mb-4 flex items-center gap-2">
                <CalendarDays className="h-5 w-5 text-brand-600" />
                <h2 className="text-lg font-bold text-slate-900">This Week's Classes</h2>
                <span className="rounded-full bg-brand-50 px-2.5 py-0.5 text-xs font-bold text-brand-700">
                  {thisWeek.length}
                </span>
              </div>

              {thisWeek.length === 0 ? (
                <EmptyState message="No classes scheduled for this week." />
              ) : (
                <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
                  {thisWeek.map((cls) => (
                    <ClassCard
                      key={cls.id}
                      classData={cls}
                      variant="featured"
                      canManage
                      onDelete={handleDeleteClass}
                    />
                  ))}
                </div>
              )}
            </section>

            <section>
              <div className="mb-4 flex items-center gap-2">
                <Clock3 className="h-[18px] w-[18px] text-slate-400" />
                <h2 className="text-base font-bold text-slate-700">Upcoming Classes</h2>
                <span className="rounded-full bg-slate-100 px-2.5 py-0.5 text-xs font-bold text-slate-500">
                  {upcoming.length}
                </span>
              </div>

              {upcoming.length === 0 ? (
                <EmptyState message="No upcoming classes scheduled beyond this week." compact />
              ) : (
                <div className="space-y-2.5">
                  {upcoming.map((cls) => (
                    <ClassCard
                      key={cls.id}
                      classData={cls}
                      variant="compact"
                      canManage
                      onDelete={handleDeleteClass}
                    />
                  ))}
                </div>
              )}
            </section>
          </>
        )}
      </main>

      <AddClassModal open={modalOpen} onClose={() => setModalOpen(false)} onSubmit={handleAddClass} />
    </div>
  )
}

function EmptyState({ message, compact }) {
  return (
    <div
      className={`flex flex-col items-center justify-center rounded-2xl border border-dashed border-slate-200 bg-white text-center ${
        compact ? 'py-8' : 'py-14'
      }`}
    >
      <Inbox className="mb-2 h-6 w-6 text-slate-300" />
      <p className="text-sm text-slate-400">{message}</p>
    </div>
  )
}
