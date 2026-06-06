'use client'

import { useState, useMemo } from 'react'
import Link from 'next/link'
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from 'recharts'

const DOT_GRID = { backgroundImage: 'radial-gradient(circle, #cbd5e1 1px, transparent 1px)', backgroundSize: '24px 24px' }
const COLORS = ['#1d4ed8', '#0ea5e9', '#059669', '#d97706']

interface Round { id: number; name: string; raise: number; preMoney: number }

const fmt = (n: number) => n >= 1e9 ? `$${(n/1e9).toFixed(2)}B` : n >= 1e6 ? `$${(n/1e6).toFixed(1)}M` : `$${(n/1e3).toFixed(0)}K`

function calc(founder: number, pool: number, rounds: Round[]) {
  let f = founder, p = pool
  const investors: { pct: number; name: string }[] = []
  for (const r of rounds) {
    const post = r.preMoney + r.raise
    const np = (r.raise / post) * 100
    const d = 1 - np / 100
    f *= d; p *= d
    for (const inv of investors) inv.pct *= d
    investors.push({ pct: np, name: r.name })
  }
  return { founder: f, pool: p, investors }
}

const Tip = ({ active, payload }: any) => active && payload?.length
  ? <div className="bg-white border border-slate-200 rounded-lg px-3 py-2 text-xs mono shadow-md"><span className="text-slate-900 font-bold">{payload[0].name}:</span> <span className="text-blue-700">{payload[0].value.toFixed(1)}%</span></div>
  : null

