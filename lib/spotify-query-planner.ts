import { hasLlmKey } from './llm'
import { getTasteSummary, getUserTasteKeywords } from './user-taste'

export interface SpotifyQueryPlan {
  playlist_name: string
  summary: string
  search_queries: string[]
  avoid?: string[]
}

const SYSTEM = `You are a Spotify search query planner. Users describe music in vague natural language. You translate intent into 3–5 keyword search strings that work with Spotify's GET /search?q=...&type=track API.

Rules:
- Output ONLY valid JSON with keys: playlist_name, summary, search_queries (array of 3-5 strings), avoid (optional array of genres/vibes to skip).
- Each search_queries entry must be 2–5 words, searchable on Spotify (artist names, genres, moods, "sad but hopeful", "country rap chill").
- Resolve contradictions: "depression uplifting" = melancholy but hopeful, NOT pure sad OR pure party.
- Multi-genre: "country hip hop soothing" = blend queries like "country hip hop chill", "soothing country rap".
- Never output abstract phrases alone ("feeling blue") — always add genre/mood keywords Spotify can match.
- Personalize when user taste context is provided.

Examples:
User: depression uplifting sound
{"playlist_name":"Light Through the Fog","summary":"Melancholy songs with a hopeful lift — not pure sadness.","search_queries":["melancholy uplifting indie","sad but hopeful","depression recovery songs","hopeful acoustic sad"],"avoid":["screamo","heavy metal"]}

User: country hip hop soothing music
{"playlist_name":"Country Rap & Chill","summary":"Smooth country-hip-hop crossover and soothing rap-folk blends.","search_queries":["country hip hop chill","soothing country rap","acoustic hip hop country","country trap mellow"],"avoid":[]}

User: sad like lovely
{"playlist_name":"Like Lovely","summary":"Emotional, intimate ballads similar to Billie Eilish & Khalid.","search_queries":["lovely billie eilish","sad intimate pop","emotional duet ballad","melancholy pop duet"],"avoid":[]}`

async function callPlannerLlm(userPrompt: string): Promise<string> {
  const apiKey = process.env.OPENAI_API_KEY
  if (!apiKey) throw new Error('No API key')

  const model = process.env.OPENAI_QUERY_MODEL || process.env.OPENAI_MODEL || 'gpt-4o-mini'
  const res = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model,
      temperature: 0.3,
      response_format: { type: 'json_object' },
      messages: [
        { role: 'system', content: SYSTEM },
        { role: 'user', content: userPrompt },
      ],
    }),
  })

  if (!res.ok) {
    const err = await res.text()
    throw new Error(`LLM planner error ${res.status}: ${err}`)
  }

  const data = (await res.json()) as { choices: { message: { content: string } }[] }
  return data.choices[0]?.message?.content ?? ''
}

function parsePlan(raw: string): SpotifyQueryPlan {
  const parsed = JSON.parse(raw) as Partial<SpotifyQueryPlan>
  const queries = (parsed.search_queries ?? [])
    .filter((q): q is string => typeof q === 'string' && q.trim().length > 0)
    .map((q) => q.trim().slice(0, 80))
  if (queries.length === 0) throw new Error('No search_queries in plan')
  return {
    playlist_name: (parsed.playlist_name ?? 'AI Mix').slice(0, 80),
    summary: (parsed.summary ?? '').slice(0, 300),
    search_queries: queries.slice(0, 5),
    avoid: parsed.avoid?.filter((a) => typeof a === 'string').slice(0, 5),
  }
}

