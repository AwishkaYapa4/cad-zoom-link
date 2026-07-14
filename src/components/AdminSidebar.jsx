// src/components/AdminSidebar.jsx
import { NavLink, useNavigate } from 'react-router-dom'
import {
  Video,
  LayoutDashboard,
  BookOpen,
  Link2,
  Calendar,
  BarChart3,
  Settings,
  LogOut,
  ChevronsLeft,
  ChevronsRight,
  X,
} from 'lucide-react'
import { useAuth } from '../context/AuthContext'

const NAV_ITEMS = [
  { to: '/admin/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { to: '/admin/courses', label: 'Courses', icon: BookOpen },
  { to: '/admin/classes', label: 'Class Links', icon: Link2 },
  { to: '/admin/calendar', label: 'Calendar', icon: Calendar },
  { to: '/admin/reports', label: 'Reports', icon: BarChart3 },
  { to: '/admin/settings', label: 'Settings', icon: Settings },
]

// Fixed left sidebar for the admin panel. `collapsed` shrinks it to an
// icon-only rail (state + persistence owned by AdminLayout). `mobileOpen`
// controls the small-screen overlay presentation; on md+ screens it's
// always a static column instead.
export default function AdminSidebar({ collapsed, onToggleCollapse, mobileOpen, onCloseMobile }) {
  const { logout } = useAuth()
  const navigate = useNavigate()

  async function handleLogout() {
    await logout()
    navigate('/login', { replace: true })
  }

  return (
    <>
      {mobileOpen && (
        <div
          className="fixed inset-0 z-40 bg-slate-900/40 md:hidden"
          onClick={onCloseMobile}
          aria-hidden="true"
        />
      )}

      <aside
        className={`fixed inset-y-0 left-0 z-50 flex h-full flex-col border-r border-slate-100 bg-white transition-all duration-200 md:sticky md:top-0 md:z-auto md:translate-x-0 ${
          collapsed ? 'md:w-20' : 'md:w-64'
        } w-64 ${mobileOpen ? 'translate-x-0' : '-translate-x-full'}`}
      >
        <div className="flex h-16 flex-shrink-0 items-center justify-between border-b border-slate-100 px-4">
          <div className="flex min-w-0 items-center gap-2.5">
            <div className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-xl bg-brand-600 shadow-soft">
              <Video className="h-4 w-4 text-white" strokeWidth={2.25} />
            </div>
            {!collapsed && (
              <p className="truncate text-sm font-bold text-slate-900 md:block">CAD Academy</p>
            )}
          </div>
          <button
            onClick={onCloseMobile}
            className="flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-lg text-slate-400 hover:bg-slate-100 md:hidden"
            aria-label="Close sidebar"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <nav className="flex-1 space-y-1 overflow-y-auto px-3 py-4">
          {NAV_ITEMS.map(({ to, label, icon: Icon }) => (
            <NavLink
              key={to}
              to={to}
              onClick={onCloseMobile}
              title={collapsed ? label : undefined}
              className={({ isActive }) =>
                `flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-semibold transition ${
                  isActive ? 'bg-brand-50 text-brand-700' : 'text-slate-500 hover:bg-slate-50 hover:text-slate-700'
                } ${collapsed ? 'md:justify-center' : ''}`
              }
            >
              <Icon className="h-[18px] w-[18px] flex-shrink-0" />
              <span className={collapsed ? 'md:hidden' : ''}>{label}</span>
            </NavLink>
          ))}
        </nav>

        <div className="flex-shrink-0 space-y-1 border-t border-slate-100 px-3 py-4">
          <button
            onClick={onToggleCollapse}
            title={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
            className={`hidden w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-semibold text-slate-500 transition hover:bg-slate-50 hover:text-slate-700 md:flex ${
              collapsed ? 'justify-center' : ''
            }`}
          >
            {collapsed ? <ChevronsRight className="h-[18px] w-[18px]" /> : <ChevronsLeft className="h-[18px] w-[18px]" />}
            <span className={collapsed ? 'md:hidden' : ''}>Collapse</span>
          </button>
          <button
            onClick={handleLogout}
            title={collapsed ? 'Log out' : undefined}
            className={`flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-semibold text-slate-500 transition hover:bg-red-50 hover:text-red-600 ${
              collapsed ? 'md:justify-center' : ''
            }`}
          >
            <LogOut className="h-[18px] w-[18px] flex-shrink-0" />
            <span className={collapsed ? 'md:hidden' : ''}>Log out</span>
          </button>
        </div>
      </aside>
    </>
  )
}
