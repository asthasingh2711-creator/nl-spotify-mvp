'use client'

import { ChevronLeft, ChevronRight, Play } from 'lucide-react'
import { FEATURED, type Playlist } from '@/lib/catalog'
import { AlbumCard } from './AlbumCard'
import { usePlayer } from '@/context/PlayerContext'

function greeting() {
  const h = new Date().getHours()
  if (h < 12) return 'Good morning'
  if (h < 18) return 'Good afternoon'
  return 'Good evening'
}

export function HomeView({ onOpenPlaylist }: { onOpenPlaylist: (id: string) => void }) {
  const { playTrack } = usePlayer()

  return (
    <div className="flex h-full flex-col overflow-y-auto">
      <header className="sticky top-0 z-10 flex items-center justify-between bg-spotify-dark/80 px-6 py-4 backdrop-blur-md">
        <div className="flex gap-2">
          <button className="flex h-8 w-8 items-center justify-center rounded-full bg-black/70 text-spotify-text hover:text-white">
            <ChevronLeft size={20} />
          </button>
          <button className="flex h-8 w-8 items-center justify-center rounded-full bg-black/70 text-spotify-text hover:text-white">
            <ChevronRight size={20} />
          </button>
        </div>
        <div className="flex items-center gap-2">
          <button className="rounded-full bg-black/70 px-4 py-1.5 text-sm font-bold text-white hover:scale-105">
            Explore Premium
          </button>
          <button className="flex items-center gap-2 rounded-full bg-black/70 py-1 pr-1 pl-3 text-sm font-bold text-white hover:scale-105">
            Profile
            <div className="flex h-7 w-7 items-center justify-center rounded-full bg-purple-700 text-xs">A</div>
          </button>
        </div>
      </header>

      <div className="px-6 pb-8">
        <h1 className="mb-6 text-3xl font-bold">{greeting()}</h1>

        <div className="mb-8 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {FEATURED.map((pl) => (
            <QuickTile key={pl.id} playlist={pl} onOpen={() => onOpenPlaylist(pl.id)} onPlay={() => pl.tracks[0] && playTrack(pl.tracks[0], pl.tracks)} />
          ))}
        </div>

        <Section title="Made For You" playlists={FEATURED} onOpen={onOpenPlaylist} />
        <Section title="Recently played" playlists={[...FEATURED].reverse()} onOpen={onOpenPlaylist} />
        <Section title="Jump back in" playlists={FEATURED.slice(2)} onOpen={onOpenPlaylist} />
      </div>
    </div>
  )
}

function QuickTile({ playlist, onOpen, onPlay }: { playlist: Playlist; onOpen: () => void; onPlay: () => void }) {
  return (
    <button onClick={onOpen} className="group flex items-center gap-4 overflow-hidden rounded-md bg-spotify-highlight hover:bg-spotify-hover">
      <img src={playlist.cover} alt="" className="h-20 w-20 object-cover shadow-lg" />
      <span className="truncate pr-2 font-bold">{playlist.name}</span>
      <div className="mr-3 ml-auto opacity-0 transition-opacity group-hover:opacity-100" onClick={(e) => { e.stopPropagation(); onPlay() }}>
        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-spotify-green shadow-xl transition-transform hover:scale-105">
          <Play size={24} fill="black" className="ml-0.5 text-black" />
        </div>
      </div>
    </button>
  )
}

function Section({ title, playlists, onOpen }: { title: string; playlists: Playlist[]; onOpen: (id: string) => void }) {
  return (
    <section className="mb-8">
      <h2 className="mb-4 text-2xl font-bold hover:underline">{title}</h2>
      <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
        {playlists.map((p) => (
          <AlbumCard key={`${title}-${p.id}`} playlist={p} onClick={() => onOpen(p.id)} />
        ))}
      </div>
    </section>
  )
}
