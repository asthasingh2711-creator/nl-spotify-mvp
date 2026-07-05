import { NextResponse } from 'next/server'
import { hasSpotifyCredentials } from '@/lib/spotify/config'
import { getSpotifyAccessToken } from '@/lib/spotify/auth'

export async function GET() {
  if (!hasSpotifyCredentials()) {
    return NextResponse.json({
      mode: 'demo',
      connected: false,
      message: 'Add SPOTIFY_CLIENT_ID and SPOTIFY_CLIENT_SECRET to .env.local',
    })
  }

  try {
    await getSpotifyAccessToken()
    return NextResponse.json({
      mode: 'live',
      connected: true,
      message: 'Connected to Spotify Web API',
    })
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Spotify auth failed'
    return NextResponse.json(
      { mode: 'error', connected: false, message },
      { status: 502 },
    )
  }
}
