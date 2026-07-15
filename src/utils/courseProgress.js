// src/utils/courseProgress.js

// Per-course completion, blending two independent signals:
//   1. Real classes (Class Links / Course Details) marked completed there.
//   2. The course's own standalone "Course Progress" checklist
//      (`completedClassNumbers`), used to track planned classes that don't
//      have a real Class Link entry yet.
// A class number counts once even if both signals mark it complete (e.g. a
// real class #3 that's completed AND checklist item #3 is checked). This
// feeds course-level summary views (Dashboard cards, Courses table,
// Reports) — it intentionally does NOT change what Class Links itself
// displays, which always reflects only real class documents.
export function getCourseCompletion(course, classes) {
  const courseClasses = classes.filter((c) => c.courseId === course.id)

  const completedNumbers = new Set()
  let completedWithoutNumber = 0
  for (const cls of courseClasses) {
    if (!cls.completed) continue
    if (cls.classNumber != null) completedNumbers.add(Number(cls.classNumber))
    else completedWithoutNumber += 1
  }
  for (const n of course.completedClassNumbers || []) {
    completedNumbers.add(Number(n))
  }

  const completed = completedNumbers.size + completedWithoutNumber
  const total = course.totalClasses || courseClasses.length
  const remaining = Math.max(0, total - completed)
  const progressPct = total > 0 ? Math.min(100, Math.round((completed / total) * 100)) : 0

  return { total, completed, remaining, progressPct }
}
