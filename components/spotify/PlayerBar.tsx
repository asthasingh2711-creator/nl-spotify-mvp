'use client'

import type { CSSProperties } from 'react'
import { SkipBack, SkipForward, Play, Pause, Volume2, Volume1, VolumeX, Shuffle, Repeat } from 'lucide-react'
import { formatDuration } from '@/lib/catalog'
import { usePlayer } from '@/context/PlayerContext'

export function PlayerBar() {
  const { currentTrack, isPlaying, progress, duration, volume, togglePlay, playNext, playPrevious, seek, setVolume } = usePlayer()
  const pct = duration > 0 ? (progress / duration) * 100 : 0
  const VolIcon = volume === 0 ? VolumeX : volume < 0.5 ? Volume1 : Volume2

  return (
    <footer className="grid h-[90px] shrink-0 grid-cols-3 items-center border-t border-white/10 bg-spotify-elevated px-4">
      <div className="flex min-w-0 items-center gap-3">
        {currentTrack ? (
          <>
            <img src={currentTrack.cover} alt="" className="h-14 w-14 rounded object-cover" />
            <div className="min-w-0">
              <p className="truncate text-sm font-medium">{currentTrack.title}</p>
              <p className="truncate text-xs text-spotify-text">{currentTrack.artist}</p>
            </div>
          </>
        ) : (
          <p className="text-sm text-spotify-text">Select a track to play</p>
        )}
      </div>

      <div className="flex max-w-[722px] flex-col items-center gap-2">
        <div className="flex items-center gap-4">
          <Shuffle size={16} className="text-spotify-text" />
          <button onClick={playPrevious} disabled={!currentTrack} className="text-spotify-text hover:text-white disabled:opacity-40">
            <SkipBack size={20} fill="currentColor" />
          </button>
          <button onClick={togglePlay} disabled={!currentTrack} className="flex h-8 w-8 items-center justify-center rounded-full bg-white text-black disabled:opacity-40">
            {isPlaying ? <Pause size={18} fill="black" /> : <Play size={18} fill="black" className="ml-0.5" />}
          </button>
          <button onClick={playNext} disabled={!currentTrack} className="text-spotify-text hover:text-white disabled:opacity-40">
            <SkipForward size={20} fill="currentColor" />
          </button>
          <Repeat size={16} className="text-spotify-text" />
        </div>
        <div className="flex w-full items-center gap-2">
          <span className="w-10 text-right text-xs tabular-nums text-spotify-text">{formatDuration(progress)}</span>
          <input type="range" min={0} max={duration || 100} value={progress} onChange={(e) => seek(+e.target.value)} disabled={!currentTrack} className="progress h-1 flex-1" style={{ '--progress': `${pct}%` } as CSSProperties} />
          <span className="w-10 text-xs tabular-nums text-spotify-text">{formatDuration(duration || 0)}</span>
        </div>
      </div>

      <div className="flex items-center justify-end gap-2">
        <button onClick={() => setVolume(volume > 0 ? 0 : 0.7)} className="text-spotify-text hover:text-white">
          <VolIcon size={16} />
        </button>
        <input type="range" min={0} max={1} step={0.01} value={volume} onChange={(e) => setVolume(+e.target.value)} className="progress h-1 w-24" style={{ '--progress': `${volume * 100}%` } as CSSProperties} />
      </div>
    </footer>
  )
}
