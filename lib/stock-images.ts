/** Reliable stock cover images — picsum with stable seeds per item. */
export function stockCover(seed: string): string {
  const safe = seed.replace(/[^a-zA-Z0-9-]/g, '-').slice(0, 40) || 'music'
  return `https://picsum.photos/seed/${safe}/300/300`
}

export const LOVELY_COVER = stockCover('lovely')
export const ARTIST_COVER = stockCover('artist')
