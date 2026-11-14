interface ProgressRingProps {
  value: number
  max?: number
  size?: number
  stroke?: number
  label?: string
  sublabel?: string
  tone?: 'red' | 'green' | 'gold' | 'ink'
}

export function ProgressRing({
  value,
  max = 100,
  size = 96,
  stroke = 7,
  label,
  sublabel,
  tone = 'red',
}: ProgressRingProps) {
  const radius = (size - stroke) / 2
  const circumference = 2 * Math.PI * radius
  const percent = max <= 0 ? 0 : Math.min(1, Math.max(0, value / max))
  const offset = circumference * (1 - percent)
  return (
    <div className={`progress-ring tone-${tone}`} style={{ width: size, height: size }}>
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} aria-hidden="true">
        <circle className="ring-track" cx={size / 2} cy={size / 2} r={radius} strokeWidth={stroke} fill="none" />
        <circle
          className="ring-value"
          cx={size / 2}
          cy={size / 2}
          r={radius}
          strokeWidth={stroke}
          fill="none"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          strokeLinecap="round"
          transform={`rotate(-90 ${size / 2} ${size / 2})`}
        />
      </svg>
      <div className="ring-copy">
        <strong>{label ?? `${Math.round(percent * 100)}%`}</strong>
        {sublabel && <span>{sublabel}</span>}
      </div>
    </div>
  )
}
