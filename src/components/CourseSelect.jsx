// src/components/CourseSelect.jsx

// Shared <select> for picking a course, used by both the Add Class form
// (required, no "all" option) and the Class Links filter dropdown
// (optional, with an "All courses" option).
export default function CourseSelect({
  courses,
  value,
  onChange,
  includeAllOption = false,
  placeholder = 'Select a course',
  className = '',
}) {
  return (
    <select
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className={
        className ||
        'w-full appearance-none rounded-xl border border-slate-200 bg-slate-50 py-2.5 pl-10 pr-3 text-sm outline-none transition focus:border-brand-500 focus:bg-white focus:ring-2 focus:ring-brand-100'
      }
    >
      {includeAllOption ? (
        <option value="">All courses</option>
      ) : (
        <option value="" disabled>
          {placeholder}
        </option>
      )}
      {courses.length === 0 && !includeAllOption && (
        <option value="" disabled>
          No courses yet — add one first
        </option>
      )}
      {courses.map((course) => (
        <option key={course.id} value={course.id}>
          {course.courseName}
        </option>
      ))}
    </select>
  )
}
