import { getSpotifyAccessToken } from './auth'
import type { SpotifyTrack } from './types'
import type { PlayableTrack } from '@/lib/catalog'
import { stockCover } from '@/lib/stock-images'

const SPOTIFY_API = 'https://api.spotify.com/v1'
/** Spotify search limit for this app tier (requests above 10 return 400). */
export const SPOTIFY_SEARCH_MAX = 10

export interface SpotifySearchOptions {
  /** When true, Spotify omits explicit tracks from search results. */
  familySafe?: boolean
}

async function spotifyFetch<T>(path: string, params?: Record<string, string>): Promise<T> {
  const token = await getSpotifyAccessToken()
  const url = new URL(`${SPOTIFY_API}${path}`)
  if (params) {
    for (const [key, value] of Object.entries(params)) {
      url.searchParams.set(key, value)
    }
  }

  const response = await fetch(url.toString(), {
    headers: { Authorization: `Bearer ${token}` },
    next: { revalidate: 0 },
  })

  if (!response.ok) {
    const body = await response.text()
    throw new Error(`Spotify API error ${response.status}: ${body}`)
  }

  return response.json() as Promise<T>
}

export function spotifyTrackToPlayable(track: SpotifyTrack): PlayableTrack {
  return {
    id: track.id,
    title: track.name,
    artist: track.artists.map((a) => a.name).join(', '),
    album: track.album.name,
    duration: Math.round(track.duration_ms / 1000),
    src: track.preview_url ?? '',
    cover: track.album.images[0]?.url || stockCover(track.id),
    genre: 'spotify',
    spotifyUrl: track.external_urls.spotify,
    hasPreview: Boolean(track.preview_url),
    explicit: track.explicit,
  }
}

export async function searchSpotifyTracksRaw(
  query: string,
  limit = 10,
  options: SpotifySearchOptions = {},
): Promise<SpotifyTrack[]> {
  const safeLimit = Math.min(Math.max(limit, 1), SPOTIFY_SEARCH_MAX)
  const params: Record<string, string> = {
    q: query,
    type: 'track',
    limit: String(safeLimit),
    market: 'US',
  }
  if (options.familySafe) {
    params.explicit = 'exclude'
  }
  const data = await spotifyFetch<{ tracks: { items: SpotifyTrack[] } }>('/search', params)
  let items = data.tracks.items
  if (options.familySafe) {
    items = items.filter((t) => !t.explicit)
  }
  return items
}

export async function searchSpotifyTracks(
  query: string,
  limit = 10,
  options: SpotifySearchOptions = {},
): Promise<PlayableTrack[]> {
  return (await searchSpotifyTracksRaw(query, limit, options)).map(spotifyTrackToPlayable)
}

export async function getSpotifyTrack(trackId: string): Promise<PlayableTrack> {
  const track = await spotifyFetch<SpotifyTrack>(`/tracks/${trackId}`)
  return spotifyTrackToPlayable(track)
}

export async function getSpotifyCategories(limit = 20) {
  const data = await spotifyFetch<{
    categories: { items: { id: string; name: string; icons: { url: string }[] }[] }
  }>('/browse/categories', { limit: String(limit), country: 'US' })
  return data.categories.items
}

export async function getSpotifyNewReleases(limit = 10) {
  const data = await spotifyFetch<{ albums: { items: { id: string; name: string; artists: { name: string }[]; images: { url: string }[] }[] } }>(
    '/browse/new-releases',
    { limit: String(limit), country: 'US' },
  )
  return data.albums.items
}
