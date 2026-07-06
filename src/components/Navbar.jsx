// src/components/Navbar.jsx
import { useNavigate } from 'react-router-dom'
import { Video, LogOut, ShieldCheck, Eye } from 'lucide-react'
import { useAuth } from '../context/AuthContext'

export default function Navbar({ title }) {
  const { currentUser, role, logout } = useAuth()
  const navigate = useNavigate()

  async function handleLogout() {
    await logout()
    navigate('/login', { replace: true })
  }

  const isAdmin = role === 'admin'

  return (
    <header className="sticky top-0 z-30 border-b border-slate-100 bg-white/80 backdrop-blur-md">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-4 sm:px-6 lg:px-8">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-brand-600 shadow-soft">
            <Video className="h-5 w-5 text-white" strokeWidth={2.25} />
          </div>
          <div>
            <p className="text-sm font-bold leading-tight text-slate-900">CAD Academy</p>
            <p className="text-xs leading-tight text-slate-400">{title}</p>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <div className="hidden items-center gap-2 rounded-full border border-slate-200 bg-slate-50 px-3 py-1.5 sm:flex">
            {isAdmin ? (
              <ShieldCheck className="h-3.5 w-3.5 text-brand-600" />
            ) : (
              <Eye className="h-3.5 w-3.5 text-slate-500" />
            )}
            <span className="text-xs font-medium text-slate-600">
              {currentUser?.email} · {isAdmin ? 'Admin' : 'Staff'}
            </span>
          </div>

          <button
            onClick={handleLogout}
            className="flex items-center gap-1.5 rounded-xl border border-slate-200 px-3 py-2 text-xs font-semibold text-slate-600 transition hover:border-red-200 hover:bg-red-50 hover:text-red-600"
          >
            <LogOut className="h-3.5 w-3.5" />
            <span className="hidden sm:inline">Log out</span>
          </button>
        </div>
      </div>
    </header>
  )
}
