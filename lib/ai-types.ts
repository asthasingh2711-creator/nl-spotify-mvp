/** Client-safe AI response shape (no server imports). */
export interface AICurateResponse {
  mode: 'live' | 'demo'
  /** Whether Spotify search queries came from OpenAI or heuristics */
  planner?: 'llm' | 'mock'
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
