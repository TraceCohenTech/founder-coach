'use client'

import { useState, useMemo } from 'react'
import Link from 'next/link'

interface VC {
  name: string
  stages: string[]
  sectors: string[]
  geo: string[]
  check: string
  thesis: string
  url: string
}

const VCS: VC[] = [
  // ── NYC ───────────────────────────────────────────────────────────────────
  { name: 'NYVP', stages: ['Pre-Seed','Seed'], sectors: ['B2B SaaS','AI / ML','Fintech','Consumer','Other'], geo: ['New York'], check: '$250K–$1M', thesis: "Trace Cohen's own fund — early-stage bets across the NYC ecosystem with hands-on operator support.", url: 'https://nyvp.com' },
  { name: 'BoxGroup', stages: ['Pre-Seed','Seed'], sectors: ['B2B SaaS','Fintech','Healthcare','Consumer','AI / ML'], geo: ['New York'], check: '$250K–$1M', thesis: 'First-check NYC fund known for dense, category-defining portfolios and fast, low-process decisions.', url: 'https://boxgroup.com' },
  { name: 'Lerer Hippeau', stages: ['Seed','Series A'], sectors: ['B2B SaaS','Consumer','Fintech','Healthcare'], geo: ['New York'], check: '$500K–$2M', thesis: 'NYC-centric seed fund with a strong consumer and enterprise lens. Deep LP network for B2B distribution.', url: 'https://lererhippeau.com' },
  { name: 'Primary VP', stages: ['Seed','Series A'], sectors: ['B2B SaaS','Fintech','AI / ML'], geo: ['New York'], check: '$1M–$5M', thesis: 'NYC B2B SaaS specialists. Run "In Residence" programs and have deep enterprise buyer networks.', url: 'https://primary.vc' },
  { name: 'RRE Ventures', stages: ['Seed','Series A','Series B'], sectors: ['B2B SaaS','Fintech','Defense Tech','Healthcare'], geo: ['New York'], check: '$500K–$10M', thesis: "One of NYC's oldest funds. Deep enterprise and financial services relationships. Broad mandate.", url: 'https://rre.com' },
  { name: 'Notation Capital', stages: ['Pre-Seed'], sectors: ['B2B SaaS','Consumer','Fintech','AI / ML','Other'], geo: ['New York'], check: '$150K–$400K', thesis: 'Pre-product, pre-revenue NYC first checks. Lean fund, fast decisions, founder-first mentality.', url: 'https://notation.vc' },
  { name: 'Contour VP', stages: ['Seed','Series A'], sectors: ['B2B SaaS','Fintech'], geo: ['New York'], check: '$1M–$5M', thesis: 'NYC fintech and B2B SaaS. Operator-led fund with LP base across enterprise and financial services.', url: 'https://contourventures.com' },
  { name: 'Flybridge', stages: ['Seed','Series A'], sectors: ['B2B SaaS','AI / ML','Consumer'], geo: ['New York','San Francisco / Bay Area'], check: '$500K–$3M', thesis: 'Runs MBA Fellowship for sourcing. Generalist early-stage with offices in NY and Boston.', url: 'https://flybridge.com' },
  { name: 'Point72 VP', stages: ['Seed','Series A','Series B'], sectors: ['Fintech','AI / ML','B2B SaaS'], geo: ['New York'], check: '$1M–$25M', thesis: "Steve Cohen's venture arm. Heavy in fintech and AI infrastructure. Hedge fund-grade diligence.", url: 'https://point72.com/ventures/' },
  { name: 'Nyca Partners', stages: ['Seed','Series A','Series B'], sectors: ['Fintech','B2B SaaS'], geo: ['New York'], check: '$1M–$15M', thesis: 'NYC fintech specialists. Former Visa and FSI executives as LPs give portfolio real distribution.', url: 'https://nyca.com' },
  { name: 'Lux Capital', stages: ['Seed','Series A','Series B','Series C+'], sectors: ['Defense Tech','Healthcare','Climate','AI / ML'], geo: ['New York','San Francisco / Bay Area'], check: '$2M–$50M', thesis: "Josh Wolfe's science and deep tech fund. Defense, bio, and frontier tech. Contrarian macro lens.", url: 'https://luxcapital.com' },
  { name: 'Insight Partners', stages: ['Series A','Series B','Series C+'], sectors: ['B2B SaaS','AI / ML','Fintech','Healthcare'], geo: ['New York'], check: '$10M–$300M', thesis: 'ScaleUp™ methodology. Will pay aggressive multiples for proven SaaS growth. NYC HQ, global reach.', url: 'https://insightpartners.com' },

  // ── SF / Bay Area ─────────────────────────────────────────────────────────
  { name: 'Y Combinator', stages: ['Pre-Seed','Seed'], sectors: ['B2B SaaS','AI / ML','Fintech','Healthcare','Consumer','Defense Tech','Climate','Other'], geo: ['San Francisco / Bay Area','New York','Other'], check: '$500K', thesis: "The world's top accelerator. $500K for 7% equity. Batch twice/year. Network effect is unmatched.", url: 'https://ycombinator.com' },
  { name: 'a16z', stages: ['Seed','Series A','Series B','Series C+'], sectors: ['B2B SaaS','AI / ML','Fintech','Healthcare','Consumer','Defense Tech','Climate'], geo: ['San Francisco / Bay Area'], check: '$500K–$100M+', thesis: 'Platform-first mega-fund. Software is eating the world, AI is next. Category-defining bets only.', url: 'https://a16z.com' },
  { name: 'Sequoia', stages: ['Seed','Series A','Series B','Series C+'], sectors: ['B2B SaaS','AI / ML','Fintech','Healthcare','Consumer','Defense Tech'], geo: ['San Francisco / Bay Area','New York'], check: '$1M–$100M+', thesis: 'The standard bearer. Runs Arc seed program. Backs companies that define their categories.', url: 'https://sequoiacap.com' },
  { name: 'First Round', stages: ['Seed'], sectors: ['B2B SaaS','AI / ML','Fintech','Healthcare','Consumer'], geo: ['San Francisco / Bay Area','New York'], check: '$1M–$5M', thesis: "The seed benchmark. First Round Review is required reading. Community-first investing model.", url: 'https://firstround.com' },
  { name: 'Founders Fund', stages: ['Seed','Series A','Series B','Series C+'], sectors: ['Defense Tech','AI / ML','B2B SaaS','Healthcare','Climate'], geo: ['San Francisco / Bay Area'], check: '$1M–$50M+', thesis: "Peter Thiel's fund. Deep tech and defense. Contrarian theses only — if everyone's doing it, they pass.", url: 'https://foundersfund.com' },
  { name: 'General Catalyst', stages: ['Seed','Series A','Series B','Series C+'], sectors: ['Healthcare','AI / ML','B2B SaaS','Fintech','Climate'], geo: ['San Francisco / Bay Area','New York','Other'], check: '$1M–$100M+', thesis: "Scale-up fund with healthcare and AI conviction. 'Health Assurance' and responsible innovation thesis.", url: 'https://generalcatalyst.com' },
  { name: 'Lightspeed', stages: ['Seed','Series A','Series B','Series C+'], sectors: ['B2B SaaS','AI / ML','Consumer','Fintech'], geo: ['San Francisco / Bay Area','New York','Other'], check: '$1M–$100M+', thesis: 'Global platform. Enterprise and consumer verticals. Runs Lightspeed Faction seed scout program.', url: 'https://lsvp.com' },
  { name: 'Accel', stages: ['Seed','Series A','Series B','Series C+'], sectors: ['B2B SaaS','AI / ML','Fintech','Healthcare'], geo: ['San Francisco / Bay Area','Europe'], check: '$1M–$100M+', thesis: 'Enterprise-first. Early bets on global infrastructure. Deep Europe presence via Accel London.', url: 'https://accel.com' },
  { name: 'Bessemer VP', stages: ['Seed','Series A','Series B','Series C+'], sectors: ['B2B SaaS','AI / ML','Fintech','Healthcare','Consumer'], geo: ['San Francisco / Bay Area','New York'], check: '$1M–$100M+', thesis: 'Cloud and SaaS specialists. Publish detailed investment memos publicly. Legendary anti-portfolio.', url: 'https://bvp.com' },
  { name: 'Khosla Ventures', stages: ['Seed','Series A','Series B'], sectors: ['AI / ML','Healthcare','Climate','B2B SaaS','Defense Tech'], geo: ['San Francisco / Bay Area'], check: '$500K–$30M', thesis: "Deep tech and science-forward bets. High-risk/high-reward only. Vinod takes the moon shots.", url: 'https://khoslaventures.com' },
  { name: 'Conviction', stages: ['Seed','Series A'], sectors: ['AI / ML','B2B SaaS'], geo: ['San Francisco / Bay Area'], check: '$1M–$10M', thesis: "Sarah Guo's AI-first fund. Former Greylock. If you're AI-native and in SF, this is a top 5 call.", url: 'https://conviction.com' },
  { name: 'Radical Ventures', stages: ['Seed','Series A','Series B'], sectors: ['AI / ML','B2B SaaS'], geo: ['San Francisco / Bay Area','Other'], check: '$1M–$30M', thesis: 'AI specialists. Cofounded by Geoffrey Hinton. For companies where AI is the core IP breakthrough.', url: 'https://radical.vc' },
  { name: 'Forerunner', stages: ['Seed','Series A','Series B'], sectors: ['Consumer','B2B SaaS'], geo: ['San Francisco / Bay Area'], check: '$1M–$20M', thesis: "Kirsten Green's taste-led consumer fund. Warby Parker, Dollar Shave, Glossier. Commerce DNA.", url: 'https://forerunnerventures.com' },
  { name: 'Emergence Capital', stages: ['Series A','Series B'], sectors: ['B2B SaaS','AI / ML'], geo: ['San Francisco / Bay Area'], check: '$5M–$30M', thesis: "Enterprise SaaS specialists who coined 'SaaS.' Zoom, Salesforce, Veeva. They know this playbook cold.", url: 'https://emcap.com' },
  { name: 'OpenView', stages: ['Series A','Series B'], sectors: ['B2B SaaS','AI / ML'], geo: ['San Francisco / Bay Area','New York','Other'], check: '$5M–$30M', thesis: 'Product-led growth specialists. If your PLG motion is real and repeatable, call OpenView first.', url: 'https://openviewpartners.com' },
  { name: 'GV', stages: ['Seed','Series A','Series B'], sectors: ['Healthcare','AI / ML','B2B SaaS','Climate'], geo: ['San Francisco / Bay Area','New York','Europe'], check: '$1M–$50M', thesis: "Google's VC arm. Life sciences and AI strong. Access to Google infrastructure and network is real.", url: 'https://gv.com' },
  { name: 'Spark Capital', stages: ['Seed','Series A','Series B','Series C+'], sectors: ['Consumer','Fintech','B2B SaaS','AI / ML'], geo: ['San Francisco / Bay Area','New York'], check: '$1M–$100M', thesis: 'Twitter, Warby Parker, Tumblr DNA. Culture-first consumer with enterprise discipline.', url: 'https://sparkcapital.com' },
  { name: 'IVP', stages: ['Series B','Series C+'], sectors: ['B2B SaaS','Consumer','Fintech','AI / ML'], geo: ['San Francisco / Bay Area'], check: '$20M–$150M', thesis: 'Series B/C specialists. Twitter, Snap, GitHub. The Series B squeeze is their specific entry point.', url: 'https://ivp.com' },
  { name: 'NEA', stages: ['Seed','Series A','Series B','Series C+'], sectors: ['Healthcare','B2B SaaS','AI / ML','Consumer','Fintech'], geo: ['San Francisco / Bay Area','New York','Other'], check: '$1M–$100M+', thesis: 'One of the oldest and largest. $20B+ AUM. Healthcare and enterprise tech are their strongest verticals.', url: 'https://nea.com' },
  { name: 'Battery Ventures', stages: ['Seed','Series A','Series B','Series C+'], sectors: ['B2B SaaS','Fintech','AI / ML','Healthcare'], geo: ['San Francisco / Bay Area','New York','Europe'], check: '$1M–$100M+', thesis: '40-year-old fund. Application software and infrastructure. Publish State of Open Source annually.', url: 'https://battery.com' },

  // ── Defense ───────────────────────────────────────────────────────────────
  { name: 'Shield Capital', stages: ['Seed','Series A','Series B'], sectors: ['Defense Tech','AI / ML','B2B SaaS'], geo: ['San Francisco / Bay Area','Other'], check: '$1M–$20M', thesis: 'Defense-focused specialists. Former IC and Pentagon operators. Deep DoD procurement knowledge.', url: 'https://shieldcap.com' },
  { name: 'Paladin Capital', stages: ['Series A','Series B','Series C+'], sectors: ['Defense Tech','AI / ML','B2B SaaS'], geo: ['Other'], check: '$5M–$50M', thesis: 'DC-based defense and national security specialists. Deep IC and government contractor relationships.', url: 'https://paladincapgroup.com' },
  { name: 'In-Q-Tel', stages: ['Seed','Series A'], sectors: ['Defense Tech','AI / ML','B2B SaaS'], geo: ['Other'], check: 'Non-dilutive', thesis: "CIA's strategic investment arm. Non-dilutive capital. Comes with USG validation and procurement access.", url: 'https://iqt.org' },

  // ── Fintech ───────────────────────────────────────────────────────────────
  { name: 'Ribbit Capital', stages: ['Seed','Series A','Series B','Series C+'], sectors: ['Fintech','B2B SaaS'], geo: ['San Francisco / Bay Area','Other'], check: '$1M–$50M', thesis: 'Pure-play fintech specialists. Robinhood, Coinbase, Credit Karma. They know the regulatory map cold.', url: 'https://ribbitcap.com' },
  { name: 'QED Investors', stages: ['Seed','Series A','Series B'], sectors: ['Fintech','B2B SaaS'], geo: ['Other','New York','San Francisco / Bay Area'], check: '$2M–$30M', thesis: 'Global fintech specialists. Former Capital One execs. Deep in payments, lending, and insurance.', url: 'https://qedinvestors.com' },
  { name: 'Bain Capital VP', stages: ['Series A','Series B','Series C+'], sectors: ['B2B SaaS','Fintech','AI / ML'], geo: ['San Francisco / Bay Area','New York'], check: '$5M–$75M', thesis: 'Bain alumni network is the edge. Deep in fintech infrastructure and enterprise SaaS scale-up.', url: 'https://baincapitalventures.com' },
  { name: 'Anthemis', stages: ['Seed','Series A','Series B'], sectors: ['Fintech','Healthcare'], geo: ['Europe','New York'], check: '$1M–$20M', thesis: 'European fintech and insurtech specialists. Strong in climate fintech and embedded finance.', url: 'https://anthemis.com' },

  // ── Healthcare ────────────────────────────────────────────────────────────
  { name: 'Rock Health', stages: ['Seed','Series A'], sectors: ['Healthcare','AI / ML'], geo: ['San Francisco / Bay Area'], check: '$500K–$5M', thesis: 'Digital health specialists. Annual State of Digital Health report sets the benchmark for the sector.', url: 'https://rockhealth.com' },
  { name: 'a16z Bio', stages: ['Seed','Series A','Series B','Series C+'], sectors: ['Healthcare','AI / ML'], geo: ['San Francisco / Bay Area'], check: '$2M–$100M+', thesis: "a16z's dedicated health fund. Software-biology convergence thesis. Former NIH and FDA advisors on staff.", url: 'https://a16z.com/bio-health' },

  // ── Climate ───────────────────────────────────────────────────────────────
  { name: 'Breakthrough Energy', stages: ['Series A','Series B','Series C+'], sectors: ['Climate','AI / ML'], geo: ['San Francisco / Bay Area','Other'], check: '$10M–$200M', thesis: 'Bill Gates-backed climate fund. Hard science and breakthrough innovation only. 20-year time horizon.', url: 'https://breakthroughenergy.org' },
  { name: 'Lowercarbon', stages: ['Seed','Series A','Series B'], sectors: ['Climate','B2B SaaS','AI / ML'], geo: ['San Francisco / Bay Area','Other'], check: '$1M–$30M', thesis: "Chris Sacca's climate fund. Fast, irreverent, mission-driven. They'll back weird bets in climate.", url: 'https://lowercarbon.com' },
  { name: 'Congruent VP', stages: ['Seed','Series A'], sectors: ['Climate','B2B SaaS'], geo: ['San Francisco / Bay Area'], check: '$500K–$5M', thesis: 'Sustainability-focused early stage. Climate tech, sustainable cities, and clean mobility.', url: 'https://congruentvc.com' },

  // ── Europe ────────────────────────────────────────────────────────────────
  { name: 'Index Ventures', stages: ['Seed','Series A','Series B','Series C+'], sectors: ['B2B SaaS','Fintech','Consumer','AI / ML'], geo: ['Europe','San Francisco / Bay Area','New York'], check: '$1M–$100M+', thesis: 'SF and London platform. Notion, Figma, Robinhood. The best bridge between Europe and Silicon Valley.', url: 'https://indexventures.com' },
  { name: 'Balderton', stages: ['Seed','Series A','Series B','Series C+'], sectors: ['B2B SaaS','Fintech','Consumer','AI / ML'], geo: ['Europe'], check: '$1M–$50M', thesis: 'London-based. European category leaders only. Deep operator mentor network across the continent.', url: 'https://balderton.com' },
  { name: 'Atomico', stages: ['Series A','Series B','Series C+'], sectors: ['B2B SaaS','Fintech','AI / ML','Climate'], geo: ['Europe'], check: '$5M–$100M', thesis: "Skype founder Niklas Zennström's fund. European breakout-stage specialist. Strong in Nordics.", url: 'https://atomico.com' },
  { name: 'Northzone', stages: ['Seed','Series A','Series B'], sectors: ['B2B SaaS','Fintech','Consumer','AI / ML'], geo: ['Europe','New York'], check: '$1M–$30M', thesis: 'Nordic-rooted, pan-European. Spotify-era partners. NY office actively expanding into US market.', url: 'https://northzone.com' },
  { name: 'Creandum', stages: ['Seed','Series A','Series B'], sectors: ['B2B SaaS','Consumer','Fintech','AI / ML'], geo: ['Europe'], check: '$1M–$20M', thesis: 'Stockholm-based. Klarna, Spotify, iZettle. Nordics and DACH focus with strong consumer DNA.', url: 'https://creandum.com' },

  // ── Late / Growth ─────────────────────────────────────────────────────────
  { name: 'Tiger Global', stages: ['Series B','Series C+'], sectors: ['B2B SaaS','Consumer','Fintech','AI / ML'], geo: ['New York','San Francisco / Bay Area','Other'], check: '$25M–$500M+', thesis: 'Quantitative growth investing. Fast decisions. Pays up for quality. Less board involvement than most.', url: 'https://tigerglobal.com' },
  { name: 'Coatue', stages: ['Series B','Series C+'], sectors: ['B2B SaaS','AI / ML','Fintech','Consumer'], geo: ['New York','San Francisco / Bay Area'], check: '$25M–$500M+', thesis: "Philippe Laffont's fund. Heavy AI thesis. Crossover from public markets. Diligence is extensive.", url: 'https://coatue.com' },
  { name: 'Sapphire VP', stages: ['Series A','Series B','Series C+'], sectors: ['B2B SaaS','AI / ML','Fintech'], geo: ['San Francisco / Bay Area','Europe'], check: '$10M–$100M', thesis: 'Enterprise SaaS scale-up specialists. SAP spin-off with deep CIO and CISO enterprise networks.', url: 'https://sapphireventures.com' },
]

