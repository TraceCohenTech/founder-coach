'use client'

import { useState } from 'react'
import { UserProfile } from '@/lib/system-prompt'

const STEP_COLORS = ['#1d4ed8', '#0ea5e9', '#059669', '#d97706', '#dc2626']
const STEP_BG    = ['#eff6ff', '#f0f9ff', '#ecfdf5', '#fffbeb', '#fef2f2']
const STEP_ICONS = ['📊', '🏢', '💵', '📈', '📍']

const STEPS = [
  {
    question: 'What stage are you raising?',
    sub: 'Benchmarks shift significantly between stages.',
    options: ['Pre-Seed', 'Seed', 'Series A', 'Series B', 'Series C+'],
    field: 'stage' as keyof UserProfile,
    multi: false,
  },
  {
    question: 'What sector are you in?',
    sub: 'Select all that apply — many companies overlap.',
    options: ['B2B SaaS', 'AI / ML', 'Fintech', 'Healthcare', 'Consumer', 'Defense Tech', 'Climate', 'Other'],
    field: 'sector' as keyof UserProfile,
    multi: true,  // ← multi-select
  },
  {
    question: 'Current ARR or MRR?',
    sub: "Give me the real number — I can't benchmark a guess.",
    options: ['Pre-revenue', '<$10K MRR', '$10K–$50K MRR', '$50K–$200K MRR', '$200K–$500K MRR', '$500K–$2M ARR', '$2M–$10M ARR', '$10M+ ARR'],
    field: 'arr' as keyof UserProfile,
    multi: false,
  },
  {
    question: "What's your growth rate?",
    sub: 'MoM if early stage, YoY if you have 12+ months of data.',
    options: ['Pre-revenue / no data yet', '<5% MoM', '5–10% MoM', '10–20% MoM', '20–30% MoM', '30%+ MoM', '2–3x YoY', '3x+ YoY'],
    field: 'growth' as keyof UserProfile,
    multi: false,
  },
  {
    question: 'Where are you based?',
    sub: 'Networks and deal dynamics differ by geography.',
    options: ['New York', 'San Francisco / Bay Area', 'Los Angeles', 'Austin', 'Miami', 'Europe', 'Other'],
    field: 'geo' as keyof UserProfile,
    multi: false,
  },
]

