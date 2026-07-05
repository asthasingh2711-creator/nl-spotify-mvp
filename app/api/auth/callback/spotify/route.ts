import { NextRequest, NextResponse } from 'next/server'

/** Spotify OAuth redirect URI — required in Developer Dashboard settings. */
export async function GET(request: NextRequest) {
  const code = request.nextUrl.searchParams.get('code')
  const error = request.nextUrl.searchParams.get('error')

  if (error) {
    return NextResponse.json({ ok: false, error }, { status: 400 })
  }

  if (code) {
    return NextResponse.redirect(new URL('/?spotify=connected', request.url))
  }

  return NextResponse.json({
    ok: true,
    message: 'Spotify redirect URI is configured correctly.',
  })
}
