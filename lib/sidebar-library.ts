import { stockCover } from './stock-images'

export interface SidebarPlaylist {
  id: string
  name: string
  subtitle: string
  cover: string
  liked?: boolean
  pinned?: boolean
}

/** Sidebar library list — matches user's Spotify account (screenshot). */
export const SIDEBAR_LIBRARY: SidebarPlaylist[] = [
  {
    id: 'liked',
    name: 'Liked Songs',
    subtitle: 'Playlist • 334 songs',
    cover: '',
    liked: true,
    pinned: true,
  },
  {
    id: 'discover-weekly',
    name: 'Release Radar',
    subtitle: 'Playlist • Made for Astha Singh',
    cover: stockCover('release-radar'),
  },
  {
    id: 'chill',
    name: 'redolife',
    subtitle: 'Playlist • Astha Singh',
    cover: stockCover('redolife'),
  },
  {
    id: 'workout',
    name: 'Bridal songs',
    subtitle: 'Playlist • Astha Singh',
    cover: stockCover('bridal'),
  },
  {
    id: 'genre-pop',
    name: 'Varmala + Entry',
    subtitle: 'Playlist • Prerna Singh',
    cover: stockCover('varmala'),
  },
  {
    id: 'genre-rock',
    name: 'Bridal Entry Hindi Songs Playlist - Indi...',
    subtitle: 'Playlist • NDX A.1.1',
    cover: stockCover('bridal-entry'),
  },
  {
    id: 'genre-electronic',
    name: 'Bihari wedding songs',
    subtitle: 'Playlist • Priyanka Tiwary',
    cover: stockCover('bihari'),
  },
  {
    id: 'genre-jazz',
    name: 'UT dance',
    subtitle: 'Playlist • Astha Singh',
    cover: stockCover('utdance'),
  },
  {
    id: 'genre-folk',
    name: 'Best of Kailash Kher',
    subtitle: 'Playlist • Ishant Jaiswal',
    cover: stockCover('kailash'),
  },
  {
    id: 'chill',
    name: 'On Repeat',
    subtitle: 'Playlist • Made for Astha Singh',
    cover: stockCover('onrepeat'),
  },
]
