// src/components/AppLayout.jsx
// Staff-only shell (the admin panel uses AdminLayout instead).
import { Outlet, useLocation } from 'react-router-dom'
import Navbar from './Navbar'

const TITLES = {
  '/staff/dashboard': 'Dashboard',
  '/staff/classes': 'Class Links',
  '/staff/calendar': 'Calendar',
}

function resolveTitle(pathname) {
  if (TITLES[pathname]) return TITLES[pathname]
  if (pathname.startsWith('/staff/course/')) return 'Course Details'
  return 'CAD Academy'
}

// Shared shell for every /staff/* page: sticky Navbar (with the tab nav) on
// top, page content rendered via <Outlet/> below. Keeps the tabs and header
// persistent across pages instead of each page re-rendering its own copy.
export default function AppLayout() {
  const location = useLocation()
  const title = resolveTitle(location.pathname)

  return (
    <div className="min-h-screen bg-slate-50">
      <Navbar title={title} />
      <main className="mx-auto max-w-6xl px-4 py-8 sm:px-6 lg:px-8">
        <Outlet />
      </main>
    </div>
  )
}
