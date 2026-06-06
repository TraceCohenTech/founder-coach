'use client'

import { useEffect, useRef, useState } from 'react'
import Link from 'next/link'

// ── Constants ─────────────────────────────────────────────────────────────────
const DOT_GRID = { backgroundImage: 'radial-gradient(circle, #cbd5e1 1px, transparent 1px)', backgroundSize: '24px 24px' }

const TICKER1 = ['SEED MEDIAN: $8M PRE', 'SERIES A MEDIAN: $25M', 'SERIES A ARR: $2.1M+', 'TOP-QUARTILE NRR: 130%+', 'HOT SECTOR: AI / ML', 'AVG CLOSE TIME: 4–6 MO', 'DEFENSE TECH PREMIUM: +25%', 'SERIES B MEDIAN: $65M', 'CAC PAYBACK: <18 MO', '2025 MARKET DATA']
const TICKER2 = ['SEED RAISE: $1.5M–$3M', 'SER A ARR MULTIPLE: 8–12×', 'TOP NRR: 130%+', 'DOWN ROUNDS: +40% YoY', 'AI DEALS: +65% VOLUME', 'CLOSE TIME: 4.2 MO AVG', 'BRIDGE NOTES UP: +28%', 'DEFENSE UP: +88% YoY', 'CONSUMER TOUGH: -35% MULT']

// ── Data ──────────────────────────────────────────────────────────────────────
const STATS = [
  { value: 65,  suffix: '+', prefix: '',  label: 'Companies Invested' },
  { value: 25,  suffix: 'M', prefix: '$', label: 'Median Series A' },
  { value: 12,  suffix: '+', prefix: '',  label: 'Years Both Sides' },
  { value: 500, suffix: '+', prefix: '',  label: 'Founders Coached' },
]

const MARKET = [
  { stage: 'Pre-Seed',  pre: '$3.5M',  raise: '$500K – $1.5M',  mult: '—',         close: '2–3 mo', color: '#0ea5e9' },
  { stage: 'Seed',      pre: '$8M',    raise: '$1.5M – $3M',    mult: '12–15×',    close: '3–4 mo', color: '#059669' },
  { stage: 'Series A',  pre: '$25M',   raise: '$8M – $15M',     mult: '8–12× ARR', close: '4–5 mo', color: '#1d4ed8' },
  { stage: 'Series B',  pre: '$65M',   raise: '$20M – $35M',    mult: '6–9× ARR',  close: '5–6 mo', color: '#d97706' },
  { stage: 'Series C+', pre: '$180M',  raise: '$50M – $100M+',  mult: '5–7× ARR',  close: '6+ mo',  color: '#dc2626' },
]

const MYTHS = [
  { myth: 'You need a warm intro to get a meeting', truth: 'Cold emails convert at 8–12% if your metrics are right and the email is tight. Intros help — they don\'t gate-keep.' },
  { myth: 'SAFE notes are always founder-friendly',  truth: 'They are — until you hit a capped SAFE at a flat round. Know your post-money mechanics before you sign anything.' },
  { myth: 'Raise as much as you can while you can', truth: 'Dilution compounds. Raise what you can deploy in 18–24 months. Over-raising creates valuation traps on your next round.' },
  { myth: 'VCs fund vision and potential',           truth: 'Pre-Seed they fund people. Series A+? They fund proof. Know exactly what evidence your stage requires.' },
  { myth: 'Your pitch deck closes the deal',         truth: 'The deck gets you the meeting. Conviction, retention data, and crisp answers to hard questions close the deal.' },
  { myth: 'A term sheet means you\'re funded',       truth: '15–20% of term sheets don\'t close. Keep running your process until you have wire confirmation.' },
]