export default function DilutionPage() {
  const [founderPct, setFounderPct] = useState(80)
  const [poolPct, setPoolPct] = useState(10)
  const [rounds, setRounds] = useState<Round[]>([{ id: 1, name: 'Seed', raise: 2_000_000, preMoney: 8_000_000 }])

  const after = useMemo(() => calc(founderPct, poolPct, rounds), [founderPct, poolPct, rounds])

  const beforePie = [
    { name: 'Founders', value: founderPct },
    { name: 'Option Pool', value: poolPct },
    ...(100 - founderPct - poolPct > 0 ? [{ name: 'Other', value: 100 - founderPct - poolPct }] : []),
  ]
  const afterPie = [
    { name: 'Founders', value: parseFloat(after.founder.toFixed(1)) },
    { name: 'Option Pool', value: parseFloat(after.pool.toFixed(1)) },
    ...after.investors.map(inv => ({ name: inv.name, value: parseFloat(inv.pct.toFixed(1)) })),
  ].filter(d => d.value > 0)
  const afterColors = ['#1d4ed8', '#0ea5e9', ...rounds.map((_, i) => COLORS[i % COLORS.length])]

  function addRound() {
    if (rounds.length >= 4) return
    const defs = [{ name: 'Seed', raise: 2_000_000, preMoney: 8_000_000 }, { name: 'Series A', raise: 10_000_000, preMoney: 40_000_000 }, { name: 'Series B', raise: 25_000_000, preMoney: 100_000_000 }, { name: 'Series C', raise: 60_000_000, preMoney: 300_000_000 }]
    setRounds(p => [...p, { id: Date.now(), ...defs[p.length] ?? defs[3] }])
  }

  function upd(id: number, field: keyof Round, v: number | string) { setRounds(p => p.map(r => r.id === id ? { ...r, [field]: v } : r)) }

  const diluted = founderPct - after.founder
  const ownerColor = after.founder >= 50 ? '#059669' : after.founder >= 30 ? '#1d4ed8' : after.founder >= 20 ? '#d97706' : '#dc2626'
  const traceMsg = after.founder >= 50 ? `You'd own ${after.founder.toFixed(1)}% — well above median. Most founders exit with 15–25% by Series B. You're in great shape.`
    : after.founder >= 30 ? `${after.founder.toFixed(1)}% is healthy and above median. Keep pushing pre-money valuations up on future rounds to protect this.`
    : after.founder >= 20 ? `${after.founder.toFixed(1)}% is below what I'd want to see. Raise on higher valuations or raise less to protect your stake.`
    : `${after.founder.toFixed(1)}% is over-diluted. This creates misalignment risk and will come up in future fundraises.`

  return (
    <div className="min-h-screen bg-gray-50" style={DOT_GRID}>
      <nav className="bg-slate-900 border-b border-white/10 px-6 py-4 flex items-center gap-4">
        <Link href="/" className="mono text-xs text-white/40 hover:text-white uppercase tracking-wide transition-colors">← Back</Link>
        <span className="text-white/20">|</span>
        <span className="text-sm font-bold text-white">📉 Dilution Simulator</span>
        <div className="ml-auto flex items-center gap-2">
          <div className="pulse-dot w-1.5 h-1.5 rounded-full bg-emerald-400" />
          <span className="mono text-xs text-white/40 uppercase">Interactive</span>
        </div>
      </nav>

      <div className="max-w-5xl mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-slate-900 mb-1">Model your dilution</h1>
          <p className="text-slate-500 text-sm">See exactly how each round affects your ownership — and what you&apos;ll actually own at exit.</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* INPUTS */}
          <div className="space-y-4">
            <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm">
              <p className="mono text-xs text-slate-400 uppercase tracking-widest mb-4">Current Cap Table</p>
              <div className="space-y-5">
                <Slider label="Your Ownership" value={founderPct} onChange={setFounderPct} min={1} max={100} step={1} display={`${founderPct}%`} />
                <Slider label="Option Pool" value={poolPct} onChange={setPoolPct} min={0} max={30} step={1} display={`${poolPct}%`} />
                <div className="flex justify-between mono text-xs text-slate-400 pt-3 border-t border-slate-100">
                  <span className="uppercase tracking-wide">Other / existing investors</span>
                  <span className="font-bold text-slate-600">{Math.max(0, 100 - founderPct - poolPct).toFixed(0)}%</span>
                </div>
              </div>
            </div>

            {rounds.map((r, idx) => (
              <div key={r.id} className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm fade-in">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-sm" style={{ background: COLORS[idx % COLORS.length] }} />
                    <input value={r.name} onChange={e => upd(r.id, 'name', e.target.value)}
                      className="text-sm font-bold text-slate-900 bg-transparent outline-none border-b border-transparent hover:border-slate-300 focus:border-blue-500 transition-colors w-28 mono" />
                  </div>
                  <button onClick={() => setRounds(p => p.filter(x => x.id !== r.id))}
                    className="text-slate-300 hover:text-red-500 transition-colors text-xl leading-none">×</button>
                </div>
                <div className="space-y-4">
                  <Slider label="Amount Raised" value={r.raise} onChange={v => upd(r.id, 'raise', v)} min={250_000} max={100_000_000} step={250_000} display={fmt(r.raise)} />
                  <Slider label="Pre-money Valuation" value={r.preMoney} onChange={v => upd(r.id, 'preMoney', v)} min={1_000_000} max={500_000_000} step={1_000_000} display={fmt(r.preMoney)} />
                  <div className="flex justify-between mono text-xs pt-3 border-t border-slate-100">
                    <span className="text-slate-400 uppercase tracking-wide">Post-money <span className="text-slate-700 font-bold">{fmt(r.raise + r.preMoney)}</span></span>
                    <span className="text-slate-400 uppercase tracking-wide">Investor gets <span className="text-blue-700 font-bold">{((r.raise / (r.raise + r.preMoney)) * 100).toFixed(1)}%</span></span>
                  </div>
                </div>
              </div>
            ))}

            {rounds.length < 4 && (
              <button onClick={addRound}
                className="w-full py-3 rounded-2xl border-2 border-dashed border-slate-300 bg-white text-sm mono text-slate-400 hover:border-blue-400 hover:text-blue-700 hover:bg-blue-50 transition-all uppercase tracking-wide font-semibold">
                + Add Round
              </button>
            )}
          </div>

          {/* RESULTS */}
          <div className="space-y-4">
            <div className="grid grid-cols-3 gap-3">
              {[
                { label: 'You own now', val: `${founderPct}%`, color: '#0f172a' },
                { label: 'After rounds', val: `${after.founder.toFixed(1)}%`, color: ownerColor },
                { label: 'Diluted by', val: `${diluted.toFixed(1)}%`, color: '#d97706' },
              ].map(({ label, val, color }) => (
                <div key={label} className="bg-white rounded-xl border border-slate-200 border-t-4 p-3 text-center shadow-sm" style={{ borderTopColor: color }}>
                  <div className="text-xl font-bold mono" style={{ color }}>{val}</div>
                  <div className="mono text-xs text-slate-400 uppercase mt-1 tracking-wide">{label}</div>
                </div>
              ))}
            </div>

            {/* Pie charts */}
            <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm">
              <div className="grid grid-cols-2 gap-4">
                {[
                  { title: 'Before', data: beforePie, colors: ['#1d4ed8', '#0ea5e9', '#e2e8f0'] },
                  { title: 'After', data: afterPie, colors: afterColors },
                ].map(({ title, data, colors }) => (
                  <div key={title}>
                    <p className="mono text-xs text-slate-400 uppercase tracking-widest text-center mb-3">{title}</p>
                    <div className="h-44">
                      <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                          <Pie data={data} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={66} innerRadius={34} paddingAngle={2}>
                            {data.map((_, i) => <Cell key={i} fill={colors[i % colors.length]} stroke="white" strokeWidth={2} />)}
                          </Pie>
                          <Tooltip content={<Tip />} />
                        </PieChart>
                      </ResponsiveContainer>
                    </div>
                  </div>
                ))}
              </div>
              <div className="flex flex-wrap gap-x-4 gap-y-1.5 mt-3 justify-center border-t border-slate-100 pt-3">
                {afterPie.map((d, i) => (
                  <div key={d.name} className="flex items-center gap-1.5 mono text-xs text-slate-500">
                    <div className="w-2.5 h-2.5 rounded-sm" style={{ background: afterColors[i] }} />
                    {d.name}: {d.value.toFixed(1)}%
                  </div>
                ))}
              </div>
            </div>

            {/* Waterfall */}
            <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm">
              <p className="mono text-xs text-slate-400 uppercase tracking-widest mb-4">Ownership Waterfall</p>
              <div className="space-y-3">
                <WRow label="Starting" pct={founderPct} color="#1d4ed8" />
                {rounds.map((r, i) => {
                  const s = calc(founderPct, poolPct, rounds.slice(0, i + 1))
                  return <WRow key={r.id} label={`After ${r.name}`} pct={s.founder} color={COLORS[i % COLORS.length]} sub={`−${(founderPct - s.founder).toFixed(1)}pp total dilution`} />
                })}
              </div>
            </div>

            {/* Trace's take */}
            <div className="bg-white rounded-2xl border border-slate-200 border-l-4 border-l-sky-500 p-5 shadow-sm">
              <p className="mono text-xs text-slate-400 uppercase tracking-widest mb-2">{'>'} Trace&apos;s Take</p>
              <p className="text-sm text-slate-700 leading-relaxed">{traceMsg}</p>
            </div>
          </div>
        </div>
      </div>
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

function WRow({ label, pct, color, sub }: { label: string; pct: number; color: string; sub?: string }) {
  return (
    <div>
      <div className="flex justify-between mono text-xs text-slate-500 mb-1.5">
        <span className="uppercase tracking-wide">{label}</span>
        <span className="font-bold text-slate-900">{pct.toFixed(1)}%</span>
      </div>
      <div className="h-2 bg-slate-100 rounded-full overflow-hidden border border-slate-200">
        <div className="h-full rounded-full transition-all duration-500" style={{ width: `${Math.min(pct, 100)}%`, background: color }} />
      </div>
      {sub && <p className="mono text-xs text-slate-400 mt-1">{sub}</p>}
    </div>
  )
}
