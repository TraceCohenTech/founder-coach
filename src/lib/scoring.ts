import { UserProfile } from './system-prompt'

export const ARR_IDX: Record<string, number> = {
  'Pre-revenue': 0, '<$10K MRR': 1, '$10K–$50K MRR': 2,
  '$50K–$200K MRR': 3, '$200K–$500K MRR': 4,
  '$500K–$2M ARR': 5, '$2M–$10M ARR': 6, '$10M+ ARR': 7,
}
export const STAGE_TARGET: Record<string, number> = {
  'Pre-Seed': 0, 'Seed': 2, 'Series A': 5, 'Series B': 6, 'Series C+': 7,
}
export const GROWTH_PTS: Record<string, number> = {
  'Pre-revenue / no data yet': 15, '<5% MoM': 8, '5–10% MoM': 18,
  '10–20% MoM': 26, '20–30% MoM': 32, '30%+ MoM': 35,
  '2–3x YoY': 28, '3x+ YoY': 35,
}
export const SECTOR_PTS: Record<string, number> = {
  'AI / ML': 15, 'Defense Tech': 14, 'Healthcare': 12,
  'Fintech': 11, 'B2B SaaS': 10, 'Climate': 10, 'Consumer': 7, 'Other': 8,
}
export const GEO_PTS: Record<string, number> = {
  'San Francisco / Bay Area': 10, 'New York': 9,
  'Los Angeles': 8, 'Austin': 8, 'Miami': 7, 'Europe': 7, 'Other': 6,
}

export function getComponentScores(p: UserProfile) {
  const diff = (ARR_IDX[p.arr] ?? 2) - (STAGE_TARGET[p.stage] ?? 3)
  const arrPts = Math.max(0, Math.min(40, 20 + diff * 8))
  const gPts   = GROWTH_PTS[p.growth] ?? 15
  const sPts   = Math.max(...p.sector.map(s => SECTOR_PTS[s.trim()] ?? 8))
  const geoPt  = GEO_PTS[p.geo] ?? 7
  return { arrPts, gPts, sPts, geoPt }
}

export function calcScore(p: UserProfile): { score: number; insights: { good: boolean; text: string }[] } {
  const { arrPts, gPts, sPts, geoPt } = getComponentScores(p)
  const ins: { good: boolean; text: string }[] = []

  const diff = (ARR_IDX[p.arr] ?? 2) - (STAGE_TARGET[p.stage] ?? 3)
  ins.push(diff >= 0
    ? { good: true,  text: `${p.arr} is in the right range for ${p.stage}` }
    : { good: false, text: `${p.arr} may be light for ${p.stage} — VCs will probe this first` })

  ins.push(gPts >= 28
    ? { good: true,  text: `${p.growth} growth is a standout signal — lead every pitch with it` }
    : gPts >= 18
    ? { good: true,  text: `${p.growth} growth is solid — benchmark it vs. category leaders` }
    : { good: false, text: `${p.growth} growth will get hard questions — have an acceleration story` })

  const primarySector = p.sector[0] ?? ''
  if (sPts >= 12) ins.push({ good: true,  text: `${primarySector} is commanding a premium from VCs in 2025` })
  else if (sPts <= 7) ins.push({ good: false, text: `${primarySector} faces more skepticism — nail your differentiation` })

  return { score: Math.min(100, Math.round(arrPts + gPts + sPts + geoPt)), insights: ins.slice(0, 4) }
}

export function getGrade(score: number) {
  if (score >= 80) return { label: 'Raise-Ready',   color: '#059669', desc: "Fundamentals are there. Execution is everything now." }
  if (score >= 65) return { label: 'Getting There', color: '#1d4ed8', desc: "Solid base with a few gaps. Fix the reds before going wide." }
  if (score >= 50) return { label: 'Almost Ready',  color: '#d97706', desc: "Key gaps will stall your process. Address them first." }
  return              { label: 'Not Ready Yet',  color: '#dc2626', desc: "Significant issues VCs will find. Work these before starting." }
}

// Deterministic opening — renders instantly, no API call
export function buildIntro(profile: UserProfile): string {
  const { score, insights } = calcScore(profile)
  const { label } = getGrade(score)

  const sectors = profile.sector.length > 0 ? profile.sector.join(' + ') : 'your sector'
  const bads  = insights.filter(i => !i.good)
  const goods = insights.filter(i => i.good)

  const lines: string[] = []
  lines.push(`**${profile.stage} · ${sectors} · ${profile.geo}** — Score **${score}/100 (${label})**`)
  lines.push('')
  lines.push("Here's my honest read:")
  lines.push('')

  if (bads.length > 0) {
    lines.push('**What VCs will push on:**')
    bads.forEach(b => lines.push(`- ${b.text}`))
    lines.push('')
  }

  if (goods.length > 0) {
    lines.push("**What's working in your favor:**")
    goods.forEach(g => lines.push(`- ${g.text}`))
    lines.push('')
  }

  if (profile.raiseSize && profile.raiseSize !== 'Not sure yet') {
    const hasHistory = profile.priorRaise && profile.priorRaise !== 'No prior funding'
    if (hasHistory) {
      lines.push(`You're raising ${profile.raiseSize} with ${profile.priorRaise} already behind you — lean into that continuity with existing investors.`)
    } else {
      lines.push(`You're raising ${profile.raiseSize}. ${score < 65
        ? 'Given the gaps above, you\'ll need a tight story around why now and exactly where the capital goes.'
        : 'The fundamentals support that check size — lean into the traction data.'
      }`)
    }
    lines.push('')
  }

  lines.push('Where do you want to start?')
  return lines.join('\n')
}
