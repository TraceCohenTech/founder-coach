/**
 * Ingestion pipeline: reads ValueAddVC blog posts → chunks → embeds (Voyage AI) → upserts to Upstash Vector
 * Run: npm run ingest
 * Prerequisites: VOYAGE_API_KEY, UPSTASH_VECTOR_REST_URL, UPSTASH_VECTOR_REST_TOKEN in .env.local
 */

import { readFileSync, readdirSync, existsSync } from 'fs'
import { join, dirname } from 'path'
import { fileURLToPath } from 'url'

const __dirname = dirname(fileURLToPath(import.meta.url))

// Load env from .env.local
const envPath = join(__dirname, '../.env.local')
if (existsSync(envPath)) {
  const envContent = readFileSync(envPath, 'utf-8')
  for (const line of envContent.split('\n')) {
    const [key, ...vals] = line.split('=')
    if (key && vals.length) process.env[key.trim()] = vals.join('=').trim()
  }
}

const VOYAGE_API_KEY = process.env.VOYAGE_API_KEY
const UPSTASH_URL = process.env.UPSTASH_VECTOR_REST_URL
const UPSTASH_TOKEN = process.env.UPSTASH_VECTOR_REST_TOKEN

if (!VOYAGE_API_KEY || !UPSTASH_URL || !UPSTASH_TOKEN) {
  console.error('Missing env vars: VOYAGE_API_KEY, UPSTASH_VECTOR_REST_URL, UPSTASH_VECTOR_REST_TOKEN')
  process.exit(1)
}

const PRIORITY_CATEGORIES = [
  'Fundraising',
  'VC & Investing',
  'Startup Operations',
  'Strategy & Thesis',
  'Growth & Marketing',
  'Market & Trends',
]

const BLOG_DIR = join(__dirname, '../../ValueAddVC/hub/src/app/blog')
const CHUNK_SIZE = 400
const CHUNK_OVERLAP = 80
const BATCH_SIZE = 8  // Voyage AI rate limits are stricter

// ── Text extraction ──────────────────────────────────────────────────

function extractFromTSX(content) {
  let text = ''

  const titleMatch = content.match(/title:\s*"([^"]+)"/)
  if (titleMatch) text += titleMatch[1] + '\n\n'

  const descMatch = content.match(/description:\s*"([^"]+)"/)
  if (descMatch) text += descMatch[1] + '\n\n'

  const subtitleMatch = content.match(/subtitle="([^"]{20,})"/)
  if (subtitleMatch) text += subtitleMatch[1] + '\n\n'

  const qaMatch = content.match(/quickAnswer="([^"]{20,})"/)
  if (qaMatch) text += 'Key answer: ' + qaMatch[1] + '\n\n'

  const contentMatch = content.match(/content=\{`([\s\S]*?)`\}/)
  if (contentMatch) {
    const raw = contentMatch[1]
      .replace(/<[^>]+>/g, ' ')
      .replace(/&amp;/g, '&')
      .replace(/&lt;/g, '<')
      .replace(/&gt;/g, '>')
      .replace(/&nbsp;/g, ' ')
      .replace(/\s{2,}/g, ' ')
      .trim()
    text += raw + '\n\n'
  }

  const faqBlock = content.match(/faqs=\{(\[[\s\S]*?\])\}/)
  if (faqBlock) {
    const questionMatches = [...faqBlock[1].matchAll(/question:\s*"([^"]+)"/g)]
    const answerMatches = [...faqBlock[1].matchAll(/answer:\s*"([^"]{20,})"/g)]
    for (let i = 0; i < questionMatches.length; i++) {
      text += `Q: ${questionMatches[i][1]}\n`
      if (answerMatches[i]) text += `A: ${answerMatches[i][1]}\n\n`
    }
  }

  return text.trim()
}

function extractMetadata(content, slug) {
  const titleMatch = content.match(/title:\s*['"`]([^'"`]+)['"`]/)
  const categoryMatch = content.match(/category:\s*['"`]([^'"`]+)['"`]/)
  return {
    slug,
    title: titleMatch?.[1] ?? slug,
    category: categoryMatch?.[1] ?? 'General',
  }
}

// ── Chunking ─────────────────────────────────────────────────────────

function chunkText(text, chunkSize = CHUNK_SIZE, overlap = CHUNK_OVERLAP) {
  const words = text.split(/\s+/)
  const chunks = []
  let start = 0
  while (start < words.length) {
    const end = Math.min(start + chunkSize, words.length)
    const chunk = words.slice(start, end).join(' ')
    if (chunk.trim().length > 50) chunks.push(chunk)
    start += chunkSize - overlap
  }
  return chunks
}

// ── Voyage AI embeddings ─────────────────────────────────────────────

async function embed(texts) {
  const res = await fetch('https://api.voyageai.com/v1/embeddings', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${VOYAGE_API_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ model: 'voyage-3-large', input: texts }),
  })
  if (!res.ok) throw new Error(`Voyage AI error: ${await res.text()}`)
  const data = await res.json()
  return data.data.map(d => d.embedding)
}

// ── Upstash upsert ────────────────────────────────────────────────────

async function upsertBatch(vectors) {
  const res = await fetch(`${UPSTASH_URL}/upsert`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${UPSTASH_TOKEN}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(vectors),
  })
  if (!res.ok) throw new Error(`Upstash error: ${await res.text()}`)
}

// ── Main ──────────────────────────────────────────────────────────────

async function main() {
  if (!existsSync(BLOG_DIR)) {
    console.error(`Blog dir not found: ${BLOG_DIR}`)
    process.exit(1)
  }

  const slugs = readdirSync(BLOG_DIR)
  console.log(`Found ${slugs.length} blog post directories`)

  const allVectors = []
  let processed = 0
  let skipped = 0

  for (const slug of slugs) {
    const postPath = join(BLOG_DIR, slug, 'page.tsx')
    if (!existsSync(postPath)) { skipped++; continue }

    const raw = readFileSync(postPath, 'utf-8')
    const meta = extractMetadata(raw, slug)

    if (!PRIORITY_CATEGORIES.includes(meta.category)) { skipped++; continue }

    const text = extractFromTSX(raw)
    if (!text || text.length < 100) { skipped++; continue }

    const chunks = chunkText(text)
    for (let i = 0; i < chunks.length; i++) {
      allVectors.push({
        id: `${slug}_${i}`,
        text: chunks[i],
        metadata: { slug, title: meta.title, category: meta.category, chunk: chunks[i], chunkIndex: i },
      })
    }

    processed++
    if (processed % 20 === 0) process.stdout.write(`\r  Processed: ${processed}/${slugs.length}`)
  }

  console.log(`\nProcessed: ${processed} posts, Skipped: ${skipped}`)
  console.log(`Total chunks: ${allVectors.length}`)
  console.log('Generating embeddings with Voyage AI and upserting to Upstash...')

  for (let i = 0; i < allVectors.length; i += BATCH_SIZE) {
    const batch = allVectors.slice(i, i + BATCH_SIZE)
    const texts = batch.map(v => v.text)
    const embeddings = await embed(texts)
    const upsertPayload = batch.map((v, j) => ({
      id: v.id,
      vector: embeddings[j],
      metadata: v.metadata,
    }))
    await upsertBatch(upsertPayload)
    process.stdout.write(`\r  Upserted: ${Math.min(i + BATCH_SIZE, allVectors.length)}/${allVectors.length}`)
    // Small delay to respect rate limits
    await new Promise(r => setTimeout(r, 200))
  }

  console.log('\nDone! Knowledge base loaded.')
}

main().catch(err => { console.error(err); process.exit(1) })
