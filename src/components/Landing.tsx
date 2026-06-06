'use client'

import { useEffect, useRef, useState } from 'react'
import Link from 'next/link'

const DOT_GRID = { backgroundImage: 'radial-gradient(circle, #cbd5e1 1px, transparent 1px)', backgroundSize: '24px 24px' }

const TICKER_ITEMS = [
  'SEED MEDIAN: $8M PRE', 'SERIES A MEDIAN: $25M', 'SERIES A ARR: $2.1M+',
  'TOP-QUARTILE NRR: 130%+', 'HOT SECTOR: AI / ML', 'AVG CLOSE TIME: 4–6 MO',
  'DEFENSE TECH PREMIUM: +25%', 'SERIES B MEDIAN: $65M', '2025 MARKET DATA',
]

const STATS = [
  { value: 65,  suffix: '+', label: 'Companies Invested' },
  { value: 25,  prefix: '$', suffix: 'M', label: 'Median Series A' },
  { value: 12,  suffix: '+', label: 'Years Both Sides' },
  { value: 500, suffix: '+', label: 'Founders Coached' },
]

const FEATURES = [
  {
    icon: '🎯', color: '#1d4ed8', bg: '#eff6ff',
    title: 'Benchmark Your Metrics',
    desc: 'Know exactly where you stand vs. 2025 market comps — ARR multiples, NRR expectations, growth rates by stage and sector.',
  },
  {
    icon: '💰', color: '#059669', bg: '#ecfdf5',
    title: 'Valuation Estimator',
    desc: 'Interactive model based on real 2025 deal data. Get a bear/base/bull range — not a random guess.',
    href: '/tools/valuation',
  },
  {
    icon: '📉', color: '#0ea5e9', bg: '#f0f9ff',
    title: 'Dilution Simulator',
    desc: "Model each funding round and see exactly what you'll own. Understand the math before you sign.",
    href: '/tools/dilution',
  },
  {
    icon: '🤝', color: '#d97706', bg: '#fffbeb',
    title: 'VC Meeting Prep',
    desc: "Know what they're going to push back on before the meeting. Have a crisp answer ready for every hard question.",
  },
  {
    icon: '📋', color: '#7c3aed', bg: '#f5f3ff',
    title: 'Term Sheet Decoder',
    desc: 'Liquidation preferences, pro-rata, anti-dilution — explained in plain English with the real economic impact.',
  },
  {
    icon: '⚡', color: '#dc2626', bg: '#fef2f2',
    title: 'Run a Real Process',
    desc: 'How to create urgency, manage parallel conversations, and close on your terms — not theirs.',
  },
]

function useCounter(target: number, duration = 1800, active = false) {
  const [val, setVal] = useState(0)
  useEffect(() => {
    if (!active) return
    let start: number | null = null
    const tick = (ts: number) => {
      if (!start) start = ts
      const p = Math.min((ts - start) / duration, 1)
      const ease = 1 - Math.pow(1 - p, 3) // ease-out cubic
      setVal(Math.floor(ease * target))
      if (p < 1) requestAnimationFrame(tick)
    }
    requestAnimationFrame(tick)
  }, [target, duration, active])
  return active ? val : 0
}

function StatBlock({ value, prefix = '', suffix, label, active }: { value: number; prefix?: string; suffix: string; label: string; active: boolean }) {
  const n = useCounter(value, 1600, active)
  return (
    <div className="text-center py-2">
      <div className="text-4xl lg:text-5xl font-black text-white mono tracking-tight mb-1">
        {prefix}{n}{suffix}
      </div>
      <div className="text-white/70 text-xs mono uppercase tracking-widest">{label}</div>
    </div>
  )
}

