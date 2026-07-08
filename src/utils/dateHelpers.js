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

// Normalizes a Date to local midnight (strips hours/minutes/seconds/ms),
// so day-to-day comparisons aren't thrown off by time-of-day or timezones.
function startOfDay(date) {
  const d = new Date(date)
  d.setHours(0, 0, 0, 0)
  return d
}

// Groups classes into Today / Tomorrow / This Week / Upcoming based on the
// class's startTime compared against the viewer's local date. Each class
// belongs to exactly one group, in this priority order:
//   1. Today       — classDay === today
//   2. Tomorrow    — classDay === today + 1
//   3. This Week   — after tomorrow, on or before the current week's Sunday
//   4. Upcoming    — after the current week
// Classes whose day is before today are past classes and are excluded from
// every group (they're left in Firestore untouched, just not displayed).
// Each group is sorted chronologically (date, then time), earliest first.
// Date-only arithmetic via setDate()/setHours() correctly rolls over month
// and year boundaries (e.g. Dec 31 -> today, Jan 1 -> tomorrow).
export function categorizeClasses(classes) {
  const today = startOfDay(new Date())

  const tomorrow = new Date(today)
  tomorrow.setDate(today.getDate() + 1)

  const { weekEnd } = getCurrentWeekBounds(today)
  const weekEndDay = startOfDay(weekEnd)

  const groups = { today: [], tomorrow: [], thisWeek: [], upcoming: [] }

  for (const cls of classes) {
    const start = toJsDate(cls.startTime)
    if (!start) continue

    const classDay = startOfDay(start)

    if (classDay.getTime() < today.getTime()) {
      continue // past class — not shown in any section
    }

    if (classDay.getTime() === today.getTime()) {
      groups.today.push(cls)
    } else if (classDay.getTime() === tomorrow.getTime()) {
      groups.tomorrow.push(cls)
    } else if (classDay.getTime() <= weekEndDay.getTime()) {
      groups.thisWeek.push(cls)
    } else {
      groups.upcoming.push(cls)
    }
  }

  const byStartTime = (a, b) => toJsDate(a.startTime) - toJsDate(b.startTime)
  groups.today.sort(byStartTime)
  groups.tomorrow.sort(byStartTime)
  groups.thisWeek.sort(byStartTime)
  groups.upcoming.sort(byStartTime)

  return groups
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
