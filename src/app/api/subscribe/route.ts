export const runtime = 'nodejs'

const PUB_ID = 'pub_a912eba6-7a35-4c1b-a9cb-9721b5c72389'

export async function POST(req: Request) {
  const { email } = await req.json()
  if (!email || !email.includes('@')) {
    return Response.json({ ok: false, error: 'invalid email' }, { status: 400 })
  }

  const apiKey = process.env.BEEHIIV_API_KEY
  if (!apiKey) {
    return Response.json({ ok: false, error: 'not configured' }, { status: 500 })
  }

  try {
    const res = await fetch(`https://api.beehiiv.com/v2/publications/${PUB_ID}/subscriptions`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email,
        reactivate_existing: true,
        send_welcome_email: true,
      }),
    })
    return Response.json({ ok: res.ok })
  } catch {
    return Response.json({ ok: false }, { status: 500 })
  }
}
