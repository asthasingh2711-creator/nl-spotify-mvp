import { NextRequest, NextResponse } from 'next/server'
import { getAllTracks } from '@/lib/dataset'
import { filterAndRank } from '@/lib/filter'
import { generateExplanations, parseIntent } from '@/lib/llm'
import type { DiscoverResponse, ScoredTrack } from '@/lib/types'

export async function POST(req: NextRequest) {
  try {
    const { intent } = (await req.json()) as { intent?: string }
    if (!intent?.trim()) {
      return NextResponse.json({ error: 'intent is required' }, { status: 400 })
    }

    const { filters, mode: parseMode } = await parseIntent(intent.trim())
    const candidates = filterAndRank(getAllTracks(), filters, 12)

    const { explanations, mode: explainMode } = await generateExplanations(intent.trim(), candidates)

    const results: ScoredTrack[] = candidates.map((track, i) => ({
      track,
      score: 1 - i * 0.04,
      explanation: explanations[i] ?? 'Matches your stated session intent.',
    }))

    const response: DiscoverResponse = {
      mode: parseMode === 'llm' || explainMode === 'llm' ? 'llm' : 'mock',
      intent: intent.trim(),
      filters,
      results,
    }

    return NextResponse.json(response)
  } catch (err) {
    console.error('Discover error:', err)
    return NextResponse.json(
      { error: err instanceof Error ? err.message : 'Discovery failed' },
      { status: 500 },
    )
  }
}
