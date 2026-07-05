import type { IntentFilters } from './types'
import { EMPTY_FILTERS } from './types'

const INTENT_SYSTEM = `You are a music intent parser. Given a user's natural-language request, output ONLY a JSON object with fields: energy_min, energy_max, valence_min, valence_max, tempo_min, tempo_max, genre_include, genre_exclude, popularity_max (lower = more obscure), popularity_min, keywords. Use null for unspecified fields. Do not explain, output JSON only.`

const REFINE_SYSTEM = `You are a music intent parser. You receive the user's original intent, their current filter JSON, and a new refinement instruction. Merge the refinement into the filters and output ONLY the updated JSON object with the same fields. Use null for unspecified fields. Do not explain, output JSON only.`

export function hasLlmKey(): boolean {
  return Boolean(process.env.OPENAI_API_KEY)
}

async function callLlm(system: string, user: string): Promise<string> {
  const apiKey = process.env.OPENAI_API_KEY
  if (!apiKey) throw new Error('No API key')

  const model = process.env.OPENAI_MODEL || 'gpt-4o-mini'
  const res = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model,
      temperature: 0.2,
      messages: [
        { role: 'system', content: system },
        { role: 'user', content: user },
      ],
    }),
  })

  if (!res.ok) {
    const err = await res.text()
    throw new Error(`LLM error: ${res.status} ${err}`)
  }

  const data = (await res.json()) as { choices: { message: { content: string } }[] }
  return data.choices[0]?.message?.content ?? ''
}

function extractJson(text: string): IntentFilters {
  const match = text.match(/\{[\s\S]*\}/)
  if (!match) throw new Error('No JSON in LLM response')
  const parsed = JSON.parse(match[0]) as Partial<IntentFilters>
  return { ...EMPTY_FILTERS, ...parsed }
}

export async function parseIntent(intent: string): Promise<{ filters: IntentFilters; mode: 'llm' | 'mock' }> {
  if (hasLlmKey()) {
    try {
      const raw = await callLlm(INTENT_SYSTEM, intent)
      return { filters: extractJson(raw), mode: 'llm' }
    } catch {
      // fall through to mock
    }
  }
  return { filters: mockParseIntent(intent), mode: 'mock' }
}

export async function refineFilters(
  originalIntent: string,
  currentFilters: IntentFilters,
  refinement: string,
): Promise<{ filters: IntentFilters; mode: 'llm' | 'mock' }> {
  if (hasLlmKey()) {
    try {
      const user = `Original intent: ${originalIntent}\nCurrent filters: ${JSON.stringify(currentFilters)}\nRefinement: ${refinement}`
      const raw = await callLlm(REFINE_SYSTEM, user)
      return { filters: extractJson(raw), mode: 'llm' }
    } catch {
      // fall through
    }
  }
  return {
    filters: mockRefineFilters(currentFilters, refinement),
    mode: 'mock',
  }
}

export async function generateExplanations(
  intent: string,
  tracks: { track_name: string; artist: string; genre: string; energy: number; valence: number; popularity: number; tempo: number }[],
): Promise<{ explanations: string[]; mode: 'llm' | 'mock' }> {
  if (hasLlmKey()) {
    try {
      const prompt = tracks
        .map(
          (t, i) =>
            `${i + 1}. "${t.track_name}" by ${t.artist} | genre=${t.genre} energy=${t.energy} valence=${t.valence} popularity=${t.popularity} tempo=${t.tempo}`,
        )
        .join('\n')

      const raw = await callLlm(
        `Given the user intent and tracks below, write one sentence (max 20 words) per track explaining why it matches the CURRENT stated intent. Do not mention listening history. Return a JSON array of strings, one per track, in order.`,
        `User intent: ${intent}\n\nTracks:\n${prompt}`,
      )

      const match = raw.match(/\[[\s\S]*\]/)
      if (match) {
        const arr = JSON.parse(match[0]) as string[]
        if (arr.length === tracks.length) return { explanations: arr, mode: 'llm' }
      }
    } catch {
      // fall through
    }
  }

  return {
    explanations: tracks.map((t) => mockExplanation(intent, t)),
    mode: 'mock',
  }
}

