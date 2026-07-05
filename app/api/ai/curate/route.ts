import { NextRequest, NextResponse } from 'next/server'
import { curatePlaylist } from '@/lib/ai-curate'

export async function POST(req: NextRequest) {
  try {
    const { intent } = (await req.json()) as { intent?: string }
    if (!intent?.trim()) {
      return NextResponse.json({ error: 'intent is required' }, { status: 400 })
    }
    const result = await curatePlaylist(intent.trim())
    return NextResponse.json(result)
  } catch (err) {
    console.error('AI curate error:', err)
    return NextResponse.json(
      { error: err instanceof Error ? err.message : 'Curation failed' },
      { status: 500 },
    )
  }
}
