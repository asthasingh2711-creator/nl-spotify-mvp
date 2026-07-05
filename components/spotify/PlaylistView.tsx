'use client'

import { Clock, Play, Pause } from 'lucide-react'
import { getPlaylistById } from '@/lib/catalog'
import { SongRow } from './SongRow'
import { usePlayer } from '@/context/PlayerContext'

export function PlaylistView({ playlistId }: { playlistId: string }) {
  const playlist = getPlaylistById(playlistId)
  const { playTrack, currentTrack, isPlaying, togglePlay } = usePlayer()

  if (!playlist) return <div className="flex h-full items-center justify-center text-spotify-text">Playlist not found</div>

  const playing = currentTrack && playlist.tracks.some((t) => t.id === currentTrack.id) && isPlaying

  return (
    <div className="flex h-full flex-col overflow-y-auto">
      <div className="flex shrink-0 items-end gap-6 bg-gradient-to-b from-indigo-900 to-spotify-dark px-6 pt-20 pb-6">
        <img src={playlist.cover} alt="" className="h-52 w-52 rounded shadow-2xl" />
        <div>
          <p className="mb-2 text-xs font-bold uppercase">Playlist</p>
          <h1 className="mb-4 text-5xl font-black">{playlist.name}</h1>
          <p className="text-spotify-text">{playlist.description}</p>
          <p className="mt-2 text-sm"><span className="font-bold text-white">Spotify Clone</span> · {playlist.tracks.length} songs</p>
        </div>
      </div>

      <div className="px-6 py-6">
        <button
          onClick={() => playing ? togglePlay() : playlist.tracks[0] && playTrack(playlist.tracks[0], playlist.tracks)}
          className="flex h-14 w-14 items-center justify-center rounded-full bg-spotify-green shadow-lg hover:scale-105"
        >
          {playing ? <Pause size={28} fill="black" /> : <Play size={28} fill="black" className="ml-1" />}
        </button>
      </div>

      <div className="px-2 pb-8">
        <div className="mb-2 grid grid-cols-[16px_4fr_2fr_1fr] gap-4 border-b border-white/10 px-4 pb-2 text-xs uppercase text-spotify-text">
          <span>#</span><span>Title</span><span>Album</span><span className="flex justify-end"><Clock size={16} /></span>
        </div>
        {playlist.tracks.map((t, i) => <SongRow key={t.id} track={t} index={i} queue={playlist.tracks} />)}
      </div>
    </div>
  )
}
