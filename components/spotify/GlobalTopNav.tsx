'use client'

import { Home, Search, Mic, Download, Bell } from 'lucide-react'
import { SpotifyLogo } from './SpotifyLogo'

interface GlobalTopNavProps {
  onHome: () => void
  onSearch: () => void
}

export function GlobalTopNav({ onHome, onSearch }: GlobalTopNavProps) {
  return (
    <header className="flex h-14 shrink-0 items-center gap-4 bg-black px-4">
      <div className="flex w-[280px] shrink-0 items-center pl-2">
        <SpotifyLogo className="h-8 w-8 text-white" />
      </div>

      <div className="flex min-w-0 flex-1 items-center justify-center">
        <div className="flex h-11 w-full max-w-[480px] items-center gap-1 rounded-full bg-[#282828] px-1.5">
          <button
            type="button"
            onClick={onHome}
            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[#121212] text-white hover:bg-[#3e3e3e]"
            aria-label="Home"
          >
            <Home size={20} fill="currentColor" />
          </button>
          <button
            type="button"
            onClick={onSearch}
            className="flex min-w-0 flex-1 items-center gap-2 px-2 text-left text-sm text-spotify-text hover:text-white"
          >
            <Search size={18} />
            <span>What do you want to play?</span>
          </button>
          <button
            type="button"
            onClick={onSearch}
            className="mr-1 flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-spotify-text hover:text-white"
            aria-label="Voice search"
          >
            <Mic size={18} />
          </button>
        </div>
      </div>

      <div className="flex w-[280px] shrink-0 items-center justify-end gap-3 pr-2">
        <button type="button" className="hidden items-center gap-2 rounded-full bg-white/10 px-3 py-1.5 text-sm font-bold text-white hover:bg-white/20 sm:flex">
          <Download size={16} />
          Install App
        </button>
        <button type="button" className="text-spotify-text hover:text-white" aria-label="Notifications">
          <Bell size={20} />
        </button>
        <button type="button" className="flex h-8 w-8 items-center justify-center rounded-full bg-[#5038a0] text-xs font-bold text-white">
          A
        </button>
      </div>
    </header>
  )
}
