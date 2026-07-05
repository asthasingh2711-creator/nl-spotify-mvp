export interface Track {
  id: string
  track_name: string
  artist: string
  genre: string
  popularity: number
  year: number
  danceability: number
  energy: number
  valence: number
  tempo: number
  acousticness: number
  album: string
  cover: string
}

export interface IntentFilters {
  energy_min: number | null
  energy_max: number | null
  valence_min: number | null
  valence_max: number | null
  tempo_min: number | null
  tempo_max: number | null
  genre_include: string[] | null
  genre_exclude: string[] | null
  popularity_max: number | null
  popularity_min: number | null
  keywords: string[] | null
}

export interface ScoredTrack {
  track: Track
  score: number
  explanation: string
}

export interface DiscoverResponse {
  mode: 'llm' | 'mock'
  intent: string
  filters: IntentFilters
  results: ScoredTrack[]
}

export interface SavedPlaylist {
  id: string
  name: string
  trackIds: string[]
  createdAt: string
  sessionIntent: string
}

export const EMPTY_FILTERS: IntentFilters = {
  energy_min: null,
  energy_max: null,
  valence_min: null,
  valence_max: null,
  tempo_min: null,
  tempo_max: null,
  genre_include: null,
  genre_exclude: null,
  popularity_max: null,
  popularity_min: null,
  keywords: null,
}
