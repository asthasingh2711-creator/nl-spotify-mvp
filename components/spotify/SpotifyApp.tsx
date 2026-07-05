'use client'

import { useState } from 'react'
import { PlayerProvider } from '@/context/PlayerContext'
import { Sidebar, type SpotifyPage } from './Sidebar'
import { PlayerBar } from './PlayerBar'
import { HomeView } from './HomeView'
import { SearchView } from './SearchView'
import { LibraryView } from './LibraryView'
import { PlaylistView } from './PlaylistView'

export function SpotifyApp() {
  const [page, setPage] = useState<SpotifyPage>('home')
  const [playlistId, setPlaylistId] = useState<string | null>(null)

  const openPlaylist = (id: string) => {
    setPlaylistId(id)
    setPage('playlist')
  }

  const navigate = (p: SpotifyPage) => {
    setPage(p)
    setPlaylistId(null)
  }

  return (
    <PlayerProvider>
      <div className="flex h-screen flex-col bg-spotify-dark">
        <div className="flex min-h-0 flex-1 gap-2 p-2">
          <Sidebar
            currentPage={page}
            activePlaylistId={playlistId}
            onNavigate={navigate}
            onOpenPlaylist={openPlaylist}
          />
          <main className="min-w-0 flex-1 overflow-hidden rounded-lg bg-gradient-to-b from-spotify-highlight/30 to-spotify-dark">
            {page === 'home' && <HomeView onOpenPlaylist={openPlaylist} />}
            {page === 'search' && <SearchView />}
            {page === 'library' && <LibraryView onOpenPlaylist={openPlaylist} />}
            {page === 'playlist' && playlistId && <PlaylistView playlistId={playlistId} />}
          </main>
        </div>
        <PlayerBar />
      </div>
    </PlayerProvider>
  )
}
