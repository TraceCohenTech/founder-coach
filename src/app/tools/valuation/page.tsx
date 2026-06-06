'use client'

import { useState, useMemo } from 'react'
import Link from 'next/link'
import { RadialBarChart, RadialBar, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, Cell } from 'recharts'

const DOT_GRID = { backgroundImage: 'radial-gradient(circle, #cbd5e1 1px, transparent 1px)', backgroundSize: '24px 24px' }

const SECTOR_MULT: Record<string, number> = { 'AI / ML': 1.35, 'Defense Tech': 1.25, 'Healthcare': 1.15, 'Fintech': 1.10, 'B2B SaaS': 1.00, 'Climate': 1.05, 'Consumer': 0.85, 'Other': 1.00 }
const STAGE_BASE: Record<string, { mult: number; floor: number }> = { 'Pre-Seed': { mult: 0, floor: 3_500_000 }, 'Seed': { mult: 12, floor: 5_000_000 }, 'Series A': { mult: 10, floor: 12_000_000 }, 'Series B': { mult: 7.5, floor: 35_000_000 }, 'Series C+': { mult: 6, floor: 90_000_000 } }
const MARKET: Record<string, { p25: number; p50: number; p75: number }> = { 'Pre-Seed': { p25: 2_500_000, p50: 4_500_000, p75: 8_000_000 }, 'Seed': { p25: 6_000_000, p50: 9_000_000, p75: 15_000_000 }, 'Series A': { p25: 15_000_000, p50: 25_000_000, p75: 45_000_000 }, 'Series B': { p25: 45_000_000, p50: 65_000_000, p75: 100_000_000 }, 'Series C+': { p25: 100_000_000, p50: 180_000_000, p75: 350_000_000 } }

const fmt = (n: number) => n >= 1e9 ? `$${(n/1e9).toFixed(1)}B` : n >= 1e6 ? `$${(n/1e6).toFixed(1)}M` : `$${(n/1e3).toFixed(0)}K`

function pct(v: number, p25: number, p50: number, p75: number) {
  if (v <= p25) return Math.round(25 * v / p25)
  if (v <= p50) return Math.round(25 + 25 * (v - p25) / (p50 - p25))
  if (v <= p75) return Math.round(50 + 25 * (v - p50) / (p75 - p50))
  return Math.min(99, Math.round(75 + 24 * (v - p75) / (p75 * 1.5)))
}

