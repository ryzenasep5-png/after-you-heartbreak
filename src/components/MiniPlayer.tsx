import { AnimatePresence, motion } from 'motion/react'
import {
  ExternalLink,
  Pause,
  Play,
  Repeat,
  Shuffle,
  SkipBack,
  SkipForward,
  Volume2,
  VolumeX,
} from 'lucide-react'
import { useEffect, useState } from 'react'
import { usePlayer } from '../context/player'
import { formatClock } from '../lib/store'

export default function MiniPlayer() {
  const player = usePlayer()
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    const target = document.getElementById('music')
    if (!target) return
    const observer = new IntersectionObserver(
      (entries) => {
        const entry = entries[0]
        setVisible(!entry.isIntersecting)
      },
      { threshold: 0.08 },
    )
    observer.observe(target)
    return () => observer.disconnect()
  }, [])

  const show = visible && player.current !== null

  return (
    <AnimatePresence>
      {show ? (
        <motion.div
          initial={{ y: 90, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 90, opacity: 0 }}
          transition={{ duration: 0.3, ease: 'easeOut' }}
          className="glass fixed inset-x-3 bottom-3 z-[60] rounded-2xl px-4 py-3 shadow-2xl shadow-black/60 sm:inset-x-auto sm:right-5 sm:bottom-5 sm:w-[380px]"
          aria-label="Pemutar musik mini"
        >
          <div className="flex items-center gap-3">
            <div className="relative h-11 w-11 shrink-0 overflow-hidden rounded-lg bg-deeppurple">
              <div className="absolute inset-0 flex items-end justify-center gap-[3px] p-2">
                {[0, 1, 2, 3].map((bar) => (
                  <span
                    key={bar}
                    className={`eq-bar w-1 rounded-full bg-neon ${player.playing ? '' : '[animation-play-state:paused]'}`}
                    style={{ height: '100%', animationDelay: `${bar * 0.13}s`, animationDuration: `${0.8 + bar * 0.12}s` }}
                  />
                ))}
              </div>
            </div>
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-medium text-softwhite">{player.current?.title}</p>
              <p className="truncate text-xs text-muted">{player.current?.artist}</p>
            </div>
            <button
              type="button"
              onClick={player.previous}
              className="rounded-full p-2 text-lavender transition hover:bg-lavender/10"
              aria-label="Lagu sebelumnya"
            >
              <SkipBack size={16} />
            </button>
            <button
              type="button"
              onClick={player.togglePlay}
              className="flex h-10 w-10 items-center justify-center rounded-full bg-neon text-void transition hover:brightness-110"
              aria-label={player.playing ? 'Jeda' : 'Putar'}
            >
              {player.playing ? <Pause size={17} /> : <Play size={17} className="ml-0.5" />}
            </button>
            <button
              type="button"
              onClick={player.next}
              className="rounded-full p-2 text-lavender transition hover:bg-lavender/10"
              aria-label="Lagu berikutnya"
            >
              <SkipForward size={16} />
            </button>
          </div>

          <div className="mt-3 flex items-center gap-2">
            <span className="w-9 text-[10px] tabular-nums text-muted">{formatClock(player.time)}</span>
            <input
              type="range"
              min={0}
              max={player.duration || 1}
              step={1}
              value={Math.min(player.time, player.duration || 1)}
              onChange={(event) => player.seek(Number(event.target.value))}
              className="h-1 flex-1 cursor-pointer accent-[#A78BFA]"
              aria-label="Posisi lagu"
            />
            <span className="w-9 text-right text-[10px] tabular-nums text-muted">
              {formatClock(player.duration)}
            </span>
          </div>

          <div className="mt-2 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={player.toggleShuffle}
                className={`rounded-full p-1.5 transition ${player.shuffle ? 'bg-neon/20 text-neon' : 'text-muted hover:text-lavender'}`}
                aria-label="Acak"
              >
                <Shuffle size={13} />
              </button>
              <button
                type="button"
                onClick={player.cycleRepeat}
                className={`rounded-full p-1.5 transition ${player.repeat !== 'off' ? 'bg-neon/20 text-neon' : 'text-muted hover:text-lavender'}`}
                aria-label={`Ulangi: ${player.repeat === 'off' ? 'mati' : player.repeat === 'all' ? 'semua' : 'satu lagu'}`}
              >
                <Repeat size={13} />
              </button>
            </div>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={player.toggleMute}
                className="rounded-full p-1.5 text-muted transition hover:text-lavender"
                aria-label={player.muted ? 'Nyalakan suara' : 'Bisukan'}
              >
                {player.muted ? <VolumeX size={14} /> : <Volume2 size={14} />}
              </button>
              <input
                type="range"
                min={0}
                max={100}
                value={player.muted ? 0 : player.volume}
                onChange={(event) => player.setVolume(Number(event.target.value))}
                className="h-1 w-16 cursor-pointer accent-[#A78BFA]"
                aria-label="Volume"
              />
              {player.current ? (
                <button
                  type="button"
                  onClick={() => player.openOnYouTube(player.current!)}
                  className="rounded-full p-1.5 text-muted transition hover:text-lavender"
                  aria-label="Buka di YouTube"
                >
                  <ExternalLink size={14} />
                </button>
              ) : null}
            </div>
          </div>
        </motion.div>
      ) : null}
    </AnimatePresence>
  )
}
