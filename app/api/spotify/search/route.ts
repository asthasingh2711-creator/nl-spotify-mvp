import { NextRequest, NextResponse } from 'next/server'
import { hasSpotifyCredentials } from '@/lib/spotify/config'
import { searchSpotifyTracks, SPOTIFY_SEARCH_MAX } from '@/lib/spotify/client'
import { searchCatalog } from '@/lib/catalog'

export async function GET(request: NextRequest) {
  const query = request.nextUrl.searchParams.get('q')?.trim() ?? ''
  const rawLimit = Number(request.nextUrl.searchParams.get('limit') ?? SPOTIFY_SEARCH_MAX)
  const limit = Math.min(Math.max(Number.isFinite(rawLimit) ? rawLimit : SPOTIFY_SEARCH_MAX, 1), SPOTIFY_SEARCH_MAX)

  if (!query) {
    return NextResponse.json({ mode: 'demo', tracks: [] })
  }

  if (!hasSpotifyCredentials()) {
    return NextResponse.json({
      mode: 'demo',
      tracks: searchCatalog(query, limit),
    })
  }

  try {
    const tracks = await searchSpotifyTracks(query, limit)
    return NextResponse.json({ mode: 'live', tracks })
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Spotify search failed'
    return NextResponse.json(
      { mode: 'error', message, tracks: searchCatalog(query, limit) },
      { status: 502 },
    )
  }
}
