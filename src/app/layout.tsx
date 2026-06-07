import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'Founder Fundraising Coach | Trace Cohen · NYVP',
  description: 'Benchmark your metrics, prep for VC meetings, and decode term sheets — free AI coaching backed by Trace Cohen\'s decade of real deal data from 65+ investments.',
  metadataBase: new URL('https://founder-coach.vercel.app'),
  openGraph: {
    title: 'Founder Fundraising Coach | Trace Cohen',
    description: 'Trace Cohen\'s decade of VC experience, available 24/7. Free, instant, brutally honest.',
    url: 'https://founder-coach.vercel.app',
    siteName: 'Founder Fundraising Coach',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Founder Fundraising Coach | Trace Cohen · NYVP',
    description: 'Benchmark your raise, prep for VC meetings, decode term sheets. Free AI coaching from Trace Cohen.',
    creator: '@Trace_Cohen',
    site: '@Trace_Cohen',
  },
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-slate-900 text-slate-100 antialiased">
        {children}
      </body>
    </html>
  )
}
