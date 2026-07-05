import { NextRequest, NextResponse } from 'next/server'
import { keywordSearch } from '@/lib/dataset'

export async function POST(req: NextRequest) {
  try {
    const { query } = (await req.json()) as { query?: string }
    if (!query?.trim()) {
      return NextResponse.json({ error: 'query is required' }, { status: 400 })
    }

    const results = keywordSearch(query.trim(), 12)
    return NextResponse.json({ query: query.trim(), results })
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : 'Search failed' },
      { status: 500 },
    )
  }
}
