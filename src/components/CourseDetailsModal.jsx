// src/components/CourseDetailsModal.jsx
//
// Overlay wrapper around CourseDetailsContent, opened from the Dashboard's
// "View Details" button — shows the full course details (stats, classes
// table, Edit/Delete/Mark Completed/Add Class) without navigating away.
import { useEffect, useState } from 'react'
import CourseDetailsContent from './CourseDetailsContent'

export default function CourseDetailsModal({ open, courseId, onClose }) {
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    if (open) {
      const raf = requestAnimationFrame(() => setVisible(true))
      return () => cancelAnimationFrame(raf)
    }
    setVisible(false)
  }, [open])

  useEffect(() => {
    if (!open) return

    function handleKeyDown(e) {
      if (e.key === 'Escape') onClose()
    }

    document.addEventListener('keydown', handleKeyDown)
    const previousOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'

    return () => {
      document.removeEventListener('keydown', handleKeyDown)
      document.body.style.overflow = previousOverflow
    }
  }, [open, onClose])

  if (!open || !courseId) return null

  return (
    <div
      onClick={onClose}
      className={`fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-slate-900/40 p-4 backdrop-blur-sm transition-opacity duration-200 sm:items-center sm:p-6 ${
        visible ? 'opacity-100' : 'opacity-0'
      }`}
    >
      {/*
        No transform (scale/translate) on this panel: CourseDetailsContent
        nests AddClassModal/ClassDetailsModal, which are themselves
        `fixed inset-0` overlays — a transformed ancestor would establish a
        new containing block for those and break their full-viewport
        positioning. A plain opacity fade avoids that entirely.
      */}
      <div
        onClick={(e) => e.stopPropagation()}
        className={`w-full max-w-4xl rounded-2xl bg-slate-50 p-5 shadow-2xl transition-opacity duration-200 sm:p-8 ${
          visible ? 'opacity-100' : 'opacity-0'
        }`}
      >
        <CourseDetailsContent courseId={courseId} onClose={onClose} />
      </div>
    </div>
  )
}
