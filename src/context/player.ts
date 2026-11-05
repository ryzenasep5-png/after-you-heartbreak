import { createContext, useContext } from 'react'
import type { Track } from '../types'

export interface PlayerState {
  current: Track | null
  playing: boolean
  ready: boolean
  failed: boolean
  time: number
  duration: number
  volume: number
  muted: boolean
  shuffle: boolean
  repeat: 'off' | 'all' | 'one'
}

export interface PlayerApi extends PlayerState {
  playTrack: (track: Track) => void
  togglePlay: () => void
  next: () => void
  previous: () => void
  seek: (seconds: number) => void
  setVolume: (value: number) => void
  toggleMute: () => void
  toggleShuffle: () => void
  cycleRepeat: () => void
  openOnYouTube: (track: Track) => void
}

export const PlayerContext = createContext<PlayerApi | null>(null)

export function usePlayer(): PlayerApi {
  const context = useContext(PlayerContext)
  if (!context) throw new Error('usePlayer harus dipakai di dalam PlayerProvider')
  return context
}
