'use client'

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
  type ReactNode,
} from 'react'
import type { PlayableTrack } from '@/lib/catalog'

interface PlayerContextValue {
  currentTrack: PlayableTrack | null
  queue: PlayableTrack[]
  isPlaying: boolean
  progress: number
  duration: number
  volume: number
  playTrack: (track: PlayableTrack, queue?: PlayableTrack[]) => void
  togglePlay: () => void
  playNext: () => void
  playPrevious: () => void
  seek: (time: number) => void
  setVolume: (v: number) => void
}

const PlayerContext = createContext<PlayerContextValue | null>(null)

export function PlayerProvider({ children }: { children: ReactNode }) {
  const audioRef = useRef<HTMLAudioElement | null>(null)
  const [currentTrack, setCurrentTrack] = useState<PlayableTrack | null>(null)
  const [queue, setQueue] = useState<PlayableTrack[]>([])
  const [isPlaying, setIsPlaying] = useState(false)
  const [progress, setProgress] = useState(0)
  const [duration, setDuration] = useState(0)
  const [volume, setVolumeState] = useState(0.7)

  useEffect(() => {
    audioRef.current = new Audio()
    audioRef.current.volume = volume
    const audio = audioRef.current
    const onTime = () => setProgress(audio.currentTime)
    const onMeta = () => setDuration(audio.duration || 0)
    const onEnd = () => playNextRef.current()
    audio.addEventListener('timeupdate', onTime)
    audio.addEventListener('loadedmetadata', onMeta)
    audio.addEventListener('ended', onEnd)
    return () => {
      audio.removeEventListener('timeupdate', onTime)
      audio.removeEventListener('loadedmetadata', onMeta)
      audio.removeEventListener('ended', onEnd)
      audio.pause()
    }
  }, [])

  const playNextRef = useRef<() => void>(() => {})

  const playNext = useCallback(() => {
    if (!currentTrack || !queue.length) { setIsPlaying(false); return }
    const idx = queue.findIndex((t) => t.id === currentTrack.id)
    const next = queue[idx + 1]
    if (next) {
      setCurrentTrack(next)
      audioRef.current!.src = next.src
      audioRef.current!.play().catch(() => setIsPlaying(false))
      setIsPlaying(true)
    } else setIsPlaying(false)
  }, [currentTrack, queue])

  playNextRef.current = playNext

  const playTrack = useCallback((track: PlayableTrack, newQueue?: PlayableTrack[]) => {
    if (!track.src) {
      if (track.spotifyUrl) window.open(track.spotifyUrl, '_blank', 'noopener,noreferrer')
      return
    }
    if (newQueue) setQueue(newQueue)
    setCurrentTrack(track)
    setProgress(0)
    audioRef.current!.src = track.src
    audioRef.current!.play().catch(() => setIsPlaying(false))
    setIsPlaying(true)
  }, [])

  const togglePlay = useCallback(() => {
    if (!audioRef.current || !currentTrack) return
    if (isPlaying) { audioRef.current.pause(); setIsPlaying(false) }
    else { audioRef.current.play().catch(() => setIsPlaying(false)); setIsPlaying(true) }
  }, [currentTrack, isPlaying])

  const playPrevious = useCallback(() => {
    if (!currentTrack || !audioRef.current) return
    if (audioRef.current.currentTime > 3) {
      audioRef.current.currentTime = 0
      setProgress(0)
      return
    }
    const idx = queue.findIndex((t) => t.id === currentTrack.id)
    const prev = queue[idx - 1]
    if (prev) {
      setCurrentTrack(prev)
      audioRef.current.src = prev.src
      audioRef.current.play().catch(() => setIsPlaying(false))
      setIsPlaying(true)
    }
  }, [currentTrack, queue])

  const seek = useCallback((t: number) => {
    if (audioRef.current) { audioRef.current.currentTime = t; setProgress(t) }
  }, [])

  const setVolume = useCallback((v: number) => {
    setVolumeState(v)
    if (audioRef.current) audioRef.current.volume = v
  }, [])

  return (
    <PlayerContext.Provider value={{
      currentTrack, queue, isPlaying, progress, duration, volume,
      playTrack, togglePlay, playNext, playPrevious, seek, setVolume,
    }}>
      {children}
    </PlayerContext.Provider>
  )
}

export function usePlayer() {
  const ctx = useContext(PlayerContext)
  if (!ctx) throw new Error('usePlayer requires PlayerProvider')
  return ctx
}
