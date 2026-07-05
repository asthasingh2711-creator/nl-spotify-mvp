#!/usr/bin/env node
/**
 * Generates a local music corpus for Explain & Refine mode.
 * Schema mirrors pre-2024 Spotify audio-feature datasets (Kaggle-style).
 */
import { writeFileSync, mkdirSync } from 'fs'
import { dirname, join } from 'path'
import { fileURLToPath } from 'url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const OUT = join(__dirname, '../data/tracks.json')

const GENRES = [
  'pop', 'rock', 'hip-hop', 'electronic', 'jazz', 'classical', 'r&b',
  'country', 'indie', 'metal', 'folk', 'latin', 'reggae', 'blues', 'soul',
  'punk', 'ambient', 'funk', 'disco', 'k-pop',
]

const ARTISTS_BY_GENRE = {
  pop: ['Luna Ray', 'Starlight Ave', 'Velvet Echo', 'Crystal Wave', 'Nova Bloom'],
  rock: ['Iron Horizon', 'Crimson Drive', 'Thunder Lane', 'Stone Valley', 'Arctic Pulse'],
  'hip-hop': ['Metro Cipher', 'Block Theory', 'Golden Mic', 'Urban Prism', 'Beat Architect'],
  electronic: ['Neon Circuit', 'Pulse Theory', 'Digital Mirage', 'Synth Harbor', 'Voltage Lab'],
  jazz: ['Blue Note Society', 'Midnight Quartet', 'Smooth Current', 'Brass Harbor', 'Velvet Sax'],
  classical: ['Chamber Ensemble', 'Symphony Hall', 'Piano Reverie', 'String Atlas', 'Opus Collective'],
  'r&b': ['Silk Motion', 'Velvet Soul', 'Midnight Groove', 'Honey Tone', 'Rhythm Grace'],
  country: ['Dusty Trail', 'Prairie Light', 'Whiskey Creek', 'Open Road', 'Heartland Sons'],
  indie: ['Forest Echo', 'Paper Moon', 'Coastal Kids', 'Hazy Bloom', 'Garden State'],
  metal: ['Shadow Forge', 'Razor Crown', 'Obsidian Tide', 'Steel Cathedral', 'Void Hammer'],
  folk: ['Willow Creek', 'Campfire Tales', 'Green Horizon', 'River Song', 'Hearth & String'],
  latin: ['Sol Caliente', 'Ritmo Libre', 'Casa del Son', 'Fuego Tropical', 'Noche Azul'],
  reggae: ['Island Root', 'Sunset Dub', 'Kingston Flow', 'Herb Garden', 'Rasta Wave'],
  blues: ['Delta Smoke', 'Mississippi Haze', 'Blue Room', 'Guitar Alley', 'Slow Burn'],
  soul: ['Golden Era', 'Deep Feeling', 'Motown Spirit', 'Warm Vinyl', 'Soul Kitchen'],
  punk: ['Raw District', 'Fast Lane', 'Chaos Theory', 'Basement Kings', 'Static Youth'],
  ambient: ['Cloud Drift', 'Aether Field', 'Quiet Space', 'Horizon Mist', 'Deep Calm'],
  funk: ['Groove Machine', 'Funky Town', 'Bass Parliament', 'Slap Theory', 'Disco Root'],
  disco: ['Mirror Ball', 'Saturday Night', 'Glitter Floor', 'Boogie Lane', 'Dance Palace'],
  'k-pop': ['Seoul Wave', 'Starlight K', 'Neon Seoul', 'Cherry Beat', 'Hallyu Sound'],
}

const ADJECTIVES = ['Midnight', 'Golden', 'Electric', 'Silent', 'Wild', 'Neon', 'Frozen', 'Burning', 'Hidden', 'Lost']
const NOUNS = ['Dreams', 'Highway', 'Echo', 'Fire', 'Rain', 'Shadow', 'Light', 'Pulse', 'Wave', 'Sky']

function rand(min, max) {
  return min + Math.random() * (max - min)
}

function pick(arr) {
  return arr[Math.floor(Math.random() * arr.length)]
}

