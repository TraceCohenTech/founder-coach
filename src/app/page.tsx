'use client'

import { useState } from 'react'
import Landing from '@/components/Landing'
import Onboarding from '@/components/Onboarding'
import ReadinessScore from '@/components/ReadinessScore'
import Chat from '@/components/Chat'
import { UserProfile } from '@/lib/system-prompt'

type Step = 'landing' | 'onboarding' | 'score' | 'chat'

export default function Home() {
  const [step, setStep]       = useState<Step>('landing')
  const [profile, setProfile] = useState<UserProfile | null>(null)

  if (step === 'landing')    return <Landing onStart={() => setStep('onboarding')} />
  if (step === 'onboarding') return <Onboarding onComplete={p => { setProfile(p); setStep('score') }} />
  if (step === 'score')      return <ReadinessScore profile={profile!} onContinue={() => setStep('chat')} onBack={() => setStep('onboarding')} />
  return <Chat profile={profile!} onHome={() => setStep('landing')} />
}
