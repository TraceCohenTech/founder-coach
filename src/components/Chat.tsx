'use client'

import { useChat } from 'ai/react'
import { useRef, useEffect, useState } from 'react'
import Link from 'next/link'
import Message from './Message'
import { UserProfile } from '@/lib/system-prompt'

const DOT_GRID = {
  backgroundImage: 'radial-gradient(circle, #cbd5e1 1px, transparent 1px)',
  backgroundSize: '24px 24px',
}

const TOOLS = [
  { href: '/tools/vcs',       icon: '🎯', label: 'VC Target List',      sub: 'Find your investors',  color: '#dc2626', bg: '#fef2f2' },
  { href: '/tools/valuation', icon: '💰', label: 'Valuation Estimator', sub: 'See where you stand',  color: '#059669', bg: '#ecfdf5' },
  { href: '/tools/dilution',  icon: '📉', label: 'Dilution Simulator',  sub: 'Model your cap table', color: '#1d4ed8', bg: '#eff6ff' },
]

function getChips(lastContent: string, profile: UserProfile): string[] {
  const r = lastContent.toLowerCase()
  if (r.includes('term sheet') || r.includes('liquidat') || r.includes('pro-rata') || r.includes('anti-dilut'))
    return ['Walk me through the most important term sheet terms', 'What should I push back on?', 'How do I negotiate a higher valuation cap?']
  if (r.includes('arr') || r.includes('mrr') || r.includes('revenue') || r.includes('churn') || r.includes('nrr') || r.includes('retention'))
    return ['How do I improve ARR growth quickly?', 'What NRR should I target at my stage?', 'How do VCs model my growth trajectory?']
  if (r.includes('pitch') || r.includes('deck') || r.includes('slide') || r.includes('narrative') || r.includes('story'))
    return ['What do VCs want to see in slide 1?', 'How long should my deck be?', 'Walk me through a winning pitch flow']
  if (r.includes('investor') || r.includes(' vc ') || r.includes('target') || r.includes('outreach') || r.includes('intro'))
    return [`Which VCs should I target for ${profile.stage} ${profile.sector}?`, 'How do I get warm intros to VCs?', 'How many VCs should I be pitching at once?']
  if (r.includes('dilut') || r.includes('cap table') || r.includes('valuation') || r.includes('pre-money') || r.includes('post-money'))
    return ['Model my dilution across multiple rounds', `What's a fair pre-money for ${profile.stage}?`, 'How do I minimize dilution while maximizing raise?']
  if (r.includes('close') || r.includes('timeline') || r.includes('urgency') || r.includes('process') || r.includes('lead'))
    return ['How do I create urgency with multiple investors?', 'What\'s the right timeline for a fundraise?', 'How do I get VCs to move faster?']
  return [
    `What's my single strongest selling point for ${profile.stage}?`,
    'What hard questions will VCs ask me?',
    'How do I run a competitive fundraising process?',
  ]
}

const MESSAGES_KEY = 'fc_messages'

