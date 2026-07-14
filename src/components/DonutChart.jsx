// src/components/DonutChart.jsx

// Hand-rolled SVG ring/donut chart — no charting library. value/max drive
// the filled arc; the percentage is rendered in the center.
export default function DonutChart({ value, max, label, size = 160, strokeWidth = 16 }) {
  const pct = max > 0 ? Math.min(100, Math.max(0, Math.round((value / max) * 100))) : 0
  const radius = (size - strokeWidth) / 2
  const circumference = 2 * Math.PI * radius
  const offset = circumference * (1 - pct / 100)
  const center = size / 2

  return (
    <div className="flex flex-col items-center">
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
        <circle cx={center} cy={center} r={radius} stroke="#e2e8f0" strokeWidth={strokeWidth} fill="none" />
        <circle
          cx={center}
          cy={center}
          r={radius}
          stroke="#dc2626"
          strokeWidth={strokeWidth}
          fill="none"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          strokeLinecap="round"
          transform={`rotate(-90 ${center} ${center})`}
          className="transition-all duration-500"
        />
        <text
          x={center}
          y={center}
          textAnchor="middle"
          dominantBaseline="middle"
          className="fill-current text-slate-900"
          style={{ fontSize: 22, fontWeight: 700 }}
        >
          {pct}%
        </text>
      </svg>
      {label && <p className="mt-2 text-sm font-medium text-slate-500">{label}</p>}
    </div>
  )
}
