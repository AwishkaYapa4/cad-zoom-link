// src/components/Skeleton.jsx

// Generic pulsing placeholder block for loading states. Size/shape via className.
export function Skeleton({ className = '' }) {
  return <div className={`animate-pulse rounded-lg bg-slate-200 ${className}`} />
}

// A row of `count` stat-card-shaped skeletons, matching StatCard's layout.
export function StatCardSkeletonGrid({ count = 4 }) {
  return (
    <div className="grid grid-cols-2 gap-5 lg:grid-cols-4">
      {Array.from({ length: count }, (_, i) => (
        <div key={i} className="rounded-2xl border border-slate-100 bg-white p-5 shadow-soft">
          <div className="mb-4 flex items-center justify-between">
            <Skeleton className="h-4 w-20" />
            <Skeleton className="h-9 w-9 rounded-xl" />
          </div>
          <Skeleton className="h-7 w-16" />
        </div>
      ))}
    </div>
  )
}

// A grid of `count` course-card-shaped skeletons, matching CourseCard's layout.
export function CourseCardSkeletonGrid({ count = 3 }) {
  return (
    <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
      {Array.from({ length: count }, (_, i) => (
        <div key={i} className="rounded-2xl border border-slate-100 bg-white p-5 shadow-soft">
          <div className="mb-4 flex items-center justify-between">
            <Skeleton className="h-10 w-10 rounded-xl" />
          </div>
          <Skeleton className="mb-4 h-5 w-3/4" />
          <div className="mb-4 grid grid-cols-3 gap-2">
            <Skeleton className="h-14 rounded-xl" />
            <Skeleton className="h-14 rounded-xl" />
            <Skeleton className="h-14 rounded-xl" />
          </div>
          <Skeleton className="mb-5 h-2 w-full" />
          <Skeleton className="h-10 w-full rounded-xl" />
        </div>
      ))}
    </div>
  )
}

// `count` skeleton table rows, sized to `columns` cells each.
export function TableRowSkeleton({ rows = 4, columns = 5 }) {
  return (
    <>
      {Array.from({ length: rows }, (_, r) => (
        <tr key={r} className="border-b border-slate-50 last:border-0">
          {Array.from({ length: columns }, (_, c) => (
            <td key={c} className="px-5 py-4">
              <Skeleton className="h-4 w-full max-w-[10rem]" />
            </td>
          ))}
        </tr>
      ))}
    </>
  )
}
