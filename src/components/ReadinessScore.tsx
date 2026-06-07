'use client'

import { useEffect, useState, useMemo } from 'react'
import { UserProfile } from '@/lib/system-prompt'
import { calcScore, getGrade, getComponentScores, getScorePushes } from '@/lib/scoring'

// ── Confetti ──────────────────────────────────────────────────────────────────
const CONFETTI_COLORS = ['#1d4ed8','#0ea5e9','#059669','#d97706','#f43f5e','#06b6d4','#f97316','#10b981']

const PARTICLES = Array.from({ length: 60 }, (_, i) => ({
  id: i,
  left: ((i * 37 + 3) % 97) + 1,
  color: CONFETTI_COLORS[i % CONFETTI_COLORS.length],
  w: 6 + (i % 5),
  h: 8 + (i % 4) * 3,
  delay: (i * 71 % 180) / 100,
  dur: 1.5 + (i * 13 % 14) / 10,
}))

// ── SVG Gauge ─────────────────────────────────────────────────────────────────
const R = 70, CX = 90, CY = 92
const CIRC   = 2 * Math.PI * R
const ARC270 = CIRC * 0.75

export default function ReadinessScore({ profile, onContinue, onBack }: { profile: UserProfile; onContinue: () => void; onBack: () => void }) {
  const [show, setShow]     = useState(false)
  const [disp, setDisp]     = useState(0)
  const [shared, setShared] = useState(false)

  const { score, insights } = useMemo(() => calcScore(profile), [profile])
  const components          = useMemo(() => getComponentScores(profile), [profile])
  const pushes              = useMemo(() => getScorePushes(profile), [profile])
  const { label, color, desc } = getGrade(score)

  useEffect(() => { const t = setTimeout(() => setShow(true), 350); return () => clearTimeout(t) }, [])

  useEffect(() => {
    if (!show) return
    let t0: number | null = null
    const dur = 1700
    const go = (ts: number) => {
      if (!t0) t0 = ts
      const p = Math.min((ts - t0) / dur, 1)
      setDisp(Math.floor((1 - Math.pow(1 - p, 3)) * score))
      if (p < 1) requestAnimationFrame(go)
    }
    requestAnimationFrame(go)
  }, [show, score])

  function shareScore() {
    const sectorStr = profile.sector.join(', ')
    const text = `📊 Just benchmarked my fundraise with @Trace_Cohen's AI Coach\n\nScore: ${score}/100 — ${label}\nStage: ${profile.stage} | Sector: ${sectorStr}\nARR: ${profile.arr} | Growth: ${profile.growth}\nBased in: ${profile.geo}\n\nFree & instant → founder-coach.vercel.app\n#startups #vc #fundraising`
    navigator.clipboard.writeText(text).catch(() => {})
    setShared(true)
    setTimeout(() => setShared(false), 2500)
  }

  const filled = ARC270 * (disp / 100)
  const fgDash = `${filled} ${CIRC}`
  const bgDash = `${ARC270} ${CIRC}`

  const bars = [
    { label: 'Revenue Fit', pts: components.arrPts, max: 40, color: '#1d4ed8' },
    { label: 'Growth',      pts: components.gPts,   max: 35, color: '#059669' },
    { label: 'Sector',      pts: components.sPts,   max: 15, color: '#0ea5e9' },
    { label: 'Geography',   pts: components.geoPt,  max: 10, color: '#d97706' },
  ]

  return (
    <div className="min-h-screen bg-slate-900 flex flex-col items-center justify-center relative overflow-hidden px-4 py-8">
      {/* Confetti */}
      {PARTICLES.map(p => (
        <div key={p.id} style={{
          position: 'fixed', left: `${p.left}%`, top: '-14px',
          width: p.w, height: p.h, background: p.color,
          borderRadius: 2, opacity: 0, zIndex: 100, pointerEvents: 'none',
          animation: `confettiFall ${p.dur}s ${p.delay}s ease-in both`,
        }} />
      ))}

      <div className="absolute inset-0 pointer-events-none"
        style={{ backgroundImage: 'radial-gradient(circle, rgba(255,255,255,0.04) 1px, transparent 1px)', backgroundSize: '28px 28px' }} />
      <div className="absolute inset-0 pointer-events-none"
        style={{ background: `radial-gradient(ellipse at 50% 50%, ${color}20 0%, transparent 60%)` }} />

      {/* Card */}
      <div className="relative z-10 w-full max-w-md bg-white rounded-3xl shadow-2xl overflow-hidden"
        style={{ opacity: show ? 1 : 0, transform: show ? 'translateY(0) scale(1)' : 'translateY(28px) scale(0.95)', transition: 'all 0.6s cubic-bezier(0.34,1.56,0.64,1)' }}>

        <div className="h-2" style={{ background: `linear-gradient(90deg, ${color}, ${color}80, #60a5fa)` }} />

        <div className="p-7">
          {/* Gauge */}
          <div className="text-center mb-4">
            <p className="mono text-xs text-slate-400 uppercase tracking-widest mb-4">Fundraise Readiness Score</p>
            <div className="flex justify-center mb-3">
              <svg width="180" height="162" viewBox="0 0 180 162">
                <circle cx={CX} cy={CY} r={R} fill="none" stroke="#e2e8f0" strokeWidth="13"
                  strokeDasharray={bgDash} strokeLinecap="round"
                  transform={`rotate(135 ${CX} ${CY})`} />
                <circle cx={CX} cy={CY} r={R} fill="none" stroke={color} strokeWidth="13"
                  strokeDasharray={fgDash} strokeLinecap="round"
                  transform={`rotate(135 ${CX} ${CY})`}
                  style={{ transition: 'stroke-dasharray 0.04s linear' }} />
                <text x={CX} y={CY - 5} textAnchor="middle" fontSize="38" fontWeight="900"
                  fill={color} fontFamily="monospace">{disp}</text>
                <text x={CX} y={CY + 20} textAnchor="middle" fontSize="10"
                  fill="#94a3b8" fontFamily="monospace" letterSpacing="2" fontWeight="700">/ 100</text>
              </svg>
            </div>
            <div className="inline-flex items-center gap-2 rounded-full px-4 py-1.5 mb-2"
              style={{ background: `${color}12`, border: `1.5px solid ${color}35` }}>
              <div className="w-2 h-2 rounded-full" style={{ background: color }} />
              <span className="mono text-sm font-black uppercase tracking-widest" style={{ color }}>{label}</span>
            </div>
            <p className="text-sm text-slate-500 max-w-xs mx-auto leading-relaxed">{desc}</p>
          </div>

          {/* Score breakdown bars */}
          <div className="bg-slate-50 rounded-xl p-4 mb-5 space-y-2.5"
            style={{ opacity: show ? 1 : 0, transition: 'opacity 0.5s ease 0.8s' }}>
            {bars.map((bar, i) => (
              <div key={bar.label}>
                <div className="flex items-center justify-between mb-1">
                  <span className="mono text-xs font-bold text-slate-500 uppercase tracking-wide">{bar.label}</span>
                  <span className="mono text-xs font-black" style={{ color: bar.color }}>{bar.pts}/{bar.max}</span>
                </div>
                <div className="h-1.5 bg-slate-200 rounded-full overflow-hidden">
                  <div className="h-full rounded-full" style={{
                    width: show ? `${(bar.pts / bar.max) * 100}%` : '0%',
                    background: bar.color,
                    transition: `width 1.2s cubic-bezier(0.4,0,0.2,1) ${0.9 + i * 0.1}s`,
                  }} />
                </div>
              </div>
            ))}
          </div>

          {/* Insights */}
          <div className="space-y-2 mb-5">
            {insights.map((ins, i) => (
              <div key={i} className="flex items-start gap-3 px-3.5 py-2.5 rounded-xl text-sm font-medium"
                style={{
                  background: ins.good ? '#ecfdf5' : '#fef2f2',
                  border: `1px solid ${ins.good ? '#bbf7d0' : '#fecaca'}`,
                  opacity: show ? 1 : 0, transform: show ? 'translateX(0)' : 'translateX(-10px)',
                  transition: `all 0.45s ease ${1.2 + i * 0.12}s`,
                }}>
                <span className="shrink-0 font-black" style={{ color: ins.good ? '#059669' : '#dc2626' }}>
                  {ins.good ? '▲' : '▼'}
                </span>
                <span style={{ color: ins.good ? '#065f46' : '#7f1d1d' }}>{ins.text}</span>
              </div>
            ))}
          </div>

          {/* Profile chips */}
          <div className="grid grid-cols-2 gap-2 mb-5">
            {[
              { k: 'Stage',   v: profile.stage },
              { k: 'Sector',  v: profile.sector.join(', ') },
              { k: 'Revenue', v: profile.arr },
              { k: 'Growth',  v: profile.growth },
            ].map(({ k, v }) => (
              <div key={k} className="bg-slate-50 border border-slate-200 rounded-xl px-3 py-2">
                <div className="mono text-xs text-slate-400 uppercase tracking-wide mb-0.5">{k}</div>
                <div className="text-sm font-bold text-slate-900 truncate">{v}</div>
              </div>
            ))}
          </div>

          {/* What gets you to 80 */}
          {score < 80 && pushes.length > 0 && (
            <div className="mb-5 rounded-xl overflow-hidden border border-amber-200"
              style={{ opacity: show ? 1 : 0, transition: 'opacity 0.5s ease 1.4s' }}>
              <div className="h-1" style={{ background: 'linear-gradient(90deg, #d97706, #f59e0b)' }} />
              <div className="bg-amber-50 p-4">
                <p className="mono text-xs font-bold uppercase tracking-widest text-amber-700 mb-3">
                  What gets you to 80
                </p>
                <div className="space-y-2.5">
                  {pushes.map((push, i) => (
                    <div key={i} className="flex items-center justify-between gap-3">
                      <div>
                        <span className="mono text-xs font-bold uppercase tracking-wide text-amber-600">{push.dimension}</span>
                        <p className="text-sm font-bold text-slate-800">{push.action}</p>
                      </div>
                      <span className="shrink-0 mono text-sm font-black text-emerald-600">+{push.pts}pts</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Subscribe CTA */}
          <div className="mb-4 rounded-xl border border-slate-200 overflow-hidden"
            style={{ opacity: show ? 1 : 0, transition: 'opacity 0.5s ease 1.5s' }}>
            <div className="h-1" style={{ background: 'linear-gradient(90deg, #1d4ed8, #0ea5e9)' }} />
            <div className="p-4 bg-slate-50 flex items-center justify-between gap-3">
              <div>
                <p className="mono text-xs font-bold uppercase tracking-widest text-slate-500 mb-0.5">📬 Trace&apos;s VC insights</p>
                <p className="text-xs text-slate-400">Weekly dealflow data for founders</p>
              </div>
              <a href="https://startupstechvc.beehiiv.com/subscribe" target="_blank" rel="noreferrer"
                className="shrink-0 px-4 py-2 rounded-lg text-white text-xs font-bold transition-colors hover:opacity-90"
                style={{ background: '#1d4ed8' }}>
                Subscribe →
              </a>
            </div>
          </div>

          {/* Share */}
          <button onClick={shareScore}
            className="w-full py-2.5 rounded-xl border text-sm font-bold transition-all mb-3"
            style={shared
              ? { background: '#ecfdf5', borderColor: '#bbf7d0', color: '#059669' }
              : { background: 'white', borderColor: '#e2e8f0', color: '#475569' }}>
            {shared ? '✓ Copied — paste on X' : '📤 Share your score'}
          </button>

          <button onClick={onContinue}
            className="w-full py-4 rounded-xl text-white font-black text-base shadow-lg hover:-translate-y-0.5 hover:shadow-xl transition-all mb-3"
            style={{ background: `linear-gradient(135deg, ${color}, ${color}cc)` }}>
            Let&apos;s get coaching →
          </button>
          <button onClick={onBack}
            className="w-full py-2.5 rounded-xl bg-slate-100 text-slate-500 text-sm font-bold hover:bg-slate-200 hover:text-slate-700 transition-colors">
            ← Change my answers
          </button>
        </div>
      </div>

      <p className="relative z-10 mono text-xs text-white/25 uppercase tracking-widest mt-5">
        <a href="https://x.com/Trace_Cohen" className="hover:text-white/50 transition-colors">@Trace_Cohen</a>
        {' · '}
        <a href="mailto:t@nyvp.com" className="hover:text-white/50 transition-colors">t@nyvp.com</a>
      </p>
    </div>
  )
}
