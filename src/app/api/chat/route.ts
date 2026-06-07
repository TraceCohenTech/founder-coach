import { createGroq } from '@ai-sdk/groq'
import { streamText } from 'ai'
import { buildSystemPrompt, UserProfile } from '@/lib/system-prompt'

export const runtime = 'nodejs'
export const maxDuration = 60

const groq = createGroq({ apiKey: process.env.GROQ_API_KEY! })

// ── Voyage AI embed ───────────────────────────────────────────────────

async function embedQuery(text: string): Promise<number[] | null> {
  const key = process.env.VOYAGE_API_KEY
  if (!key) return null
  try {
    const res = await fetch('https://api.voyageai.com/v1/embeddings', {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${key}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({ model: 'voyage-large-2', input: [text] }),
    })
    if (!res.ok) return null
    const data = await res.json()
    return data.data[0].embedding
  } catch { return null }
}

// ── Upstash Vector query ──────────────────────────────────────────────

interface VectorMatch {
  metadata?: { title?: string; chunk?: string; slug?: string }
}

async function queryVector(vector: number[], topK = 3): Promise<string> {
  const url = process.env.UPSTASH_VECTOR_REST_URL
  const token = process.env.UPSTASH_VECTOR_REST_TOKEN
  if (!url || !token) return ''
  try {
    const res = await fetch(`${url}/query`, {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({ vector, topK, includeMetadata: true }),
    })
    if (!res.ok) return ''
    const data = await res.json()
    const matches: VectorMatch[] = data.result ?? []
    if (!matches.length) return ''
    const snippets = matches
      .filter(m => m.metadata?.chunk)
      .map(m => `[${m.metadata!.title ?? m.metadata!.slug}]\n${m.metadata!.chunk}`)
    return snippets.join('\n\n---\n\n')
  } catch { return '' }
}

// ── Route handler ─────────────────────────────────────────────────────

export async function POST(req: Request) {
  const { messages, profile } = await req.json()

  // RAG: embed the latest user message and pull relevant context
  let ragContext = ''
  const lastUser = [...messages].reverse().find((m: { role: string }) => m.role === 'user')
  if (lastUser?.content) {
    const vector = await embedQuery(lastUser.content)
    if (vector) ragContext = await queryVector(vector)
  }

  const systemPrompt = buildSystemPrompt(profile as UserProfile | null, ragContext)

  const result = streamText({
    model: groq('llama-3.3-70b-versatile'),
    system: systemPrompt,
    messages,
    maxTokens: 1024,
    temperature: 0.7,
  })

  return result.toDataStreamResponse()
}