const FEATURES = [
  { icon: '🎯', color: '#1d4ed8', bg: '#eff6ff', title: 'Benchmark Your Metrics',   desc: 'Know exactly where you stand vs. 2025 market comps — ARR multiples, NRR, growth rates by stage.', href: null },
  { icon: '💰', color: '#059669', bg: '#ecfdf5', title: 'Valuation Estimator',       desc: 'Interactive model based on real 2025 deal data. Bear, base, and bull case — not a guess.', href: '/tools/valuation' },
  { icon: '📉', color: '#0ea5e9', bg: '#f0f9ff', title: 'Dilution Simulator',        desc: "Model each round and see exactly what you'll own. Understand the math before you sign.", href: '/tools/dilution' },
  { icon: '🤝', color: '#d97706', bg: '#fffbeb', title: 'VC Meeting Prep',           desc: 'Know every question they\'ll ask before the meeting. Have a crisp answer for every hard push.', href: null },
  { icon: '📋', color: '#0ea5e9', bg: '#f0f9ff', title: 'Term Sheet Decoder',        desc: 'Liquidation preferences, pro-rata, anti-dilution — plain English with real economic impact.', href: null },
  { icon: '⚡', color: '#dc2626', bg: '#fef2f2', title: 'Run a Real Process',         desc: 'Create urgency, manage parallel conversations, and close on your terms — not theirs.', href: null },
]

const PLAYBOOK = [
  { n: '01', icon: '🔢', title: 'Know your numbers cold',   desc: 'ARR, NRR, CAC, LTV, burn, runway — every direction of movement. VCs will probe everything. Know it before they do.' },
  { n: '02', icon: '🎯', title: 'Build a targeted list',    desc: 'Quality beats quantity. 30 funds that have done your stage and sector in the last 18 months beats 200 cold emails.' },
  { n: '03', icon: '📖', title: 'Nail the narrative',       desc: 'Why now. Why you. Why this market. The story should make the opportunity feel obvious and the risk manageable.' },
  { n: '04', icon: '⚡', title: 'Create a real process',    desc: 'Set a close date. Run meetings in parallel. Generate urgency with real milestones — not artificial ones.' },
  { n: '05', icon: '🤝', title: 'Negotiate from strength',  desc: 'One term sheet changes the dynamic entirely. Know your walk-away terms before you\'re in the room.' },
]

const SECTORS = [
  { name: 'AI / ML',        heat: 95, trend: '↑', color: '#1d4ed8', note: 'Peak appetite · premium multiples' },
  { name: 'Defense Tech',   heat: 88, trend: '↑', color: '#0ea5e9', note: 'Fastest-growing vertical 2025' },
  { name: 'Healthcare',     heat: 72, trend: '→', color: '#059669', note: 'Selective but consistently active' },
  { name: 'Fintech',        heat: 65, trend: '→', color: '#10b981', note: 'Recovering from 2023–24 lows' },
  { name: 'B2B SaaS',       heat: 60, trend: '→', color: '#f59e0b', note: 'Baseline — needs strong metrics' },
  { name: 'Climate',        heat: 55, trend: '↑', color: '#84cc16', note: 'Growing · longer-horizon capital' },
  { name: 'Crypto / Web3',  heat: 42, trend: '→', color: '#06b6d4', note: 'Selective institutional return' },
  { name: 'Consumer',       heat: 32, trend: '↓', color: '#f97316', note: 'Very tough · unit econ essential' },
]

const CRITERIA = [
  { n: '01', text: 'Do the founders know something the market doesn\'t yet?',    sub: 'Proprietary insight beats a good idea every single time.' },
  { n: '02', text: 'Is this team unfairly positioned to win?',                   sub: 'Domain expertise, network density, or technical moat — one of the three.' },
  { n: '03', text: 'Does the data match what the deck claims?',                  sub: 'I check retention, growth trajectory, and CAC/LTV before anything else.' },
  { n: '04', text: 'How big is the TAM — really?',                              sub: 'Not the slide number. The honest, bottoms-up, defensible version.' },
  { n: '05', text: 'Can I work with this team for a decade?',                   sub: 'Capital is a long relationship. Character matters as much as metrics.' },
]

const QUOTES = [
  { quote: "The best fundraises share one trait: the founders didn't need the money. They had leverage, conviction, and knew their walk-away. That changes everything about how you negotiate.", attr: 'On Negotiation' },
  { quote: "VCs aren't your friends during diligence. They're trying to find the reason not to invest. Your job is to make that impossible — with data, narrative, and how you handle pushback.", attr: 'On Due Diligence' },
  { quote: "I've passed on great metrics because I couldn't see the path to $100M ARR. I've funded $0 revenue companies because the story was airtight and the founder knew the space better than anyone I'd met.", attr: 'On Storytelling' },
]

