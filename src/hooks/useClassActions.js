// src/hooks/useClassActions.js
import { useState } from 'react'
import { collection, addDoc, updateDoc, deleteDoc, doc, serverTimestamp, Timestamp } from 'firebase/firestore'
import { db } from '../firebase/config'

// Shared Firestore mutation logic for the `classes` collection, used by both
// the Class Links page and the per-course detail page so add/update/delete/
// toggle-complete behavior (including the completed <-> status sync) stays
// in one place.
export function useClassActions() {
  const [deletingIds, setDeletingIds] = useState(() => new Set())
  const [toast, setToast] = useState(null) // { message, tone: 'success' | 'error' }

  function showToast(message, tone = 'success') {
    setToast({ message, tone })
    setTimeout(() => setToast(null), 2500)
  }

  async function addClass(newClass) {
    await addDoc(collection(db, 'classes'), {
      courseId: newClass.courseId,
      classNumber: newClass.classNumber,
      className: newClass.className,
      tutorName: newClass.tutorName,
      startTime: Timestamp.fromDate(newClass.startTime),
      zoomUrl: newClass.zoomUrl,
      status: newClass.status,
      completed: false,
      classMessage: newClass.classMessage || '',
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    })
  }

  // `fields` is applied as-is (plus updatedAt) — callers only pass the keys they mean to change.
  async function updateClass(classId, fields) {
    try {
      await updateDoc(doc(db, 'classes', classId), { ...fields, updatedAt: serverTimestamp() })
      showToast('Class updated successfully', 'success')
    } catch (err) {
      console.error('Failed to update class:', err)
      showToast('Failed to update class', 'error')
      throw err
    }
  }

  // Marking a class complete/incomplete also syncs the `status` field, so
  // "status" always reflects "Completed" whenever `completed` is true.
  async function toggleComplete(classId, nextCompleted) {
    try {
      await updateDoc(doc(db, 'classes', classId), {
        completed: nextCompleted,
        status: nextCompleted ? 'completed' : 'scheduled',
        updatedAt: serverTimestamp(),
      })
      showToast(nextCompleted ? 'Class marked as completed' : 'Class marked as not completed', 'success')
    } catch (err) {
      console.error('Failed to update class:', err)
      showToast('Failed to update class', 'error')
    }
  }

  async function deleteClass(classId) {
    if (deletingIds.has(classId)) return // a delete for this class is already in flight

    const confirmed = window.confirm('Are you sure you want to delete this class?')
    if (!confirmed) return

    setDeletingIds((prev) => new Set(prev).add(classId))

    try {
      await deleteDoc(doc(db, 'classes', classId))
      showToast('Class deleted successfully', 'success')
    } catch (err) {
      console.error('Failed to delete class:', err)
      showToast('Failed to delete class', 'error')
    } finally {
      setDeletingIds((prev) => {
        const next = new Set(prev)
        next.delete(classId)
        return next
      })
    }
  }

  return { addClass, updateClass, deleteClass, toggleComplete, deletingIds, toast }
}
