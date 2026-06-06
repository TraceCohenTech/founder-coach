export const BENCHMARKS = {
  preSeed: {
    label: 'Pre-Seed',
    medianValuation: 4_000_000,
    medianCheckSize: 750_000,
    typicalRange: '$500K–$1.5M',
    whatVCsWant: 'Team, idea, TAM. Revenue optional but a strong signal.',
    redFlags: 'No clarity on problem, no domain expertise, unrealistic TAM claims',
  },
  seed: {
    label: 'Seed',
    medianARR: 300_000,
    medianMRR: 25_000,
    medianMoMGrowth: 20,
    medianValuation: 8_000_000,
    medianCheckSize: 2_500_000,
    typicalRange: '$1M–$4M',
    whatVCsWant: 'Early traction, clear ICP, some retention signal, compelling founder-market fit',
    redFlags: 'Churn >5% monthly, no clear differentiation, founder not in the space',
  },
  seriesA: {
    label: 'Series A',
    medianARR: 2_100_000,
    topQuartileARR: 4_000_000,
    medianNRR: 110,
    topQuartileNRR: 125,
    medianMoMGrowth: 13,
    medianValuation: 15_000_000,
    medianCheckSize: 8_000_000,
    typicalRange: '$5M–$15M',
    whatVCsWant: 'Repeatable sales motion, NRR >110%, clear path to $10M ARR, strong team velocity',
    redFlags: 'Sales cycle >6 months without enterprise pricing, NRR <100%, founder not in SF/NY ecosystem',
  },
  seriesB: {
    label: 'Series B',
    medianARR: 9_000_000,
    topQuartileARR: 15_000_000,
    medianNRR: 120,
    medianMoMGrowth: 10,
    medianValuation: 60_000_000,
    medianCheckSize: 25_000_000,
    typicalRange: '$15M–$50M',
    whatVCsWant: 'Scalable GTM, NRR >120%, path to profitability visible, management team in place',
    redFlags: 'Founder-led sales only, high burn with no efficiency improvement, market saturation risk',
  },
  market2025: {
    avgTimeToClose: '4–6 months',
    valuationCompressionVs2021: '30–40%',
    hotSectors: ['AI/ML infrastructure', 'Defense tech', 'Healthcare AI', 'Fintech infrastructure', 'Climate tech'],
    coldSectors: ['Consumer social', 'Crypto/NFT', 'Generic SaaS with no AI angle'],
    investorMindset: 'Profitability path matters again. Capital efficiency is the new growth.',
    aiPremium: 'AI-native companies getting 20–30% valuation premium vs. non-AI peers',
    topVCThesis2025: 'Vertical AI, agentic workflows, defense/dual-use, longevity/health',
  },
  saasMultiples: {
    median: 6,
    topQuartile: 10,
    ai: '12–18x ARR for true AI-native',
    note: 'Based on 2025 public SaaS comps. Private market 30–40% discount.',
  },
}

export function getStageData(stage: string) {
  const map: Record<string, keyof typeof BENCHMARKS> = {
    'pre-seed': 'preSeed',
    'preseed': 'preSeed',
    'seed': 'seed',
    'series-a': 'seriesA',
    'series a': 'seriesA',
    'series-b': 'seriesB',
    'series b': 'seriesB',
  }
  const key = map[stage.toLowerCase()]
  return key ? BENCHMARKS[key] : null
}
