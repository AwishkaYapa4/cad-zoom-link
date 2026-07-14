// src/components/AdminTopbar.jsx
import { useEffect, useMemo, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Menu, Search, Bell, LogOut, BookOpen, CalendarPlus, CheckCircle2, X } from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import { toJsDate, formatClassDate } from '../utils/dateHelpers'

function useClickOutside(ref, onOutside) {
  useEffect(() => {
    function handle(e) {
      if (ref.current && !ref.current.contains(e.target)) onOutside()
    }
    document.addEventListener('mousedown', handle)
    return () => document.removeEventListener('mousedown', handle)
  }, [ref, onOutside])
}

// Sticky top bar inside the admin content column: mobile sidebar toggle,
// page title, course/class search, a derived "recent activity" notification
// dropdown, and the admin profile + logout. `courses`/`classes` are passed
// down from AdminLayout (already subscribed there) rather than re-fetched.
export default function AdminTopbar({ title, courses, classes, onOpenMobileSidebar }) {
  const { currentUser, userName, logout } = useAuth()
  const navigate = useNavigate()

  const [query, setQuery] = useState('')
  const [searchOpen, setSearchOpen] = useState(false)
  const [notifOpen, setNotifOpen] = useState(false)

  const searchRef = useRef(null)
  const notifRef = useRef(null)
  useClickOutside(searchRef, () => setSearchOpen(false))
  useClickOutside(notifRef, () => setNotifOpen(false))

  const searchResults = useMemo(() => {
    const q = query.trim().toLowerCase()
    if (!q) return []
    const courseMatches = courses
      .filter((c) => c.courseName?.toLowerCase().includes(q))
      .slice(0, 4)
      .map((c) => ({ id: c.id, type: 'course', label: c.courseName, to: `/admin/course/${c.id}` }))
    const classMatches = classes
      .filter((c) => c.className?.toLowerCase().includes(q))
      .slice(0, 4)
      .map((c) => ({ id: c.id, type: 'class', label: c.className, to: `/admin/course/${c.courseId}` }))
    return [...courseMatches, ...classMatches].slice(0, 6)
  }, [query, courses, classes])

  const activity = useMemo(() => {
    const courseEvents = courses.map((c) => ({
      id: `course-${c.id}`,
      type: 'course_added',
      label: `New course added: ${c.courseName}`,
      timestamp: c.createdAt,
    }))
    const classAddedEvents = classes.map((c) => ({
      id: `class-added-${c.id}`,
      type: 'class_added',
      label: `Class added: ${c.className}`,
      timestamp: c.createdAt,
    }))
    const classCompletedEvents = classes
      .filter((c) => c.completed)
      .map((c) => ({
        id: `class-completed-${c.id}`,
        type: 'class_completed',
        label: `Class completed: ${c.className}`,
        timestamp: c.updatedAt || c.createdAt,
      }))

    return [...courseEvents, ...classAddedEvents, ...classCompletedEvents]
      .filter((event) => event.timestamp)
      .sort((a, b) => (toJsDate(b.timestamp)?.getTime() || 0) - (toJsDate(a.timestamp)?.getTime() || 0))
      .slice(0, 8)
  }, [courses, classes])

  const ACTIVITY_ICONS = { course_added: BookOpen, class_added: CalendarPlus, class_completed: CheckCircle2 }
  const ACTIVITY_STYLES = {
    course_added: 'bg-brand-50 text-brand-600',
    class_added: 'bg-sky-50 text-sky-600',
    class_completed: 'bg-green-50 text-green-600',
  }

  async function handleLogout() {
    await logout()
    navigate('/login', { replace: true })
  }

  function goTo(to) {
    setQuery('')
    setSearchOpen(false)
    navigate(to)
  }

  const initials = (userName || currentUser?.email || '?').slice(0, 1).toUpperCase()

  return (
    <header className="sticky top-0 z-20 flex h-16 flex-shrink-0 items-center gap-4 border-b border-slate-100 bg-white/80 px-4 backdrop-blur-md sm:px-6">
      <button
        onClick={onOpenMobileSidebar}
        className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-lg text-slate-500 hover:bg-slate-100 md:hidden"
        aria-label="Open sidebar"
      >
        <Menu className="h-5 w-5" />
      </button>

      <h1 className="hidden flex-shrink-0 text-base font-bold text-slate-900 sm:block">{title}</h1>

      <div ref={searchRef} className="relative flex-1 max-w-md">
        <div className="relative">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={query}
            onChange={(e) => {
              setQuery(e.target.value)
              setSearchOpen(true)
            }}
            onFocus={() => setSearchOpen(true)}
            placeholder="Search courses or classes..."
            className="w-full rounded-xl border border-slate-200 bg-slate-50 py-2 pl-9 pr-8 text-sm outline-none transition focus:border-brand-500 focus:bg-white focus:ring-2 focus:ring-brand-100"
          />
          {query && (
            <button
              onClick={() => setQuery('')}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-300 hover:text-slate-500"
              aria-label="Clear search"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          )}
        </div>

        {searchOpen && query && (
          <div className="absolute left-0 right-0 top-full z-30 mt-2 overflow-hidden rounded-xl border border-slate-100 bg-white shadow-lg">
            {searchResults.length === 0 ? (
              <p className="px-4 py-3 text-sm text-slate-400">No matches for "{query}"</p>
            ) : (
              searchResults.map((r) => (
                <button
                  key={`${r.type}-${r.id}`}
                  onClick={() => goTo(r.to)}
                  className="flex w-full items-center gap-2 px-4 py-2.5 text-left text-sm text-slate-700 transition hover:bg-slate-50"
                >
                  <span className="rounded-full bg-slate-100 px-1.5 py-0.5 text-[10px] font-semibold uppercase text-slate-500">
                    {r.type}
                  </span>
                  <span className="truncate">{r.label}</span>
                </button>
              ))
            )}
          </div>
        )}
      </div>

      <div className="ml-auto flex flex-shrink-0 items-center gap-3">
        <div ref={notifRef} className="relative">
          <button
            onClick={() => setNotifOpen((v) => !v)}
            className="relative flex h-9 w-9 items-center justify-center rounded-lg text-slate-500 transition hover:bg-slate-100"
            aria-label="Notifications"
          >
            <Bell className="h-[18px] w-[18px]" />
            {activity.length > 0 && (
              <span className="absolute right-1.5 top-1.5 h-1.5 w-1.5 rounded-full bg-brand-600" />
            )}
          </button>

          {notifOpen && (
            <div className="absolute right-0 top-full z-30 mt-2 w-80 overflow-hidden rounded-xl border border-slate-100 bg-white shadow-lg">
              <div className="border-b border-slate-100 px-4 py-3">
                <p className="text-sm font-bold text-slate-900">Recent Activity</p>
              </div>
              <div className="max-h-80 overflow-y-auto">
                {activity.length === 0 ? (
                  <p className="px-4 py-6 text-center text-sm text-slate-400">No recent activity yet.</p>
                ) : (
                  <ul className="divide-y divide-slate-50">
                    {activity.map((item) => {
                      const Icon = ACTIVITY_ICONS[item.type]
                      return (
                        <li key={item.id} className="flex items-start gap-3 px-4 py-3">
                          <div className={`flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-lg ${ACTIVITY_STYLES[item.type]}`}>
                            <Icon className="h-4 w-4" />
                          </div>
                          <div className="min-w-0">
                            <p className="truncate text-sm font-medium text-slate-700">{item.label}</p>
                            <p className="text-xs text-slate-400">{formatClassDate(item.timestamp)}</p>
                          </div>
                        </li>
                      )
                    })}
                  </ul>
                )}
              </div>
            </div>
          )}
        </div>

        <div className="flex items-center gap-2.5 border-l border-slate-100 pl-3">
          <div className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-full bg-brand-600 text-sm font-bold text-white">
            {initials}
          </div>
          <div className="hidden leading-tight sm:block">
            <p className="text-sm font-semibold capitalize text-slate-800">{userName || 'Admin'}</p>
            <p className="text-xs text-slate-400">{currentUser?.email}</p>
          </div>
          <button
            onClick={handleLogout}
            className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-lg text-slate-400 transition hover:bg-red-50 hover:text-red-600"
            aria-label="Log out"
          >
            <LogOut className="h-[18px] w-[18px]" />
          </button>
        </div>
      </div>
    </header>
  )
}
