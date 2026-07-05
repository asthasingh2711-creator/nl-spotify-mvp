import { hasLlmKey } from './llm'

const DEFAULT_MODEL = 'gemini-2.0-flash'

export function hasGeminiKey(): boolean {
  return Boolean(process.env.GEMINI_API_KEY?.trim())
}

export function hasPlannerKey(): boolean {
  return hasGeminiKey() || hasLlmKey()
}

export async function callGeminiJson(system: string, user: string): Promise<string> {
  const apiKey = process.env.GEMINI_API_KEY?.trim()
  if (!apiKey) throw new Error('No Gemini API key')

  const model = process.env.GEMINI_MODEL?.trim() || DEFAULT_MODEL
  const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`

  const res = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      systemInstruction: { parts: [{ text: system }] },
      contents: [{ role: 'user', parts: [{ text: user }] }],
      generationConfig: {
        temperature: 0.3,
        responseMimeType: 'application/json',
      },
    }),
  })

  if (!res.ok) {
    const err = await res.text()
    throw new Error(`Gemini planner error ${res.status}: ${err}`)
  }

  const data = (await res.json()) as {
    candidates?: { content?: { parts?: { text?: string }[] } }[]
  }
  const text = data.candidates?.[0]?.content?.parts?.[0]?.text
  if (!text) throw new Error('Empty Gemini response')
  return text
}
