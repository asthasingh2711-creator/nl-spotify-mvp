'use client'

import { Sparkles } from 'lucide-react'

export type ContentTab = 'All' | 'Music' | 'Podcasts' | 'AI Mode'

const TABS: ContentTab[] = ['All', 'Music', 'Podcasts', 'AI Mode']

export function ContentFilterChips({
  active,
  onChange,
}: {
  active: ContentTab
  onChange: (tab: ContentTab) => void
}) {
  return (
    <div className="flex flex-wrap gap-2 px-6 pt-4 pb-2">
      {TABS.map((tab) => (
        <button
          key={tab}
          onClick={() => onChange(tab)}
          className={`flex items-center gap-1.5 rounded-full px-4 py-1.5 text-sm font-bold transition-colors ${
            active === tab
              ? 'bg-white text-black'
              : 'bg-[#282828] text-white hover:bg-[#3e3e3e]'
          }`}
        >
          {tab === 'AI Mode' && (
            <Sparkles
              size={14}
              className={active === tab ? 'text-black' : 'text-spotify-green'}
            />
          )}
          {tab}
        </button>
      ))}
    </div>
  )
}
