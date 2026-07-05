'use client'

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-4 bg-spotify-dark px-4 text-white">
      <h2 className="text-xl font-bold">Something went wrong</h2>
      <p className="max-w-md text-center text-sm text-spotify-text">{error.message}</p>
      <button
        onClick={reset}
        className="rounded-full bg-spotify-green px-6 py-2 text-sm font-bold text-black"
      >
        Try again
      </button>
    </div>
  )
}
