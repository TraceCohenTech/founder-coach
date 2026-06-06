'use client'

import { useEffect, useState, useMemo } from 'react'
import { UserProfile } from '@/lib/system-prompt'

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

// ── Scoring ───────────────────────────────────────────────────────────────────
function calcScore(p: UserProfile): { score: number; insights: { good: boolean; text: string }[] } {
  let s = 0
  const ins: { good: boolean; text: string }[] = []

  // ARR vs stage alignment (0–40)
  const arrIdx: Record<string, number> = {
    'Pre-revenue': 0, '<$10K MRR': 1, '$10K–$50K MRR': 2,
    '$50K–$200K MRR': 3, '$200K–$500K MRR': 4,
    '$500K–$2M ARR': 5, '$2M–$10M ARR': 6, '$10M+ ARR': 7,
  }
  const stageTarget: Record<string, number> = {
    'Pre-Seed': 0, 'Seed': 2, 'Series A': 5, 'Series B': 6, 'Series C+': 7,
  }
  const diff = (arrIdx[p.arr] ?? 2) - (stageTarget[p.stage] ?? 3)
  const arrPts = Math.max(0, Math.min(40, 20 + diff * 8))
  s += arrPts
  ins.push(diff >= 0
    ? { good: true,  text: `${p.arr} is in the right range for ${p.stage}` }
    : { good: false, text: `${p.arr} may be light for ${p.stage} — VCs will probe this first` })

  // Growth (0–35)
  const growthPts: Record<string, number> = {
    'Pre-revenue / no data yet': 15, '<5% MoM': 8, '5–10% MoM': 18,
    '10–20% MoM': 26, '20–30% MoM': 32, '30%+ MoM': 35,
    '2–3x YoY': 28, '3x+ YoY': 35,
  }
  const gPts = growthPts[p.growth] ?? 15
  s += gPts
  ins.push(gPts >= 28
    ? { good: true,  text: `${p.growth} growth is a standout signal — lead every pitch with it` }
    : gPts >= 18
    ? { good: true,  text: `${p.growth} growth is solid — benchmark it vs. category leaders` }
    : { good: false, text: `${p.growth} growth will get hard questions — have an acceleration story` })

  // Sector premium (0–15)
  const sectorPts: Record<string, number> = {
    'AI / ML': 15, 'Defense Tech': 14, 'Healthcare': 12,
    'Fintech': 11, 'B2B SaaS': 10, 'Climate': 10, 'Consumer': 7, 'Other': 8,
  }
  const sPts = sectorPts[p.sector] ?? 9
  s += sPts
  if (sPts >= 12) ins.push({ good: true,  text: `${p.sector} is commanding a premium from VCs in 2025` })
  else if (sPts <= 7) ins.push({ good: false, text: `${p.sector} faces more skepticism — nail your differentiation` })

  // Geo (0–10)
  const geoPts: Record<string, number> = {
    'San Francisco / Bay Area': 10, 'New York': 9,
    'Los Angeles': 8, 'Austin': 8, 'Miami': 7, 'Europe': 7, 'Other': 6,
  }
  s += geoPts[p.geo] ?? 7

  return { score: Math.min(100, Math.round(s)), insights: ins.slice(0, 4) }
}

function getGrade(score: number) {
  if (score >= 80) return { label: 'Raise-Ready',    color: '#059669', desc: "Fundamentals are there. Execution is everything now." }
  if (score >= 65) return { label: 'Getting There',  color: '#1d4ed8', desc: "Solid base with a few gaps. Fix the reds before going wide." }
  if (score >= 50) return { label: 'Almost Ready',   color: '#d97706', desc: "Key gaps will stall your process. Address them first." }
  return              { label: 'Not Ready Yet',   color: '#dc2626', desc: "Significant issues VCs will find. Work these before starting." }
}

