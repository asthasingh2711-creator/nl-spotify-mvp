import { stockCover } from './stock-images'

export interface HomeTile {
  id: string
  name: string
  cover: string
}

export const HOME_QUICK: HomeTile[] = [
  { id: 'genre-electronic', name: '1 AM Feels Hindi', cover: stockCover('1am') },
  { id: 'liked', name: 'Liked Songs', cover: stockCover('liked') },
  { id: 'workout', name: 'Bridal songs', cover: stockCover('bridal') },
  { id: 'discover-weekly', name: 'Release Radar', cover: stockCover('radar') },
  { id: 'chill', name: 'redolife', cover: stockCover('redolife') },
  { id: 'genre-jazz', name: 'Varmala + Entry', cover: stockCover('varmala') },
  { id: 'genre-folk', name: 'UT dance', cover: stockCover('utdance') },
  { id: 'discover-weekly', name: 'On Repeat', cover: stockCover('onrepeat') },
]

export const HOME_PICKED_HERO = {
  id: 'genre-rock',
  name: 'Barso Re',
  cover: stockCover('barso'),
}

export const HOME_DAILY_MIXES: HomeTile[] = [
  { id: 'discover-weekly', name: 'Daily Mix 01', cover: stockCover('dm1') },
  { id: 'chill', name: 'Daily Mix 02', cover: stockCover('dm2') },
  { id: 'workout', name: 'Daily Mix 03', cover: stockCover('dm3') },
]

export const HOME_MADE_FOR: HomeTile[] = [
  { id: 'discover-weekly', name: 'Discover Weekly', cover: stockCover('dw') },
  { id: 'chill', name: 'Daily Mix 1', cover: stockCover('mf1') },
  { id: 'workout', name: 'Daily Mix 2', cover: stockCover('mf2') },
  { id: 'genre-pop', name: 'Daily Mix 3', cover: stockCover('mf3') },
  { id: 'genre-rock', name: 'Daily Mix 4', cover: stockCover('mf4') },
]

export const HOME_RECENTS: HomeTile[] = [
  { id: 'genre-electronic', name: '1 AM Feels Hindi', cover: stockCover('r1') },
  { id: 'workout', name: 'Bridal songs', cover: stockCover('r2') },
  { id: 'discover-weekly', name: 'Release Radar', cover: stockCover('r3') },
  { id: 'liked', name: 'Liked Songs', cover: stockCover('r4') },
  { id: 'chill', name: 'redolife', cover: stockCover('r5') },
  { id: 'genre-jazz', name: 'Best of Kailash Kher', cover: stockCover('r6') },
]
