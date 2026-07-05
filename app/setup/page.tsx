'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { Copy, Check, ExternalLink, AlertCircle } from 'lucide-react'

function CopyField({ label, value }: { label: string; value: string }) {
  const [copied, setCopied] = useState(false)

  const copy = async () => {
    await navigator.clipboard.writeText(value)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div>
      <p className="mb-1 text-sm font-medium text-spotify-text">{label}</p>
      <div className="flex items-center gap-2 rounded-lg bg-spotify-highlight p-3">
        <code className="min-w-0 flex-1 break-all text-sm text-white">{value}</code>
        <button
          onClick={copy}
          className="shrink-0 rounded-md p-2 text-spotify-text hover:bg-spotify-hover hover:text-white"
          aria-label={`Copy ${label}`}
        >
          {copied ? <Check size={16} className="text-spotify-green" /> : <Copy size={16} />}
        </button>
      </div>
    </div>
  )
}

export default function SetupPage() {
  const [health, setHealth] = useState<{ connected: boolean; mode: string; message: string } | null>(null)

  useEffect(() => {
    fetch('/api/spotify/health')
      .then((r) => r.json())
      .then(setHealth)
      .catch(() => setHealth({ connected: false, mode: 'error', message: 'Could not reach API' }))
  }, [])

  const localOrigin = 'http://localhost:3000'
  const localCallback = `${localOrigin}/api/auth/callback/spotify`
  const vercelOrigin = 'https://nl-spotify-mvp.vercel.app'
  const vercelCallback = `${vercelOrigin}/api/auth/callback/spotify`

  return (
    <div className="min-h-screen bg-spotify-dark px-6 py-10 text-white">
      <div className="mx-auto max-w-2xl">
        <Link href="/" className="mb-6 inline-block text-sm text-spotify-green hover:underline">
          ← Back to Spotify
        </Link>

        <h1 className="mb-2 text-3xl font-bold">Spotify Developer Setup</h1>
        <p className="mb-6 text-spotify-text">
          Use the <strong className="text-white">localhost values below first</strong> — you do not need Vercel deployed to get your Client Secret.
        </p>

        {health && !health.connected && (
          <div className="mb-6 flex gap-3 rounded-lg border border-yellow-500/30 bg-yellow-500/10 p-4 text-sm">
            <AlertCircle className="mt-0.5 shrink-0 text-yellow-400" size={18} />
            <div>
              <p className="font-medium text-yellow-200">Not connected yet</p>
              <p className="mt-1 text-spotify-text">{health.message}</p>
            </div>
          </div>
        )}

        {health?.connected && (
          <div className="mb-6 rounded-lg border border-spotify-green/30 bg-spotify-green/10 p-4 text-sm text-spotify-green">
            ✓ Spotify connected — search will use live data.
          </div>
        )}

        <section className="mb-10">
          <h2 className="mb-4 text-xl font-bold">Step 1 — Spotify Dashboard (use these now)</h2>
          <p className="mb-4 text-sm text-spotify-text">
            <a href="https://developer.spotify.com/dashboard" target="_blank" rel="noopener noreferrer" className="text-spotify-green hover:underline">
              Open Spotify Developer Dashboard
            </a>
            {' '}→ Create app → Settings:
          </p>
          <div className="space-y-4 rounded-xl bg-spotify-elevated p-6">
            <CopyField label="Website" value={localOrigin} />
            <CopyField label="Redirect URI" value={localCallback} />
          </div>
          <p className="mt-3 text-xs text-spotify-text-muted">
            Click Save. Then reveal and copy your Client ID and Client Secret.
          </p>
        </section>

        <section className="mb-10">
          <h2 className="mb-4 text-xl font-bold">Step 2 — Add credentials locally</h2>
          <p className="mb-3 text-sm text-spotify-text">
            Run this in your terminal (credentials stay local, never in chat):
          </p>
          <pre className="overflow-x-auto rounded-lg bg-spotify-highlight p-4 text-sm text-white">{`cd "/Users/asthasingh/Desktop/NL Spotify MVP"
npm run setup:spotify`}</pre>
          <p className="mt-3 text-sm text-spotify-text">
            It will prompt for Client ID and Client Secret and save them to{' '}
            <code className="rounded bg-spotify-highlight px-1">.env.local</code> (git-ignored).
          </p>
          <p className="mt-3 text-sm text-spotify-text">
            Then restart: <code className="rounded bg-spotify-highlight px-1">npm run dev:clean</code>
            {' '}→ open <strong className="text-white">http://localhost:3000</strong>
          </p>
        </section>

        <section className="mb-10">
          <h2 className="mb-4 text-xl font-bold">Step 3 — Vercel (optional, for production)</h2>
          <p className="mb-4 text-sm text-spotify-text">
            Import{' '}
            <a href="https://github.com/asthasingh2711-creator/nl-spotify-mvp" target="_blank" rel="noopener noreferrer" className="text-spotify-green hover:underline">
              github.com/asthasingh2711-creator/nl-spotify-mvp
            </a>
            {' '}at{' '}
            <a href="https://vercel.com/new" target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 text-spotify-green hover:underline">
              vercel.com/new
              <ExternalLink size={14} />
            </a>
            . After deploy, add these to Spotify Dashboard too:
          </p>
          <div className="space-y-4 rounded-xl bg-spotify-elevated p-6">
            <CopyField label="Website (production)" value={vercelOrigin} />
            <CopyField label="Redirect URI (production)" value={vercelCallback} />
          </div>
          <p className="mt-3 text-xs text-spotify-text-muted">
            Also add the same env vars in Vercel → Settings → Environment Variables, then redeploy.
          </p>
        </section>
      </div>
    </div>
  )
}
