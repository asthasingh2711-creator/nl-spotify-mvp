import { NextRequest, NextResponse } from 'next/server'
import { getAllTracks } from '@/lib/dataset'
import { filterAndRank } from '@/lib/filter'
import { generateExplanations, refineFilters } from '@/lib/llm'
import type { DiscoverResponse, IntentFilters, ScoredTrack } from '@/lib/types'

export async function POST(req: NextRequest) {
  try {
    const body = (await req.json()) as {
      originalIntent?: string
      filters?: IntentFilters
      refinement?: string
    }

    const { originalIntent, filters, refinement } = body
    if (!originalIntent || !filters || !refinement?.trim()) {
      return NextResponse.json(
        { error: 'originalIntent, filters, and refinement are required' },
        { status: 400 },
      )
    }

    const { filters: updatedFilters, mode: parseMode } = await refineFilters(
      originalIntent,
      filters,
      refinement.trim(),
    )

    const combinedIntent = `${originalIntent} (refined: ${refinement.trim()})`
    const candidates = filterAndRank(getAllTracks(), updatedFilters, 12)
    const { explanations, mode: explainMode } = await generateExplanations(combinedIntent, candidates)

    const results: ScoredTrack[] = candidates.map((track, i) => ({
      track,
      score: 1 - i * 0.04,
      explanation: explanations[i] ?? 'Updated to match your refinement.',
    }))

    const response: DiscoverResponse = {
      mode: parseMode === 'llm' || explainMode === 'llm' ? 'llm' : 'mock',
      intent: combinedIntent,
      filters: updatedFilters,
      results,
    }

    return NextResponse.json(response)
  } catch (err) {
    console.error('Refine error:', err)
    return NextResponse.json(
      { error: err instanceof Error ? err.message : 'Refinement failed' },
      { status: 500 },
    )
  }
}
