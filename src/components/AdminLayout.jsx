// src/components/AdminLayout.jsx
import { useEffect, useState } from 'react'
import { Outlet, useLocation } from 'react-router-dom'
import { collection, onSnapshot } from 'firebase/firestore'
import { db } from '../firebase/config'
import AdminSidebar from './AdminSidebar'
import AdminTopbar from './AdminTopbar'

const TITLES = {
  '/admin/dashboard': 'Dashboard',
  '/admin/classes': 'Class Links',
  '/admin/courses': 'Courses',
  '/admin/calendar': 'Calendar',
  '/admin/reports': 'Reports',
  '/admin/settings': 'Settings',
}

function resolveTitle(pathname) {
  if (TITLES[pathname]) return TITLES[pathname]
  if (pathname.startsWith('/admin/course/')) return 'Course Details'
  return 'Admin Dashboard'
}

const COLLAPSE_KEY = 'admin-sidebar-collapsed'

// Sidebar + top bar shell for every /admin/* page. Subscribes once to
// `courses`/`classes` here (shared by the top bar's search + notifications)
// so individual pages keep their own independent listeners for their own
// needs without this shell duplicating page-level state.
export default function AdminLayout() {
  const location = useLocation()
  const title = resolveTitle(location.pathname)

  const [collapsed, setCollapsed] = useState(() => localStorage.getItem(COLLAPSE_KEY) === 'true')
  const [mobileOpen, setMobileOpen] = useState(false)
  const [courses, setCourses] = useState([])
  const [classes, setClasses] = useState([])

  useEffect(() => {
    localStorage.setItem(COLLAPSE_KEY, String(collapsed))
  }, [collapsed])

  // Close the mobile sidebar overlay automatically on navigation.
  useEffect(() => {
    setMobileOpen(false)
  }, [location.pathname])

  useEffect(() => {
    const unsubscribe = onSnapshot(collection(db, 'courses'), (snapshot) => {
      setCourses(snapshot.docs.map((docSnap) => ({ id: docSnap.id, ...docSnap.data() })))
    })
    return unsubscribe
  }, [])

  useEffect(() => {
    const unsubscribe = onSnapshot(collection(db, 'classes'), (snapshot) => {
      setClasses(snapshot.docs.map((docSnap) => ({ id: docSnap.id, ...docSnap.data() })))
    })
    return unsubscribe
  }, [])

  return (
    <div className="flex h-screen overflow-hidden bg-slate-50">
      <AdminSidebar
        collapsed={collapsed}
        onToggleCollapse={() => setCollapsed((v) => !v)}
        mobileOpen={mobileOpen}
        onCloseMobile={() => setMobileOpen(false)}
      />

      <div className="flex min-w-0 flex-1 flex-col overflow-hidden">
        <AdminTopbar
          title={title}
          courses={courses}
          classes={classes}
          onOpenMobileSidebar={() => setMobileOpen(true)}
        />
        <main className="flex-1 overflow-y-auto p-4 sm:p-6">
          <Outlet />
        </main>
      </div>
    </div>
  )
}
