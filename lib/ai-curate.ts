import { toPlayable, searchCatalog, type PlayableTrack } from './catalog'
import { getAllTracks } from './dataset'
import { filterAndRank } from './filter'
import { parseIntent } from './llm'
import { hasSpotifyCredentials } from './spotify/config'
import { searchSpotifyTracksRaw, spotifyTrackToPlayable } from './spotify/client'
import type { IntentFilters } from './types'
import { buildSurpriseSearchQueries, getTasteSummary } from './user-taste'
import type { AICurateResponse } from './ai-types'

export type { AICurateResponse } from './ai-types'

function dedupePlayable(tracks: PlayableTrack[]): PlayableTrack[] {
  const seen = new Set<string>()
  return tracks.filter((t) => {
    if (seen.has(t.id)) return false
    seen.add(t.id)
    return true
  })
}

function buildSpotifyQueries(intent: string, _filters: IntentFilters): string[] {
  const trimmed = intent.trim()
  const queries = [trimmed]

  const likeMatch = trimmed.match(/\blike\s+(.+)$/i)
  if (likeMatch) {
    const reference = likeMatch[1].trim()
    queries.push(reference)
    queries.push(`${trimmed.replace(/\blike\s+/i, '')}`)
    if (/sad|melanchol|moody/i.test(trimmed)) queries.push(`sad ${reference}`)
    if (/happy|upbeat/i.test(trimmed)) queries.push(`upbeat ${reference}`)
  }

  return [...new Set(queries.map((q) => q.trim()).filter(Boolean))].slice(0, 4)
}

function demoPlaylist(intent: string, filters: IntentFilters, playlistName: string, summary: string): AICurateResponse {
  const byKeyword = searchCatalog(intent, 12)
  if (byKeyword.length > 0) {
    return { mode: 'demo', intent, playlistName, summary, tracks: byKeyword }
  }
  const candidates = filterAndRank(getAllTracks(), filters, 12)
  return {
    mode: 'demo',
    intent,
    playlistName,
    summary,
    tracks: candidates.map(toPlayable),
  }
}

export async function curatePlaylist(intent: string): Promise<AICurateResponse> {
  const trimmed = intent.trim()
  const { filters } = await parseIntent(trimmed)
  const playlistName = `AI Mix · ${trimmed.slice(0, 48)}`
  const summary = `A curated playlist for "${trimmed}" based on your mood and vibe.`

  if (hasSpotifyCredentials()) {
    try {
      const queries = buildSpotifyQueries(trimmed, filters)
      const batches = await Promise.all(queries.map((q) => searchSpotifyTracksRaw(q, 10)))
      const tracks = dedupePlayable(batches.flat().map(spotifyTrackToPlayable)).slice(0, 15)
      if (tracks.length > 0) {
        return { mode: 'live', intent: trimmed, playlistName, summary, tracks }
      }
    } catch (err) {
      console.error('Spotify curate failed:', err)
    }
  }

  return demoPlaylist(
    trimmed,
    filters,
    playlistName,
    `${summary} (Demo mode — add Spotify credentials for live tracks.)`,
  )
}

export async function surprisePlaylist(): Promise<AICurateResponse> {
  const intent = 'Surprise me'
  const tasteSummary = getTasteSummary()
  const playlistName = 'Hidden Gems For You'
  const summary = `Fresh picks based on ${tasteSummary} — songs you likely haven't heard but should love.`

  if (hasSpotifyCredentials()) {
    try {
      const queries = buildSurpriseSearchQueries()
      const pick = queries.sort(() => Math.random() - 0.5).slice(0, 3)
      const batches = await Promise.all(pick.map((q) => searchSpotifyTracksRaw(q, 10)))
      let raw = batches.flat()

      let filtered = raw.filter((t) => t.popularity >= 10 && t.popularity <= 55)
      if (filtered.length < 8) filtered = raw.filter((t) => t.popularity <= 65)
      if (filtered.length < 5) filtered = raw

      const seen = new Set<string>()
      const tracks = filtered
        .filter((t) => {
          if (seen.has(t.id)) return false
          seen.add(t.id)
          return true
        })
        .sort((a, b) => a.popularity - b.popularity)
        .slice(0, 12)
        .map(spotifyTrackToPlayable)

      if (tracks.length > 0) {
        return { mode: 'live', intent, playlistName, summary, tracks }
      }
    } catch (err) {
      console.error('Spotify surprise failed:', err)
    }
  }

  const filters = {
    energy_min: null,
    energy_max: null,
    valence_min: 0.4,
    valence_max: null,
    tempo_min: null,
    tempo_max: null,
    genre_include: ['indie', 'folk', 'latin', 'r&b'] as string[],
    genre_exclude: null,
    popularity_max: 40,
    popularity_min: null,
    keywords: ['surprise', 'hidden'] as string[],
  }

  return demoPlaylist(intent, filters, playlistName, summary)
}
