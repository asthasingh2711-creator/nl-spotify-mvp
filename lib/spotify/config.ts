export function hasSpotifyCredentials(): boolean {
  return Boolean(process.env.SPOTIFY_CLIENT_ID && process.env.SPOTIFY_CLIENT_SECRET)
}

export function isSpotifyLive(): boolean {
  return hasSpotifyCredentials()
}
