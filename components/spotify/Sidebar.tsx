'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { Home, Search, Library, Heart, Sparkles, Plus, Settings } from 'lucide-react'
import { buildPlaylists } from '@/lib/catalog'
import { SpotifyLogo } from './SpotifyLogo'

export type SpotifyPage = 'home' | 'search' | 'library' | 'playlist'

interface SidebarProps {
  currentPage: SpotifyPage
  activePlaylistId: string | null
  onNavigate: (page: SpotifyPage) => void
  onOpenPlaylist: (id: string) => void
}

export function Sidebar({ currentPage, activePlaylistId, onNavigate, onOpenPlaylist }: SidebarProps) {
  const [spotifyStatus, setSpotifyStatus] = useState<'loading' | 'live' | 'demo' | 'error'>('loading')

  useEffect(() => {
    fetch('/api/spotify/health')
      .then((r) => r.json())
      .then((d: { connected: boolean; mode: string }) => {
        setSpotifyStatus(d.connected ? 'live' : d.mode === 'error' ? 'error' : 'demo')
      })
      .catch(() => setSpotifyStatus('demo'))
  }, [])

  const nav = [
    { id: 'home' as SpotifyPage, label: 'Home', icon: Home },
    { id: 'search' as SpotifyPage, label: 'Search', icon: Search },
    { id: 'library' as SpotifyPage, label: 'Your Library', icon: Library },
  ]

  const playlists = buildPlaylists()

  return (
    <aside className="flex h-full w-[350px] shrink-0 flex-col gap-2 bg-black p-2">
      <div className="rounded-lg bg-spotify-elevated px-6 py-5">
        <div className="flex items-center gap-3">
          <SpotifyLogo className="h-8 w-8 text-spotify-green" />
          <span className="text-2xl font-black tracking-tight">Spotify</span>
        </div>
        {spotifyStatus === 'live' && (
          <p className="mt-2 text-xs text-spotify-green">● Connected to Spotify</p>
        )}
        {spotifyStatus === 'demo' && (
          <Link href="/setup" className="mt-2 block text-xs text-spotify-text hover:text-white hover:underline">
            Demo mode — set up Spotify credentials
          </Link>
        )}
        {spotifyStatus === 'error' && (
          <Link href="/setup" className="mt-2 block text-xs text-red-400 hover:underline">
            Spotify auth failed — check setup
          </Link>
        )}
      </div>

      <nav className="rounded-lg bg-spotify-elevated px-3 py-4">
        <ul className="space-y-1">
          {nav.map(({ id, label, icon: Icon }) => (
            <li key={id}>
              <button
                onClick={() => onNavigate(id)}
                className={`flex w-full items-center gap-4 rounded-md px-3 py-2.5 text-base font-bold transition-colors hover:text-white ${
                  currentPage === id && !activePlaylistId ? 'text-white' : 'text-spotify-text'
                }`}
              >
                <Icon size={24} strokeWidth={2.5} />
                {label}
              </button>
            </li>
          ))}
          <li>
            <Link
              href="/discover"
              className="flex w-full items-center gap-4 rounded-md px-3 py-2.5 text-base font-bold text-spotify-green transition-colors hover:bg-spotify-hover hover:text-spotify-green-hover"
            >
              <Sparkles size={24} />
              Explain & Refine
            </Link>
          </li>
        </ul>
      </nav>

      <div className="flex min-h-0 flex-1 flex-col rounded-lg bg-spotify-elevated">
        <div className="flex items-center justify-between px-6 py-4">
          <button className="flex items-center gap-2 text-sm font-bold text-spotify-text transition-colors hover:text-white">
            <Library size={20} />
            Your Library
          </button>
          <div className="flex gap-2">
            <button className="rounded-full p-1 text-spotify-text hover:bg-spotify-hover hover:text-white">
              <Plus size={18} />
            </button>
            <Link href="/setup" className="rounded-full p-1 text-spotify-text hover:bg-spotify-hover hover:text-white">
              <Settings size={18} />
            </Link>
          </div>
        </div>
        <div className="overflow-y-auto px-2 pb-4">
          <button
            onClick={() => onOpenPlaylist('liked')}
            className={`mb-1 flex w-full items-center gap-3 rounded-md px-3 py-2 text-left text-sm transition-colors hover:bg-spotify-hover ${
              activePlaylistId === 'liked' ? 'bg-spotify-hover text-white' : 'text-spotify-text'
            }`}
          >
            <div className="flex h-10 w-10 items-center justify-center rounded bg-gradient-to-br from-indigo-700 to-purple-400">
              <Heart size={16} fill="white" />
            </div>
            <span className="truncate font-medium">Liked Songs</span>
          </button>
          {playlists.filter((p) => p.id !== 'liked').slice(0, 8).map((p) => (
            <button
              key={p.id}
              onClick={() => onOpenPlaylist(p.id)}
              className={`flex w-full items-center gap-3 rounded-md px-3 py-2 text-left text-sm transition-colors hover:bg-spotify-hover ${
                activePlaylistId === p.id ? 'bg-spotify-hover text-white' : 'text-spotify-text'
              }`}
            >
              <img src={p.cover} alt="" className="h-10 w-10 rounded object-cover" />
              <span className="truncate font-medium">{p.name}</span>
            </button>
          ))}
        </div>
      </div>
    </aside>
  )
}
