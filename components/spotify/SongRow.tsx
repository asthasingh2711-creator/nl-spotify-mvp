'use client'

import { Play, Pause } from 'lucide-react'
import { formatDuration, type PlayableTrack } from '@/lib/catalog'
import { usePlayer } from '@/context/PlayerContext'
import { CoverImage } from './CoverImage'

export function SongRow({ track, index, queue }: { track: PlayableTrack; index: number; queue: PlayableTrack[] }) {
  const { currentTrack, isPlaying, playTrack, togglePlay } = usePlayer()
  const isCurrent = currentTrack?.id === track.id
  const active = isCurrent && isPlaying

  const play = () => {
    if (track.hasPreview === false && track.spotifyUrl) {
      window.open(track.spotifyUrl, '_blank', 'noopener,noreferrer')
      return
    }
    if (isCurrent) togglePlay()
    else playTrack(track, queue)
  }

  return (
    <div onDoubleClick={play} className={`group grid cursor-default grid-cols-[16px_4fr_2fr_1fr] items-center gap-4 rounded-md px-4 py-2 text-sm hover:bg-white/10 ${isCurrent ? 'text-spotify-green' : 'text-spotify-text'}`}>
      <div className="flex justify-center">
        {active ? (
          <button onClick={togglePlay}><Pause size={14} fill="currentColor" className="text-spotify-green" /></button>
        ) : (
          <>
            <span className="group-hover:hidden">{index + 1}</span>
            <button onClick={play} className="hidden text-white group-hover:block"><Play size={14} fill="currentColor" /></button>
          </>
        )}
      </div>
      <div className="flex min-w-0 items-center gap-3">
        <CoverImage src={track.cover} seed={track.id} className="h-10 w-10 rounded object-cover" />
        <div className="min-w-0">
          <p className={`truncate font-medium ${isCurrent ? 'text-spotify-green' : 'text-white'}`}>{track.title}</p>
          <p className="truncate">{track.artist}</p>
        </div>
      </div>
      <p className="truncate">{track.album}</p>
      <span className="text-right tabular-nums">{formatDuration(track.duration)}</span>
    </div>
  )
}
