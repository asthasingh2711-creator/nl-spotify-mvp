/** Canonical app URL — set NEXT_PUBLIC_APP_URL in Vercel after first deploy. */
export const APP_URL =
  process.env.NEXT_PUBLIC_APP_URL?.replace(/\/$/, '') ?? 'https://nl-spotify-mvp.vercel.app'

export const SPOTIFY_CALLBACK_PATH = '/api/auth/callback/spotify'

export function getSpotifyCallbackUrl(origin?: string): string {
  const base = origin ?? APP_URL
  return `${base}${SPOTIFY_CALLBACK_PATH}`
}

export const SPOTIFY_DASHBOARD_URIS = {
  website: APP_URL,
  redirectUris: [
    `${APP_URL}${SPOTIFY_CALLBACK_PATH}`,
    `http://localhost:3000${SPOTIFY_CALLBACK_PATH}`,
  ],
} as const