const STAGES   = ['Pre-Seed','Seed','Series A','Series B','Series C+']
const SECTORS  = ['B2B SaaS','AI / ML','Fintech','Healthcare','Consumer','Defense Tech','Climate','Other']
const GEOS     = ['New York','San Francisco / Bay Area','Los Angeles','Austin','Miami','Europe','Other']

const STAGE_COLOR: Record<string, string> = {
  'Pre-Seed': '#7c3aed', 'Seed': '#2563eb', 'Series A': '#059669',
  'Series B': '#d97706', 'Series C+': '#dc2626',
}

export default function VCTargetList() {
  const [stage, setStage]   = useState<string | null>(null)
  const [sector, setSector] = useState<string | null>(null)
  const [geo, setGeo]       = useState<string | null>(null)
  const [search, setSearch] = useState('')

  const filtered = useMemo(() => {
    return VCS.filter(vc => {
      if (stage  && !vc.stages.includes(stage))  return false
      if (sector && !vc.sectors.includes(sector)) return false
      if (geo    && !vc.geo.includes(geo))        return false
      if (search) {
        const q = search.toLowerCase()
        if (!vc.name.toLowerCase().includes(q) && !vc.thesis.toLowerCase().includes(q)) return false
      }
      return true
    })
  }, [stage, sector, geo, search])

  function Chip({ label, active, onClick }: { label: string; active: boolean; onClick: () => void }) {
    return (
      <button onClick={onClick}
        className="px-3 py-1.5 rounded-full text-xs font-bold border transition-all mono uppercase tracking-wide"
        style={active
          ? { background: '#1d4ed8', borderColor: '#1d4ed8', color: 'white' }
          : { background: 'white', borderColor: '#e2e8f0', color: '#64748b' }}>
        {label}
      </button>
    )
  }

  return (
    <div className="min-h-screen bg-slate-900 flex flex-col">
      {/* Header */}
      <header className="bg-slate-900 border-b border-white/10 px-4 py-3 flex items-center justify-between shrink-0 shadow-md">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-blue-700 flex items-center justify-center shadow-lg">
            <span className="text-white text-sm font-black mono">TC</span>
          </div>
          <div>
            <div className="text-sm font-bold text-white">VC Target List</div>
            <div className="mono text-xs text-white/40 uppercase tracking-widest">{filtered.length} investors · 2025</div>
          </div>
        </div>
        <Link href="/"
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/8 border border-white/12 mono text-xs text-white/50 hover:text-white hover:bg-white/14 transition-all uppercase tracking-wide">
          ← Back
        </Link>
      </header>

      {/* Filters */}
      <div className="bg-white border-b border-slate-200 px-4 py-4 shrink-0">
        <div className="max-w-5xl mx-auto space-y-3">
          {/* Search */}
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search firms or thesis keywords..."
            className="w-full bg-gray-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition-all"
          />
          {/* Stage */}
          <div className="flex flex-wrap gap-2 items-center">
            <span className="mono text-xs text-slate-400 uppercase tracking-widest shrink-0">Stage:</span>
            <Chip label="All" active={!stage} onClick={() => setStage(null)} />
            {STAGES.map(s => <Chip key={s} label={s} active={stage === s} onClick={() => setStage(stage === s ? null : s)} />)}
          </div>
          {/* Sector */}
          <div className="flex flex-wrap gap-2 items-center">
            <span className="mono text-xs text-slate-400 uppercase tracking-widest shrink-0">Sector:</span>
            <Chip label="All" active={!sector} onClick={() => setSector(null)} />
            {SECTORS.map(s => <Chip key={s} label={s} active={sector === s} onClick={() => setSector(sector === s ? null : s)} />)}
          </div>
          {/* Geo */}
          <div className="flex flex-wrap gap-2 items-center">
            <span className="mono text-xs text-slate-400 uppercase tracking-widest shrink-0">Geo:</span>
            <Chip label="All" active={!geo} onClick={() => setGeo(null)} />
            {GEOS.map(g => <Chip key={g} label={g} active={geo === g} onClick={() => setGeo(geo === g ? null : g)} />)}
          </div>
        </div>
      </div>

      {/* List */}
      <div className="flex-1 overflow-y-auto px-4 py-6"
        style={{ backgroundImage: 'radial-gradient(circle, #334155 1px, transparent 1px)', backgroundSize: '24px 24px' }}>
        <div className="max-w-5xl mx-auto">
          {filtered.length === 0 ? (
            <div className="text-center py-20">
              <p className="text-white/40 mono text-sm uppercase tracking-widest">No investors match your filters</p>
              <button onClick={() => { setStage(null); setSector(null); setGeo(null); setSearch('') }}
                className="mt-4 px-4 py-2 rounded-lg bg-blue-700 text-white text-sm font-bold hover:bg-blue-600 transition-colors">
                Clear all filters
              </button>
            </div>
          ) : (
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {filtered.map(vc => (
                <a key={vc.name} href={vc.url} target="_blank" rel="noreferrer"
                  className="bg-white rounded-2xl border border-slate-200 p-5 block hover:border-blue-300 hover:shadow-lg transition-all group">
                  {/* Top row */}
                  <div className="flex items-start justify-between gap-2 mb-3">
                    <div>
                      <h3 className="font-black text-slate-900 text-base leading-tight group-hover:text-blue-700 transition-colors">{vc.name}</h3>
                      <p className="mono text-xs text-slate-400 mt-0.5">{vc.check} check</p>
                    </div>
                    <span className="shrink-0 mono text-xs text-blue-600 font-bold bg-blue-50 border border-blue-200 px-2 py-1 rounded-lg">
                      Visit →
                    </span>
                  </div>

                  {/* Stage badges */}
                  <div className="flex flex-wrap gap-1 mb-2">
                    {vc.stages.map(s => (
                      <span key={s} className="mono text-xs px-2 py-0.5 rounded-full font-bold"
                        style={{ background: `${STAGE_COLOR[s]}15`, color: STAGE_COLOR[s], border: `1px solid ${STAGE_COLOR[s]}30` }}>
                        {s}
                      </span>
                    ))}
                  </div>

                  {/* Geo */}
                  <p className="mono text-xs text-slate-400 mb-3">
                    {vc.geo.join(' · ')}
                  </p>

                  {/* Thesis */}
                  <p className="text-sm text-slate-600 leading-relaxed">{vc.thesis}</p>

                  {/* Sector tags */}
                  <div className="flex flex-wrap gap-1 mt-3">
                    {vc.sectors.slice(0, 4).map(s => (
                      <span key={s} className="text-xs px-2 py-0.5 rounded bg-slate-100 text-slate-500 font-medium">{s}</span>
                    ))}
                    {vc.sectors.length > 4 && (
                      <span className="text-xs px-2 py-0.5 rounded bg-slate-100 text-slate-400">+{vc.sectors.length - 4}</span>
                    )}
                  </div>
                </a>
              ))}
            </div>
          )}
        </div>
      </div>

      <div className="bg-slate-900 border-t border-white/10 px-4 py-3">
        <p className="text-center mono text-xs text-white/25 uppercase tracking-widest">
          Trace Cohen ·{' '}
          <a href="https://x.com/Trace_Cohen" className="hover:text-white/50 transition-colors">@Trace_Cohen</a>
          {' · '}
          <a href="mailto:t@nyvp.com" className="hover:text-white/50 transition-colors">t@nyvp.com</a>
        </p>
      </div>
    </div>
  )
}
