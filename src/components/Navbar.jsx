// src/components/Navbar.jsx
// Staff-only top bar (the admin panel uses AdminSidebar/AdminTopbar instead).
// Plain, conventional light website header: white bar, logo left, simple nav links, profile + logout right.
import { useNavigate, NavLink, Link } from 'react-router-dom'
import { Video, LogOut } from 'lucide-react'
import { useAuth } from '../context/AuthContext'

const STAFF_TABS = [
  { to: '/staff/dashboard', label: 'Dashboard' },
  { to: '/staff/classes', label: 'Class Links' },
  { to: '/staff/calendar', label: 'Calendar' },
]

export default function Navbar({ title }) {
  const { currentUser, userName, logout } = useAuth()
  const navigate = useNavigate()

  async function handleLogout() {
    await logout()
    navigate('/login', { replace: true })
  }

  return (
    <header className="sticky top-0 z-30 border-b border-slate-200 bg-white">
      <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-y-3 px-4 py-4 sm:px-6 lg:px-8">
        <Link to="/staff/dashboard" className="flex items-center gap-2.5">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-brand-600">
            <Video className="h-4 w-4 text-white" strokeWidth={2.25} />
          </div>
          <div>
            <p className="text-sm font-bold leading-tight text-slate-900">CAD Academy</p>
            <p className="text-xs leading-tight text-slate-400">{title}</p>
          </div>
        </Link>

        <nav className="order-3 flex w-full items-center gap-6 overflow-x-auto sm:order-none sm:w-auto">
          {STAFF_TABS.map(({ to, label }) => (
            <NavLink
              key={to}
              to={to}
              className={({ isActive }) =>
                `flex-shrink-0 whitespace-nowrap border-b-2 py-1 text-sm font-medium transition ${
                  isActive
                    ? 'border-brand-600 text-brand-700'
                    : 'border-transparent text-slate-500 hover:text-slate-800'
                }`
              }
            >
              {label}
            </NavLink>
          ))}
        </nav>

        <div className="flex items-center gap-3">
          <div className="hidden items-center gap-2 rounded-full border border-slate-200 bg-slate-50 px-3 py-1.5 sm:flex">
            <span className="text-xs font-medium text-slate-600">
              {userName || currentUser?.email} · Staff
            </span>
          </div>

          <button
            onClick={handleLogout}
            className="flex items-center gap-1.5 rounded-lg border border-slate-200 px-3 py-2 text-xs font-semibold text-slate-600 transition hover:border-red-200 hover:bg-red-50 hover:text-red-600"
          >
            <LogOut className="h-3.5 w-3.5" />
            <span className="hidden sm:inline">Log out</span>
          </button>
        </div>
      </div>
    </header>
  )
}
