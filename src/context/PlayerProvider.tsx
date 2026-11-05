import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from 'react'
import { tracks, trackIndex } from '../data/playlists'
import type { Track } from '../types'
import { PlayerContext, type PlayerApi } from './player'

let apiPromise: Promise<typeof YT> | null = null

function loadYouTubeApi(): Promise<typeof YT> {
  if (typeof window === 'undefined') return Promise.reject(new Error('no window'))
  if (apiPromise) return apiPromise
  apiPromise = new Promise((resolve, reject) => {
    if (window.YT && window.YT.Player) {
      resolve(window.YT)
      return
    }
    const existing = document.getElementById('afteryou-yt-api') as HTMLScriptElement | null
    if (existing) {
      existing.addEventListener('load', () => resolve(window.YT))
      existing.addEventListener('error', () => reject(new Error('Gagal memuat YouTube IFrame API')))
      return
    }
    const script = document.createElement('script')
    script.id = 'afteryou-yt-api'
    script.src = 'https://www.youtube.com/iframe_api'
    script.async = true
    script.onload = () => resolve(window.YT)
    script.onerror = () => reject(new Error('Gagal memuat YouTube IFrame API'))
    document.head.appendChild(script)
  })
  return apiPromise
}

export default function PlayerProvider({ children }: { children: ReactNode }) {
  const [current, setCurrent] = useState<Track | null>(null)
  const [playing, setPlaying] = useState(false)
  const [ready, setReady] = useState(false)
  const [failed, setFailed] = useState(false)
  const [time, setTime] = useState(0)
  const [duration, setDuration] = useState(0)
  const [volume, setVolumeState] = useState(80)
  const [muted, setMuted] = useState(false)
  const [shuffle, setShuffle] = useState(false)
  const [repeat, setRepeat] = useState<'off' | 'all' | 'one'>('off')

  const playerRef = useRef<YT.Player | null>(null)
  const holderRef = useRef<HTMLDivElement | null>(null)
  const cancelledRef = useRef(false)
  const stateRef = useRef({ current, playing, ready, volume, muted, shuffle, repeat })

  useEffect(() => {
    stateRef.current = { current, playing, ready, volume, muted, shuffle, repeat }
  })

  const pickNextIndex = useCallback((direction: 1 | -1): number => {
    const total = tracks.length
    if (total === 0) return -1
    if (stateRef.current.shuffle) {
      if (total === 1) return 0
      let candidate = Math.floor(Math.random() * total)
      const currentIndex = stateRef.current.current ? trackIndex(stateRef.current.current.id) : -1
      if (candidate === currentIndex) candidate = (candidate + 1) % total
      return candidate
    }
    const base = stateRef.current.current ? trackIndex(stateRef.current.current.id) : 0
    return (base + direction + total) % total
  }, [])

  const loadVideo = useCallback((track: Track) => {
    setCurrent(track)
    setFailed(false)
    setTime(0)
    setDuration(0)
    const player = playerRef.current
    if (player && track.videoId) {
      player.loadVideoById(track.videoId)
      return
    }
    if (player && !track.videoId) {
      player.stopVideo()
    }
  }, [])

  const next = useCallback(() => {
    const index = pickNextIndex(1)
    if (index >= 0) loadVideo(tracks[index])
  }, [loadVideo, pickNextIndex])

  const previous = useCallback(() => {
    const player = playerRef.current
    if (player && player.getCurrentTime() > 4) {
      player.seekTo(0, true)
      return
    }
    const index = pickNextIndex(-1)
    if (index >= 0) loadVideo(tracks[index])
  }, [loadVideo, pickNextIndex])

  const togglePlay = useCallback(() => {
    const player = playerRef.current
    if (!player) return
    if (!stateRef.current.current) {
      loadVideo(tracks[0])
      return
    }
    if (stateRef.current.playing) {
      player.pauseVideo()
    } else {
      player.playVideo()
    }
  }, [loadVideo])

  const playTrack = useCallback((track: Track) => {
    const player = playerRef.current
    if (!player) {
      setCurrent(track)
      return
    }
    if (!track.videoId) {
      loadVideo(track)
      return
    }
    setCurrent(track)
    setFailed(false)
    setTime(0)
    player.loadVideoById(track.videoId)
  }, [loadVideo])

  const seek = useCallback((seconds: number) => {
    playerRef.current?.seekTo(seconds, true)
    setTime(seconds)
  }, [])

  const setVolume = useCallback((value: number) => {
    const clamped = Math.min(100, Math.max(0, value))
    setVolumeState(clamped)
    playerRef.current?.setVolume(clamped)
    if (clamped > 0) setMuted(false)
  }, [])

  const toggleMute = useCallback(() => {
    const player = playerRef.current
    const nextMuted = !stateRef.current.muted
    setMuted(nextMuted)
    if (player) {
      if (nextMuted) {
        player.mute()
      } else {
        player.unMute()
        player.setVolume(stateRef.current.volume)
      }
    }
  }, [])

  const toggleShuffle = useCallback(() => setShuffle((value) => !value), [])

  const cycleRepeat = useCallback(() => {
    setRepeat((value) => (value === 'off' ? 'all' : value === 'all' ? 'one' : 'off'))
  }, [])

  const openOnYouTube = useCallback((track: Track) => {
    const url = track.videoId
      ? `https://www.youtube.com/watch?v=${track.videoId}`
      : track.searchLink
    window.open(url, '_blank', 'noopener,noreferrer')
  }, [])

  // Mount player once.
  useEffect(() => {
    cancelledRef.current = false
    loadYouTubeApi()
      .then((YTNamespace) => {
        if (cancelledRef.current || !holderRef.current) return
        playerRef.current = new YTNamespace.Player(holderRef.current, {
          width: '1',
          height: '1',
          playerVars: { playsinline: 1, rel: 0, origin: window.location.origin },
          events: {
            onReady: (event) => {
              event.target.setVolume(stateRef.current.volume)
              setReady(true)
            },
            onStateChange: (event) => {
              const state = event.data
              if (state === 1) {
                setPlaying(true)
                setFailed(false)
                setDuration(event.target.getDuration() || 0)
              } else if (state === 2) {
                setPlaying(false)
              } else if (state === 0) {
                setPlaying(false)
                if (stateRef.current.repeat === 'one') {
                  event.target.seekTo(0, true)
                  event.target.playVideo()
                } else {
                  next()
                }
              }
            },
            onError: () => {
              setFailed(true)
              setPlaying(false)
            },
          },
        })
      })
      .catch(() => {
        if (!cancelledRef.current) setFailed(true)
      })
    return () => {
      cancelledRef.current = true
      playerRef.current?.destroy()
      playerRef.current = null
    }
  }, [next])

  // Time ticker.
  useEffect(() => {
    const timer = window.setInterval(() => {
      const player = playerRef.current
      if (!player || !stateRef.current.ready) return
      const currentTime = player.getCurrentTime?.() ?? 0
      setTime(currentTime)
      const total = player.getDuration?.() ?? 0
      if (total > 0) setDuration(total)
    }, 500)
    return () => window.clearInterval(timer)
  }, [])

  const value = useMemo<PlayerApi>(
    () => ({
      current,
      playing,
      ready,
      failed,
      time,
      duration,
      volume,
      muted,
      shuffle,
      repeat,
      playTrack,
      togglePlay,
      next,
      previous,
      seek,
      setVolume,
      toggleMute,
      toggleShuffle,
      cycleRepeat,
      openOnYouTube,
    }),
    [
      current,
      playing,
      ready,
      failed,
      time,
      duration,
      volume,
      muted,
      shuffle,
      repeat,
      playTrack,
      togglePlay,
      next,
      previous,
      seek,
      setVolume,
      toggleMute,
      toggleShuffle,
      cycleRepeat,
      openOnYouTube,
    ],
  )

  return (
    <PlayerContext.Provider value={value}>
      {children}
      <div
        aria-hidden="true"
        style={{
          position: 'fixed',
          width: '1px',
          height: '1px',
          overflow: 'hidden',
          opacity: 0,
          pointerEvents: 'none',
          left: '-9999px',
        }}
      >
        <div ref={holderRef} />
      </div>
    </PlayerContext.Provider>
  )
}