function mockParseIntent(intent: string): IntentFilters {
  const text = intent.toLowerCase()
  const filters: IntentFilters = { ...EMPTY_FILTERS, keywords: [] }

  if (/workout|gym|run|high.?energy|pump|cardio|exercise/.test(text)) {
    filters.energy_min = 0.7
    filters.tempo_min = 120
    filters.keywords!.push('workout')
  }
  if (/chill|relax|calm|sleep|ambient|study|lo.?fi/.test(text)) {
    filters.energy_max = 0.45
    filters.valence_min = 0.3
    filters.genre_include = ['ambient', 'jazz', 'folk', 'classical']
  }
  if (/sad|melanchol|depress|moody|blue/.test(text)) {
    filters.valence_max = 0.4
    filters.energy_max = 0.55
  }
  if (/happy|upbeat|feel.?good|positive|uplift/.test(text)) {
    filters.valence_min = 0.65
    filters.energy_min = 0.5
  }
  if (/obscure|underground|hidden|haven't heard|never heard|deep cut|indie|unknown/.test(text)) {
    filters.popularity_max = 35
  }
  if (/mainstream|popular|hit|chart/.test(text) && !/no mainstream|not mainstream|avoid mainstream/.test(text)) {
    filters.popularity_min = 60
  }
  if (/no mainstream|not mainstream|avoid mainstream|no pop/.test(text)) {
    filters.genre_exclude = ['pop']
    filters.popularity_max = filters.popularity_max ?? 45
  }
  if (/no pop|without pop|exclude pop/.test(text)) {
    filters.genre_exclude = [...(filters.genre_exclude ?? []), 'pop']
  }
  if (/electronic|edm|dance|techno|house/.test(text)) {
    filters.genre_include = ['electronic', 'disco', 'funk']
    filters.energy_min = filters.energy_min ?? 0.6
  }
  if (/rock|metal|punk/.test(text)) {
    filters.genre_include = ['rock', 'metal', 'punk']
  }
  if (/jazz|blues|soul/.test(text)) {
    filters.genre_include = ['jazz', 'blues', 'soul']
  }
  if (/acoustic|unplugged|folk/.test(text)) {
    filters.genre_include = ['folk', 'country']
  }

  if (!filters.keywords!.length) filters.keywords = null
  return filters
}

function mockRefineFilters(current: IntentFilters, refinement: string): IntentFilters {
  const text = refinement.toLowerCase()
  const next = { ...current, genre_exclude: current.genre_exclude ? [...current.genre_exclude] : null, genre_include: current.genre_include ? [...current.genre_include] : null, keywords: current.keywords ? [...current.keywords] : null }

  if (/less sad|happier|more upbeat|cheerier|brighter/.test(text)) {
    next.valence_min = Math.max(next.valence_min ?? 0, 0.55)
    next.valence_max = null
  }
  if (/more sad|sadder|darker|melanchol/.test(text)) {
    next.valence_max = 0.4
    next.valence_min = null
  }
  if (/more obscure|more hidden|more underground|less popular/.test(text)) {
    next.popularity_max = Math.min(next.popularity_max ?? 40, 25)
  }
  if (/more popular|more mainstream|bigger hits/.test(text)) {
    next.popularity_min = 55
    next.popularity_max = null
  }
  if (/more energy|harder|faster|intense/.test(text)) {
    next.energy_min = Math.max(next.energy_min ?? 0, 0.75)
    next.tempo_min = Math.max(next.tempo_min ?? 0, 125)
  }
  if (/less energy|softer|slower|calmer/.test(text)) {
    next.energy_max = 0.5
    next.energy_min = null
  }
  if (/no english|non.?english|foreign|spanish|latin|k-pop|kpop/.test(text)) {
    next.genre_include = ['latin', 'k-pop']
    next.genre_exclude = [...(next.genre_exclude ?? []), 'country', 'folk']
  }
  if (/no pop/.test(text)) {
    next.genre_exclude = [...(next.genre_exclude ?? []), 'pop']
  }
  if (/electronic|dance/.test(text)) {
    next.genre_include = ['electronic', 'disco']
  }

  return next
}

function mockExplanation(
  intent: string,
  track: { track_name: string; artist: string; genre: string; energy: number; valence: number; popularity: number; tempo: number },
): string {
  const parts: string[] = []

  if (/workout|energy|gym/.test(intent.toLowerCase()) && track.energy >= 0.7) {
    parts.push(`High energy (${Math.round(track.energy * 100)}%) fits your workout intent`)
  } else if (track.energy >= 0.7) {
    parts.push(`Strong energy at ${Math.round(track.energy * 100)}%`)
  }

  if (track.popularity <= 35) {
    parts.push(`obscure pick (popularity ${track.popularity})`)
  } else if (/obscure|haven't heard/.test(intent.toLowerCase())) {
    parts.push(`under-the-radar at popularity ${track.popularity}`)
  }

  if (/no pop|no mainstream/.test(intent.toLowerCase()) && track.genre !== 'pop') {
    parts.push(`avoids mainstream pop as ${track.genre}`)
  } else {
    parts.push(`${track.genre} genre aligns with your request`)
  }

  if (/sad|less sad|happy/.test(intent.toLowerCase())) {
    parts.push(`valence ${Math.round(track.valence * 100)}% matches mood direction`)
  }

  const sentence = parts.slice(0, 2).join(' — ')
  return sentence.charAt(0).toUpperCase() + sentence.slice(1) + '.'
}
