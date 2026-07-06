// src/utils/dateHelpers.js

// Converts a Firestore Timestamp, ISO string, or Date into a JS Date.
export function toJsDate(value) {
  if (!value) return null
  if (typeof value.toDate === 'function') return value.toDate() // Firestore Timestamp
  if (value instanceof Date) return value
  return new Date(value)
}

// Returns { weekStart, weekEnd } for the current week, Monday 00:00:00 to Sunday 23:59:59.
export function getCurrentWeekBounds(referenceDate = new Date()) {
  const now = new Date(referenceDate)
  const day = now.getDay() // 0 = Sunday, 1 = Monday, ... 6 = Saturday

  // Distance back to Monday. If today is Sunday (0), go back 6 days.
  const diffToMonday = day === 0 ? 6 : day - 1

  const weekStart = new Date(now)
  weekStart.setHours(0, 0, 0, 0)
  weekStart.setDate(now.getDate() - diffToMonday)

  const weekEnd = new Date(weekStart)
  weekEnd.setDate(weekStart.getDate() + 6)
  weekEnd.setHours(23, 59, 59, 999)

  return { weekStart, weekEnd }
}

// Splits a list of classes (each with a `startTime` field) into
// "thisWeek" (within Mon–Sun of the current week) and "upcoming" (after this week).
// Classes before the current week are excluded (considered past).
export function splitClassesByWeek(classes) {
  const { weekStart, weekEnd } = getCurrentWeekBounds()

  const thisWeek = []
  const upcoming = []

  for (const cls of classes) {
    const start = toJsDate(cls.startTime)
    if (!start) continue

    if (start >= weekStart && start <= weekEnd) {
      thisWeek.push(cls)
    } else if (start > weekEnd) {
      upcoming.push(cls)
    }
    // classes with start < weekStart are past classes and omitted from both lists
  }

  thisWeek.sort((a, b) => toJsDate(a.startTime) - toJsDate(b.startTime))
  upcoming.sort((a, b) => toJsDate(a.startTime) - toJsDate(b.startTime))

  return { thisWeek, upcoming }
}

export function formatClassDate(value) {
  const date = toJsDate(value)
  if (!date) return ''
  return date.toLocaleDateString('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
  })
}

export function formatClassTime(value) {
  const date = toJsDate(value)
  if (!date) return ''
  return date.toLocaleTimeString('en-US', {
    hour: 'numeric',
    minute: '2-digit',
  })
}

// Converts a Date to the yyyy-MM-ddTHH:mm string format needed by <input type="datetime-local">.
export function toDateTimeLocalString(date) {
  if (!date) return ''
  const d = new Date(date)
  const pad = (n) => String(n).padStart(2, '0')
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`
}
