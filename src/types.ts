export interface JournalEntry {
  id: string
  title: string
  mood: string
  text: string
  createdAt: number
  updatedAt: number
}

export interface Letter {
  id: string
  to: string
  text: string
  createdAt: number
}

export type LetterAction = 'burn' | 'tear' | 'fly' | null

export interface MoodDef {
  id: string
  label: string
  message: string
  quote: string
  playlist: string
  activity: string
  emoji: string
}

export interface Track {
  id: string
  title: string
  artist: string
  playlist: string
  videoId: string | null
  searchLink: string
}

export interface PlaylistDef {
  id: string
  name: string
  description: string
}

export const MOOD_OPTIONS = [
  'Rindu',
  'Kecewa',
  'Marah',
  'Kosong',
  'Menyesal',
  'Ikhlas',
  'Bahagia',
  'Bingung',
  'Lelah',
] as const
