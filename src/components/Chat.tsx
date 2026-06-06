'use client'

import { useChat } from 'ai/react'
import { useRef, useEffect } from 'react'
import Link from 'next/link'
import Message from './Message'
import { UserProfile } from '@/lib/system-prompt'

const DOT_GRID = {
  backgroundImage: 'radial-gradient(circle, #cbd5e1 1px, transparent 1px)',
  backgroundSize: '24px 24px',
}

const TOOLS = [
  { href: '/tools/valuation', icon: '💰', label: 'Valuation Estimator', sub: 'See where you stand', color: '#059669', bg: '#ecfdf5' },
  { href: '/tools/dilution',  icon: '📉', label: 'Dilution Simulator',  sub: 'Model your cap table', color: '#1d4ed8', bg: '#eff6ff' },
]

// Profile-aware starters replace the generic list
function buildStarters(p: UserProfile) {
  const sectorIcon: Record<string, string> = {
    'AI / ML': '🤖', 'Defense Tech': '🛡️', 'Healthcare': '🏥',
    'Fintech': '💳', 'B2B SaaS': '🏢', 'Climate': '🌱',
    'Consumer': '🛍️', 'Other': '🏗️',
  }
  const icon = sectorIcon[p.sector] ?? '🏢'
  const noRev = p.arr === 'Pre-revenue'

  return [
    {
      icon: '📊',
      text: noRev
        ? `How do I make a compelling case at ${p.stage} without revenue?`
        : `At ${p.arr}, am I tracking well for a strong ${p.stage} raise?`,
      color: '#1d4ed8', bg: '#eff6ff',
    },
    {
      icon: '📈',
      text: p.growth === 'Pre-revenue / no data yet'
        ? `How do I frame my story at ${p.stage} without a growth rate yet?`
        : `What do ${p.stage} VCs really think about ${p.growth} growth right now?`,
      color: '#059669', bg: '#ecfdf5',
    },
    {
      icon,
      text: `What's the ${p.stage} investor narrative for a ${p.sector} company in 2025?`,
      color: '#0ea5e9', bg: '#f0f9ff',
    },
    {
      icon: '🎯',
      text: `Which VCs should I be targeting for ${p.stage} ${p.sector} in ${p.geo}?`,
      color: '#d97706', bg: '#fffbeb',
    },
    {
      icon: '📄',
      text: `What terms should I push back on in a ${p.stage} term sheet?`,
      color: '#dc2626', bg: '#fef2f2',
    },
    {
      icon: '⚡',
      text: `How do I create urgency and run a competitive ${p.stage} process?`,
      color: '#059669', bg: '#ecfdf5',
    },
  ]
}

