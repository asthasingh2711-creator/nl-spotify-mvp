'use client'

import { useState } from 'react'
import Link from 'next/link'
import {
  Library,
  Plus,
  PanelRightOpen,
  Search as SearchIcon,
  List,
  Check,
  Pin,
  Sparkles,
} from 'lucide-react'
import { SIDEBAR_LIBRARY } from '@/lib/sidebar-library'
import { usePlayer } from '@/context/PlayerContext'
import { CoverImage } from './CoverImage'

export type SpotifyPage = 'home' | 'search' | 'library' | 'playlist'

interface SidebarProps {
  currentPage: SpotifyPage
  activePlaylistId: string | null
  onNavigate: (page: SpotifyPage) => void
  onOpenPlaylist: (id: string) => void
}

export function Sidebar({ currentPage, activePlaylistId, onNavigate, onOpenPlaylist }: SidebarProps) {
  const [filter, setFilter] = useState<'Playlists' | 'Artists' | 'Albums'>('Playlists')
  const [sortOpen, setSortOpen] = useState(false)
  const { currentTrack } = usePlayer()

  return (
    <aside className="flex h-full w-[420px] shrink-0 flex-col rounded-lg bg-[#121212]">
      {/* Your Library header */}
      <div className="flex items-center justify-between px-4 py-3">
        <button className="flex items-center gap-3 text-base font-bold text-white hover:scale-105">
          <Library size={22} />
          Your Library
        </button>
        <div className="flex items-center gap-1">
          <button className="flex items-center gap-1 rounded-full px-2 py-1 text-sm font-bold text-spotify-text hover:bg-white/10 hover:text-white">
            <Plus size={18} />
            <span className="hidden sm:inline">Create</span>
          </button>
          <button className="rounded-full p-2 text-spotify-text hover:bg-white/10 hover:text-white">
            <PanelRightOpen size={18} />
          </button>
        </div>
      </div>

      {/* Filter chips */}
      <div className="flex gap-2 px-4 pb-3">
        {(['Playlists', 'Artists', 'Albums'] as const).map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`rounded-full px-3 py-1 text-sm font-medium transition-colors ${
              filter === f ? 'bg-white/10 text-white' : 'bg-transparent text-spotify-text hover:text-white'
            }`}
          >
            {f}
          </button>
        ))}
      </div>

      {/* Search + Recents */}
      <div className="relative flex items-center justify-between px-4 pb-2">
        <button className="text-spotify-text hover:text-white">
          <SearchIcon size={16} />
        </button>
        <button
          onClick={() => setSortOpen(!sortOpen)}
          className="flex items-center gap-2 text-sm font-medium text-spotify-text hover:text-white"
        >
          Recents
          <List size={16} />
        </button>

        {sortOpen && (
          <div className="absolute top-8 right-4 z-30 w-52 rounded-md bg-[#282828] p-1.5 shadow-xl">
            <p className="px-3 py-2 text-xs font-bold text-spotify-text">Sort by</p>
            {['Recents', 'Recently Added', 'Alphabetical', 'Creator'].map((opt, i) => (
              <button
                key={opt}
                className="flex w-full items-center justify-between rounded-sm px-3 py-2 text-sm text-white hover:bg-white/10"
              >
                {opt}
                {i === 0 && <Check size={16} className="text-spotify-green" />}
              </button>
            ))}
            <p className="mt-1 border-t border-white/10 px-3 py-2 text-xs font-bold text-spotify-text">View as</p>
            <div className="flex gap-1 px-2 pb-1">
              {[List, List, List, List].map((Icon, i) => (
                <button key={i} className={`rounded p-2 ${i === 1 ? 'text-spotify-green' : 'text-spotify-text hover:text-white'}`}>
                  <Icon size={16} />
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Playlist list */}
      <div className="min-h-0 flex-1 overflow-y-auto px-2">
        {SIDEBAR_LIBRARY.map((pl, idx) => (
          <button
            key={`${pl.id}-${idx}`}
            onClick={() => onOpenPlaylist(pl.id)}
            className={`mb-0.5 flex w-full items-center gap-3 rounded-md px-2 py-2 text-left hover:bg-white/10 ${
              activePlaylistId === pl.id ? 'bg-white/10' : ''
            }`}
          >
            {pl.liked ? (
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded bg-gradient-to-br from-[#450af5] to-[#c4efd9]">
                <span className="text-xl text-white">♥</span>
              </div>
            ) : (
              <CoverImage src={pl.cover} seed={pl.id} className="h-12 w-12 shrink-0 rounded object-cover" />
            )}
            <div className="min-w-0 flex-1">
              <p className="truncate text-base font-normal text-white">{pl.name}</p>
              <p className="flex items-center gap-1 truncate text-sm text-spotify-text">
                {pl.pinned && <Pin size={12} className="shrink-0 text-spotify-green" fill="currentColor" />}
                {pl.subtitle}
              </p>
            </div>
          </button>
        ))}
      </div>

      {/* Mini now-playing (bottom of sidebar) */}
      {currentTrack && (
        <div className="mt-auto flex items-center gap-3 border-t border-white/10 bg-[#181818] px-3 py-2">
          <CoverImage src={currentTrack.cover} seed={currentTrack.id} className="h-12 w-12 rounded object-cover" />
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-medium text-white">{currentTrack.title}</p>
            <p className="truncate text-xs text-spotify-text">{currentTrack.artist}</p>
          </div>
          <Check size={18} className="shrink-0 text-spotify-green" />
        </div>
      )}
    </aside>
  )
}
