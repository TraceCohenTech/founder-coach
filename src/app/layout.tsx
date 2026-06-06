import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'Founder Fundraising Coach | Trace Cohen',
  description: 'Chat with Trace Cohen\'s fundraising brain. Benchmark your metrics, prep for VC meetings, and decode term sheets — grounded in real market data.',
  openGraph: {
    title: 'Founder Fundraising Coach | Trace Cohen',
    description: 'Trace Cohen\'s decade of VC experience, available 24/7.',
    url: 'https://coach.valueaddvc.com',
    siteName: 'ValueAddVC',
  },
  twitter: {
    card: 'summary_large_image',
    creator: '@Trace_Cohen',
  },
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-[#0d1117] text-[#e6edf3] antialiased">
        {children}
      </body>
    </html>
  )
}
