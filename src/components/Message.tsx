'use client'

import { useState } from 'react'

// Strip AI-generated chips tag before display
function stripChips(content: string) {
  return content.replace(/\n*<chips>[\s\S]*?<\/chips>\s*$/, '').trim()
}

export default function Message({ role, content, isStreaming }: { role: 'user' | 'assistant'; content: string; isStreaming?: boolean }) {
  const isUser = role === 'user'
  const [copied, setCopied] = useState(false)

  const displayContent = isUser ? content : stripChips(content)

  function copy() {
    // Copy plain text with markdown stripped
    const plain = displayContent
      .replace(/\*\*([^*]+)\*\*/g, '$1')
      .replace(/\*([^*]+)\*/g, '$1')
      .replace(/^#{1,3}\s*/gm, '')
      .trim()
    navigator.clipboard.writeText(plain).catch(() => {})
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div className={`flex gap-3 fade-up ${isUser ? 'justify-end' : 'justify-start'} group`}>
      {!isUser && (
        <div className="w-8 h-8 rounded-lg bg-blue-700 flex items-center justify-center shrink-0 mt-0.5 shadow-sm">
          <span className="text-white text-xs font-bold mono">TC</span>
        </div>
      )}
      <div className="relative max-w-[80%]">
        <div className={`rounded-xl px-4 py-3 text-sm leading-relaxed ${
          isUser
            ? 'bg-slate-900 text-white rounded-tr-sm'
            : 'bg-white border border-slate-200 border-l-4 border-l-blue-600 text-slate-800 rounded-tl-sm shadow-sm'
        }`}>
          {isUser
            ? <p className="text-white/90">{content}</p>
            : <Formatted content={displayContent} />}
          {isStreaming && <span className="inline-block w-1 h-3.5 bg-blue-600 ml-0.5 cursor-blink align-middle rounded-sm" />}
        </div>
        {!isUser && !isStreaming && (
          <button onClick={copy}
            className="absolute -bottom-6 right-0 flex items-center gap-1 px-2 py-1 rounded-md text-xs mono text-slate-400 hover:text-slate-700 hover:bg-slate-100 border border-transparent hover:border-slate-200 transition-all opacity-0 group-hover:opacity-100">
            {copied ? '✓ Copied' : '⎘ Copy'}
          </button>
        )}
      </div>
      {isUser && (
        <div className="w-8 h-8 rounded-lg bg-slate-100 border border-slate-200 flex items-center justify-center shrink-0 mt-0.5">
          <span className="text-slate-500 text-xs font-bold mono">F</span>
        </div>
      )}
    </div>
  )
}

function Formatted({ content }: { content: string }) {
  return (
    <div className="space-y-1.5">
      {content.split('\n').map((line, i) => {
        if (!line.trim()) return <div key={i} className="h-1" />
        if (line.startsWith('- ') || line.startsWith('• '))
          return <div key={i} className="flex gap-2 items-start"><span className="text-blue-600 font-bold shrink-0">·</span><span className="text-slate-700">{inline(line.slice(2))}</span></div>
        if (/^\d+\.\s/.test(line)) {
          const m = line.match(/^(\d+)\.\s(.*)/)
          if (m) return <div key={i} className="flex gap-2 items-start"><span className="mono text-blue-600 text-xs font-bold shrink-0 w-4">{m[1]}.</span><span className="text-slate-700">{inline(m[2])}</span></div>
        }
        if (line.startsWith('**') && line.endsWith('**') && line.length > 4)
          return <p key={i} className="font-bold text-slate-900">{line.slice(2, -2)}</p>
        if (/^#{1,3}\s/.test(line))
          return <p key={i} className="font-bold text-slate-900 border-b border-slate-100 pb-1">{line.replace(/^#+\s*/, '')}</p>
        return <p key={i} className="text-slate-700">{inline(line)}</p>
      })}
    </div>
  )
}

function inline(text: string) {
  return (
    <>
      {text.split(/(\*\*[^*]+\*\*|\[[^\]]+\]\([^)]+\))/).map((p, i) => {
        if (p.startsWith('**') && p.endsWith('**')) {
          return <strong key={i} className="font-bold text-slate-900">{p.slice(2, -2)}</strong>
        }
        const link = p.match(/^\[([^\]]+)\]\(([^)]+)\)$/)
        if (link) {
          return <a key={i} href={link[2]} target="_blank" rel="noreferrer" className="text-blue-600 underline hover:text-blue-800">{link[1]}</a>
        }
        return <span key={i}>{p}</span>
      })}
    </>
  )
}
