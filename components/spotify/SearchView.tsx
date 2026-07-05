'use client'

import { useEffect, useState } from 'react'
import { Search as SearchIcon, Loader2 } from 'lucide-react'
import type { PlayableTrack } from '@/lib/catalog'
import { searchCatalog } from '@/lib/catalog'
import { SongRow } from './SongRow'

const GENRES = ['Pop', 'Rock', 'Electronic', 'Jazz', 'Hip-Hop', 'Indie', 'Metal', 'Folk']

export function SearchView() {
  const [query, setQuery] = useState('')
  const [results, setResults] = useState<PlayableTrack[]>([])
  const [mode, setMode] = useState<'demo' | 'live'>('demo')
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    const q = query.trim()
    if (!q) {
      setResults([])
      return
    }

    const timer = setTimeout(async () => {
      setLoading(true)
      try {
        const res = await fetch(`/api/spotify/search?q=${encodeURIComponent(q)}&limit=25`)
        const data = (await res.json()) as { mode: 'demo' | 'live' | 'error'; tracks: PlayableTrack[] }
        setResults(data.tracks)
        setMode(data.mode === 'live' ? 'live' : 'demo')
      } catch {
        setResults(searchCatalog(q, 25))
        setMode('demo')
      } finally {
        setLoading(false)
      }
    }, 300)

    return () => clearTimeout(timer)
  }, [query])

  return (
    <div className="flex h-full flex-col overflow-y-auto px-6 pb-8">
      <div className="sticky top-0 z-10 bg-spotify-dark py-6">
        <div className="relative max-w-xl">
          <SearchIcon size={20} className="absolute top-1/2 left-4 -translate-y-1/2 text-black" />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="What do you want to listen to?"
            className="h-12 w-full rounded-full bg-white pr-4 pl-12 text-black placeholder:text-neutral-500 focus:outline-none focus:ring-2 focus:ring-white"
            autoFocus
          />
        </div>
        {mode === 'live' && query.trim() && (
          <p className="mt-2 text-xs text-spotify-green">Live Spotify search</p>
        )}
      </div>

      {query.trim() ? (
        <div>
          <h2 className="mb-4 text-2xl font-bold">Songs</h2>
          {loading ? (
            <div className="flex items-center gap-2 text-spotify-text">
              <Loader2 size={18} className="animate-spin" />
              Searching…
            </div>
          ) : results.length === 0 ? (
            <div className="text-spotify-text">
              <p>No results for &quot;{query}&quot;</p>
              {mode === 'demo' && (
                <p className="mt-2 text-sm">
                  Demo catalog has limited tracks.{' '}
                  <a href="/setup" className="text-spotify-green hover:underline">Connect Spotify</a>
                  {' '}for live search.
                </p>
              )}
            </div>
          ) : (
            <>
              <div className="mb-2 grid grid-cols-[16px_4fr_2fr_1fr] gap-4 border-b border-white/10 px-4 pb-2 text-xs uppercase text-spotify-text">
                <span>#</span><span>Title</span><span>Album</span><span className="text-right">Duration</span>
              </div>
              {results.map((t, i) => <SongRow key={t.id} track={t} index={i} queue={results} />)}
            </>
          )}
        </div>
      ) : (
        <>
          <h2 className="mb-4 text-2xl font-bold">Browse all</h2>
          <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
            {GENRES.map((g, i) => (
              <button key={g} onClick={() => setQuery(g.toLowerCase())} className={`relative h-28 overflow-hidden rounded-lg p-4 text-left font-bold ${['bg-pink-600','bg-red-700','bg-blue-600','bg-yellow-600','bg-orange-600','bg-green-700','bg-purple-700','bg-teal-600'][i]}`}>
                {g}
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  )
}