export default function Onboarding({ onComplete }: { onComplete: (p: UserProfile) => void }) {
  const [step, setStep]           = useState(0)
  // answers[i] is the committed answer string for step i (multi-select joined by ", ")
  const [answers, setAnswers]     = useState<string[]>(Array(STEPS.length).fill(''))
  // current in-progress selections (always an array)
  const [selections, setSelections] = useState<string[]>([])
  const [fading, setFading]       = useState(false)

  const current  = STEPS[step]
  const color    = STEP_COLORS[step]
  const bg       = STEP_BG[step]
  const icon     = STEP_ICONS[step]
  const hasAnswer = selections.length > 0

  function toggle(opt: string) {
    if (current.multi) {
      setSelections(prev => prev.includes(opt) ? prev.filter(s => s !== opt) : [...prev, opt])
    } else {
      setSelections([opt])
    }
  }

  function commitAndAdvance(newAnswers: string[]) {
    if (step === STEPS.length - 1) {
      const profile: Record<string, string> = {}
      STEPS.forEach((s, i) => { profile[s.field] = newAnswers[i] })
      onComplete(profile as unknown as UserProfile)
      return
    }
    setFading(true)
    setTimeout(() => {
      setStep(s => s + 1)
      // Restore any previous selection for the next step
      const nextAns = newAnswers[step + 1]
      setSelections(nextAns ? nextAns.split(', ') : [])
      setFading(false)
    }, 200)
  }

  function next() {
    if (!hasAnswer || fading) return
    const value = selections.join(', ')
    const newAnswers = [...answers]
    newAnswers[step] = value
    setAnswers(newAnswers)
    commitAndAdvance(newAnswers)
  }

  function back() {
    if (step === 0 || fading) return
    // Save whatever is currently selected (partial is fine)
    const value = selections.join(', ')
    const newAnswers = [...answers]
    newAnswers[step] = value
    setAnswers(newAnswers)

    setFading(true)
    setTimeout(() => {
      const prevStep = step - 1
      setStep(prevStep)
      const prevAns = newAnswers[prevStep]
      setSelections(prevAns ? prevAns.split(', ') : [])
      setFading(false)
    }, 200)
  }

  const pct = ((step + (hasAnswer ? 0.5 : 0)) / STEPS.length) * 100

  return (
    <div className="min-h-screen bg-slate-900 flex flex-col">
      {/* Progress strip */}
      <div className="h-1 bg-slate-800">
        <div className="h-full transition-all duration-500 ease-out rounded-r-full"
          style={{ width: `${pct}%`, background: `linear-gradient(90deg, ${color}, ${color}cc)` }} />
      </div>

      {/* Hero */}
      <div className="relative overflow-hidden" style={{ background: 'linear-gradient(160deg, #0f172a 0%, #1e293b 100%)' }}>
        <div className="absolute inset-0 pointer-events-none" style={{ backgroundImage: 'radial-gradient(circle, rgba(255,255,255,0.04) 1px, transparent 1px)', backgroundSize: '28px 28px' }} />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 rounded-full pointer-events-none transition-all duration-700"
          style={{ background: `radial-gradient(ellipse, ${color}30 0%, transparent 65%)` }} />

        <div className="relative z-10 px-6 py-10 text-center max-w-xl mx-auto">
          <div className="flex items-center justify-center gap-2.5 mb-6">
            <div className="w-9 h-9 rounded-xl bg-blue-700 flex items-center justify-center shadow-lg">
              <span className="text-white text-sm font-black mono">TC</span>
            </div>
            <span className="text-white/70 text-sm font-semibold">Trace Cohen · Fundraising Coach</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-black text-white mb-2 leading-tight">
            Let&apos;s get you<br />
            <span className="font-black" style={{ color }}>benchmarked</span>
          </h1>
          <p className="text-white/60 text-sm">{step + 1} of {STEPS.length} questions · ~60 seconds</p>

          <div className="flex gap-2 justify-center mt-5">
            {STEPS.map((_, i) => (
              <div key={i} className="rounded-full transition-all duration-300"
                style={{ width: i === step ? 32 : 8, height: 8, background: i < step ? color : i === step ? color : 'rgba(255,255,255,0.15)' }} />
            ))}
          </div>
        </div>
      </div>

      {/* Form */}
      <div className="flex-1 flex items-start justify-center px-4 py-8 bg-gray-50"
        style={{ backgroundImage: 'radial-gradient(circle, #cbd5e1 1px, transparent 1px)', backgroundSize: '24px 24px' }}>
        <div className="w-full max-w-md">
          <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden transition-opacity duration-200"
            style={{ opacity: fading ? 0 : 1 }}>
            <div className="h-1.5" style={{ background: `linear-gradient(90deg, ${color}, ${color}80)` }} />

            <div className="p-6">
              {/* Header row */}
              <div className="flex items-center justify-between mb-5">
                <div className="flex items-center gap-3">
                  <div className="w-11 h-11 rounded-xl flex items-center justify-center text-xl shadow-sm flex-shrink-0" style={{ background: bg }}>
                    {icon}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="mono text-xs font-bold uppercase tracking-widest" style={{ color }}>Question {step + 1}</span>
                      {current.multi && (
                        <span className="mono text-xs bg-blue-50 text-blue-600 border border-blue-200 rounded-full px-2 py-0.5 font-bold">Multi-select</span>
                      )}
                    </div>
                    <h2 className="text-xl font-black text-slate-900 leading-tight">{current.question}</h2>
                  </div>
                </div>
                {step > 0 && (
                  <button onClick={back}
                    className="shrink-0 ml-3 flex items-center gap-1 px-3 py-1.5 rounded-lg bg-slate-100 border border-slate-200 text-xs font-bold text-slate-500 hover:text-slate-900 hover:bg-slate-200 transition-all mono uppercase tracking-wide">
                    ← Back
                  </button>
                )}
              </div>

              <p className="text-sm text-slate-500 mb-5 border-l-2 pl-3" style={{ borderColor: `${color}50` }}>
                {current.sub}
              </p>

              {/* Options */}
              <div className="grid gap-2 mb-5">
                {current.options.map(opt => {
                  const active = selections.includes(opt)
                  return (
                    <button key={opt} onClick={() => toggle(opt)}
                      className="w-full text-left px-4 py-3 rounded-xl text-sm font-semibold border transition-all"
                      style={active ? { background: bg, borderColor: color, color, boxShadow: `0 0 0 3px ${color}20` }
                                    : { background: 'white', borderColor: '#e2e8f0', color: '#475569' }}>
                      <span className="mono text-xs mr-2.5 font-black" style={{ color: active ? color : '#cbd5e1' }}>
                        {active ? (current.multi ? '✓' : '▶') : (current.multi ? '□' : '○')}
                      </span>
                      {opt}
                    </button>
                  )
                })}
              </div>

              <button onClick={next} disabled={!hasAnswer}
                className="w-full py-3.5 rounded-xl text-white text-sm font-black transition-all shadow-md disabled:opacity-30 disabled:cursor-not-allowed"
                style={{ background: hasAnswer ? `linear-gradient(135deg, ${color}, ${color}cc)` : '#94a3b8' }}>
                {step === STEPS.length - 1
                  ? '🚀 Start Coaching →'
                  : current.multi && selections.length > 1
                  ? `Continue (${selections.length} selected) →`
                  : 'Continue →'}
              </button>
            </div>
          </div>

          <p className="text-center text-xs mono text-slate-400 mt-4 uppercase tracking-widest">
            Free · No account · Real 2025 data
          </p>
        </div>
      </div>
    </div>
  )
}
