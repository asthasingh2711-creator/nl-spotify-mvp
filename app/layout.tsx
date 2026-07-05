import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'Spotify Clone',
  description: 'Spotify-style music player with AI-powered Explain & Refine discovery',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="h-full">
      <body className="min-h-full bg-spotify-dark text-white antialiased">{children}</body>
    </html>
  )
}
