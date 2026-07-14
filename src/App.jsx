// src/App.jsx
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider, useAuth } from './context/AuthContext'
import ProtectedRoute from './components/ProtectedRoute'
import AppLayout from './components/AppLayout'
import AdminLayout from './components/AdminLayout'
import Login from './pages/Login'
import Dashboard from './pages/Dashboard'
import ClassLinks from './pages/ClassLinks'
import Courses from './pages/Courses'
import AdminCourseDetails from './pages/AdminCourseDetails'
import Reports from './pages/Reports'
import CalendarPage from './pages/CalendarPage'
import Settings from './pages/Settings'
import StaffClassLinks from './pages/StaffClassLinks'
import UserCourseDetails from './pages/UserCourseDetails'
import UserCalendarPage from './pages/UserCalendarPage'

// Sends an already-logged-in user straight to their dashboard,
// and sends a logged-out user to /login. Used for the root path.
function RootRedirect() {
  const { currentUser, role, loading } = useAuth()

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50">
        <div className="h-10 w-10 animate-spin rounded-full border-4 border-brand-200 border-t-brand-600" />
      </div>
    )
  }

  if (!currentUser) return <Navigate to="/login" replace />
  if (role === 'admin') return <Navigate to="/admin/dashboard" replace />
  if (role === 'staff') return <Navigate to="/staff/dashboard" replace />

  // Logged in, but no role assigned in Firestore yet.
  return <Navigate to="/login" replace />
}

function AppRoutes() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />

      <Route
        path="/admin"
        element={
          <ProtectedRoute allowedRole="admin">
            <AdminLayout />
          </ProtectedRoute>
        }
      >
        <Route index element={<Navigate to="dashboard" replace />} />
        <Route path="dashboard" element={<Dashboard />} />
        <Route path="classes" element={<ClassLinks />} />
        <Route path="courses" element={<Courses />} />
        <Route path="course/:courseId" element={<AdminCourseDetails />} />
        <Route path="calendar" element={<CalendarPage />} />
        <Route path="reports" element={<Reports />} />
        <Route path="settings" element={<Settings />} />
      </Route>

      <Route
        path="/staff"
        element={
          <ProtectedRoute allowedRole="staff">
            <AppLayout />
          </ProtectedRoute>
        }
      >
        <Route index element={<Navigate to="dashboard" replace />} />
        <Route path="dashboard" element={<Dashboard />} />
        <Route path="classes" element={<StaffClassLinks />} />
        <Route path="course/:courseId" element={<UserCourseDetails />} />
        <Route path="calendar" element={<UserCalendarPage />} />
      </Route>

      <Route path="/" element={<RootRedirect />} />
      <Route path="*" element={<RootRedirect />} />
    </Routes>
  )
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <AppRoutes />
      </AuthProvider>
    </BrowserRouter>
  )
}