// ── SVG Gauge (270° arc) ──────────────────────────────────────────────────────
const R = 70, CX = 90, CY = 92
const CIRC   = 2 * Math.PI * R   // ≈ 439.8
const ARC270 = CIRC * 0.75       // ≈ 329.9

export default function ReadinessScore({ profile, onContinue, onBack }: { profile: UserProfile; onContinue: () => void; onBack: () => void }) {
  const [show, setShow]   = useState(false)
  const [disp, setDisp]   = useState(0)
  const { score, insights } = useMemo(() => calcScore(profile), [profile])
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

  const filled  = ARC270 * (disp / 100)
  const fgDash  = `${filled} ${CIRC}`
  const bgDash  = `${ARC270} ${CIRC}`

  return (
    <div className="min-h-screen bg-slate-900 flex flex-col items-center justify-center relative overflow-hidden px-4 py-8">
      {/* Confetti particles */}
      {PARTICLES.map(p => (
        <div key={p.id} style={{
          position: 'fixed', left: `${p.left}%`, top: '-14px',
          width: p.w, height: p.h, background: p.color,
          borderRadius: 2, opacity: 0, zIndex: 100, pointerEvents: 'none',
          animation: `confettiFall ${p.dur}s ${p.delay}s ease-in both`,
        }} />
      ))}

      {/* Background */}
      <div className="absolute inset-0 pointer-events-none"
        style={{ backgroundImage: 'radial-gradient(circle, rgba(255,255,255,0.04) 1px, transparent 1px)', backgroundSize: '28px 28px' }} />
      <div className="absolute inset-0 pointer-events-none"
        style={{ background: `radial-gradient(ellipse at 50% 50%, ${color}20 0%, transparent 60%)` }} />

      {/* Score card */}
      <div className="relative z-10 w-full max-w-md bg-white rounded-3xl shadow-2xl overflow-hidden"
        style={{ opacity: show ? 1 : 0, transform: show ? 'translateY(0) scale(1)' : 'translateY(28px) scale(0.95)', transition: 'all 0.6s cubic-bezier(0.34,1.56,0.64,1)' }}>

        {/* Top bar */}
        <div className="h-2" style={{ background: `linear-gradient(90deg, ${color}, ${color}80, #60a5fa)` }} />

        <div className="p-7">
          {/* Gauge */}
          <div className="text-center mb-6">
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

          {/* Insights */}
          <div className="space-y-2 mb-6">
            {insights.map((ins, i) => (
              <div key={i}
                className="flex items-start gap-3 px-3.5 py-2.5 rounded-xl text-sm font-medium"
                style={{
                  background: ins.good ? '#ecfdf5' : '#fef2f2',
                  border: `1px solid ${ins.good ? '#bbf7d0' : '#fecaca'}`,
                  opacity: show ? 1 : 0, transform: show ? 'translateX(0)' : 'translateX(-10px)',
                  transition: `all 0.45s ease ${0.7 + i * 0.12}s`,
                }}>
                <span className="shrink-0 font-black" style={{ color: ins.good ? '#059669' : '#dc2626' }}>
                  {ins.good ? '▲' : '▼'}
                </span>
                <span style={{ color: ins.good ? '#065f46' : '#7f1d1d' }}>{ins.text}</span>
              </div>
            ))}
          </div>

          {/* Profile chips */}
          <div className="grid grid-cols-2 gap-2 mb-6">
            {[
              { k: 'Stage',   v: profile.stage },
              { k: 'Sector',  v: profile.sector },
              { k: 'Revenue', v: profile.arr },
              { k: 'Growth',  v: profile.growth },
            ].map(({ k, v }) => (
              <div key={k} className="bg-slate-50 border border-slate-200 rounded-xl px-3 py-2">
                <div className="mono text-xs text-slate-400 uppercase tracking-wide mb-0.5">{k}</div>
                <div className="text-sm font-bold text-slate-900 truncate">{v}</div>
              </div>
            ))}
          </div>

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
