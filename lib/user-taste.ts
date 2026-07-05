import { SIDEBAR_LIBRARY } from './sidebar-library'

/** Taste signals derived from the user's library sidebar. */
export function getUserTasteKeywords(): string[] {
  const words = new Set<string>()
  for (const pl of SIDEBAR_LIBRARY) {
    if (pl.liked) continue
    for (const word of pl.name.toLowerCase().split(/[\s+./-]+/)) {
      if (word.length > 2 && !['the', 'and', 'for', 'playlist', 'songs', 'song'].includes(word)) {
        words.add(word)
      }
    }
  }
  return [...words]
}

export function getTasteSummary(): string {
  const themes = ['Hindi and Bollywood', 'bridal & wedding', 'folk (Kailash Kher)', 'dance playlists']
  return themes.join(', ')
}

export function buildSurpriseSearchQueries(): string[] {
  const taste = getUserTasteKeywords()
  const hindi = taste.includes('hindi') || taste.includes('bihari') ? 'hindi' : 'indie'
  const bridal = taste.includes('bridal') ? 'bridal wedding' : 'celebration'
  return [
    `undiscovered ${hindi} ${bridal}`,
    `${hindi} indie deep cuts`,
    `lesser known bollywood acoustic`,
    `hidden gems ${taste.includes('dance') ? 'dance' : 'folk'} ${hindi}`,
  ]
}
