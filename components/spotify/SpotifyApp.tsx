'use client'

import { useState } from 'react'
import { PlayerProvider } from '@/context/PlayerContext'
import { Sidebar, type SpotifyPage } from './Sidebar'
import { PlayerBar } from './PlayerBar'
import { HomeView } from './HomeView'
import { SearchView } from './SearchView'
import { LibraryView } from './LibraryView'
import { PlaylistView } from './PlaylistView'
import { GlobalTopNav } from './GlobalTopNav'
import type { ContentTab } from './ContentFilterChips'

export function SpotifyApp() {
  const [page, setPage] = useState<SpotifyPage>('home')
  const [playlistId, setPlaylistId] = useState<string | null>(null)
  const [searchTab, setSearchTab] = useState<ContentTab>('All')

  const openPlaylist = (id: string) => {
    setPlaylistId(id)
    setPage('playlist')
  }

  const navigate = (p: SpotifyPage) => {
    setPage(p)
    setPlaylistId(null)
  }

  const goSearch = (tab: ContentTab = 'All') => {
    setSearchTab(tab)
    setPage('search')
    setPlaylistId(null)
  }

  return (
    <PlayerProvider>
      <div className="flex h-screen flex-col bg-black">
        <GlobalTopNav onHome={() => navigate('home')} onSearch={() => goSearch('All')} />

        <div className="flex min-h-0 flex-1 gap-2 p-2 pt-0">
          <Sidebar
            currentPage={page}
            activePlaylistId={playlistId}
            onNavigate={navigate}
            onOpenPlaylist={openPlaylist}
          />
          <main className="min-w-0 flex-1 overflow-hidden rounded-lg bg-gradient-to-b from-[#1a1a1a] to-[#121212]">
            {page === 'home' && <HomeView onOpenPlaylist={openPlaylist} />}
            {page === 'search' && <SearchView initialTab={searchTab} />}
            {page === 'library' && <LibraryView onOpenPlaylist={openPlaylist} />}
            {page === 'playlist' && playlistId && <PlaylistView playlistId={playlistId} />}
          </main>
        </div>
        <PlayerBar />
      </div>
    </PlayerProvider>
  )
}
