'use client'

import { useCallback, useState } from 'react'
import { ChevronLeft, ChevronRight, Play, Loader2, Mic } from 'lucide-react'
import { buildPlaylists, getPlaylistById } from '@/lib/catalog'
import type { AICurateResponse } from '@/lib/ai-types'
import { useSpeechRecognition } from './useSpeechRecognition'
import {
  HOME_QUICK,
  HOME_PICKED_HERO,
  HOME_DAILY_MIXES,
  HOME_MADE_FOR,
  HOME_RECENTS,
} from '@/lib/home-content'
import { ContentFilterChips, type ContentTab } from './ContentFilterChips'
import { CoverImage } from './CoverImage'
import { AlbumCard } from './AlbumCard'
import { SongRow } from './SongRow'
import { usePlayer } from '@/context/PlayerContext'

const GENRES = ['Pop', 'Rock', 'Electronic', 'Jazz', 'Hip-Hop', 'Indie', 'Metal', 'Folk']
const GENRE_COLORS = ['bg-pink-600', 'bg-red-700', 'bg-blue-600', 'bg-yellow-600', 'bg-orange-600', 'bg-green-700', 'bg-purple-700', 'bg-teal-600']

import { stockCover } from '@/lib/stock-images'

const PODCASTS = [
  { name: 'The Joe Rogan Experience', publisher: 'Joe Rogan', cover: stockCover('joe-rogan') },
  { name: 'Crime Junkie', publisher: 'audiochuck', cover: stockCover('crime-junkie') },
  { name: 'Call Her Daddy', publisher: 'Alex Cooper', cover: stockCover('call-her-daddy') },
  { name: 'Huberman Lab', publisher: 'Andrew Huberman', cover: stockCover('huberman') },
]

interface HomeViewProps {
  onOpenPlaylist: (id: string) => void
}

