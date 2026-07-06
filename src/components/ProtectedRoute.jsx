// src/components/ProtectedRoute.jsx
import { Navigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

// Wrap a route element with this to require authentication and, optionally,
// a specific role. Usage:
//   <ProtectedRoute allowedRole="admin"><AdminDashboard /></ProtectedRoute>
export default function ProtectedRoute({ children, allowedRole }) {
  const { currentUser, role, loading } = useAuth()

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50">
        <div className="flex flex-col items-center gap-3">
          <div className="h-10 w-10 animate-spin rounded-full border-4 border-brand-200 border-t-brand-600" />
          <p className="text-sm font-medium text-slate-500">Loading...</p>
        </div>
      </div>
    )
  }

  if (!currentUser) {
    return <Navigate to="/login" replace />
  }

  if (allowedRole && role !== allowedRole) {
    // Logged in, but wrong role — send them to their own dashboard instead of blank.
    if (role === 'admin') return <Navigate to="/admin" replace />
    if (role === 'staff') return <Navigate to="/staff" replace />
    return <Navigate to="/login" replace />
  }

  return children
}
