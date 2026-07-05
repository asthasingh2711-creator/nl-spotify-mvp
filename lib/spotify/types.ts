export interface SpotifyTrack {
  id: string
  name: string
  popularity: number
  artists: { id: string; name: string }[]
  album: {
    id: string
    name: string
    images: { url: string; width: number; height: number }[]
  }
  duration_ms: number
  preview_url: string | null
  external_urls: { spotify: string }
}

export interface SpotifyAudioFeatures {
  id: string
  danceability: number
  energy: number
  valence: number
  acousticness: number
  instrumentalness: number
  tempo: number
  speechiness: number
  liveness: number
}