function mockPlan(intent: string): SpotifyQueryPlan {
  const text = intent.toLowerCase().trim()
  const queries: string[] = []

  if (/depress|sad|melanchol|moody/.test(text) && /uplift|hope|happy|bright|recover/.test(text)) {
    queries.push('melancholy uplifting indie', 'sad but hopeful songs', 'hopeful acoustic sad', 'emotional recovery music')
  } else if (/country/.test(text) && /hip.?hop|rap/.test(text)) {
    queries.push('country hip hop chill', 'soothing country rap', 'country trap mellow', 'acoustic hip hop country')
  } else if (/sooth|calm|relax|chill/.test(text)) {
    queries.push(`${text.split(/\s+/).slice(0, 3).join(' ')}`, 'chill relaxing music', 'calm soothing playlist')
  } else if (/workout|gym|run|energy/.test(text)) {
    queries.push('workout hype', 'high energy gym', 'cardio playlist', 'pump up songs')
  } else if (/like\s+(.+)/i.test(intent)) {
    const ref = intent.match(/like\s+(.+)$/i)?.[1]?.trim() ?? ''
    queries.push(ref, `sad ${ref}`, `songs like ${ref}`, `${ref} similar`)
  } else {
    const words = text.split(/\s+/).filter((w) => w.length > 2)
    queries.push(intent.trim(), words.slice(0, 3).join(' '), `${words[0] ?? 'chill'} ${words[1] ?? 'music'}`)
  }

  const taste = getUserTasteKeywords().slice(0, 2)
  if (taste.length) queries.push(`${taste.join(' ')} ${wordsOrDefault(text, 'mix')}`)

  return {
    playlist_name: `AI Mix · ${intent.slice(0, 48)}`,
    summary: `Curated for "${intent}" — add OPENAI_API_KEY for smarter query planning.`,
    search_queries: [...new Set(queries.map((q) => q.trim()).filter(Boolean))].slice(0, 5),
  }
}

function wordsOrDefault(text: string, fallback: string): string {
  const w = text.split(/\s+/).find((x) => x.length > 3)
  return w ?? fallback
}

function buildUserMessage(intent: string): string {
  const taste = getTasteSummary()
  const keywords = getUserTasteKeywords().slice(0, 8).join(', ')
  return `User request: ${intent}\nUser taste: ${taste}\nLibrary keywords: ${keywords || 'none'}`
}

/** Log prompt + plan pairs for future fine-tuning (set LOG_AI_QUERIES=1). */
async function maybeLogTraining(intent: string, plan: SpotifyQueryPlan, source: 'llm' | 'mock') {
  if (process.env.LOG_AI_QUERIES !== '1') return
  try {
    const { appendFileSync, mkdirSync } = await import('fs')
    const { join } = await import('path')
    const dir = join(process.cwd(), 'data')
    mkdirSync(dir, { recursive: true })
    const line = JSON.stringify({
      messages: [
        { role: 'system', content: SYSTEM },
        { role: 'user', content: buildUserMessage(intent) },
        { role: 'assistant', content: JSON.stringify(plan) },
      ],
      metadata: { source, intent, logged_at: new Date().toISOString() },
    })
    appendFileSync(join(dir, 'training-log.jsonl'), line + '\n')
  } catch {
    // non-fatal
  }
}

export async function planSpotifySearch(intent: string): Promise<{ plan: SpotifyQueryPlan; mode: 'llm' | 'mock' }> {
  const trimmed = intent.trim()
  if (hasLlmKey()) {
    try {
      const raw = await callPlannerLlm(buildUserMessage(trimmed))
      const plan = parsePlan(raw)
      await maybeLogTraining(trimmed, plan, 'llm')
      return { plan, mode: 'llm' }
    } catch (err) {
      console.error('LLM query planner failed, using mock:', err)
    }
  }
  const plan = mockPlan(trimmed)
  await maybeLogTraining(trimmed, plan, 'mock')
  return { plan, mode: 'mock' }
}

export function filterAvoidedTracks<T extends { title: string; artist: string }>(
  tracks: T[],
  avoid?: string[],
): T[] {
  if (!avoid?.length) return tracks
  const bad = avoid.map((a) => a.toLowerCase())
  return tracks.filter((t) => {
    const hay = `${t.title} ${t.artist}`.toLowerCase()
    return !bad.some((term) => hay.includes(term))
  })
}