export function HomeView({ onOpenPlaylist }: HomeViewProps) {
  const [tab, setTab] = useState<ContentTab>('All')
  const [aiQuery, setAiQuery] = useState('')
  const [aiLoading, setAiLoading] = useState(false)
  const [curated, setCurated] = useState<AICurateResponse | null>(null)
  const { playTrack } = usePlayer()
  const playlists = buildPlaylists()

  const resetAiMode = useCallback(() => {
    setAiQuery('')
    setCurated(null)
    setAiLoading(false)
  }, [])

  const runAiSearch = useCallback(async (q: string) => {
    if (!q.trim()) {
      setCurated(null)
      return
    }
    setAiLoading(true)
    try {
      const res = await fetch('/api/ai/curate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ intent: q }),
      })
      const data = await res.json()
      if (res.ok) setCurated(data)
    } finally {
      setAiLoading(false)
    }
  }, [])

  const runSurprise = useCallback(async () => {
    resetAiMode()
    setAiLoading(true)
    try {
      const res = await fetch('/api/ai/surprise', { method: 'POST' })
      const data = await res.json()
      if (res.ok) {
        setCurated(data)
        setAiQuery('Surprise me')
      }
    } finally {
      setAiLoading(false)
    }
  }, [resetAiMode])

  const { listening, start: startMic } = useSpeechRecognition((text) => {
    setAiQuery(text)
    runAiSearch(text)
  })

  const handleTabChange = (next: ContentTab) => {
    if (next === 'AI Mode') resetAiMode()
    setTab(next)
  }

  const playPlaylist = (id: string) => {
    const pl = getPlaylistById(id)
    if (pl?.tracks[0]) playTrack(pl.tracks[0], pl.tracks)
  }

  return (
    <div className="flex h-full flex-col overflow-y-auto">
      <div className="sticky top-0 z-10 flex items-center justify-between bg-gradient-to-b from-[#1a1a1a] to-transparent px-4 py-3">
        <div className="flex gap-2">
          <button className="flex h-8 w-8 items-center justify-center rounded-full bg-black/40 text-white hover:bg-black/60">
            <ChevronLeft size={20} />
          </button>
          <button className="flex h-8 w-8 items-center justify-center rounded-full bg-black/40 text-white hover:bg-black/60">
            <ChevronRight size={20} />
          </button>
        </div>
        <div className="flex items-center gap-3">
          <button className="rounded-full bg-white px-4 py-1.5 text-sm font-bold text-black hover:scale-105">Premium</button>
          <button className="flex h-8 w-8 items-center justify-center rounded-full bg-[#5038a0] text-xs font-bold text-white">A</button>
        </div>
      </div>

      <ContentFilterChips active={tab} onChange={handleTabChange} />

      {tab === 'All' && (
        <div className="px-6 pb-8">
          <div className="mb-8 grid grid-cols-2 gap-3 lg:grid-cols-4">
            {HOME_QUICK.map((tile) => (
              <button
                key={tile.name}
                onClick={() => onOpenPlaylist(tile.id)}
                className="group flex items-center gap-3 overflow-hidden rounded-md bg-[#282828]/80 hover:bg-[#3e3e3e]"
              >
                <CoverImage src={tile.cover} seed={tile.name} className="h-20 w-20 shrink-0 object-cover shadow-lg" />
                <span className="truncate pr-2 text-left text-sm font-bold text-white">{tile.name}</span>
              </button>
            ))}
          </div>

          <section className="mb-8">
            <h2 className="mb-4 text-2xl font-bold text-white">Picked for you</h2>
            <div className="flex flex-col gap-4 lg:flex-row">
              <button
                onClick={() => playPlaylist(HOME_PICKED_HERO.id)}
                className="group relative flex min-h-[180px] flex-1 items-end overflow-hidden rounded-lg bg-[#282828] p-6 hover:bg-[#3e3e3e]"
              >
                <CoverImage src={HOME_PICKED_HERO.cover} seed="barso" className="absolute inset-0 h-full w-full object-cover opacity-60" />
                <div className="relative z-10">
                  <p className="text-3xl font-bold text-white">{HOME_PICKED_HERO.name}</p>
                  <p className="mt-1 text-sm text-spotify-text">Your personalized mix</p>
                </div>
                <span className="absolute right-6 bottom-6 flex h-14 w-14 items-center justify-center rounded-full bg-spotify-green text-black opacity-0 shadow-xl transition group-hover:scale-105 group-hover:opacity-100">
                  <Play size={28} fill="currentColor" />
                </span>
              </button>
              <div className="grid flex-1 grid-cols-1 gap-3 sm:grid-cols-3">
                {HOME_DAILY_MIXES.map((mix) => (
                  <button
                    key={mix.name}
                    onClick={() => onOpenPlaylist(mix.id)}
                    className="group relative aspect-square overflow-hidden rounded-lg bg-[#282828] hover:bg-[#3e3e3e]"
                  >
                    <CoverImage src={mix.cover} seed={mix.name} className="h-full w-full object-cover" />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent" />
                    <p className="absolute bottom-3 left-3 text-sm font-bold text-white">{mix.name}</p>
                  </button>
                ))}
              </div>
            </div>
          </section>

          <section className="mb-8">
            <h2 className="mb-4 text-2xl font-bold text-white">Made For Astha Singh</h2>
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
              {HOME_MADE_FOR.map((item) => {
                const pl = getPlaylistById(item.id)
                if (!pl) return null
                return (
                  <AlbumCard
                    key={item.name}
                    playlist={{ ...pl, name: item.name, cover: item.cover }}
                    onClick={() => onOpenPlaylist(item.id)}
                  />
                )
              })}
            </div>
          </section>

          <section>
            <h2 className="mb-4 text-2xl font-bold text-white">Recents</h2>
            <div className="flex gap-4 overflow-x-auto pb-2">
              {HOME_RECENTS.map((item) => (
                <button
                  key={item.name}
                  onClick={() => onOpenPlaylist(item.id)}
                  className="w-36 shrink-0 text-left hover:opacity-80"
                >
                  <CoverImage src={item.cover} seed={item.name} className="mb-2 aspect-square w-full rounded-md object-cover shadow-lg" />
                  <p className="truncate text-sm font-bold text-white">{item.name}</p>
                </button>
              ))}
            </div>
          </section>
        </div>
      )}

      {tab === 'Music' && (
        <div className="px-6 pb-8">
          <h2 className="mb-4 text-2xl font-bold text-white">Browse all</h2>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4">
            {GENRES.map((g, i) => (
              <button key={g} className={`relative h-28 overflow-hidden rounded-lg ${GENRE_COLORS[i % GENRE_COLORS.length]} p-4 text-left font-bold text-white hover:opacity-90`}>
                {g}
              </button>
            ))}
          </div>
          <h2 className="mb-4 mt-8 text-2xl font-bold text-white">Your playlists</h2>
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
            {playlists.slice(0, 10).map((pl) => (
              <AlbumCard key={pl.id} playlist={pl} onClick={() => onOpenPlaylist(pl.id)} />
            ))}
          </div>
        </div>
      )}

      {tab === 'Podcasts' && (
        <div className="px-6 pb-8">
          <h2 className="mb-4 text-2xl font-bold text-white">Popular podcasts</h2>
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4">
            {PODCASTS.map((p) => (
              <div key={p.name} className="rounded-lg bg-[#181818] p-4 hover:bg-[#282828]">
                <CoverImage src={p.cover} seed={p.name} className="mb-3 aspect-square w-full rounded-md object-cover" />
                <p className="truncate font-bold text-white">{p.name}</p>
                <p className="truncate text-sm text-spotify-text">{p.publisher}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {tab === 'AI Mode' && (
        <div className="px-6 pb-8">
          <div className="mb-6 max-w-xl">
            <p className="mb-3 text-sm text-spotify-text">Describe what you want to hear — mood, activity, or vibe.</p>
            <form
              onSubmit={(e) => {
                e.preventDefault()
                runAiSearch(aiQuery)
              }}
              className="relative"
            >
              <input
                value={aiQuery}
                onChange={(e) => setAiQuery(e.target.value)}
                placeholder="e.g. rainy day indie, upbeat workout…"
                className="h-12 w-full rounded-full bg-white pr-12 pl-5 text-black placeholder:text-neutral-500 focus:outline-none focus:ring-2 focus:ring-spotify-green"
              />
              <button
                type="button"
                onClick={startMic}
                className={`absolute top-1/2 right-4 -translate-y-1/2 rounded-full p-1 ${listening ? 'bg-spotify-green text-black' : 'text-neutral-600 hover:text-black'}`}
                aria-label="Voice search"
              >
                <Mic size={20} />
              </button>
            </form>
          </div>

          {aiLoading && (
            <div className="flex items-center gap-2 text-spotify-text">
              <Loader2 size={18} className="animate-spin" />
              Curating playlist…
            </div>
          )}

          {curated && !aiLoading && (
            <div>
              <p className="mb-1 text-base font-bold text-white">{curated.playlistName}</p>
              <p className="mb-4 text-sm text-spotify-text">
                {curated.summary}
                {curated.mode === 'live' && <span className="ml-2 text-spotify-green">· Spotify</span>}
              </p>
              <div className="mb-2 grid grid-cols-[16px_4fr_2fr_1fr] gap-4 border-b border-white/10 px-4 pb-2 text-xs uppercase text-spotify-text">
                <span>#</span><span>Title</span><span>Album</span><span className="text-right">Duration</span>
              </div>
              <div className="space-y-0">
                {curated.tracks.map((track, i) => (
                  <SongRow
                    key={track.id}
                    index={i}
                    track={track}
                    queue={curated.tracks}
                  />
                ))}
              </div>
            </div>
          )}

          {!curated && !aiLoading && (
            <div className="mt-4 flex flex-wrap items-center gap-3">
              <button
                type="button"
                onClick={runSurprise}
                className="rounded-full bg-spotify-green px-5 py-2 text-sm font-bold text-black hover:scale-105"
              >
                Surprise me
              </button>
              {['Chill evening', 'Focus flow', 'Party starter', 'Rainy day'].map((hint) => (
                <button
                  key={hint}
                  onClick={() => {
                    setAiQuery(hint)
                    runAiSearch(hint)
                  }}
                  className="rounded-full bg-[#282828] px-4 py-2 text-sm font-medium text-white hover:bg-[#3e3e3e]"
                >
                  {hint}
                </button>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  )
}