// ── Hooks ─────────────────────────────────────────────────────────────────────
function useCounter(target: number, duration = 1800, active = false) {
  const [val, setVal] = useState(0)
  useEffect(() => {
    if (!active) return
    let t0: number | null = null
    const go = (ts: number) => {
      if (!t0) t0 = ts
      const p = Math.min((ts - t0) / duration, 1)
      setVal(Math.floor((1 - Math.pow(1 - p, 3)) * target))
      if (p < 1) requestAnimationFrame(go)
    }
    requestAnimationFrame(go)
  }, [target, duration, active])
  return val
}

function useInView(threshold = 0.12) {
  const ref = useRef<HTMLDivElement>(null)
  const [vis, setVis] = useState(false)
  useEffect(() => {
    const obs = new IntersectionObserver(([e]) => { if (e.isIntersecting) setVis(true) }, { threshold })
    if (ref.current) obs.observe(ref.current)
    return () => obs.disconnect()
  }, [threshold])
  return [ref, vis] as const
}

// ── Sub-components ────────────────────────────────────────────────────────────
function StatBlock({ value, prefix = '', suffix, label, active }: { value: number; prefix?: string; suffix: string; label: string; active: boolean }) {
  const n = useCounter(value, 1600, active)
  return (
    <div className="text-center py-2">
      <div className="text-4xl lg:text-5xl font-black text-white mono tracking-tight mb-1">{prefix}{n}{suffix}</div>
      <div className="text-white/70 text-xs mono uppercase tracking-widest">{label}</div>
    </div>
  )
}

function Ticker({ items, speed = 32 }: { items: string[]; speed?: number }) {
  const text = items.map(t => `${t}  ·  `).join('')
  return (
    <div className="ticker-wrap">
      <div className="ticker-inner mono text-xs uppercase tracking-widest" style={{ animationDuration: `${speed}s` }}>
        {text}{text}
      </div>
    </div>
  )
}

