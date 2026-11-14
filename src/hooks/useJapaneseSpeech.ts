import { useCallback, useEffect, useState } from 'react'

let cachedVoices: SpeechSynthesisVoice[] = []

function pickJapaneseVoice(voices: SpeechSynthesisVoice[]) {
  return (
    voices.find((voice) => voice.lang.toLowerCase().startsWith('ja-jp')) ??
    voices.find((voice) => voice.lang.toLowerCase().startsWith('ja')) ??
    null
  )
}

export function useJapaneseSpeech() {
  const supported = typeof window !== 'undefined' && 'speechSynthesis' in window
  const [speaking, setSpeaking] = useState(false)
  const [voice, setVoice] = useState<SpeechSynthesisVoice | null>(null)

  useEffect(() => {
    if (!supported) return
    const update = () => {
      cachedVoices = window.speechSynthesis.getVoices()
      setVoice(pickJapaneseVoice(cachedVoices))
    }
    update()
    window.speechSynthesis.addEventListener('voiceschanged', update)
    return () => window.speechSynthesis.removeEventListener('voiceschanged', update)
  }, [supported])

  const stop = useCallback(() => {
    if (!supported) return
    window.speechSynthesis.cancel()
    setSpeaking(false)
  }, [supported])

  const speak = useCallback(
    (text: string, rate = 0.82) => {
      if (!supported) return
      window.speechSynthesis.cancel()
      const utterance = new SpeechSynthesisUtterance(text)
      utterance.lang = 'ja-JP'
      utterance.rate = rate
      utterance.pitch = 1
      const selected = voice ?? pickJapaneseVoice(cachedVoices)
      if (selected) utterance.voice = selected
      utterance.onstart = () => setSpeaking(true)
      utterance.onend = () => setSpeaking(false)
      utterance.onerror = () => setSpeaking(false)
      window.speechSynthesis.speak(utterance)
    },
    [supported, voice],
  )

  return { speak, stop, speaking, supported, hasJapaneseVoice: Boolean(voice) }
}
