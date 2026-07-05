/** Detect intents where explicit or age-inappropriate music must never appear. */
const FAMILY_SAFE_INTENT =
  /\b(newborn|new born|baby boy|baby girl|baby shower|infant|toddler|nursery|lullaby|namkaran|naming ceremony|for kids|for children|with kids|kids near|children near|family friendly|family-friendly|age appropriate|age-appropriate|bedtime|nap time|play school|preschool|my (son|daughter|kid|child|baby))\b/i

const EXPLICIT_LABEL = /\bexplicit\b|\(explicit\)|\[explicit\]/i

/** Substrings in titles that strongly suggest age-inappropriate content around children. */
const EXPLICIT_TITLE_TERMS = [
  'fuck',
  'f*ck',
  'shit',
  'bitch',
  'ass ',
  ' dick',
  'pussy',
  'sex ',
  'sexual',
  'nude',
  'strip',
  'xxx',
  'motherf',
]

/** Non-explicit titles that are still unsafe for baby/child contexts (Spotify often misses these). */
const FAMILY_UNSAFE_TITLE_TERMS = [
  'your fantasy',
  'whats your fantasy',
  "what's your fantasy",
  'sexy',
  'booty',
  'thot',
  'freak me',
  'body party',
  'strip club',
  'make love',
  'turn me on',
  'wet dream',
  'bad bitch',
  'money shot',
]

export function isFamilySafeIntent(intent: string): boolean {
  return FAMILY_SAFE_INTENT.test(intent.trim())
}

export function isExplicitTrack(track: {
  title: string
  artist: string
  album?: string
  explicit?: boolean
}): boolean {
  if (track.explicit === true) return true

  const hay = `${track.title} ${track.album ?? ''}`.toLowerCase()
  if (EXPLICIT_LABEL.test(hay)) return true
  return EXPLICIT_TITLE_TERMS.some((term) => hay.includes(term))
}

export function isFamilyUnsafeTrack(track: {
  title: string
  artist: string
  album?: string
  explicit?: boolean
}): boolean {
  if (isExplicitTrack(track)) return true
  const hay = `${track.title} ${track.album ?? ''}`.toLowerCase()
  return FAMILY_UNSAFE_TITLE_TERMS.some((term) => hay.includes(term))
}

export function filterExplicitTracks<
  T extends { title: string; artist: string; album?: string; explicit?: boolean },
>(tracks: T[]): T[] {
  return tracks.filter((t) => !isExplicitTrack(t))
}

export function filterFamilySafeTracks<
  T extends { title: string; artist: string; album?: string; explicit?: boolean },
>(tracks: T[]): T[] {
  return tracks.filter((t) => !isFamilyUnsafeTrack(t))
}

/** Extra Spotify search queries when family-safe results are too thin after filtering. */
export function familySafeFallbackQueries(intent: string): string[] {
  const t = intent.toLowerCase()
  if (/hindi|bollywood|namkaran|indian/.test(t)) {
    return ['namkaran hindi songs', 'hindi baby songs bollywood', 'kids hindi songs clean']
  }
  if (/baby|newborn|lullaby|nursery/.test(t)) {
    return ['baby lullaby clean', 'nursery rhymes playlist', 'family friendly celebration']
  }
  return ['family friendly playlist clean', 'kids safe music', 'clean celebration songs']
}
