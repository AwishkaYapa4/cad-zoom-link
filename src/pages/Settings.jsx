// src/pages/Settings.jsx
import { useState } from 'react'
import { EmailAuthProvider, reauthenticateWithCredential, updatePassword } from 'firebase/auth'
import { User, Mail, ShieldCheck, Lock, Loader2, CheckCircle2, Wrench } from 'lucide-react'
import { useAuth } from '../context/AuthContext'

export default function Settings() {
  const { currentUser, userName } = useAuth()

  const [form, setForm] = useState({ currentPassword: '', newPassword: '', confirmPassword: '' })
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [submitting, setSubmitting] = useState(false)

  const initials = (userName || currentUser?.email || '?').slice(0, 1).toUpperCase()

  function update(field, value) {
    setForm((prev) => ({ ...prev, [field]: value }))
  }

  async function handleChangePassword(e) {
    e.preventDefault()
    setError('')
    setSuccess('')

    if (!form.currentPassword || !form.newPassword || !form.confirmPassword) {
      setError('Please fill in every field.')
      return
    }
    if (form.newPassword.length < 6) {
      setError('New password must be at least 6 characters.')
      return
    }
    if (form.newPassword !== form.confirmPassword) {
      setError('New password and confirmation do not match.')
      return
    }

    setSubmitting(true)
    try {
      const credential = EmailAuthProvider.credential(currentUser.email, form.currentPassword)
      await reauthenticateWithCredential(currentUser, credential)
      await updatePassword(currentUser, form.newPassword)
      setForm({ currentPassword: '', newPassword: '', confirmPassword: '' })
      setSuccess('Password updated successfully.')
    } catch (err) {
      console.error('Failed to update password:', err)
      if (err.code === 'auth/wrong-password' || err.code === 'auth/invalid-credential') {
        setError('Current password is incorrect.')
      } else if (err.code === 'auth/too-many-requests') {
        setError('Too many attempts. Please wait a moment and try again.')
      } else {
        setError('Failed to update password. Please try again.')
      }
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-slate-900">Settings</h1>
        <p className="mt-1 text-sm text-slate-500">Manage your admin profile and account security.</p>
      </div>

      <div className="grid gap-5 lg:grid-cols-2">
        <div className="rounded-2xl border border-slate-100 bg-white p-6 shadow-soft">
          <h2 className="mb-5 text-sm font-bold text-slate-900">Admin Profile</h2>
          <div className="mb-5 flex items-center gap-4">
            <div className="flex h-14 w-14 flex-shrink-0 items-center justify-center rounded-full bg-brand-600 text-lg font-bold text-white">
              {initials}
            </div>
            <div className="min-w-0">
              <p className="truncate text-base font-bold capitalize text-slate-900">{userName || 'Admin'}</p>
              <p className="flex items-center gap-1 text-xs text-slate-400">
                <ShieldCheck className="h-3.5 w-3.5 text-brand-600" />
                Administrator
              </p>
            </div>
          </div>
          <div className="space-y-3 text-sm">
            <div className="flex items-center gap-2.5 rounded-xl bg-slate-50 px-3.5 py-2.5">
              <User className="h-4 w-4 flex-shrink-0 text-slate-400" />
              <span className="text-slate-600">{userName || '—'}</span>
            </div>
            <div className="flex items-center gap-2.5 rounded-xl bg-slate-50 px-3.5 py-2.5">
              <Mail className="h-4 w-4 flex-shrink-0 text-slate-400" />
              <span className="text-slate-600">{currentUser?.email}</span>
            </div>
          </div>
        </div>

        <div className="rounded-2xl border border-slate-100 bg-white p-6 shadow-soft">
          <h2 className="mb-5 flex items-center gap-1.5 text-sm font-bold text-slate-900">
            <Lock className="h-4 w-4 text-slate-400" />
            Change Password
          </h2>

          {error && <div className="mb-4 rounded-xl bg-red-50 px-4 py-2.5 text-sm text-red-700">{error}</div>}
          {success && (
            <div className="mb-4 flex items-center gap-2 rounded-xl bg-green-50 px-4 py-2.5 text-sm text-green-700">
              <CheckCircle2 className="h-4 w-4 flex-shrink-0" />
              {success}
            </div>
          )}

          <form onSubmit={handleChangePassword} className="space-y-4">
            <div>
              <label className="mb-1.5 block text-sm font-medium text-slate-700">Current password</label>
              <input
                type="password"
                value={form.currentPassword}
                onChange={(e) => update('currentPassword', e.target.value)}
                className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-2.5 text-sm outline-none transition focus:border-brand-500 focus:bg-white focus:ring-2 focus:ring-brand-100"
              />
            </div>
            <div>
              <label className="mb-1.5 block text-sm font-medium text-slate-700">New password</label>
              <input
                type="password"
                value={form.newPassword}
                onChange={(e) => update('newPassword', e.target.value)}
                className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-2.5 text-sm outline-none transition focus:border-brand-500 focus:bg-white focus:ring-2 focus:ring-brand-100"
              />
            </div>
            <div>
              <label className="mb-1.5 block text-sm font-medium text-slate-700">Confirm new password</label>
              <input
                type="password"
                value={form.confirmPassword}
                onChange={(e) => update('confirmPassword', e.target.value)}
                className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-2.5 text-sm outline-none transition focus:border-brand-500 focus:bg-white focus:ring-2 focus:ring-brand-100"
              />
            </div>
            <button
              type="submit"
              disabled={submitting}
              className="flex w-full items-center justify-center gap-2 rounded-xl bg-brand-600 py-2.5 text-sm font-bold text-white shadow-soft transition hover:bg-brand-700 disabled:cursor-not-allowed disabled:opacity-70"
            >
              {submitting && <Loader2 className="h-4 w-4 animate-spin" />}
              {submitting ? 'Updating...' : 'Update Password'}
            </button>
          </form>
        </div>

        <div className="rounded-2xl border border-dashed border-slate-200 bg-white p-6 lg:col-span-2">
          <div className="flex items-start gap-3">
            <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl bg-slate-100 text-slate-400">
              <Wrench className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-slate-700">System Settings</h2>
              <p className="mt-1 text-sm text-slate-400">
                Coming soon — branding, notification preferences, and other app-wide settings will appear here.
              </p>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}
