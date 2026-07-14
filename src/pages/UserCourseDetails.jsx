// src/pages/UserCourseDetails.jsx
//
// Read-only course details page for staff, reached via direct navigation
// at /staff/course/:courseId, nested under the /staff ProtectedRoute
// (allowedRole="staff"). The Staff Dashboard's "View Details" button
// instead opens this same content in UserCourseDetailsModal.jsx as an
// overlay, without a route change.
import { useParams } from 'react-router-dom'
import UserCourseDetailsContent from '../components/UserCourseDetailsContent'

export default function UserCourseDetails() {
  const { courseId } = useParams()
  return <UserCourseDetailsContent courseId={courseId} />
}
