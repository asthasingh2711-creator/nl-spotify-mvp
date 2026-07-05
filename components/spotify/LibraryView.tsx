'use client'

import { buildPlaylists } from '@/lib/catalog'
import { AlbumCard } from './AlbumCard'

export function LibraryView({ onOpenPlaylist }: { onOpenPlaylist: (id: string) => void }) {
  const playlists = buildPlaylists()

  return (
    <div className="flex h-full flex-col overflow-y-auto px-6 pb-8">
      <header className="sticky top-0 z-10 bg-spotify-dark py-6">
        <h1 className="text-2xl font-bold">Your Library</h1>
      </header>
      <div className="mb-6 flex gap-2">
        {['Playlists', 'Albums', 'Artists'].map((f, i) => (
          <button key={f} className={`rounded-full px-4 py-1.5 text-sm font-medium ${i === 0 ? 'bg-white text-black' : 'border border-spotify-text/40 text-spotify-text'}`}>{f}</button>
        ))}
      </div>
      <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
        {playlists.map((p) => (
          <AlbumCard key={p.id} playlist={p} onClick={() => onOpenPlaylist(p.id)} />
        ))}
      </div>
    </div>
  )
}
