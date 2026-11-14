import { Volume2 } from 'lucide-react'
import { useJapaneseSpeech } from '../hooks/useJapaneseSpeech'

interface AudioButtonProps {
  text: string
  label?: string
  compact?: boolean
  rate?: number
  className?: string
}

export function AudioButton({ text, label = '播放日语', compact = false, rate = 0.82, className = '' }: AudioButtonProps) {
  const { speak, speaking, supported } = useJapaneseSpeech()

  if (!supported) return null

  return (
    <button
      type="button"
      className={`audio-button ${compact ? 'audio-button-compact' : ''} ${speaking ? 'is-speaking' : ''} ${className}`}
      aria-label={label}
      title={label}
      onClick={(event) => {
        event.stopPropagation()
        speak(text, rate)
      }}
    >
      <Volume2 size={compact ? 15 : 17} strokeWidth={1.8} />
      {!compact && <span>{label}</span>}
    </button>
  )
}