// ── Main Component ────────────────────────────────────────────────────────────
export default function Landing({ onStart }: { onStart: () => void }) {
  const [scrollY,   setScrollY]   = useState(0)
  const [scrollPct, setScrollPct] = useState(0)
  const [scrolled,  setScrolled]  = useState(false)

  const statsRef = useRef<HTMLDivElement>(null)
  const [statsVis, setStatsVis] = useState(false)

  const [marketRef,   marketVis]   = useInView()
  const [mythsRef,    mythsVis]    = useInView()
  const [playbookRef, playbookVis] = useInView()
  const [sectorsRef,  sectorsVis]  = useInView()
  const [criteriaRef, criteriaVis] = useInView()
  const [quotesRef,   quotesVis]   = useInView()
  const [aboutRef,    aboutVis]    = useInView()

  useEffect(() => {
    const obs = new IntersectionObserver(([e]) => { if (e.isIntersecting) setStatsVis(true) }, { threshold: 0.3 })
    if (statsRef.current) obs.observe(statsRef.current)
    return () => obs.disconnect()
  }, [])

  useEffect(() => {
    const onScroll = () => {
      const el = document.documentElement
      setScrolled(window.scrollY > 20)
      setScrollY(window.scrollY)
      setScrollPct((el.scrollTop / Math.max(el.scrollHeight - el.clientHeight, 1)) * 100)
    }
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  return (
    <div className="min-h-screen bg-white">

      {/* ── Scroll progress bar ───────────────── */}
      <div className="fixed top-0 left-0 right-0 z-[60] h-0.5 bg-transparent pointer-events-none">
        <div style={{ width: `${scrollPct}%`, background: 'linear-gradient(90deg, #1d4ed8, #0ea5e9, #34d399)', height: '100%', transition: 'width 0.1s ease' }} />
      </div>

      {/* ── Fixed Nav ─────────────────────────── */}
      <nav className={`fixed top-0.5 left-0 right-0 z-50 px-5 py-3 flex items-center justify-between transition-all duration-300 ${scrolled ? 'bg-white/95 backdrop-blur-sm shadow-sm border-b border-slate-100' : 'bg-transparent'}`}>
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-blue-700 flex items-center justify-center shadow-sm">
            <span className="text-white text-xs font-black mono">TC</span>
          </div>
          <span className={`text-sm font-bold transition-colors ${scrolled ? 'text-slate-900' : 'text-white'}`}>Fundraising Coach</span>
        </div>
        <div className="flex items-center gap-3">
          <Link href="/tools/valuation" className={`hidden sm:block text-xs mono font-semibold uppercase tracking-wide transition-colors ${scrolled ? 'text-slate-500 hover:text-blue-700' : 'text-white/50 hover:text-white'}`}>💰 Valuation</Link>
          <Link href="/tools/dilution"  className={`hidden sm:block text-xs mono font-semibold uppercase tracking-wide transition-colors ${scrolled ? 'text-slate-500 hover:text-blue-700' : 'text-white/50 hover:text-white'}`}>📉 Dilution</Link>
          <button onClick={onStart} className="px-4 py-2 rounded-lg bg-blue-600 text-white text-sm font-bold hover:bg-blue-500 transition-all shadow-md hover:-translate-y-px">Start Free →</button>
        </div>
      </nav>

      {/* ── Hero ──────────────────────────────── */}
      <div className="bg-slate-900 min-h-screen flex flex-col relative overflow-hidden pt-16">
        <div className="absolute inset-0 pointer-events-none" style={{ backgroundImage: 'radial-gradient(circle, rgba(255,255,255,0.04) 1px, transparent 1px)', backgroundSize: '28px 28px' }} />
        {/* Parallax glows */}
        <div className="glow-blob absolute pointer-events-none" style={{
          top: '30%', left: '50%', width: 700, height: 500,
          transform: `translate(-50%, calc(-50% + ${scrollY * 0.15}px))`,
          background: 'radial-gradient(ellipse, rgba(59,130,246,0.35) 0%, transparent 65%)',
          borderRadius: '50%',
        }} />
        <div className="glow-blob absolute pointer-events-none" style={{
          bottom: '20%', right: '20%', width: 320, height: 320,
          transform: `translateY(${scrollY * -0.1}px)`,
          background: 'radial-gradient(ellipse, rgba(52,211,153,0.14) 0%, transparent 70%)',
          borderRadius: '50%', animationDelay: '2.5s',
        }} />

        <div className="relative z-10 flex-1 flex flex-col items-center justify-center px-5 py-20 text-center max-w-5xl mx-auto w-full">
          <div className="fade-in inline-flex items-center gap-2.5 bg-white/8 border border-white/12 rounded-full px-5 py-2 mb-8">
            <div className="pulse-dot w-2 h-2 rounded-full bg-emerald-400" />
            <span className="mono text-xs text-white/60 uppercase tracking-widest">3x Founder · 65+ Investments · Managing Partner NYVP</span>
          </div>

          <h1 className="fade-up text-5xl sm:text-6xl lg:text-7xl font-black leading-none mb-5 tracking-tight">
            <span className="text-white block mb-1">Stop Guessing</span>
            <span className="gradient-text block">What VCs Want</span>
          </h1>

          <p className="fade-up delay-2 text-white/55 text-lg sm:text-xl max-w-2xl mx-auto mb-10 leading-relaxed">
            Real answers from someone who&apos;s sat on both sides of the table.
            No generic playbooks. No hedging. Just what 2025 investors actually care about.
          </p>

          <div className="fade-up delay-3 flex flex-col sm:flex-row gap-4 justify-center mb-6">
            <button onClick={onStart}
              className="group px-9 py-4 rounded-xl bg-blue-600 text-white font-black text-lg hover:bg-blue-500 transition-all shadow-xl hover:shadow-blue-500/40 hover:-translate-y-1">
              Start Coaching — Free
              <span className="inline-block ml-1 group-hover:translate-x-1 transition-transform">→</span>
            </button>
            <a href="#market" className="px-9 py-4 rounded-xl bg-white/8 border border-white/15 text-white font-bold text-lg hover:bg-white/14 transition-all backdrop-blur-sm">
              See the Data ↓
            </a>
          </div>

          <p className="fade-in delay-5 mono text-xs text-white/25 uppercase tracking-widest">Free · No account · No fluff</p>
        </div>

        <div className="relative z-10 border-t border-white/8 bg-white/4 py-3 overflow-hidden">
          <div className="text-white/40"><Ticker items={TICKER1} speed={32} /></div>
        </div>
      </div>

      {/* ── Stats ─────────────────────────────── */}
      <div ref={statsRef} className="bg-slate-800 py-14 px-5">
        <div className="max-w-4xl mx-auto grid grid-cols-2 lg:grid-cols-4 gap-8 divide-x divide-white/10">
          {STATS.map(s => <StatBlock key={s.label} {...s} active={statsVis} />)}
        </div>
      </div>

      {/* ── 2025 Market Snapshot ──────────────── */}
      <div id="market" className="bg-slate-900 py-20 px-5">
        <div className="max-w-5xl mx-auto">
          <div ref={marketRef} style={{ opacity: marketVis ? 1 : 0, transform: marketVis ? 'translateY(0)' : 'translateY(24px)', transition: 'all 0.7s ease' }}>
            <div className="flex items-center justify-between mb-8 flex-wrap gap-3">
              <div>
                <span className="mono text-xs text-sky-400 uppercase tracking-widest font-bold">Live Benchmarks</span>
                <h2 className="text-3xl sm:text-4xl font-black text-white mt-1">2025 Market Snapshot</h2>
              </div>
              <div className="flex items-center gap-2 bg-emerald-500/10 border border-emerald-500/20 rounded-full px-4 py-2">
                <div className="pulse-dot w-2 h-2 rounded-full bg-emerald-400" />
                <span className="mono text-xs text-emerald-400 uppercase tracking-widest">Updated Q2 2025</span>
              </div>
            </div>

            {/* Table header */}
            <div className="grid grid-cols-5 gap-0 mb-2 px-4">
              {['Stage', 'Pre-Money', 'Raise Range', 'ARR Multiple', 'Close Time'].map(h => (
                <div key={h} className="mono text-xs text-white/30 uppercase tracking-widest">{h}</div>
              ))}
            </div>

            <div className="rounded-2xl overflow-hidden border border-white/8">
              {MARKET.map((row, i) => (
                <div key={row.stage}
                  className="grid grid-cols-5 gap-0 px-4 py-4 border-b border-white/6 last:border-0 group hover:bg-white/4 transition-colors"
                  style={{ opacity: marketVis ? 1 : 0, transform: marketVis ? 'translateX(0)' : 'translateX(-20px)', transition: `all 0.5s ease ${i * 0.08 + 0.2}s` }}>
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full shrink-0" style={{ background: row.color }} />
                    <span className="text-white font-bold text-sm">{row.stage}</span>
                  </div>
                  <div className="mono text-sm font-bold" style={{ color: row.color }}>{row.pre}</div>
                  <div className="mono text-sm text-white/70">{row.raise}</div>
                  <div className="mono text-sm text-white/70">{row.mult}</div>
                  <div className="mono text-sm text-white/50">{row.close}</div>
                </div>
              ))}
            </div>
            <p className="mono text-xs text-white/20 mt-3 text-right uppercase tracking-wide">Source: NYVP deal data + Carta / PitchBook 2025</p>
          </div>
        </div>
      </div>

      {/* ── Ticker 2 ──────────────────────────── */}
      <div className="bg-blue-700 py-3 overflow-hidden">
        <div className="text-blue-200/60"><Ticker items={TICKER2} speed={22} /></div>
      </div>

      {/* ── Myth Busters ──────────────────────── */}
      <div ref={mythsRef} className="py-24 px-5 bg-white">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-14" style={{ opacity: mythsVis ? 1 : 0, transform: mythsVis ? 'translateY(0)' : 'translateY(20px)', transition: 'all 0.6s ease' }}>
            <span className="mono text-xs text-red-600 uppercase tracking-widest font-bold bg-red-50 border border-red-200 rounded-full px-4 py-1.5 inline-block">Myth Busters</span>
            <h2 className="text-4xl sm:text-5xl font-black text-slate-900 mt-4 mb-3">What founders get wrong</h2>
            <p className="text-slate-500 text-lg max-w-xl mx-auto">Six things I hear constantly that either aren&apos;t true or are only half the story.</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {MYTHS.map((m, i) => (
              <div key={i} className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm hover:shadow-md transition-shadow"
                style={{ opacity: mythsVis ? 1 : 0, transform: mythsVis ? 'translateY(0)' : 'translateY(24px)', transition: `all 0.55s ease ${i * 0.08}s` }}>
                <div className="bg-red-50 border-b border-red-100 px-4 py-2.5 flex items-center gap-2">
                  <span className="text-red-500 font-black text-sm">✕</span>
                  <span className="mono text-xs text-red-500 uppercase tracking-widest font-bold">The Myth</span>
                </div>
                <div className="px-4 py-3">
                  <p className="text-slate-800 font-bold text-sm mb-3 leading-snug">&ldquo;{m.myth}&rdquo;</p>
                  <div className="flex items-start gap-2 bg-emerald-50 rounded-xl px-3 py-2.5 border border-emerald-100">
                    <span className="text-emerald-500 font-black text-sm shrink-0 mt-0.5">✓</span>
                    <p className="text-emerald-800 text-xs leading-relaxed font-medium">{m.truth}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── Features ──────────────────────────── */}
      <div id="features" className="py-24 px-5 bg-gray-50" style={DOT_GRID}>
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-14">
            <span className="mono text-xs text-blue-700 uppercase tracking-widest font-bold bg-blue-50 border border-blue-200 rounded-full px-4 py-1.5 inline-block">What You Get</span>
            <h2 className="text-4xl sm:text-5xl font-black text-slate-900 mt-4 mb-3">
              Every tool you need<br className="hidden sm:block" /> to raise your round
            </h2>
            <p className="text-slate-500 text-lg max-w-xl mx-auto">Built from real deal experience — as a founder raising and as an investor deploying.</p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {FEATURES.map((f, i) => (
              f.href
                ? <Link key={f.title} href={f.href} className="card-hover bg-white rounded-2xl border border-slate-200 p-6 shadow-sm block group">
                    <div className="w-12 h-12 rounded-xl flex items-center justify-center text-2xl mb-4 shadow-sm" style={{ background: f.bg }}>{f.icon}</div>
                    <h3 className="font-bold text-slate-900 text-lg mb-2 group-hover:text-blue-700 transition-colors">{f.title}</h3>
                    <p className="text-slate-500 text-sm leading-relaxed">{f.desc}</p>
                    <div className="mt-4 text-xs mono font-bold uppercase tracking-wide" style={{ color: f.color }}>Open Tool →</div>
                  </Link>
                : <div key={f.title} className="card-hover bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
                    <div className="w-12 h-12 rounded-xl flex items-center justify-center text-2xl mb-4 shadow-sm" style={{ background: f.bg }}>{f.icon}</div>
                    <h3 className="font-bold text-slate-900 text-lg mb-2">{f.title}</h3>
                    <p className="text-slate-500 text-sm leading-relaxed">{f.desc}</p>
                    <div className="mt-4 text-xs mono font-bold uppercase tracking-wide" style={{ color: f.color }}>Ask in chat →</div>
                  </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── The Playbook ──────────────────────── */}
      <div ref={playbookRef} className="py-24 px-5 bg-slate-900">
        <div className="max-w-3xl mx-auto">
          <div className="text-center mb-16" style={{ opacity: playbookVis ? 1 : 0, transform: playbookVis ? 'translateY(0)' : 'translateY(20px)', transition: 'all 0.6s ease' }}>
            <span className="mono text-xs text-sky-400 uppercase tracking-widest font-bold">The Framework</span>
            <h2 className="text-4xl sm:text-5xl font-black text-white mt-2">The Fundraising Playbook</h2>
            <p className="text-white/50 mt-3 text-lg">Five moves that separate successful raises from failed processes.</p>
          </div>

          <div className="relative">
            {/* Vertical connecting line */}
            <div className="absolute left-7 top-8 bottom-8 w-px pointer-events-none" style={{ background: 'linear-gradient(to bottom, #1d4ed8, #0ea5e9, #34d399)', opacity: playbookVis ? 0.4 : 0, transition: 'opacity 1s ease 0.3s' }} />

            <div className="space-y-6">
              {PLAYBOOK.map((step, i) => (
                <div key={step.n} className="flex gap-5 items-start"
                  style={{ opacity: playbookVis ? 1 : 0, transform: playbookVis ? 'translateX(0)' : 'translateX(-32px)', transition: `all 0.6s ease ${i * 0.12 + 0.2}s` }}>
                  <div className="shrink-0 w-14 h-14 rounded-2xl bg-slate-800 border border-white/10 flex flex-col items-center justify-center shadow-lg">
                    <span className="text-lg">{step.icon}</span>
                    <span className="mono text-xs text-white/30 font-bold">{step.n}</span>
                  </div>
                  <div className="bg-slate-800/60 border border-white/8 rounded-2xl px-5 py-4 flex-1 hover:border-white/15 transition-colors">
                    <h3 className="text-white font-black text-lg mb-1">{step.title}</h3>
                    <p className="text-white/55 text-sm leading-relaxed">{step.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* ── Sector Heat Map ───────────────────── */}
      <div ref={sectorsRef} className="py-24 px-5 bg-white">
        <div className="max-w-3xl mx-auto">
          <div className="text-center mb-12" style={{ opacity: sectorsVis ? 1 : 0, transform: sectorsVis ? 'translateY(0)' : 'translateY(20px)', transition: 'all 0.6s ease' }}>
            <span className="mono text-xs text-orange-600 uppercase tracking-widest font-bold bg-orange-50 border border-orange-200 rounded-full px-4 py-1.5 inline-block">Investor Appetite</span>
            <h2 className="text-4xl sm:text-5xl font-black text-slate-900 mt-4 mb-3">Sector Heat Map</h2>
            <p className="text-slate-500 text-lg max-w-xl mx-auto">Where VC dollars are actually going in 2025 — not where they say they&apos;re going.</p>
          </div>

          <div className="space-y-4">
            {SECTORS.map((s, i) => (
              <div key={s.name} style={{ opacity: sectorsVis ? 1 : 0, transform: sectorsVis ? 'translateX(0)' : 'translateX(24px)', transition: `all 0.5s ease ${i * 0.07}s` }}>
                <div className="flex items-center justify-between mb-1.5">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-bold text-slate-900">{s.name}</span>
                    <span className="text-xs font-bold" style={{ color: s.color }}>{s.trend}</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-xs text-slate-400 mono hidden sm:block">{s.note}</span>
                    <span className="mono text-sm font-black" style={{ color: s.color }}>{s.heat}</span>
                  </div>
                </div>
                <div className="h-3 bg-slate-100 rounded-full overflow-hidden border border-slate-200">
                  <div className="h-full rounded-full" style={{
                    width: sectorsVis ? `${s.heat}%` : '0%',
                    background: `linear-gradient(90deg, ${s.color}, ${s.color}aa)`,
                    transition: `width 1.3s cubic-bezier(0.4, 0, 0.2, 1) ${i * 0.06 + 0.1}s`,
                  }} />
                </div>
              </div>
            ))}
          </div>
          <p className="mono text-xs text-slate-300 mt-6 text-center uppercase tracking-wide">Heat score 0–100 based on deal volume, multiple expansion, and fund interest signals</p>
        </div>
      </div>

      {/* ── What I Look For ───────────────────── */}
      <div ref={criteriaRef} className="py-24 px-5" style={{ background: 'linear-gradient(160deg, #0f172a 0%, #1e293b 100%)' }}>
        <div className="max-w-3xl mx-auto">
          <div className="text-center mb-16" style={{ opacity: criteriaVis ? 1 : 0, transform: criteriaVis ? 'translateY(0)' : 'translateY(20px)', transition: 'all 0.6s ease' }}>
            <span className="mono text-xs text-emerald-400 uppercase tracking-widest font-bold">From the Investor Side</span>
            <h2 className="text-4xl sm:text-5xl font-black text-white mt-2">5 things I always look for</h2>
            <p className="text-white/40 mt-3 text-lg">These are the questions I ask every founder — whether you know it or not.</p>
          </div>

          <div className="space-y-5">
            {CRITERIA.map((c, i) => (
              <div key={c.n}
                className="flex gap-5 items-start p-5 rounded-2xl border border-white/6 hover:border-white/12 hover:bg-white/3 transition-all group"
                style={{ opacity: criteriaVis ? 1 : 0, transform: criteriaVis ? 'translateY(0)' : 'translateY(20px)', transition: `all 0.55s ease ${i * 0.1 + 0.2}s` }}>
                <div className="shrink-0 w-10 h-10 rounded-xl bg-white/6 border border-white/10 flex items-center justify-center">
                  <span className="mono text-xs font-black text-white/40">{c.n}</span>
                </div>
                <div>
                  <p className="text-white font-black text-lg leading-snug mb-1 group-hover:text-blue-300 transition-colors">{c.text}</p>
                  <p className="text-white/40 text-sm">{c.sub}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── Straight Talk ─────────────────────── */}
      <div ref={quotesRef} className="py-24 px-5 bg-gray-50" style={DOT_GRID}>
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-14" style={{ opacity: quotesVis ? 1 : 0, transform: quotesVis ? 'translateY(0)' : 'translateY(20px)', transition: 'all 0.6s ease' }}>
            <span className="mono text-xs text-blue-700 uppercase tracking-widest font-bold bg-blue-50 border border-blue-200 rounded-full px-4 py-1.5 inline-block">Straight Talk</span>
            <h2 className="text-4xl sm:text-5xl font-black text-slate-900 mt-4">In my own words</h2>
          </div>

          <div className="grid grid-cols-1 gap-5">
            {QUOTES.map((q, i) => (
              <div key={i}
                className="bg-white rounded-2xl border border-slate-200 border-l-4 p-7 shadow-sm"
                style={{
                  borderLeftColor: ['#1d4ed8','#059669','#d97706'][i],
                  opacity: quotesVis ? 1 : 0,
                  transform: quotesVis ? 'scale(1)' : 'scale(0.97)',
                  transition: `all 0.55s ease ${i * 0.12}s`,
                }}>
                <div className="text-5xl font-black leading-none mb-4" style={{ color: ['#1d4ed8','#059669','#d97706'][i], opacity: 0.2 }}>&ldquo;</div>
                <p className="text-slate-800 text-lg leading-relaxed font-medium mb-4">{q.quote}</p>
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-blue-700 flex items-center justify-center shrink-0">
                    <span className="text-white text-xs font-black mono">TC</span>
                  </div>
                  <div>
                    <p className="text-slate-900 font-bold text-sm">Trace Cohen</p>
                    <p className="mono text-xs text-slate-400 uppercase tracking-wide">{q.attr}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── About Trace ───────────────────────── */}
      <div ref={aboutRef} className="py-24 px-5 bg-white border-t border-slate-100">
        <div className="max-w-4xl mx-auto flex flex-col lg:flex-row items-center gap-12"
          style={{ opacity: aboutVis ? 1 : 0, transform: aboutVis ? 'translateY(0)' : 'translateY(24px)', transition: 'all 0.7s ease' }}>
          <div className="shrink-0 text-center lg:text-left">
            <div className="w-32 h-32 rounded-2xl bg-blue-700 flex items-center justify-center shadow-2xl mx-auto lg:mx-0 mb-4">
              <span className="text-white text-4xl font-black mono">TC</span>
            </div>
            <div className="flex items-center justify-center lg:justify-start gap-2">
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
              3x founder who raised across Pre-Seed through Series B. Now investing in 65+ startups as Managing Partner at New York Venture Partners. I&apos;ve been on both sides of every hard fundraising conversation — and I built this so you walk in prepared.
            </p>
            <div className="flex flex-wrap gap-4">
              <a href="https://x.com/Trace_Cohen" target="_blank" rel="noreferrer" className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-slate-900 text-white text-sm font-bold hover:bg-slate-700 transition-colors shadow-sm">𝕏 @Trace_Cohen</a>
              <a href="mailto:t@nyvp.com" className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-slate-100 text-slate-700 text-sm font-bold hover:bg-slate-200 transition-colors">✉ t@nyvp.com</a>
            </div>
          </div>
        </div>
      </div>

      {/* ── CTA ───────────────────────────────── */}
      <div className="relative overflow-hidden py-28 px-5 text-center" style={{ background: 'linear-gradient(135deg, #1e40af 0%, #1d4ed8 50%, #0ea5e9 100%)' }}>
        <div className="absolute inset-0 pointer-events-none" style={{ backgroundImage: 'radial-gradient(circle, rgba(255,255,255,0.06) 1px, transparent 1px)', backgroundSize: '24px 24px' }} />
        <div className="relative z-10 max-w-2xl mx-auto">
          <h2 className="text-4xl sm:text-5xl font-black text-white mb-4 leading-tight">Ready for straight answers?</h2>
          <p className="text-blue-200 text-lg mb-10 leading-relaxed">No fluff. No generic advice. Just real benchmarks and real talk from someone who&apos;s done it.</p>
          <button onClick={onStart} className="group px-12 py-5 rounded-2xl bg-white text-blue-700 font-black text-xl hover:bg-blue-50 transition-all shadow-2xl hover:-translate-y-1">
            Start Coaching — Free
            <span className="inline-block ml-2 group-hover:translate-x-1 transition-transform">→</span>
          </button>
        </div>
      </div>

      {/* ── Footer ────────────────────────────── */}
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