export default function ValuationPage() {
  const [stage, setStage] = useState('Series A')
  const [sector, setSector] = useState('B2B SaaS')
  const [arr, setArr] = useState(2_000_000)
  const [growth, setGrowth] = useState(100)
  const [nrr, setNrr] = useState(110)
  const [sharing, setSharing] = useState(false)
  const [copied, setCopied] = useState(false)

  const res = useMemo(() => {
    const base = STAGE_BASE[stage]; const mkt = MARKET[stage]
    let m = base.mult
    if (growth >= 200) m *= 1.45; else if (growth >= 100) m *= 1.25; else if (growth >= 50) m *= 1.10; else if (growth < 20) m *= 0.80
    if (nrr >= 130) m *= 1.30; else if (nrr >= 120) m *= 1.15; else if (nrr >= 110) m *= 1.05; else if (nrr < 100) m *= 0.80
    m *= (SECTOR_MULT[sector] ?? 1)
    const mid = Math.max(arr * m, base.floor)
    const p = pct(mid, mkt.p25, mkt.p50, mkt.p75)
    const insights: { text: string; up: boolean }[] = []
    if (growth >= 150) insights.push({ text: `${growth}% YoY is exceptional — lead every pitch with this`, up: true })
    else if (growth >= 80) insights.push({ text: `${growth}% YoY is strong for ${stage}`, up: true })
    else insights.push({ text: `${growth}% growth may slow your process — VCs want acceleration`, up: false })
    if (nrr >= 120) insights.push({ text: `${nrr}% NRR is top-quartile — a real differentiator`, up: true })
    else if (nrr >= 100) insights.push({ text: `${nrr}% NRR is solid but not a standout metric`, up: true })
    else insights.push({ text: `NRR below 100% signals churn — this comes up in every diligence call`, up: false })
    if ((SECTOR_MULT[sector] ?? 1) > 1.1) insights.push({ text: `${sector} is getting a premium in 2025`, up: true })
    return { low: mid * 0.72, mid, high: mid * 1.45, p, insights, m }
  }, [stage, sector, arr, growth, nrr])

  const pctColor = res.p >= 75 ? '#059669' : res.p >= 50 ? '#d97706' : res.p >= 25 ? '#1d4ed8' : '#dc2626'
  const pctLabel = res.p >= 75 ? 'Top Quartile' : res.p >= 50 ? 'Above Median' : res.p >= 25 ? 'Below Median' : 'Bottom Quartile'
  const mkt = MARKET[stage]
  const bars = [
    { name: 'P25', value: mkt.p25, you: false },
    { name: 'Median', value: mkt.p50, you: false },
    { name: 'Your Est.', value: res.mid, you: true },
    { name: 'P75', value: mkt.p75, you: false },
  ]

  function copyShare() {
    const lines = [
      `💰 Valuation Estimate — ${stage} · ${sector} · 2025`,
      '',
      `Bear:   ${fmt(res.low)}`,
      `Base:   ${fmt(res.mid)}  ← estimate`,
      `Bull:   ${fmt(res.high)}`,
      '',
      `Market: ${res.p}th percentile · ~${res.m.toFixed(1)}x ARR`,
      '',
      ...res.insights.map(i => `${i.up ? '▲' : '▼'} ${i.text}`),
      '',
      'Modeled with Trace Cohen\'s Fundraising Coach',
      'coach.valueaddvc.com | @Trace_Cohen | t@nyvp.com',
    ].join('\n')
    navigator.clipboard.writeText(lines).then(() => {
      setCopied(true)
      setTimeout(() => setCopied(false), 2500)
    })
  }

  return (
    <div className="min-h-screen bg-gray-50" style={DOT_GRID}>
      <nav className="bg-slate-900 border-b border-white/10 px-6 py-4 flex items-center gap-4">
        <Link href="/" className="mono text-xs text-white/40 hover:text-white uppercase tracking-wide transition-colors">← Back</Link>
        <span className="text-white/20">|</span>
        <span className="text-sm font-bold text-white">💰 Valuation Estimator</span>
        <div className="ml-auto flex items-center gap-2">
          <div className="pulse-dot w-1.5 h-1.5 rounded-full bg-emerald-400" />
          <span className="mono text-xs text-white/40 uppercase">Live · 2025</span>
        </div>
      </nav>

      <div className="max-w-5xl mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-slate-900 mb-1">What&apos;s your company worth?</h1>
          <p className="text-slate-500 text-sm">Dial in your metrics. Get a benchmarked 2025 valuation range and see where you stand.</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* INPUTS */}
          <div className="space-y-4">
            {/* Stage */}
            <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm">
              <p className="mono text-xs text-slate-400 uppercase tracking-widest mb-3">Stage</p>
              <div className="grid grid-cols-3 gap-2">
                {Object.keys(STAGE_BASE).map(s => (
                  <button key={s} onClick={() => setStage(s)}
                    className={`py-2 rounded-lg mono text-xs font-bold uppercase tracking-wide transition-all border ${stage === s ? 'bg-blue-700 text-white border-blue-700 shadow-sm' : 'bg-white text-slate-500 border-slate-200 hover:border-blue-400 hover:text-blue-700'}`}>
                    {s}
                  </button>
                ))}
              </div>
            </div>

            {/* Sector */}
            <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm">
              <p className="mono text-xs text-slate-400 uppercase tracking-widest mb-3">Sector</p>
              <div className="grid grid-cols-2 gap-2">
                {Object.keys(SECTOR_MULT).map(s => (
                  <button key={s} onClick={() => setSector(s)}
                    className={`py-2 rounded-lg text-xs font-semibold transition-all border ${sector === s ? 'bg-blue-50 text-blue-700 border-blue-400' : 'bg-white text-slate-600 border-slate-200 hover:border-blue-300 hover:text-blue-700'}`}>
                    {s}
                  </button>
                ))}
              </div>
            </div>

            {/* Sliders */}
            <div className="bg-white rounded-2xl border border-slate-200 p-5 space-y-6 shadow-sm">
              <Slider label="Annual Recurring Revenue" value={arr} onChange={setArr} min={100_000} max={20_000_000} step={100_000} display={fmt(arr)} />
              <Slider label="Revenue Growth Rate (YoY)" value={growth} onChange={setGrowth} min={0} max={400} step={5} display={`${growth}%`} />
              <Slider label="Net Revenue Retention" value={nrr} onChange={setNrr} min={60} max={160} step={1} display={`${nrr}%`} />
            </div>
          </div>

          {/* RESULTS */}
          <div className="space-y-4">
            {/* Gauge */}
            <div className="bg-white rounded-2xl border border-slate-200 border-t-4 p-5 text-center shadow-sm" style={{ borderTopColor: pctColor }}>
              <p className="mono text-xs text-slate-400 uppercase tracking-widest mb-1">Market Percentile</p>
              <div className="relative h-40">
                <ResponsiveContainer width="100%" height="100%">
                  <RadialBarChart innerRadius="62%" outerRadius="90%" startAngle={200} endAngle={-20}
                    data={[{ value: res.p, fill: pctColor }]}>
                    <RadialBar dataKey="value" background={{ fill: '#f1f5f9' }} cornerRadius={6} />
                  </RadialBarChart>
                </ResponsiveContainer>
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <span className="text-4xl font-bold mono" style={{ color: pctColor }}>{res.p}<span className="text-xl">th</span></span>
                  <span className="text-xs font-bold mono uppercase tracking-wide mt-0.5" style={{ color: pctColor }}>{pctLabel}</span>
                </div>
              </div>
            </div>

            {/* Valuation range */}
            <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm">
              <p className="mono text-xs text-slate-400 uppercase tracking-widest mb-4">Estimated Valuation Range</p>
              <div className="grid grid-cols-3 gap-3">
                {[
                  { label: 'Bear Case', val: res.low, color: '#64748b' },
                  { label: 'Base Case', val: res.mid, color: '#1d4ed8' },
                  { label: 'Bull Case', val: res.high, color: '#059669' },
                ].map(({ label, val, color }) => (
                  <div key={label} className="bg-gray-50 rounded-xl p-3 text-center border border-slate-200">
                    <div className="text-xl font-bold mono" style={{ color }}>{fmt(val)}</div>
                    <div className="mono text-xs text-slate-400 uppercase mt-1">{label}</div>
                  </div>
                ))}
              </div>
              <p className="mono text-xs text-slate-400 mt-3 text-center">{stage} 2025 · ~{res.m.toFixed(1)}x ARR multiple</p>
            </div>

            {/* Bar chart */}
            <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm">
              <p className="mono text-xs text-slate-400 uppercase tracking-widest mb-4">vs. Market ({stage} 2025)</p>
              <div className="h-48">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={bars} margin={{ top: 0, right: 0, left: 0, bottom: 0 }}>
                    <XAxis dataKey="name" tick={{ fill: '#94a3b8', fontSize: 11, fontFamily: 'monospace' }} axisLine={false} tickLine={false} />
                    <YAxis tickFormatter={fmt} tick={{ fill: '#94a3b8', fontSize: 11, fontFamily: 'monospace' }} axisLine={false} tickLine={false} width={56} />
                    <Tooltip formatter={(v) => [fmt(v as number), 'Valuation']}
                      contentStyle={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: '10px', fontSize: '12px', fontFamily: 'monospace', color: '#0f172a' }} />
                    <Bar dataKey="value" radius={[5, 5, 0, 0]}>
                      {bars.map((d, i) => <Cell key={i} fill={d.you ? '#1d4ed8' : '#e2e8f0'} />)}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Trace's read */}
            <div className="bg-white rounded-2xl border border-slate-200 border-l-4 border-l-sky-500 p-5 shadow-sm">
              <div className="flex items-center justify-between mb-3">
                <p className="mono text-xs text-slate-400 uppercase tracking-widest">{'>'} Trace&apos;s Read</p>
                <button onClick={() => setSharing(true)}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-blue-50 border border-blue-200 mono text-xs text-blue-700 font-bold uppercase tracking-wide hover:bg-blue-100 transition-colors">
                  📤 Share
                </button>
              </div>
              <div className="space-y-2">
                {res.insights.map((ins, i) => (
                  <div key={i} className={`flex items-start gap-2 text-sm font-medium ${ins.up ? 'text-emerald-700' : 'text-red-600'}`}>
                    <span className="shrink-0 font-bold mono">{ins.up ? '▲' : '▼'}</span>
                    <span>{ins.text}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Share modal */}
      {sharing && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50 fade-in"
          onClick={() => setSharing(false)}>
          <div className="bg-white rounded-2xl max-w-sm w-full overflow-hidden shadow-2xl pop-in"
            onClick={e => e.stopPropagation()}>

            {/* Card header */}
            <div className="p-5" style={{ background: 'linear-gradient(135deg, #1e40af, #0ea5e9)' }}>
              <div className="flex items-center gap-2 mb-4">
                <div className="w-7 h-7 rounded-lg bg-white/20 flex items-center justify-center">
                  <span className="text-white text-xs font-black mono">TC</span>
                </div>
                <span className="text-white/70 text-xs font-bold mono uppercase tracking-widest">Trace Cohen · Fundraising Coach</span>
              </div>
              <p className="mono text-xs text-white/50 uppercase tracking-wide mb-1">{stage} · {sector} · 2025 Data</p>
              <p className="text-white text-4xl font-black mono">{fmt(res.mid)}</p>
              <p className="text-white/60 text-xs mono mt-1">Base Case · {pctLabel} ({res.p}th percentile)</p>
            </div>

            {/* Card body */}
            <div className="p-5">
              <div className="grid grid-cols-3 gap-2 mb-4">
                {[
                  { label: 'Bear', val: res.low, color: '#64748b' },
                  { label: 'Base', val: res.mid, color: '#1d4ed8' },
                  { label: 'Bull', val: res.high, color: '#059669' },
                ].map(({ label, val, color }) => (
                  <div key={label} className="bg-gray-50 rounded-xl p-2.5 text-center border border-slate-200">
                    <div className="text-sm font-black mono" style={{ color }}>{fmt(val)}</div>
                    <div className="mono text-xs text-slate-400 uppercase mt-0.5">{label}</div>
                  </div>
                ))}
              </div>

              <div className="text-xs mono text-slate-400 text-center mb-4 border-b border-slate-100 pb-3">
                ~{res.m.toFixed(1)}x ARR multiple
              </div>

              <div className="space-y-2 mb-4">
                {res.insights.map((ins, i) => (
                  <div key={i} className={`text-xs font-semibold flex items-start gap-1.5 ${ins.up ? 'text-emerald-700' : 'text-red-600'}`}>
                    <span className="font-black shrink-0">{ins.up ? '▲' : '▼'}</span>
                    <span>{ins.text}</span>
                  </div>
                ))}
              </div>

              <div className="text-center mono text-xs text-slate-400 border-t border-slate-100 pt-3 mb-4">
                coach.valueaddvc.com · @Trace_Cohen
              </div>

              <div className="flex gap-2">
                <button onClick={copyShare}
                  className="flex-1 py-2.5 rounded-xl bg-slate-900 text-white text-sm font-bold transition-all hover:bg-slate-700">
                  {copied ? '✓ Copied!' : '📋 Copy Text'}
                </button>
                <button onClick={() => setSharing(false)}
                  className="px-4 py-2.5 rounded-xl border border-slate-200 text-sm font-bold text-slate-600 hover:bg-slate-50 transition-colors">
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

function Slider({ label, value, onChange, min, max, step, display }: { label: string; value: number; onChange: (v: number) => void; min: number; max: number; step: number; display: string }) {
  return (
    <div>
      <div className="flex justify-between items-center mb-2">
        <label className="text-sm font-medium text-slate-700">{label}</label>
        <span className="text-sm font-bold text-blue-700 mono">{display}</span>
      </div>
      <input type="range" min={min} max={max} step={step} value={value} onChange={e => onChange(Number(e.target.value))} className="w-full" />
    </div>
  )
}
