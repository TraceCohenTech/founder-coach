import { createGroq } from '@ai-sdk/groq'
import { streamText } from 'ai'
import { buildSystemPrompt, UserProfile } from '@/lib/system-prompt'

export const runtime = 'nodejs'
export const maxDuration = 60

const groq = createGroq({
  apiKey: process.env.GROQ_API_KEY!,
})

export async function POST(req: Request) {
  const { messages, profile } = await req.json()

  const systemPrompt = buildSystemPrompt(profile as UserProfile | null, '')

  const result = streamText({
    model: groq('llama-3.3-70b-versatile'),
    system: systemPrompt,
    messages,
    maxTokens: 1024,
    temperature: 0.7,
  })

  return result.toDataStreamResponse()
}
