// src/components/ScheduleSection.jsx
// Shared section wrapper for the Today / Tomorrow / This Week / Upcoming
// schedule groups. Renders nothing if `count` is 0, so empty groups never
// show up as blank headers on the dashboard.
export default function ScheduleSection({
  icon: Icon,
  iconClassName = 'h-5 w-5 text-brand-600',
  title,
  titleClassName = 'text-lg font-bold text-slate-900',
  count,
  countClassName = 'bg-brand-50 text-brand-700',
  badge,
  wrapperClassName = '',
  children,
}) {
  if (!count) return null

  return (
    <section className="mb-10">
      <div className={`mb-4 flex flex-wrap items-center gap-2.5 ${wrapperClassName}`}>
        <Icon className={iconClassName} />
        <h2 className={titleClassName}>{title}</h2>
        {badge && (
          <span className={`rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide ${badge.className}`}>
            {badge.label}
          </span>
        )}
        <span className={`rounded-full px-2.5 py-0.5 text-xs font-bold ${countClassName}`}>{count}</span>
      </div>
      {children}
    </section>
  )
}
