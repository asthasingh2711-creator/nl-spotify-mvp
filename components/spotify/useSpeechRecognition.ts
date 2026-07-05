'use client'

import { useCallback, useRef, useState } from 'react'

type SpeechRecognitionInstance = {
  lang: string
  onresult: (e: { results: { [i: number]: { [j: number]: { transcript: string } } } }) => void
  onerror: () => void
  onend: () => void
  start: () => void
  stop: () => void
}

declare global {
  interface Window {
    webkitSpeechRecognition?: new () => SpeechRecognitionInstance
  }
}

export function useSpeechRecognition(onResult: (text: string) => void) {
  const [listening, setListening] = useState(false)
  const recognitionRef = useRef<SpeechRecognitionInstance | null>(null)

  const stop = useCallback(() => {
    recognitionRef.current?.stop()
    setListening(false)
  }, [])

  const start = useCallback(() => {
    const SR = window.webkitSpeechRecognition
    if (!SR) return

    recognitionRef.current?.stop()
    const rec = new SR()
    rec.lang = 'en-US'
    rec.onresult = (e) => {
      const text = e.results[0]?.[0]?.transcript
      if (text) onResult(text)
      setListening(false)
    }
    rec.onerror = rec.onend = () => setListening(false)
    recognitionRef.current = rec
    rec.start()
    setListening(true)
  }, [onResult])

  return { listening, start, stop }
}
