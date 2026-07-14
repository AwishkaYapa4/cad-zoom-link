// src/pages/AdminCourseDetails.jsx
//
// Admin-only course details page, reached via direct navigation (the
// Courses page's "view classes" icon, or a bookmarked/shared URL) at
// /admin/course/:courseId, nested under the /admin ProtectedRoute
// (allowedRole="admin") — a staff/user account can never reach this route.
// The Dashboard's "View Details" button instead opens this same content in
// CourseDetailsModal.jsx as an overlay, without a route change.
import { useParams } from 'react-router-dom'
import CourseDetailsContent from '../components/CourseDetailsContent'

export default function AdminCourseDetails() {
  const { courseId } = useParams()
  return <CourseDetailsContent courseId={courseId} />
}
