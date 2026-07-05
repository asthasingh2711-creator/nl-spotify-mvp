import { toPlayable, searchCatalog, type PlayableTrack } from './catalog'
import { getAllTracks } from './dataset'
import { filterAndRank } from './filter'
import { parseIntent } from './llm'
import { hasSpotifyCredentials } from './spotify/config'
import { searchSpotifyTracksRaw, spotifyTrackToPlayable } from './spotify/client'
import type { IntentFilters } from './types'
import { buildSurpriseSearchQueries, getTasteSummary } from './user-taste'
import type { AICurateResponse } from './ai-types'
import { filterAvoidedTracks, planSpotifySearch } from './spotify-query-planner'

export type { AICurateResponse } from './ai-types'

function dedupePlayable(tracks: PlayableTrack[]): PlayableTrack[] {
  const seen = new Set<string>()
  return tracks.filter((t) => {
    if (seen.has(t.id)) return false
    seen.add(t.id)
    return true
  })
}

function demoPlaylist(intent: string, filters: IntentFilters, playlistName: string, summary: string, planner?: 'llm' | 'mock'): AICurateResponse {
  const byKeyword = searchCatalog(intent, 12)
  if (byKeyword.length > 0) {
    return { mode: 'demo', planner, intent, playlistName, summary, tracks: byKeyword }
  }
  const candidates = filterAndRank(getAllTracks(), filters, 12)
  return {
    mode: 'demo',
    planner,
    intent,
    playlistName,
    summary,
    tracks: candidates.map(toPlayable),
  }
}

export async function curatePlaylist(intent: string): Promise<AICurateResponse> {
  const trimmed = intent.trim()
  const { plan, mode: plannerMode } = await planSpotifySearch(trimmed)
  const { filters } = await parseIntent(trimmed)

  const playlistName = plan.playlist_name
  const summary = plan.summary || `A curated playlist for "${trimmed}".`

  if (hasSpotifyCredentials()) {
    try {
      const batches = await Promise.all(
        plan.search_queries.map((q) => searchSpotifyTracksRaw(q, 10)),
      )
      let tracks = dedupePlayable(batches.flat().map(spotifyTrackToPlayable))
      tracks = filterAvoidedTracks(tracks, plan.avoid).slice(0, 15)

      if (tracks.length > 0) {
        return {
          mode: 'live',
          planner: plannerMode,
          intent: trimmed,
          playlistName,
          summary,
          tracks,
        }
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
    plannerMode,
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