export default function Landing({ onStart }: { onStart: () => void }) {
  const statsRef = useRef<HTMLDivElement>(null)
  const [statsVisible, setStatsVisible] = useState(false)
  const [scrolled, setScrolled] = useState(false)

  useEffect(() => {
    const obs = new IntersectionObserver(([e]) => { if (e.isIntersecting) setStatsVisible(true) }, { threshold: 0.4 })
    if (statsRef.current) obs.observe(statsRef.current)
    return () => obs.disconnect()
  }, [])

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20)
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  const tickerText = TICKER_ITEMS.map(t => `${t}  ·  `).join('')

  return (
    <div className="min-h-screen bg-white">

      {/* ── Fixed Nav ─────────────────────────────── */}
      <nav className={`fixed top-0 left-0 right-0 z-50 px-5 py-3 flex items-center justify-between transition-all duration-300 ${scrolled ? 'bg-white/95 backdrop-blur-sm shadow-sm border-b border-slate-100' : 'bg-transparent'}`}>
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-blue-700 flex items-center justify-center shadow-sm">
            <span className="text-white text-xs font-black mono">TC</span>
          </div>
          <span className={`text-sm font-bold transition-colors ${scrolled ? 'text-slate-900' : 'text-white'}`}>
            Fundraising Coach
          </span>
        </div>
        <div className="flex items-center gap-3">
          <Link href="/tools/valuation"
            className={`hidden sm:block text-xs mono font-semibold uppercase tracking-wide transition-colors ${scrolled ? 'text-slate-500 hover:text-blue-700' : 'text-white/50 hover:text-white'}`}>
            💰 Valuation
          </Link>
          <Link href="/tools/dilution"
            className={`hidden sm:block text-xs mono font-semibold uppercase tracking-wide transition-colors ${scrolled ? 'text-slate-500 hover:text-blue-700' : 'text-white/50 hover:text-white'}`}>
            📉 Dilution
          </Link>
          <button onClick={onStart}
            className="px-4 py-2 rounded-lg bg-blue-600 text-white text-sm font-bold hover:bg-blue-500 transition-all shadow-md hover:shadow-blue-500/30 hover:-translate-y-px">
            Start Free →
          </button>
        </div>
      </nav>

      {/* ── Hero ──────────────────────────────────── */}
      <div className="bg-slate-900 min-h-screen flex flex-col relative overflow-hidden pt-16">
        {/* Dot grid overlay */}
        <div className="absolute inset-0 pointer-events-none" style={{ backgroundImage: 'radial-gradient(circle, rgba(255,255,255,0.04) 1px, transparent 1px)', backgroundSize: '28px 28px' }} />
        {/* Animated blue glow */}
        <div className="glow-blob absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[500px] rounded-full pointer-events-none"
          style={{ background: 'radial-gradient(ellipse, rgba(59,130,246,0.35) 0%, transparent 65%)' }} />
        {/* Emerald accent glow */}
        <div className="glow-blob absolute bottom-1/4 right-1/4 w-[300px] h-[300px] rounded-full pointer-events-none"
          style={{ background: 'radial-gradient(ellipse, rgba(52,211,153,0.12) 0%, transparent 70%)', animationDelay: '2.5s' }} />

        <div className="relative z-10 flex-1 flex flex-col items-center justify-center px-5 py-20 text-center max-w-5xl mx-auto w-full">
          {/* Badge */}
          <div className="fade-in inline-flex items-center gap-2.5 bg-white/8 border border-white/12 rounded-full px-5 py-2 mb-8">
            <div className="pulse-dot w-2 h-2 rounded-full bg-emerald-400" />
            <span className="mono text-xs text-white/60 uppercase tracking-widest">3x Founder · 65+ Investments · Managing Partner NYVP</span>
          </div>

          {/* Headline */}
          <h1 className="fade-up text-5xl sm:text-6xl lg:text-7xl font-black leading-none mb-5 tracking-tight">
            <span className="text-white block mb-1">Stop Guessing</span>
            <span className="gradient-text block">What VCs Want</span>
          </h1>

          {/* Subheadline */}
          <p className="fade-up delay-2 text-white/55 text-lg sm:text-xl max-w-2xl mx-auto mb-10 leading-relaxed">
            Real answers from someone who&apos;s sat on both sides of the table.
            No generic playbooks. No hedging. Just what 2025 investors actually care about.
          </p>

          {/* CTAs */}
          <div className="fade-up delay-3 flex flex-col sm:flex-row gap-4 justify-center mb-6">
            <button onClick={onStart}
              className="group px-9 py-4 rounded-xl bg-blue-600 text-white font-black text-lg hover:bg-blue-500 transition-all shadow-xl hover:shadow-blue-500/40 hover:-translate-y-1">
              Start Coaching — Free
              <span className="inline-block ml-1 group-hover:translate-x-1 transition-transform">→</span>
            </button>
            <a href="#features"
              className="px-9 py-4 rounded-xl bg-white/8 border border-white/15 text-white font-bold text-lg hover:bg-white/14 transition-all backdrop-blur-sm">
              See the Tools ↓
            </a>
          </div>

          <p className="fade-in delay-5 mono text-xs text-white/25 uppercase tracking-widest">
            Free · No account · No fluff
          </p>
        </div>

        {/* Ticker strip */}
        <div className="relative z-10 border-t border-white/8 bg-white/4 py-3 overflow-hidden">
          <div className="ticker-wrap">
            <div className="ticker-inner mono text-xs text-white/40 uppercase tracking-widest">
              {tickerText}{tickerText}
            </div>
          </div>
        </div>
      </div>

      {/* ── Stats ─────────────────────────────────── */}
      <div ref={statsRef} className="bg-slate-800 py-14 px-5">
        <div className="max-w-4xl mx-auto grid grid-cols-2 lg:grid-cols-4 gap-8 divide-x divide-white/10">
          {STATS.map((s, i) => (
            <StatBlock key={s.label} {...s} active={statsVisible} />
          ))}
        </div>
      </div>

      {/* ── Features ──────────────────────────────── */}
      <div id="features" className="py-24 px-5 bg-gray-50" style={DOT_GRID}>
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-14">
            <span className="mono text-xs text-blue-700 uppercase tracking-widest font-bold bg-blue-50 border border-blue-200 rounded-full px-4 py-1.5 inline-block">What You Get</span>
            <h2 className="text-4xl sm:text-5xl font-black text-slate-900 mt-4 mb-3">
              Everything you need<br className="hidden sm:block" /> to raise your round
            </h2>
            <p className="text-slate-500 text-lg max-w-xl mx-auto">
              Built from real deal experience — as a founder raising and as an investor deploying.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {FEATURES.map((f, i) => (
              f.href ? (
                <Link key={f.title} href={f.href}
                  className="card-hover bg-white rounded-2xl border border-slate-200 p-6 shadow-sm block group fade-up"
                  style={{ animationDelay: `${i * 0.07}s` }}>
                  <div className="w-12 h-12 rounded-xl flex items-center justify-center text-2xl mb-4 shadow-sm" style={{ background: f.bg }}>
                    {f.icon}
                  </div>
                  <h3 className="font-bold text-slate-900 text-lg mb-2 group-hover:text-blue-700 transition-colors">{f.title}</h3>
                  <p className="text-slate-500 text-sm leading-relaxed">{f.desc}</p>
                  <div className="mt-4 text-xs mono font-bold uppercase tracking-wide" style={{ color: f.color }}>Open Tool →</div>
                </Link>
              ) : (
                <div key={f.title}
                  className="card-hover bg-white rounded-2xl border border-slate-200 p-6 shadow-sm fade-up"
                  style={{ animationDelay: `${i * 0.07}s` }}>
                  <div className="w-12 h-12 rounded-xl flex items-center justify-center text-2xl mb-4 shadow-sm" style={{ background: f.bg }}>
                    {f.icon}
                  </div>
                  <h3 className="font-bold text-slate-900 text-lg mb-2">{f.title}</h3>
                  <p className="text-slate-500 text-sm leading-relaxed">{f.desc}</p>
                  <div className="mt-4 text-xs mono font-bold uppercase tracking-wide" style={{ color: f.color }}>Ask in chat →</div>
                </div>
              )
            ))}
          </div>
        </div>
      </div>

      {/* ── About Trace ───────────────────────────── */}
      <div className="py-24 px-5 bg-white border-t border-slate-100">
        <div className="max-w-4xl mx-auto flex flex-col lg:flex-row items-center gap-12">
          <div className="shrink-0 text-center lg:text-left">
            <div className="w-32 h-32 rounded-2xl bg-blue-700 flex items-center justify-center shadow-2xl mx-auto lg:mx-0 mb-4">
              <span className="text-white text-4xl font-black mono">TC</span>
            </div>
            <div className="flex items-center justify-center lg:justify-start gap-3">
              <div className="pulse-dot w-2 h-2 rounded-full bg-emerald-400" />
              <span className="mono text-xs text-slate-400 uppercase tracking-wider">Available Now</span>
            </div>
          </div>

          <div>
            <div className="flex flex-wrap items-center gap-3 mb-3">
              <h2 className="text-3xl font-black text-slate-900">Trace Cohen</h2>
              <span className="mono text-xs bg-blue-50 text-blue-700 border border-blue-200 px-3 py-1 rounded-full uppercase tracking-widest">Managing Partner · NYVP</span>
            </div>
            <p className="text-slate-600 leading-relaxed text-lg mb-6">
              3x founder who raised across Pre-Seed through Series B. Now investing in 65+ startups as Managing Partner at New York Venture Partners. I&apos;ve been in every uncomfortable fundraising conversation — and I built this so you can walk in prepared.
            </p>
            <div className="flex flex-wrap gap-4">
              <a href="https://x.com/Trace_Cohen" target="_blank" rel="noreferrer"
                className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-slate-900 text-white text-sm font-bold hover:bg-slate-700 transition-colors shadow-sm">
                𝕏 @Trace_Cohen
              </a>
              <a href="mailto:t@nyvp.com"
                className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-slate-100 text-slate-700 text-sm font-bold hover:bg-slate-200 transition-colors">
                ✉ t@nyvp.com
              </a>
            </div>
          </div>
        </div>
      </div>

      {/* ── CTA ───────────────────────────────────── */}
      <div className="relative overflow-hidden py-28 px-5 text-center" style={{ background: 'linear-gradient(135deg, #1e40af 0%, #1d4ed8 50%, #0ea5e9 100%)' }}>
        <div className="absolute inset-0 pointer-events-none" style={{ backgroundImage: 'radial-gradient(circle, rgba(255,255,255,0.06) 1px, transparent 1px)', backgroundSize: '24px 24px' }} />
        <div className="relative z-10 max-w-2xl mx-auto">
          <h2 className="text-4xl sm:text-5xl font-black text-white mb-4 leading-tight">
            Ready for straight answers?
          </h2>
          <p className="text-blue-200 text-lg mb-10 leading-relaxed">
            No fluff. No generic startup advice. Just real benchmarks and real talk from someone who&apos;s done it.
          </p>
          <button onClick={onStart}
            className="group px-12 py-5 rounded-2xl bg-white text-blue-700 font-black text-xl hover:bg-blue-50 transition-all shadow-2xl hover:-translate-y-1">
            Start Coaching — Free
            <span className="inline-block ml-2 group-hover:translate-x-1 transition-transform">→</span>
          </button>
        </div>
      </div>

      {/* ── Footer ────────────────────────────────── */}
      <div className="bg-slate-900 py-8 px-5 text-center">
        <p className="mono text-xs text-white/30 uppercase tracking-widest">
          Trace Cohen ·{' '}
          <a href="https://x.com/Trace_Cohen" target="_blank" rel="noreferrer" className="hover:text-white/60 transition-colors">@Trace_Cohen</a>
          {' · '}
          <a href="mailto:t@nyvp.com" className="hover:text-white/60 transition-colors">t@nyvp.com</a>
          {' · '}Free · 2025 Market Data
        </p>
      </div>

    </div>
  )
}
