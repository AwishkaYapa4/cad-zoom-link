// src/utils/validators.js

// Shared Zoom URL check — used by both the Add Class form and the
// Class Details edit form so validation stays consistent in one place.
export function isValidZoomUrl(value) {
  return /^https?:\/\/.+/i.test((value || '').trim())
}
