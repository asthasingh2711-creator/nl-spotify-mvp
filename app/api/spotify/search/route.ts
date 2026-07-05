import { NextRequest, NextResponse } from 'next/server'
import { hasSpotifyCredentials } from '@/lib/spotify/config'
import { searchSpotifyTracks } from '@/lib/spotify/client'
import { searchCatalog } from '@/lib/catalog'

export async function GET(request: NextRequest) {
  const query = request.nextUrl.searchParams.get('q')?.trim() ?? ''
  const limit = Math.min(Number(request.nextUrl.searchParams.get('limit') ?? 20), 50)

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