export default function Chat({ profile }: { profile: UserProfile }) {
  const bottomRef = useRef<HTMLDivElement>(null)
  const { messages, input, setInput, handleSubmit, isLoading, append } = useChat({
    api: '/api/chat', body: { profile },
  })

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const empty    = messages.length === 0
  const starters = buildStarters(profile)

  return (
    <div className="flex flex-col h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-slate-900 border-b border-white/10 px-4 py-3 flex items-center justify-between shrink-0 shadow-md">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-blue-700 flex items-center justify-center shadow-lg">
            <span className="text-white text-sm font-black mono">TC</span>
          </div>
          <div>
            <div className="text-sm font-bold text-white">Trace Cohen · Fundraising Coach</div>
            <div className="flex items-center gap-2 mt-0.5">
              <div className="pulse-dot w-1.5 h-1.5 rounded-full bg-emerald-400" />
              <span className="mono text-xs text-white/40 uppercase tracking-widest">
                {profile.sector} · {profile.stage} · {profile.geo}
              </span>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {TOOLS.map(t => (
            <Link key={t.href} href={t.href}
              className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/8 border border-white/12 mono text-xs text-white/50 hover:text-white hover:bg-white/14 transition-all uppercase tracking-wide">
              {t.icon} {t.label}
            </Link>
          ))}
        </div>
      </header>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-4 py-6 scrollbar-thin" style={DOT_GRID}>
        {empty ? (
          <div className="max-w-2xl mx-auto">
            {/* Welcome card */}
            <div className="pop-in bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden mb-5">
              <div className="h-1.5" style={{ background: 'linear-gradient(90deg, #1d4ed8, #0ea5e9, #34d399)' }} />
              <div className="p-6">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-xl bg-blue-700 flex items-center justify-center shrink-0 shadow-lg">
                    <span className="text-white font-black mono text-base">TC</span>
                  </div>
                  <div>
                    <div className="flex flex-wrap items-center gap-2 mb-1.5">
                      <span className="font-black text-slate-900 text-lg">Trace Cohen</span>
                      <span className="mono text-xs bg-blue-50 text-blue-700 border border-blue-200 px-2.5 py-0.5 rounded-full uppercase tracking-widest">
                        Managing Partner · NYVP
                      </span>
                    </div>
                    <p className="text-sm text-slate-600 leading-relaxed">
                      I know you&apos;re raising {profile.stage} in {profile.sector} out of {profile.geo}.
                      Ask me anything — I&apos;ll give you straight answers backed by real 2025 deal data.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Tool cards */}
            <div className="grid grid-cols-2 gap-3 mb-5">
              {TOOLS.map((t, i) => (
                <Link key={t.href} href={t.href}
                  className="card-hover bg-white rounded-xl border border-slate-200 p-4 block group fade-up"
                  style={{ animationDelay: `${i * 0.06}s` }}>
                  <div className="w-10 h-10 rounded-xl flex items-center justify-center text-xl mb-3 shadow-sm" style={{ background: t.bg }}>
                    {t.icon}
                  </div>
                  <div className="text-sm font-bold text-slate-900 group-hover:text-blue-700 transition-colors">{t.label}</div>
                  <div className="mono text-xs mt-0.5 font-semibold uppercase tracking-wide" style={{ color: t.color }}>{t.sub} →</div>
                </Link>
              ))}
            </div>

            <div className="flex items-center gap-3 mb-4">
              <div className="h-px flex-1 bg-slate-200" />
              <span className="mono text-xs text-slate-400 uppercase tracking-widest">questions for your situation</span>
              <div className="h-px flex-1 bg-slate-200" />
            </div>

            {/* Adaptive starter prompts */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {starters.map(({ icon, text, color, bg }, i) => (
                <button key={text}
                  onClick={() => append({ role: 'user', content: text })}
                  className="card-hover bg-white flex items-center gap-3 text-left px-4 py-3 rounded-xl border border-slate-200 text-sm font-semibold text-slate-700 shadow-sm fade-up group"
                  style={{ animationDelay: `${(i + 2) * 0.06}s` }}>
                  <div className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0 text-base group-hover:scale-110 transition-transform flex-shrink-0" style={{ background: bg }}>
                    {icon}
                  </div>
                  <span className="group-hover:text-slate-900 transition-colors leading-tight">{text}</span>
                </button>
              ))}
            </div>
          </div>
        ) : (
          <div className="max-w-2xl mx-auto space-y-4">
            {messages.map((msg, i) => (
              <Message key={msg.id} role={msg.role as 'user' | 'assistant'} content={msg.content}
                isStreaming={isLoading && i === messages.length - 1 && msg.role === 'assistant'} />
            ))}
          </div>
        )}
        <div ref={bottomRef} />
      </div>

      {/* Input */}
      <div className="bg-white border-t border-slate-200 px-4 py-4 shrink-0 shadow-sm">
        <div className="max-w-2xl mx-auto">
          <form onSubmit={handleSubmit} className="flex gap-2">
            <div className="flex-1 relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-blue-700 font-black font-mono text-sm pointer-events-none">{'>'}</span>
              <input
                value={input}
                onChange={e => setInput(e.target.value)}
                placeholder="Ask about your fundraise..."
                className="w-full bg-gray-50 border border-slate-200 rounded-xl pl-8 pr-4 py-3 text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition-all"
              />
            </div>
            <button type="submit" disabled={!input.trim() || isLoading}
              className="px-5 py-3 rounded-xl bg-blue-700 text-white text-sm font-bold disabled:opacity-30 disabled:cursor-not-allowed hover:bg-blue-600 transition-colors shadow-md">
              {isLoading ? '···' : 'Send'}
            </button>
          </form>
          <p className="text-center mono text-xs text-slate-400 mt-2.5 uppercase tracking-wide">
            Trace Cohen ·{' '}
            <a href="https://x.com/Trace_Cohen" className="hover:text-blue-700 transition-colors">@Trace_Cohen</a>
            {' · '}
            <a href="mailto:t@nyvp.com" className="hover:text-blue-700 transition-colors">t@nyvp.com</a>
          </p>
        </div>
      </div>
    </div>
  )
}
