import { NextResponse } from 'next/server'
import { surprisePlaylist } from '@/lib/ai-curate'

export async function POST() {
  try {
    const result = await surprisePlaylist()
    return NextResponse.json(result)
  } catch (err) {
    console.error('AI surprise error:', err)
    return NextResponse.json(
      { error: err instanceof Error ? err.message : 'Surprise failed' },
      { status: 500 },
    )
  }
}