function genreProfile(genre) {
  const profiles = {
    pop: { energy: [0.5, 0.85], valence: [0.5, 0.9], dance: [0.5, 0.85], acoustic: [0, 0.3], tempo: [100, 130], pop: [40, 95] },
    rock: { energy: [0.6, 0.95], valence: [0.3, 0.7], dance: [0.3, 0.6], acoustic: [0, 0.25], tempo: [110, 160], pop: [20, 80] },
    'hip-hop': { energy: [0.5, 0.9], valence: [0.3, 0.75], dance: [0.6, 0.95], acoustic: [0, 0.15], tempo: [80, 110], pop: [30, 90] },
    electronic: { energy: [0.6, 0.98], valence: [0.4, 0.85], dance: [0.7, 0.98], acoustic: [0, 0.1], tempo: [120, 140], pop: [15, 75] },
    jazz: { energy: [0.2, 0.6], valence: [0.3, 0.7], dance: [0.3, 0.6], acoustic: [0.4, 0.9], tempo: [80, 140], pop: [5, 50] },
    classical: { energy: [0.1, 0.5], valence: [0.2, 0.6], dance: [0.1, 0.3], acoustic: [0.7, 0.99], acousticness: true, tempo: [60, 120], pop: [5, 40] },
    'r&b': { energy: [0.4, 0.75], valence: [0.4, 0.8], dance: [0.5, 0.8], acoustic: [0.1, 0.4], tempo: [70, 110], pop: [25, 85] },
    country: { energy: [0.4, 0.75], valence: [0.4, 0.85], dance: [0.4, 0.7], acoustic: [0.3, 0.8], tempo: [90, 130], pop: [20, 70] },
    indie: { energy: [0.3, 0.7], valence: [0.3, 0.75], dance: [0.3, 0.65], acoustic: [0.2, 0.7], tempo: [90, 130], pop: [10, 60] },
    metal: { energy: [0.75, 0.99], valence: [0.1, 0.5], dance: [0.2, 0.5], acoustic: [0, 0.1], tempo: [130, 200], pop: [10, 65] },
    folk: { energy: [0.2, 0.55], valence: [0.35, 0.75], dance: [0.2, 0.5], acoustic: [0.5, 0.95], tempo: [80, 120], pop: [5, 45] },
    latin: { energy: [0.6, 0.9], valence: [0.6, 0.95], dance: [0.65, 0.95], acoustic: [0.1, 0.4], tempo: [100, 130], pop: [20, 75] },
    reggae: { energy: [0.4, 0.7], valence: [0.5, 0.85], dance: [0.6, 0.85], acoustic: [0.1, 0.35], tempo: [70, 100], pop: [15, 60] },
    blues: { energy: [0.3, 0.65], valence: [0.2, 0.55], dance: [0.3, 0.55], acoustic: [0.3, 0.7], tempo: [70, 110], pop: [5, 40] },
    soul: { energy: [0.4, 0.7], valence: [0.45, 0.85], dance: [0.45, 0.75], acoustic: [0.15, 0.45], tempo: [80, 115], pop: [20, 70] },
    punk: { energy: [0.8, 0.99], valence: [0.3, 0.65], dance: [0.3, 0.6], acoustic: [0, 0.15], tempo: [140, 190], pop: [10, 55] },
    ambient: { energy: [0.05, 0.35], valence: [0.2, 0.6], dance: [0.1, 0.35], acoustic: [0.3, 0.8], tempo: [60, 90], pop: [5, 35] },
    funk: { energy: [0.6, 0.85], valence: [0.6, 0.9], dance: [0.65, 0.95], acoustic: [0.05, 0.25], tempo: [100, 125], pop: [15, 60] },
    disco: { energy: [0.65, 0.9], valence: [0.65, 0.95], dance: [0.75, 0.98], acoustic: [0, 0.15], tempo: [115, 130], pop: [25, 75] },
    'k-pop': { energy: [0.55, 0.9], valence: [0.55, 0.9], dance: [0.6, 0.9], acoustic: [0, 0.2], tempo: [100, 135], pop: [40, 95] },
  }
  return profiles[genre] || profiles.pop
}

const COVER_HUES = [260, 200, 30, 120, 0, 280, 180, 45, 320, 160]

function coverUrl(id) {
  const hue = COVER_HUES[id.charCodeAt(id.length - 1) % COVER_HUES.length]
  const sat = Math.floor(rand(80, 255)).toString(16).padStart(2, '0')
  return `https://placehold.co/300x300/1a1a1a/${hue.toString(16).padStart(2, '0')}${sat}?text=%E2%99%AA`
}

const tracks = []
let id = 1

for (const genre of GENRES) {
  const artists = ARTISTS_BY_GENRE[genre] || ['Unknown Artist']
  const profile = genreProfile(genre)
  const count = genre === 'pop' ? 100 : Math.floor(rand(45, 75))

  for (let i = 0; i < count; i++) {
    const trackId = `track-${String(id++).padStart(5, '0')}`
    const artist = pick(artists)
    const title = `${pick(ADJECTIVES)} ${pick(NOUNS)}`
    const year = Math.floor(rand(1975, 2024))

    tracks.push({
      id: trackId,
      track_name: title,
      artist,
      genre,
      popularity: Math.round(rand(...profile.pop)),
      year,
      danceability: +rand(...profile.dance).toFixed(3),
      energy: +rand(...profile.energy).toFixed(3),
      valence: +rand(...profile.valence).toFixed(3),
      tempo: Math.round(rand(...profile.tempo)),
      acousticness: +rand(...profile.acoustic).toFixed(3),
      album: `${artist} — ${genre.charAt(0).toUpperCase() + genre.slice(1)} Collection`,
      cover: coverUrl(trackId),
    })
  }
}

mkdirSync(dirname(OUT), { recursive: true })
writeFileSync(OUT, JSON.stringify(tracks, null, 0))
console.log(`Generated ${tracks.length} tracks → ${OUT}`)
