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

type YouTubeWindow = Window & {
  YT?: typeof YT
  onYouTubeIframeAPIReady?: () => void
}

let apiPromise: Promise<typeof YT> | null = null

/**
 * The IFrame API fires `onYouTubeIframeAPIReady` after its script has loaded.
 * Waiting only for script.onload races the API's second-stage widget script and
 * leaves `YT.Player` undefined on slower mobile connections.
 */
function loadYouTubeApi(): Promise<typeof YT> {
  if (typeof window === 'undefined') return Promise.reject(new Error('no window'))

  const youtubeWindow = window as YouTubeWindow
  if (youtubeWindow.YT?.Player) return Promise.resolve(youtubeWindow.YT)
  if (apiPromise) return apiPromise

  apiPromise = new Promise((resolve, reject) => {
    let settled = false
    let pollId: number | undefined
    let timeoutId: number | undefined

    const cleanup = () => {
      if (pollId !== undefined) window.clearInterval(pollId)
      if (timeoutId !== undefined) window.clearTimeout(timeoutId)
    }

    const finish = () => {
      if (settled) return
      if (youtubeWindow.YT?.Player) {
        settled = true
        cleanup()
        resolve(youtubeWindow.YT)
      }
    }

    const fail = (error: Error) => {
      if (settled) return
      settled = true
      cleanup()
      apiPromise = null
      reject(error)
    }

    const previousReady = youtubeWindow.onYouTubeIframeAPIReady
    youtubeWindow.onYouTubeIframeAPIReady = () => {
      previousReady?.()
      finish()
    }

    // Covers an already-inserted script and the short gap between script load
    // and the API's global callback.
    pollId = window.setInterval(finish, 50)
    timeoutId = window.setTimeout(
      () => fail(new Error('YouTube IFrame API timeout')),
      15_000,
    )

    const existing = document.getElementById('afteryou-yt-api') as HTMLScriptElement | null
    if (!existing) {
      const script = document.createElement('script')
      script.id = 'afteryou-yt-api'
      script.src = 'https://www.youtube.com/iframe_api'
      script.async = true
      script.onerror = () => fail(new Error('Gagal memuat YouTube IFrame API'))
      document.head.appendChild(script)
    } else {
      existing.addEventListener('error', () => fail(new Error('Gagal memuat YouTube IFrame API')), {
        once: true,
      })
    }
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
  const playerReadyRef = useRef(false)
  const pendingTrackRef = useRef<Track | null>(null)
  const pendingAutoplayRef = useRef(false)
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

  const queueTrack = useCallback((track: Track, autoplay: boolean) => {
    pendingTrackRef.current = track
    pendingAutoplayRef.current = autoplay
  }, [])

  const loadTrackIntoPlayer = useCallback((track: Track, autoplay: boolean) => {
    const player = playerRef.current
    if (!player || !playerReadyRef.current || !track.videoId) return false

    if (autoplay) {
      // loadVideoById starts playback only after a user gesture initiated the
      // action (track row or Play button); there is no autoplay on page load.
      player.loadVideoById(track.videoId)
    } else {
      player.cueVideoById(track.videoId)
    }
    return true
  }, [])

  const selectTrack = useCallback(
    (track: Track, autoplay: boolean) => {
      setCurrent(track)
      setFailed(false)
      setPlaying(false)
      setTime(0)
      setDuration(0)
      queueTrack(track, autoplay)

      if (!track.videoId) {
        playerRef.current?.stopVideo()
        return
      }
      loadTrackIntoPlayer(track, autoplay)
    },
    [loadTrackIntoPlayer, queueTrack],
  )

  const next = useCallback(() => {
    const index = pickNextIndex(1)
    if (index >= 0) selectTrack(tracks[index], true)
  }, [pickNextIndex, selectTrack])

  const previous = useCallback(() => {
    const player = playerRef.current
    if (player && playerReadyRef.current && player.getCurrentTime() > 4) {
      player.seekTo(0, true)
      return
    }
    const index = pickNextIndex(-1)
    if (index >= 0) selectTrack(tracks[index], true)
  }, [pickNextIndex, selectTrack])

  const togglePlay = useCallback(() => {
    const player = playerRef.current
    const selected = stateRef.current.current

    if (!selected) {
      selectTrack(tracks[0], true)
      return
    }
    if (!selected.videoId) return

    if (!player || !playerReadyRef.current) {
      queueTrack(selected, true)
      setFailed(false)
      return
    }
    if (stateRef.current.playing) {
      player.pauseVideo()
    } else {
      player.playVideo()
    }
  }, [queueTrack, selectTrack])

  const playTrack = useCallback(
    (track: Track) => {
      // Selecting a row is an explicit user gesture, so it may start the
      // selected song. If the API is still initializing, the queued request is
      // flushed from onReady rather than being silently discarded.
      selectTrack(track, true)
    },
    [selectTrack],
  )

  const seek = useCallback((seconds: number) => {
    if (!playerRef.current || !playerReadyRef.current) return
    playerRef.current.seekTo(seconds, true)
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
    const url = track.videoId ? `https://www.youtube.com/watch?v=${track.videoId}` : track.searchLink
    window.open(url, '_blank', 'noopener,noreferrer')
  }, [])

  // Mount the player before the user reaches Music Room. This avoids losing a
  // user gesture while waiting for the IFrame API on the first click.
  useEffect(() => {
    cancelledRef.current = false
    playerReadyRef.current = false

    loadYouTubeApi()
      .then((YTNamespace) => {
        if (cancelledRef.current || !holderRef.current) return
        playerRef.current = new YTNamespace.Player(holderRef.current, {
          width: '1',
          height: '1',
          playerVars: {
            autoplay: 0,
            controls: 0,
            enablejsapi: 1,
            modestbranding: 1,
            playsinline: 1,
            rel: 0,
            origin: window.location.origin,
          },
          events: {
            onReady: (event) => {
              playerReadyRef.current = true
              event.target.setVolume(stateRef.current.volume)
              if (stateRef.current.muted) event.target.mute()
              setReady(true)

              const pendingTrack = pendingTrackRef.current
              if (pendingTrack?.videoId) {
                const shouldPlay = pendingAutoplayRef.current
                pendingTrackRef.current = null
                pendingAutoplayRef.current = false
                loadTrackIntoPlayer(pendingTrack, shouldPlay)
              }
            },
            onStateChange: (event) => {
              const state = event.data
              if (state === 1) {
                setPlaying(true)
                setFailed(false)
                setDuration(event.target.getDuration() || 0)
              } else if (state === 2 || state === 5) {
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
        if (!cancelledRef.current) {
          playerReadyRef.current = false
          setReady(false)
          setFailed(true)
        }
      })

    return () => {
      cancelledRef.current = true
      playerReadyRef.current = false
      playerRef.current?.destroy()
      playerRef.current = null
    }
  }, [loadTrackIntoPlayer, next])

  // Keep progress in React state for the visual progress bar and mini player.
  useEffect(() => {
    const timer = window.setInterval(() => {
      const player = playerRef.current
      if (!player || !playerReadyRef.current) return
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
