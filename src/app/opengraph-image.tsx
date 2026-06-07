import { ImageResponse } from 'next/og'

export const runtime = 'edge'
export const alt = 'Trace Cohen — Founder Fundraising Coach'
export const size = { width: 1200, height: 630 }
export const contentType = 'image/png'

export default function Image() {
  return new ImageResponse(
    (
      <div
        style={{
          background: 'linear-gradient(160deg, #0f172a 0%, #1e293b 60%, #0f172a 100%)',
          width: '100%', height: '100%',
          display: 'flex', flexDirection: 'column',
          alignItems: 'center', justifyContent: 'center',
          padding: '80px',
          fontFamily: 'monospace',
          position: 'relative',
        }}
      >
        {/* Dot grid overlay */}
        <div style={{ position: 'absolute', inset: 0, background: 'radial-gradient(circle at 50% 40%, rgba(29,78,216,0.18) 0%, transparent 55%)' }} />

        {/* Badge */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 18, marginBottom: 36 }}>
          <div style={{
            width: 72, height: 72, borderRadius: 16,
            background: '#1d4ed8', display: 'flex',
            alignItems: 'center', justifyContent: 'center',
            boxShadow: '0 8px 32px rgba(29,78,216,0.5)',
          }}>
            <span style={{ color: 'white', fontSize: 26, fontWeight: 900 }}>TC</span>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            <span style={{ color: 'white', fontSize: 26, fontWeight: 900, lineHeight: 1.2 }}>Trace Cohen</span>
            <span style={{ color: '#60a5fa', fontSize: 13, fontWeight: 700, letterSpacing: 4, textTransform: 'uppercase' }}>Managing Partner · NYVP</span>
          </div>
        </div>

        {/* Headline */}
        <h1 style={{ color: 'white', fontSize: 68, fontWeight: 900, textAlign: 'center', margin: '0 0 20px', lineHeight: 1.05, letterSpacing: -2 }}>
          Founder Fundraising
        </h1>
        <h1 style={{ color: '#60a5fa', fontSize: 68, fontWeight: 900, textAlign: 'center', margin: '0 0 28px', lineHeight: 1.05, letterSpacing: -2 }}>
          Coach
        </h1>

        {/* Subline */}
        <p style={{ color: '#94a3b8', fontSize: 22, textAlign: 'center', margin: '0 0 48px', maxWidth: 680, lineHeight: 1.5 }}>
          Benchmark metrics · Prep for VC meetings · Decode term sheets
        </p>

        {/* Tags */}
        <div style={{ display: 'flex', gap: 14 }}>
          {['65+ Investments', 'Real 2025 Data', 'Free & Instant'].map(tag => (
            <div key={tag} style={{
              background: 'rgba(255,255,255,0.06)',
              border: '1px solid rgba(255,255,255,0.12)',
              borderRadius: 10, padding: '10px 20px',
              color: '#94a3b8', fontSize: 15, fontWeight: 700,
              letterSpacing: 1,
            }}>
              {tag}
            </div>
          ))}
        </div>
      </div>
    ),
    { ...size }
  )
}
