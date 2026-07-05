'use client'

import { useCallback, useEffect, useState } from 'react'
import { Search as SearchIcon, Loader2, Mic, MessageSquare } from 'lucide-react'
import type { PlayableTrack } from '@/lib/catalog'
import { searchCatalog, toPlayable } from '@/lib/catalog'
import type { AICurateResponse } from '@/lib/ai-types'
import type { DiscoverResponse } from '@/lib/types'
import { SongRow } from './SongRow'
import { usePlayer } from '@/context/PlayerContext'
import { useSpeechRecognition } from './useSpeechRecognition'
import { ContentFilterChips, type ContentTab } from './ContentFilterChips'
import { CoverImage } from './CoverImage'
import { stockCover } from '@/lib/stock-images'

const PODCASTS = [
  { name: 'The Joe Rogan Experience', publisher: 'Joe Rogan', cover: stockCover('joe-rogan') },
  { name: 'Crime Junkie', publisher: 'audiochuck', cover: stockCover('crime-junkie') },
  { name: 'Call Her Daddy', publisher: 'Alex Cooper', cover: stockCover('call-her-daddy') },
  { name: 'Huberman Lab', publisher: 'Andrew Huberman', cover: stockCover('huberman') },
]

const GENRES = ['Pop', 'Rock', 'Electronic', 'Jazz', 'Hip-Hop', 'Indie', 'Metal', 'Folk']
const GENRE_COLORS = ['bg-pink-600', 'bg-red-700', 'bg-blue-600', 'bg-yellow-600', 'bg-orange-600', 'bg-green-700', 'bg-purple-700', 'bg-teal-600']
type Tab = ContentTab

