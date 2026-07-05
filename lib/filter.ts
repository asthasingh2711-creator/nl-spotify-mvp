import type { IntentFilters, Track } from './types'

function matchesGenre(track: Track, filters: IntentFilters): boolean {
  if (filters.genre_include?.length) {
    if (!filters.genre_include.some((g) => track.genre.toLowerCase().includes(g.toLowerCase()))) {
      return false
    }
  }
  if (filters.genre_exclude?.length) {
    if (filters.genre_exclude.some((g) => track.genre.toLowerCase().includes(g.toLowerCase()))) {
      return false
    }
  }
  return true
}

function matchesRange(value: number, min: number | null, max: number | null): boolean {
  if (min !== null && value < min) return false
  if (max !== null && value > max) return false
  return true
}

function keywordBoost(track: Track, keywords: string[] | null): number {
  if (!keywords?.length) return 0
  const hay = `${track.track_name} ${track.artist} ${track.genre} ${track.album}`.toLowerCase()
  let boost = 0
  for (const kw of keywords) {
    if (hay.includes(kw.toLowerCase())) boost += 0.15
  }
  return boost
}

function filterScore(track: Track, filters: IntentFilters): number {
  if (!matchesGenre(track, filters)) return -1
  if (!matchesRange(track.energy, filters.energy_min, filters.energy_max)) return -1
  if (!matchesRange(track.valence, filters.valence_min, filters.valence_max)) return -1
  if (!matchesRange(track.tempo, filters.tempo_min, filters.tempo_max)) return -1
  if (!matchesRange(track.popularity, filters.popularity_min, filters.popularity_max)) return -1

  let score = 0.5

  if (filters.energy_min !== null) score += (track.energy - filters.energy_min) * 0.3
  if (filters.valence_min !== null) score += (track.valence - filters.valence_min) * 0.2
  if (filters.popularity_max !== null) {
    score += ((filters.popularity_max - track.popularity) / 100) * 0.4
  }

  score += keywordBoost(track, filters.keywords)
  score += (1 - track.popularity / 100) * 0.05

  return score
}

export function filterAndRank(tracks: Track[], filters: IntentFilters, limit = 12): Track[] {
  const scored = tracks
    .map((track) => ({ track, score: filterScore(track, filters) }))
    .filter((s) => s.score >= 0)
    .sort((a, b) => b.score - a.score)

  if (scored.length >= limit) return scored.slice(0, limit).map((s) => s.track)

  // Relax popularity constraint if too few results
  if (filters.popularity_max !== null && scored.length < limit) {
    const relaxed = { ...filters, popularity_max: Math.min(100, (filters.popularity_max ?? 100) + 25) }
    return filterAndRank(tracks, relaxed, limit)
  }

  return scored.slice(0, limit).map((s) => s.track)
}
