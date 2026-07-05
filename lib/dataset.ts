import tracksData from '@/data/tracks.json'
import type { Track } from './types'

let cache: Track[] | null = null

export function getAllTracks(): Track[] {
  if (!cache) cache = tracksData as Track[]
  return cache
}

export function getTrackById(id: string): Track | undefined {
  return getAllTracks().find((t) => t.id === id)
}

export function keywordSearch(query: string, limit = 15): Track[] {
  const q = query.toLowerCase().trim()
  if (!q) return []

  const words = q.split(/\s+/).filter((w) => w.length > 3)
  if (words.length === 0) return []

  return getAllTracks()
    .filter((t) => {
      const hay = `${t.track_name} ${t.artist} ${t.genre} ${t.album}`.toLowerCase()
      // Literal AND match — fails on natural-language intent queries
      return words.every((word) => hay.includes(word))
    })
    .slice(0, limit)
}