export default function Chat({ profile, onHome }: { profile: UserProfile; onHome: () => void }) {
  const bottomRef = useRef<HTMLDivElement>(null)
  const hasAutoOpened = useRef(false)
  const [bannerDismissed, setBannerDismissed] = useState(false)

  const [initialMessages] = useState(() => {
    if (typeof window === 'undefined') return []
    try {
      const raw = localStorage.getItem(MESSAGES_KEY)
      return raw ? JSON.parse(raw) : []
    } catch { return [] }
  })

  const { messages, input, setInput, handleSubmit, isLoading, append } = useChat({
    api: '/api/chat', body: { profile }, initialMessages,
  })

  // Persist messages
  useEffect(() => {
    if (messages.length === 0) return
    try { localStorage.setItem(MESSAGES_KEY, JSON.stringify(messages)) } catch {}
  }, [messages])

  // Auto-intro on fresh session
  useEffect(() => {
    if (hasAutoOpened.current || initialMessages.length > 0) return
    hasAutoOpened.current = true
    const t = setTimeout(() => {
      append({ role: 'user', content: 'Give me your honest opening read on my raise.' })
    }, 400)
    return () => clearTimeout(t)
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const empty    = messages.length === 0
  const aiCount  = messages.filter(m => m.role === 'assistant').length
  const showBanner = aiCount >= 3 && !bannerDismissed

  const lastMsg  = messages[messages.length - 1]
  const showChips = !isLoading && lastMsg?.role === 'assistant' && lastMsg.content.length > 0

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
              <span className="mono text-xs text-white/40 uppercase tracking-widest truncate max-w-xs">
                {profile.sector} · {profile.stage} · {profile.geo}
              </span>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {TOOLS.slice(0, 2).map(t => (
            <Link key={t.href} href={t.href}
              className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/8 border border-white/12 mono text-xs text-white/50 hover:text-white hover:bg-white/14 transition-all uppercase tracking-wide">
              {t.icon} {t.label}
            </Link>
          ))}
          <button onClick={onHome}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/8 border border-white/12 mono text-xs text-white/50 hover:text-white hover:bg-white/14 transition-all uppercase tracking-wide">
            ← Home
          </button>
        </div>
      </header>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-4 py-6 scrollbar-thin" style={DOT_GRID}>
        {empty ? (
          /* Loading state while auto-intro fires */
          <div className="max-w-2xl mx-auto">
            <div className="flex gap-3 fade-up">
              <div className="w-8 h-8 rounded-lg bg-blue-700 flex items-center justify-center shrink-0 mt-0.5 shadow-sm">
                <span className="text-white text-xs font-bold mono">TC</span>
              </div>
              <div className="bg-white border border-slate-200 border-l-4 border-l-blue-600 rounded-xl rounded-tl-sm px-4 py-3 shadow-sm">
                <span className="text-slate-400 text-sm">···</span>
              </div>
            </div>
          </div>
        ) : (
          <div className="max-w-2xl mx-auto space-y-4">
            {messages.map((msg, i) => (
              <Message key={msg.id} role={msg.role as 'user' | 'assistant'} content={msg.content}
                isStreaming={isLoading && i === messages.length - 1 && msg.role === 'assistant'} />
            ))}

            {/* Quick-reply chips */}
            {showChips && (
              <div className="flex flex-wrap gap-2 pt-1 pb-1 fade-up">
                {getChips(lastMsg.content, profile).map(chip => (
                  <button key={chip}
                    onClick={() => append({ role: 'user', content: chip })}
                    className="text-xs px-3 py-1.5 rounded-full bg-white border border-slate-200 text-slate-600 hover:border-blue-400 hover:text-blue-700 hover:shadow-sm transition-all shadow-sm">
                    {chip}
                  </button>
                ))}
              </div>
            )}

            {/* Contact banner after 3 AI replies */}
            {showBanner && (
              <div className="fade-up bg-white border border-blue-200 rounded-2xl overflow-hidden shadow-sm">
                <div className="h-1" style={{ background: 'linear-gradient(90deg, #1d4ed8, #0ea5e9, #34d399)' }} />
                <div className="p-4 flex items-center justify-between gap-3 flex-wrap">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-xl bg-blue-700 flex items-center justify-center shrink-0 shadow-sm">
                      <span className="text-white text-xs font-black mono">TC</span>
                    </div>
                    <div>
                      <p className="text-sm font-bold text-slate-900">Want to talk directly?</p>
                      <p className="text-xs text-slate-500">I read every message — reach out anytime.</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <a href="https://x.com/Trace_Cohen" target="_blank" rel="noreferrer"
                      className="px-3 py-2 rounded-lg bg-slate-900 text-white text-xs font-bold hover:bg-slate-700 transition-colors shadow-sm">
                      𝕏 @Trace_Cohen
                    </a>
                    <a href="mailto:t@nyvp.com"
                      className="px-3 py-2 rounded-lg bg-blue-50 border border-blue-200 text-blue-700 text-xs font-bold hover:bg-blue-100 transition-colors">
                      ✉ t@nyvp.com
                    </a>
                    <button onClick={() => setBannerDismissed(true)}
                      className="w-7 h-7 flex items-center justify-center rounded-lg text-slate-300 hover:text-slate-600 hover:bg-slate-100 transition-colors text-lg leading-none">
                      ×
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Tool cards — show after first AI response */}
            {aiCount === 1 && !isLoading && (
              <div className="grid grid-cols-3 gap-2 fade-up">
                {TOOLS.map((t, i) => (
                  <Link key={t.href} href={t.href}
                    className="card-hover bg-white rounded-xl border border-slate-200 p-3 block group"
                    style={{ animationDelay: `${i * 0.06}s` }}>
                    <div className="w-8 h-8 rounded-lg flex items-center justify-center text-base mb-2 shadow-sm" style={{ background: t.bg }}>
                      {t.icon}
                    </div>
                    <div className="text-xs font-bold text-slate-900 group-hover:text-blue-700 transition-colors leading-tight">{t.label}</div>
                    <div className="mono text-xs mt-0.5 font-semibold uppercase tracking-wide" style={{ color: t.color, fontSize: 10 }}>{t.sub} →</div>
                  </Link>
                ))}
              </div>
            )}
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
