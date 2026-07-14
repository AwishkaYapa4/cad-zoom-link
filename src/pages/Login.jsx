// src/pages/Login.jsx
import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Video, Lock, Mail, Loader2, AlertCircle, Eye, EyeOff, CalendarClock, BookOpen, ShieldCheck } from 'lucide-react'
import { useAuth } from '../context/AuthContext'

const HIGHLIGHTS = [
  { icon: CalendarClock, text: 'Live class schedules, always up to date' },
  { icon: BookOpen, text: 'Course progress tracked automatically' },
  { icon: ShieldCheck, text: 'Role-based access for admins and staff' },
]

export default function Login() {
  const { login } = useAuth()
  const navigate = useNavigate()

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState('')
  const [submitting, setSubmitting] = useState(false)

  async function handleSubmit(e) {
    e.preventDefault()
    setError('')
    setSubmitting(true)

    try {
      const role = await login(email.trim(), password)

      if (role === 'admin') {
        navigate('/admin/dashboard', { replace: true })
      } else if (role === 'staff') {
        navigate('/staff/dashboard', { replace: true })
      } else {
        setError('Your account has no role assigned. Contact an administrator.')
      }
    } catch (err) {
      console.error(err)
      setError(mapAuthError(err.code))
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="flex min-h-screen bg-white">
      {/* Brand panel — hidden on small screens, the visual "header" of the page on lg+ */}
      <div className="relative hidden w-[45%] flex-shrink-0 overflow-hidden bg-gradient-to-br from-brand-700 via-brand-600 to-red-900 lg:flex lg:flex-col lg:justify-between">
        <div
          className="pointer-events-none absolute inset-0 opacity-[0.07]"
          style={{
            backgroundImage: 'radial-gradient(circle, #fff 1px, transparent 1px)',
            backgroundSize: '28px 28px',
          }}
        />
        <div className="pointer-events-none absolute -right-24 -top-24 h-96 w-96 rounded-full bg-white/10 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-32 -left-16 h-96 w-96 rounded-full bg-red-950/40 blur-3xl" />

        <div className="relative z-10 px-12 pt-14">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-white/15 backdrop-blur-sm">
              <Video className="h-5 w-5 text-white" strokeWidth={2.25} />
            </div>
            <p className="text-lg font-bold text-white">CAD Academy</p>
          </div>
        </div>

        <div className="relative z-10 px-12 py-14">
          <h2 className="max-w-sm text-3xl font-bold leading-tight text-white">
            Every class link, in one place.
          </h2>
          <p className="mt-4 max-w-sm text-sm leading-relaxed text-white/70">
            The class link management system for CAD Academy — schedule, share, and track Zoom classes without the
            spreadsheet chaos.
          </p>

          <div className="mt-10 space-y-4">
            {HIGHLIGHTS.map(({ icon: Icon, text }) => (
              <div key={text} className="flex items-center gap-3">
                <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-lg bg-white/10">
                  <Icon className="h-4 w-4 text-white" />
                </div>
                <p className="text-sm font-medium text-white/85">{text}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="relative z-10 px-12 pb-10">
          <p className="text-xs text-white/50">© {new Date().getFullYear()} CAD Academy. All rights reserved.</p>
        </div>
      </div>

      {/* Sign-in form */}
      <div className="flex flex-1 items-center justify-center bg-slate-50 px-4 py-12 lg:bg-white">
        <div className="w-full max-w-md">
          <div className="mb-8 flex flex-col items-center text-center lg:items-start lg:text-left">
            <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-brand-600 shadow-soft lg:hidden">
              <Video className="h-7 w-7 text-white" strokeWidth={2.25} />
            </div>
            <h1 className="text-2xl font-bold text-slate-900 lg:hidden">CAD Academy</h1>
            <p className="mt-1 text-sm font-medium text-brand-600 lg:mt-0">Welcome back</p>
            <p className="mt-1 text-2xl font-bold text-slate-900">Sign in to your account</p>
            <p className="mt-1.5 text-sm text-slate-500">Enter your credentials to access your dashboard.</p>
          </div>

          <div className="rounded-2xl border border-slate-100 bg-white p-8 shadow-soft lg:border-none lg:p-0 lg:shadow-none">
            {error && (
              <div className="mb-5 flex items-start gap-2 rounded-xl bg-red-50 px-4 py-3 text-sm text-red-700">
                <AlertCircle className="mt-0.5 h-4 w-4 flex-shrink-0" />
                <span>{error}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label htmlFor="email" className="mb-1.5 block text-sm font-medium text-slate-700">
                  Email address
                </label>
                <div className="relative">
                  <Mail className="pointer-events-none absolute left-3 top-1/2 h-[18px] w-[18px] -translate-y-1/2 text-slate-400" />
                  <input
                    id="email"
                    type="email"
                    required
                    autoComplete="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="you@cadacademy.com"
                    className="w-full rounded-xl border border-slate-200 bg-slate-50 py-2.5 pl-10 pr-3 text-sm text-slate-900 outline-none transition focus:border-brand-500 focus:bg-white focus:ring-2 focus:ring-brand-100"
                  />
                </div>
              </div>

              <div>
                <label htmlFor="password" className="mb-1.5 block text-sm font-medium text-slate-700">
                  Password
                </label>
                <div className="relative">
                  <Lock className="pointer-events-none absolute left-3 top-1/2 h-[18px] w-[18px] -translate-y-1/2 text-slate-400" />
                  <input
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    required
                    autoComplete="current-password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full rounded-xl border border-slate-200 bg-slate-50 py-2.5 pl-10 pr-10 text-sm text-slate-900 outline-none transition focus:border-brand-500 focus:bg-white focus:ring-2 focus:ring-brand-100"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((v) => !v)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 transition hover:text-slate-600"
                    aria-label={showPassword ? 'Hide password' : 'Show password'}
                    tabIndex={-1}
                  >
                    {showPassword ? <EyeOff className="h-[18px] w-[18px]" /> : <Eye className="h-[18px] w-[18px]" />}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={submitting}
                className="flex w-full items-center justify-center gap-2 rounded-xl bg-brand-600 py-3 text-sm font-bold text-white shadow-soft transition hover:bg-brand-700 hover:shadow-lg active:scale-[0.99] disabled:cursor-not-allowed disabled:opacity-70"
              >
                {submitting && <Loader2 className="h-4 w-4 animate-spin" />}
                {submitting ? 'Signing in...' : 'Sign in'}
              </button>
            </form>
          </div>

          <p className="mt-6 text-center text-xs text-slate-400 lg:text-left">
            Access is restricted to CAD Academy staff and administrators.
          </p>
        </div>
      </div>
    </div>
  )
}

function mapAuthError(code) {
  switch (code) {
    case 'auth/invalid-credential':
    case 'auth/wrong-password':
    case 'auth/user-not-found':
      return 'Incorrect email or password.'
    case 'auth/invalid-email':
      return 'Please enter a valid email address.'
    case 'auth/too-many-requests':
      return 'Too many attempts. Please wait a moment and try again.'
    default:
      return 'Unable to sign in. Please try again.'
  }
}