export function SearchView({ initialTab = 'All' }: { initialTab?: Tab }) {
  const [query, setQuery] = useState('')
  const [tab, setTab] = useState<Tab>(initialTab)
  const [musicResults, setMusicResults] = useState<PlayableTrack[]>([])
  const [aiResponse, setAiResponse] = useState<DiscoverResponse | null>(null)
  const [curated, setCurated] = useState<AICurateResponse | null>(null)
  const [connected, setConnected] = useState(false)
  const [loading, setLoading] = useState(false)
  const { playTrack } = usePlayer()

  useEffect(() => {
    fetch('/api/spotify/health')
      .then((r) => r.json())
      .then((d: { connected: boolean }) => setConnected(d.connected))
      .catch(() => setConnected(false))
  }, [])

  useEffect(() => {
    setTab(initialTab)
  }, [initialTab])

  const resetAiMode = useCallback(() => {
    setQuery('')
    setMusicResults([])
    setAiResponse(null)
    setCurated(null)
    setLoading(false)
  }, [])

  const handleTabChange = (next: Tab) => {
    if (next === 'AI Mode') resetAiMode()
    setTab(next)
  }

  const runCurate = useCallback(async (q: string) => {
    setLoading(true)
    try {
      const res = await fetch('/api/ai/curate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ intent: q }),
      })
      const data = await res.json()
      if (res.ok) setCurated(data)
      else setCurated(null)
    } finally {
      setLoading(false)
    }
  }, [])

  const runSurprise = useCallback(async () => {
    resetAiMode()
    setLoading(true)
    try {
      const res = await fetch('/api/ai/surprise', { method: 'POST' })
      const data = await res.json()
      if (res.ok) {
        setCurated(data)
        setQuery('Surprise me')
      }
    } finally {
      setLoading(false)
    }
  }, [resetAiMode])

  const runSearch = useCallback(async (q: string) => {
    if (!q.trim()) {
      setMusicResults([])
      setAiResponse(null)
      setCurated(null)
      return
    }

    if (tab === 'AI Mode') {
      await runCurate(q)
      return
    }

    setLoading(true)
    try {
      const needsAi = tab === 'All'
      const needsMusic = tab === 'All' || tab === 'Music'

      const [discoverRes, musicRes] = await Promise.all([
        needsAi
          ? fetch('/api/discover', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ intent: q }) })
          : Promise.resolve(null),
        needsMusic
          ? fetch(`/api/spotify/search?q=${encodeURIComponent(q)}&limit=10`)
          : Promise.resolve(null),
      ])

      if (discoverRes) {
        const data = await discoverRes.json()
        if (discoverRes.ok) setAiResponse(data)
        else setAiResponse(null)
      } else setAiResponse(null)

      if (musicRes) {
        const data = (await musicRes.json()) as { tracks?: PlayableTrack[] }
        setMusicResults(data.tracks ?? searchCatalog(q, 10))
      } else setMusicResults([])
    } catch {
      setMusicResults(searchCatalog(q, 10))
      setAiResponse(null)
    } finally {
      setLoading(false)
    }
  }, [tab, runCurate])

  useEffect(() => {
    const q = query.trim()
    if (!q) {
      setMusicResults([])
      setAiResponse(null)
      setCurated(null)
      return
    }
    const timer = setTimeout(() => runSearch(q), 400)
    return () => clearTimeout(timer)
  }, [query, tab, runSearch])

  const { listening, start: startMic } = useSpeechRecognition((text) => {
    setQuery(text)
  })

  const showAi = tab === 'All'
  const showMusic = tab === 'All' || tab === 'Music'
  const showPodcasts = tab === 'Podcasts'
  const isAiMode = tab === 'AI Mode'

  return (
    <div className="flex h-full flex-col overflow-y-auto px-6 pb-8">
      <div className="sticky top-0 z-10 bg-spotify-dark py-4">
        <div className="relative max-w-xl">
          <SearchIcon size={20} className="absolute top-1/2 left-4 -translate-y-1/2 text-black" />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="What do you want to play?"
            className="h-12 w-full rounded-full bg-white pr-12 pl-12 text-black placeholder:text-neutral-500 focus:outline-none focus:ring-2 focus:ring-white"
            autoFocus
          />
          <button
            type="button"
            onClick={startMic}
            className={`absolute top-1/2 right-3 -translate-y-1/2 rounded-full p-1.5 ${listening ? 'bg-spotify-green text-black' : 'text-neutral-600 hover:text-black'}`}
            aria-label="Voice search"
          >
            <Mic size={18} />
          </button>
        </div>

        <ContentFilterChips active={tab} onChange={handleTabChange} />
      </div>

      {loading && query.trim() && (
        <div className="flex items-center gap-2 py-4 text-spotify-text">
          <Loader2 size={18} className="animate-spin" />
          {isAiMode ? 'Curating playlist…' : 'Searching…'}
        </div>
      )}

      {!query.trim() ? (
        <>
          {isAiMode && (
            <div className="mb-6">
              <button
                type="button"
                onClick={runSurprise}
                className="rounded-full bg-spotify-green px-5 py-2 text-sm font-bold text-black hover:scale-105"
              >
                Surprise me
              </button>
            </div>
          )}
          <h2 className="mb-4 text-2xl font-bold">Browse all</h2>
          <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
            {GENRES.map((g, i) => (
              <button key={g} onClick={() => setQuery(g.toLowerCase())} className={`relative h-28 overflow-hidden rounded-lg p-4 text-left font-bold ${GENRE_COLORS[i]}`}>
                {g}
              </button>
            ))}
          </div>
        </>
      ) : (
        <>
          {isAiMode && curated && curated.tracks.length > 0 && (
            <section className="mb-8">
              <h2 className="mb-1 text-2xl font-bold">{curated.playlistName}</h2>
              <p className="mb-4 text-sm text-spotify-text">
                {curated.summary}
                {curated.mode === 'live' && <span className="ml-2 text-spotify-green">· Spotify</span>}
              </p>
              <div className="mb-2 grid grid-cols-[16px_4fr_2fr_1fr] gap-4 border-b border-white/10 px-4 pb-2 text-xs uppercase text-spotify-text">
                <span>#</span><span>Title</span><span>Album</span><span className="text-right">Duration</span>
              </div>
              {curated.tracks.map((t, i) => (
                <SongRow key={t.id} track={t} index={i} queue={curated.tracks} />
              ))}
            </section>
          )}

          {showPodcasts && (
            <section className="mb-8">
              <h2 className="mb-4 text-2xl font-bold">Podcasts</h2>
              <div className="grid grid-cols-2 gap-4 md:grid-cols-3">
                {PODCASTS.filter((p) => p.name.toLowerCase().includes(query.toLowerCase()) || query.length < 3).map((p) => (
                  <div key={p.name} className="rounded-lg bg-spotify-elevated p-3">
                    <CoverImage src={p.cover} seed={p.name} className="mb-2 aspect-square w-full rounded object-cover" />
                    <p className="truncate font-bold">{p.name}</p>
                    <p className="truncate text-sm text-spotify-text">{p.publisher}</p>
                  </div>
                ))}
              </div>
            </section>
          )}

          {showAi && aiResponse && aiResponse.results.length > 0 && (
            <section className="mb-8">
              <h2 className="mb-4 text-2xl font-bold">AI Mode</h2>
              {aiResponse.results.map(({ track, explanation }, i) => {
                const playable = toPlayable(track)
                return (
                  <div key={track.id} onDoubleClick={() => playTrack(playable, aiResponse.results.map((r) => toPlayable(r.track)))} className="mb-2 flex gap-3 rounded-lg bg-spotify-elevated p-3 hover:bg-spotify-highlight">
                    <CoverImage src={toPlayable(track).cover} seed={track.id} className="h-12 w-12 rounded object-cover" />
                    <div className="min-w-0 flex-1">
                      <p className="font-medium text-white">{track.track_name}</p>
                      <p className="text-sm text-spotify-text">{track.artist}</p>
                      <p className="mt-1 flex items-start gap-1 text-xs text-spotify-text"><MessageSquare size={12} className="mt-0.5 shrink-0 text-spotify-green" />{explanation}</p>
                    </div>
                    <span className="text-xs text-spotify-text">{i + 1}</span>
                  </div>
                )
              })}
            </section>
          )}

          {showMusic && musicResults.length > 0 && (
            <section>
              <h2 className="mb-4 text-2xl font-bold">Songs{connected && <span className="ml-2 text-xs font-normal text-spotify-green">Live</span>}</h2>
              <div className="mb-2 grid grid-cols-[16px_4fr_2fr_1fr] gap-4 border-b border-white/10 px-4 pb-2 text-xs uppercase text-spotify-text">
                <span>#</span><span>Title</span><span>Album</span><span className="text-right">Duration</span>
              </div>
              {musicResults.map((t, i) => <SongRow key={t.id} track={t} index={i} queue={musicResults} />)}
            </section>
          )}

          {!loading && isAiMode && !curated?.tracks.length && (
            <p className="text-spotify-text">No playlist found for &quot;{query}&quot;</p>
          )}

          {!loading && !isAiMode && !showPodcasts && !aiResponse?.results.length && !musicResults.length && (
            <p className="text-spotify-text">No results for &quot;{query}&quot;</p>
          )}
        </>
      )}
    </div>
  )
}
