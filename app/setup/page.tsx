'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { Copy, Check, ExternalLink } from 'lucide-react'

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
  const [origin, setOrigin] = useState('https://nl-spotify-mvp.vercel.app')

  useEffect(() => {
    if (typeof window !== 'undefined') setOrigin(window.location.origin)
  }, [])

  const callback = `${origin}/api/auth/callback/spotify`
  const localCallback = 'http://localhost:3000/api/auth/callback/spotify'

  return (
    <div className="min-h-screen bg-spotify-dark px-6 py-10 text-white">
      <div className="mx-auto max-w-2xl">
        <Link href="/" className="mb-6 inline-block text-sm text-spotify-green hover:underline">
          ← Back to Spotify
        </Link>

        <h1 className="mb-2 text-3xl font-bold">Spotify Developer Setup</h1>
        <p className="mb-8 text-spotify-text">
          Paste these values into your{' '}
          <a
            href="https://developer.spotify.com/dashboard"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1 text-spotify-green hover:underline"
          >
            Spotify Developer Dashboard
            <ExternalLink size={14} />
          </a>{' '}
          → your app → Settings.
        </p>

        <div className="space-y-6 rounded-xl bg-spotify-elevated p-6">
          <CopyField label="Website (required)" value={origin} />
          <CopyField label="Redirect URI #1 — production" value={callback} />
          <CopyField label="Redirect URI #2 — local dev" value={localCallback} />
        </div>

        <ol className="mt-8 list-decimal space-y-3 pl-5 text-spotify-text">
          <li>Create an app in the Spotify Developer Dashboard.</li>
          <li>Paste the Website and both Redirect URIs above, then Save.</li>
          <li>Copy Client ID and Client Secret into Vercel → Settings → Environment Variables.</li>
          <li>Redeploy. Search on the homepage will use live Spotify data.</li>
        </ol>

        <p className="mt-6 text-sm text-spotify-text-muted">
          This app uses Client Credentials (server-side). Redirect URIs are required by Spotify to save app settings.
        </p>
      </div>
    </div>
  )
}
