'use client'

import Link from 'next/link'
import { useCallback, useState } from 'react'
import {
  Sparkles,
  Search,
  Loader2,
  MessageSquare,
  Save,
  Shield,
  ChevronRight,
  Filter,
  AlertCircle,
  ArrowLeft,
} from 'lucide-react'
import type { DiscoverResponse, SavedPlaylist } from '@/lib/types'

type Mode = 'keyword' | 'discover'

const DEMO_QUERY = 'high energy workout music, no mainstream pop, haven\'t heard before'

export default function DiscoverPage() {
  const [mode, setMode] = useState<Mode>('discover')
  const [query, setQuery] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [response, setResponse] = useState<DiscoverResponse | null>(null)
  const [keywordResults, setKeywordResults] = useState<{ track_name: string; artist: string; genre: string }[]>([])
  const [refinement, setRefinement] = useState('')
  const [refineLoading, setRefineLoading] = useState(false)
  const [originalIntent, setOriginalIntent] = useState('')
  const [showFilters, setShowFilters] = useState(false)
  const [influenceFuture, setInfluenceFuture] = useState(false)
  const [playlistName, setPlaylistName] = useState('')
  const [savedMsg, setSavedMsg] = useState<string | null>(null)

  const runDiscover = useCallback(async (intent: string) => {
    setLoading(true)
    setError(null)
    setOriginalIntent(intent)
    try {
      const res = await fetch('/api/discover', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ intent }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Request failed')
      setResponse(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong')
    } finally {
      setLoading(false)
    }
  }, [])

  const runKeywordSearch = useCallback(async (q: string) => {
    setLoading(true)
    setError(null)
    setResponse(null)
    try {
      const res = await fetch('/api/keyword-search', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query: q }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Request failed')
      setKeywordResults(data.results)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong')
    } finally {
      setLoading(false)
    }
  }, [])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!query.trim()) return
    if (mode === 'keyword') runKeywordSearch(query.trim())
    else runDiscover(query.trim())
  }

  const handleRefine = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!refinement.trim() || !response || !originalIntent) return
    setRefineLoading(true)
    setError(null)
    try {
      const res = await fetch('/api/refine', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          originalIntent,
          filters: response.filters,
          refinement: refinement.trim(),
        }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Refinement failed')
      setResponse(data)
      setRefinement('')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Refinement failed')
    } finally {
      setRefineLoading(false)
    }
  }

  const savePlaylist = () => {
    if (!response?.results.length || !playlistName.trim()) return
    const playlist: SavedPlaylist = {
      id: crypto.randomUUID(),
      name: playlistName.trim(),
      trackIds: response.results.map((r) => r.track.id),
      createdAt: new Date().toISOString(),
      sessionIntent: originalIntent,
    }
    const existing = JSON.parse(localStorage.getItem('saved-playlists') || '[]') as SavedPlaylist[]
    localStorage.setItem('saved-playlists', JSON.stringify([playlist, ...existing]))
    setSavedMsg(`Saved "${playlist.name}" (${playlist.trackIds.length} tracks) to local storage`)
    setPlaylistName('')
    setTimeout(() => setSavedMsg(null), 4000)
  }

  const loadDemo = () => {
    setQuery(DEMO_QUERY)
    setMode('discover')
  }

  return (
    <div className="mx-auto flex min-h-screen max-w-4xl flex-col px-4 py-8">
      <Link
        href="/"
        className="mb-6 inline-flex items-center gap-2 text-sm text-spotify-text transition-colors hover:text-white"
      >
        <ArrowLeft size={18} />
        Back to Spotify
      </Link>

      <header className="mb-8">
        <div className="mb-2 flex items-center gap-2">
          <Sparkles className="text-spotify-green" size={28} />
          <h1 className="text-3xl font-black tracking-tight">AI Mode</h1>
        </div>
        <p className="max-w-2xl text-spotify-text">
          Session-based music discovery — describe what you want in plain language, get ranked
          results with reasons, then refine.
        </p>
      </header>

      <div className="mb-4 flex gap-2">
        <button
          onClick={() => { setMode('keyword'); setResponse(null) }}
          className={`flex items-center gap-2 rounded-full px-4 py-2 text-sm font-medium transition-colors ${
            mode === 'keyword' ? 'bg-white text-black' : 'border border-spotify-text/40 text-spotify-text hover:border-white hover:text-white'
          }`}
        >
          <Search size={16} />
          Keyword Search
        </button>
        <button
          onClick={() => { setMode('discover'); setKeywordResults([]) }}
          className={`flex items-center gap-2 rounded-full px-4 py-2 text-sm font-medium transition-colors ${
            mode === 'discover' ? 'bg-spotify-green text-black' : 'border border-spotify-text/40 text-spotify-text hover:border-white hover:text-white'
          }`}
        >
          <Sparkles size={16} />
          Explain & Refine
        </button>
      </div>

      <form onSubmit={handleSubmit} className="mb-6">
        <div className="relative">
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder={
              mode === 'keyword'
                ? 'Try the demo query — see how keyword search fails…'
                : 'e.g. high energy workout music, no mainstream pop, haven\'t heard before'
            }
            className="h-14 w-full rounded-xl bg-spotify-elevated px-5 pr-28 text-base text-white placeholder:text-spotify-text-muted focus:outline-none focus:ring-2 focus:ring-spotify-green"
          />
          <button
            type="submit"
            disabled={loading || !query.trim()}
            className="absolute top-1/2 right-2 flex -translate-y-1/2 items-center gap-2 rounded-lg bg-spotify-green px-4 py-2 text-sm font-bold text-black hover:bg-spotify-green-hover disabled:opacity-50"
          >
            {loading ? <Loader2 size={16} className="animate-spin" /> : <ChevronRight size={16} />}
            {mode === 'keyword' ? 'Search' : 'Discover'}
          </button>
        </div>
        {!query && (
          <button type="button" onClick={loadDemo} className="mt-2 text-sm text-spotify-green hover:underline">
            Load demo query for walkthrough →
          </button>
        )}
      </form>

      {mode === 'keyword' && (
        <p className="mb-4 flex items-start gap-2 rounded-lg bg-yellow-900/20 px-3 py-2 text-sm text-yellow-200/90">
          <AlertCircle size={16} className="mt-0.5 shrink-0" />
          Traditional keyword search matches literal words in titles/artists — it cannot understand
          intent like &quot;high energy&quot; or &quot;obscure.&quot;
        </p>
      )}

      {error && (
        <div className="mb-4 rounded-lg border border-red-600/50 bg-red-900/20 px-4 py-3 text-sm text-red-200">{error}</div>
      )}

      {mode === 'keyword' && keywordResults.length > 0 && (
        <section className="mb-8">
          <h2 className="mb-3 text-lg font-bold text-spotify-text">
            Keyword matches ({keywordResults.length}) — no intent understanding
          </h2>
          <div className="space-y-2">
            {keywordResults.map((t, i) => (
              <div key={i} className="rounded-lg bg-spotify-elevated px-4 py-3">
                <p className="font-medium">{t.track_name}</p>
                <p className="text-sm text-spotify-text">{t.artist} · {t.genre}</p>
              </div>
            ))}
          </div>
        </section>
      )}

      {mode === 'keyword' && !loading && query && keywordResults.length === 0 && (
        <p className="text-spotify-text">No literal keyword matches — intent-based search would still work.</p>
      )}

      {mode === 'discover' && response && (
        <>
          <div className="mb-4 flex flex-wrap items-center gap-3">
            <span className="rounded-full bg-spotify-green/20 px-3 py-1 text-xs font-medium text-spotify-green">
              {response.mode === 'llm' ? 'LLM-powered' : 'Demo mode (no API key)'}
            </span>
            <button onClick={() => setShowFilters(!showFilters)} className="flex items-center gap-1 text-xs text-spotify-text hover:text-white">
              <Filter size={14} />
              {showFilters ? 'Hide' : 'Show'} parsed filters
            </button>
          </div>

          {showFilters && (
            <pre className="mb-4 overflow-x-auto rounded-lg bg-black/40 p-4 text-xs text-spotify-green">
              {JSON.stringify(response.filters, null, 2)}
            </pre>
          )}

          <section className="mb-6 space-y-3">
            <h2 className="text-lg font-bold">{response.results.length} recommendations for your intent</h2>
            {response.results.map(({ track, explanation, score }, i) => (
              <article key={track.id} className="flex gap-4 rounded-xl bg-spotify-elevated p-4 hover:bg-spotify-highlight">
                <img src={track.cover} alt="" className="h-16 w-16 shrink-0 rounded object-cover" />
                <div className="min-w-0 flex-1">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <p className="font-bold">
                        <span className="mr-2 text-spotify-text-muted">{i + 1}.</span>
                        {track.track_name}
                      </p>
                      <p className="text-sm text-spotify-text">{track.artist} · {track.genre} · {track.year}</p>
                    </div>
                    <span className="shrink-0 text-xs text-spotify-text-muted">pop {track.popularity}</span>
                  </div>
                  <div className="mt-2 flex items-start gap-2 rounded-lg bg-black/30 px-3 py-2">
                    <MessageSquare size={14} className="mt-0.5 shrink-0 text-spotify-green" />
                    <p className="text-sm leading-snug text-spotify-text">{explanation}</p>
                  </div>
                  <div className="mt-2 flex gap-3 text-[10px] text-spotify-text-muted">
                    <span>E {Math.round(track.energy * 100)}%</span>
                    <span>V {Math.round(track.valence * 100)}%</span>
                    <span>{track.tempo} BPM</span>
                    <span>match {(score * 100).toFixed(0)}%</span>
                  </div>
                </div>
              </article>
            ))}
          </section>

          <section className="mb-8 rounded-xl border border-spotify-highlight bg-spotify-elevated p-4">
            <h3 className="mb-2 flex items-center gap-2 font-bold">
              <Sparkles size={18} className="text-spotify-green" />
              Refine results
            </h3>
            <p className="mb-3 text-sm text-spotify-text">
              Adjust in plain language — e.g. &quot;less sad&quot;, &quot;more obscure&quot;, &quot;no English&quot;
            </p>
            <form onSubmit={handleRefine} className="flex gap-2">
              <input
                type="text"
                value={refinement}
                onChange={(e) => setRefinement(e.target.value)}
                placeholder="less sad, more obscure…"
                className="h-11 flex-1 rounded-lg bg-spotify-dark px-4 text-sm focus:outline-none focus:ring-2 focus:ring-spotify-green"
              />
              <button
                type="submit"
                disabled={refineLoading || !refinement.trim()}
                className="flex items-center gap-2 rounded-lg bg-spotify-green px-4 py-2 text-sm font-bold text-black hover:bg-spotify-green-hover disabled:opacity-50"
              >
                {refineLoading ? <Loader2 size={16} className="animate-spin" /> : 'Refine'}
              </button>
            </form>
          </section>
        </>
      )}

      {loading && mode === 'discover' && (
        <div className="flex flex-col items-center gap-3 py-12 text-spotify-text">
          <Loader2 size={36} className="animate-spin text-spotify-green" />
          <p>Parsing intent → filtering corpus → generating explanations…</p>
        </div>
      )}

      <footer className="mt-auto border-t border-white/10 pt-6">
        <div className="grid gap-6 md:grid-cols-2">
          <div className="rounded-xl bg-spotify-elevated p-4">
            <h3 className="mb-2 flex items-center gap-2 text-sm font-bold">
              <Save size={16} className="text-spotify-green" />
              Save as playlist
            </h3>
            <p className="mb-3 text-xs text-spotify-text">Saves to browser local storage only.</p>
            <div className="flex gap-2">
              <input
                type="text"
                value={playlistName}
                onChange={(e) => setPlaylistName(e.target.value)}
                placeholder="Playlist name"
                className="h-9 flex-1 rounded-lg bg-spotify-dark px-3 text-sm focus:outline-none focus:ring-1 focus:ring-spotify-green"
              />
              <button
                onClick={savePlaylist}
                disabled={!response?.results.length || !playlistName.trim()}
                className="rounded-lg bg-spotify-green px-3 py-1 text-sm font-bold text-black disabled:opacity-40"
              >
                Save
              </button>
            </div>
            {savedMsg && <p className="mt-2 text-xs text-spotify-green">{savedMsg}</p>}
          </div>

          <div className="rounded-xl bg-spotify-elevated p-4">
            <h3 className="mb-2 flex items-center gap-2 text-sm font-bold">
              <Shield size={16} className="text-spotify-green" />
              Session influence guardrail
            </h3>
            <p className="mb-3 text-xs text-spotify-text">
              Controls whether this session bleeds into your long-term taste profile.
            </p>
            <div className="flex gap-2">
              <button
                onClick={() => setInfluenceFuture(true)}
                className={`rounded-full px-4 py-1.5 text-xs font-medium ${influenceFuture ? 'bg-spotify-green text-black' : 'bg-spotify-dark text-spotify-text'}`}
              >
                Yes, influence future
              </button>
              <button
                onClick={() => setInfluenceFuture(false)}
                className={`rounded-full px-4 py-1.5 text-xs font-medium ${!influenceFuture ? 'bg-white text-black' : 'bg-spotify-dark text-spotify-text'}`}
              >
                No, session only
              </button>
            </div>
          </div>
        </div>

        <p className="mt-6 text-center text-[11px] text-spotify-text-muted">
          Uses a pre-tagged local dataset (1,200+ tracks). Spotify&apos;s Web API no longer exposes
          audio-feature or recommendation endpoints to new developer apps (2025–2026).
        </p>
      </footer>
    </div>
  )
}
