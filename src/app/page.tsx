'use client'

import { useState, useEffect } from 'react'
import Landing from '@/components/Landing'
import Onboarding from '@/components/Onboarding'
import ReadinessScore from '@/components/ReadinessScore'
import Chat from '@/components/Chat'
import { UserProfile } from '@/lib/system-prompt'

type Step = 'landing' | 'onboarding' | 'score' | 'chat'

const SESSION_KEY = 'fc_session'
const MESSAGES_KEY = 'fc_messages'

function clearSession() {
  try {
    localStorage.removeItem(SESSION_KEY)
    localStorage.removeItem(MESSAGES_KEY)
  } catch {}
}

export default function Home() {
  const [step, setStep]       = useState<Step>('landing')
  const [profile, setProfile] = useState<UserProfile | null>(null)
  const [hydrated, setHydrated] = useState(false)

  // Restore session on mount
  useEffect(() => {
    try {
      const raw = localStorage.getItem(SESSION_KEY)
      if (raw) {
        const { step: s, profile: p } = JSON.parse(raw)
        if (p && s && s !== 'landing') {
          setProfile(p)
          setStep(s)
        }
      }
    } catch {}
    setHydrated(true)
  }, [])

  // Persist session on change
  useEffect(() => {
    if (!hydrated) return
    if (step === 'landing') {
      clearSession()
    } else {
      try {
        localStorage.setItem(SESSION_KEY, JSON.stringify({ step, profile }))
      } catch {}
    }
  }, [step, profile, hydrated])

  if (!hydrated) return null

  if (step === 'landing')    return <Landing onStart={() => setStep('onboarding')} />
  if (step === 'onboarding') return <Onboarding onComplete={p => { setProfile(p); setStep('score') }} />
  if (step === 'score')      return <ReadinessScore profile={profile!} onContinue={() => setStep('chat')} onBack={() => setStep('onboarding')} />
  return <Chat profile={profile!} onHome={() => { clearSession(); setStep('landing') }} />
}
