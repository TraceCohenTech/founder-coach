import { vectorIndex } from './upstash'
import OpenAI from 'openai'

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY })

export async function embedQuery(text: string): Promise<number[]> {
  const res = await openai.embeddings.create({
    model: 'text-embedding-3-small',
    input: text,
  })
  return res.data[0].embedding
}

export interface SearchResult {
  id: string
  score: number
  title: string
  category: string
  slug: string
  chunk: string
}

export async function searchKnowledgeBase(query: string, topK = 5): Promise<SearchResult[]> {
  const embedding = await embedQuery(query)

  const results = await vectorIndex.query({
    vector: embedding,
    topK,
    includeMetadata: true,
  })

  return results
    .filter(r => r.score > 0.3)
    .map(r => ({
      id: String(r.id),
      score: r.score,
      title: (r.metadata as any)?.title ?? '',
      category: (r.metadata as any)?.category ?? '',
      slug: (r.metadata as any)?.slug ?? '',
      chunk: (r.metadata as any)?.chunk ?? '',
    }))
}
