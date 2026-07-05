/** Client-safe AI response shape (no server imports). */
export interface AICurateResponse {
  mode: 'live' | 'demo'
  intent: string
  playlistName: string
  summary: string
  tracks: Array<{
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
  }>
}
