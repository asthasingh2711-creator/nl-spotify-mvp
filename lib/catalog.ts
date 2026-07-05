import type { Track } from './types'
import { getAllTracks } from './dataset'
import { stockCover } from './stock-images'

export interface PlayableTrack {
  id: string
  title: string
  artist: string
  album: string
  duration: number
  src: string
  cover: string
  genre: string
  spotifyUrl?: string
  hasPreview?: boolean
}

export interface Playlist {
  id: string
  name: string
  description: string
  cover: string
  tracks: PlayableTrack[]
  type: 'playlist' | 'album'
}

const PREVIEWS = Array.from(
  { length: 16 },
  (_, i) => `https://www.soundhelix.com/examples/mp3/SoundHelix-Song-${i + 1}.mp3`,
)

function resolveCover(track: Track): string {
  if (!track.cover || track.cover.includes('placehold.co')) return stockCover(track.id)
  return track.cover
}

export function toPlayable(track: Track): PlayableTrack {
  const num = parseInt(track.id.replace(/\D/g, ''), 10) || 1
  return {
    id: track.id,
    title: track.track_name,
    artist: track.artist,
    album: track.album,
    duration: 180 + (num % 120),
    src: PREVIEWS[(num - 1) % PREVIEWS.length],
    cover: resolveCover(track),
    genre: track.genre,
  }
}

let _playlistsCache: Playlist[] | null = null

function buildPlaylistsImpl(): Playlist[] {
  const tracks = getAllTracks().map(toPlayable)
  const byGenre = new Map<string, PlayableTrack[]>()

  for (const t of tracks) {
    const list = byGenre.get(t.genre) ?? []
    list.push(t)
    byGenre.set(t.genre, list)
  }

  const genrePlaylists: Playlist[] = [...byGenre.entries()].map(([genre, genreTracks]) => ({
    id: `genre-${genre}`,
    name: `${genre.charAt(0).toUpperCase() + genre.slice(1)} Mix`,
    description: `Top picks in ${genre}`,
    cover: genreTracks[0]?.cover ?? '',
    tracks: genreTracks.slice(0, 12),
    type: 'playlist' as const,
  }))

  const discoverWeekly: Playlist = {
    id: 'discover-weekly',
    name: 'Discover Weekly',
    description: 'Your weekly mixtape of fresh music',
    cover: tracks[42]?.cover ?? tracks[0].cover,
    tracks: tracks.filter((t) => t.genre !== 'pop').slice(0, 10),
    type: 'playlist',
  }

  const liked: Playlist = {
    id: 'liked',
    name: 'Liked Songs',
    description: 'Your favorite tracks',
    cover: tracks[7]?.cover ?? tracks[0].cover,
    tracks: tracks.slice(0, 15),
    type: 'playlist',
  }

  const chill: Playlist = {
    id: 'chill',
    name: 'Chill Vibes',
    description: 'Relax and unwind',
    cover: tracks.filter((t) => ['ambient', 'jazz', 'folk'].includes(t.genre))[0]?.cover ?? tracks[0].cover,
    tracks: tracks.filter((t) => t.genre === 'ambient' || t.genre === 'jazz' || t.genre === 'folk').slice(0, 8),
    type: 'playlist',
  }

  const workout: Playlist = {
    id: 'workout',
    name: 'Beast Mode',
    description: 'High energy tracks',
    cover: tracks.filter((t) => t.genre === 'electronic' || t.genre === 'metal')[0]?.cover ?? tracks[0].cover,
    tracks: tracks.filter((t) => t.genre === 'electronic' || t.genre === 'metal' || t.genre === 'punk').slice(0, 8),
    type: 'playlist',
  }

  return [liked, discoverWeekly, chill, workout, ...genrePlaylists.slice(0, 8)]
}

export function buildPlaylists(): Playlist[] {
  if (!_playlistsCache) _playlistsCache = buildPlaylistsImpl()
  return _playlistsCache
}

export function getPlaylistById(id: string): Playlist | undefined {
  return buildPlaylists().find((p) => p.id === id)
}

export function searchCatalog(query: string, limit = 20): PlayableTrack[] {
  const q = query.toLowerCase().trim()
  if (!q) return []
  return getAllTracks()
    .filter((t) => {
      const hay = `${t.track_name} ${t.artist} ${t.genre} ${t.album}`.toLowerCase()
      return q.split(/\s+/).some((w) => w.length > 1 && hay.includes(w))
    })
    .slice(0, limit)
    .map(toPlayable)
}

export function formatDuration(seconds: number): string {
  const m = Math.floor(seconds / 60)
  const s = Math.floor(seconds % 60)
  return `${m}:${s.toString().padStart(2, '0')}`
}

export const FEATURED = buildPlaylists().slice(0, 6)
