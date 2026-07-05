'use client'

import { Play } from 'lucide-react'
import type { Playlist } from '@/lib/catalog'

export function AlbumCard({ playlist, onClick }: { playlist: Playlist; onClick: () => void }) {
  return (
    <button onClick={onClick} className="group rounded-lg bg-spotify-elevated p-4 text-left transition-colors hover:bg-spotify-highlight">
      <div className="relative mb-4 aspect-square overflow-hidden rounded-md shadow-lg">
        <img src={playlist.cover} alt="" className="h-full w-full object-cover" />
        <div className="absolute bottom-2 right-2 translate-y-2 opacity-0 transition-all group-hover:translate-y-0 group-hover:opacity-100">
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-spotify-green shadow-xl">
            <Play size={24} fill="black" className="ml-0.5 text-black" />
          </div>
        </div>
      </div>
      <h3 className="truncate font-bold">{playlist.name}</h3>
      <p className="line-clamp-2 text-sm text-spotify-text">{playlist.description}</p>
    </button>
  )
}
