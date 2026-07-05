'use client'

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  return (
    <html lang="en">
      <body style={{ background: '#121212', color: 'white', fontFamily: 'system-ui, sans-serif' }}>
        <div style={{ display: 'flex', minHeight: '100vh', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '1rem', padding: '1rem' }}>
          <h2 style={{ fontSize: '1.25rem', fontWeight: 'bold' }}>Something went wrong</h2>
          <p style={{ color: '#b3b3b3', fontSize: '0.875rem', textAlign: 'center', maxWidth: '28rem' }}>{error.message}</p>
          <button
            onClick={reset}
            style={{ background: '#1db954', color: 'black', border: 'none', borderRadius: '9999px', padding: '0.5rem 1.5rem', fontWeight: 'bold', cursor: 'pointer' }}
          >
            Try again
          </button>
        </div>
      </body>
    </html>
  )
}
