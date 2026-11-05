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
import SectionHeading from '../components/SectionHeading'
import { usePlayer } from '../context/player'
import { playlists, tracksInPlaylist } from '../data/playlists'
import type { PlaylistDef } from '../types'
import { formatClock } from '../lib/store'

const EQUALIZER = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11]

function Visualizer({ active, paused }: { active: boolean; paused: boolean }) {
  return (
    <div className="flex h-14 items-end justify-center gap-1" aria-hidden="true">
      {EQUALIZER.map((bar) => (
        <span
          key={bar}
          className={`eq-bar w-1.5 rounded-full ${active ? 'bg-neon' : 'bg-lavender/25'}`}
          style={{
            height: active ? '100%' : '14%',
            animationDelay: `${(bar * 0.09) % 0.9}s`,
            animationDuration: `${0.7 + ((bar * 7) % 10) / 14}s`,
            animationPlayState: active && !paused ? 'running' : 'paused',
          }}
        />
      ))}
    </div>
  )
}

function TrackRow({
  playlist,
  index,
}: {
  playlist: PlaylistDef
  index: number
}) {
  const player = usePlayer()
  const track = tracksInPlaylist(playlist.id)[index]
  if (!track) return null
  const isCurrent = player.current?.id === track.id
  const isPlaying = isCurrent && player.playing

  return (
    <li>
      <button
        type="button"
        onClick={() => player.playTrack(track)}
        className={`flex w-full items-center gap-4 rounded-xl border px-4 py-3 text-left transition ${
          isCurrent
            ? 'border-neon/50 bg-neon/10'
            : 'border-lavender/10 bg-void/40 hover:border-lavender/30 hover:bg-lavender/5'
        }`}
      >
        <span className="w-5 shrink-0 text-center font-quote text-sm text-muted">
          {isPlaying ? (
            <span className="flex h-4 items-end justify-center gap-[2px]" aria-label="Sedang diputar">
              <span className="eq-bar w-[3px] rounded-full bg-neon" style={{ height: '100%' }} />
              <span className="eq-bar w-[3px] rounded-full bg-neon" style={{ height: '100%', animationDelay: '0.2s' }} />
              <span className="eq-bar w-[3px] rounded-full bg-neon" style={{ height: '100%', animationDelay: '0.4s' }} />
            </span>
          ) : (
            String(index + 1).padStart(2, '0')
          )}
        </span>
        <span className="min-w-0 flex-1">
          <span className={`block truncate text-sm ${isCurrent ? 'text-lavender' : 'text-softwhite'}`}>
            {track.title}
          </span>
          <span className="block truncate text-xs text-muted">{track.artist}</span>
        </span>
        {track.videoId ? (
          <Play size={15} className="shrink-0 text-muted" />
        ) : (
          <ExternalLink size={15} className="shrink-0 text-muted" />
        )}
      </button>
    </li>
  )
}

export default function MusicRoom() {
  const player = usePlayer()
  const [activePlaylist, setActivePlaylist] = useState(playlists[0].id)

  useEffect(() => {
    const onSelect = (event: Event) => {
      const detail = (event as CustomEvent<string>).detail
      if (playlists.some((item) => item.id === detail)) {
        setActivePlaylist(detail)
      }
    }
    window.addEventListener('afteryou:select-playlist', onSelect)
    return () => window.removeEventListener('afteryou:select-playlist', onSelect)
  }, [])

  const current = player.current
  const progress = player.duration > 0 ? (player.time / player.duration) * 100 : 0
  const repeatLabel =
    player.repeat === 'off' ? 'Ulangi: mati' : player.repeat === 'all' ? 'Ulangi: semua' : 'Ulangi: satu'

  return (
    <section id="music" className="relative scroll-mt-16 overflow-hidden bg-abyss py-24 sm:py-32">
      <div
        className="pointer-events-none absolute inset-0 opacity-30"
        style={{
          backgroundImage: 'url(/images/empty-street.jpg)',
          backgroundSize: 'cover',
          backgroundPosition: 'center',
        }}
        aria-hidden="true"
      />
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-abyss via-abyss/60 to-abyss" />
      <div className="fog-layer pointer-events-none absolute -inset-x-1/4 top-1/3 h-64 rounded-full bg-deeppurple/40 blur-3xl" />

      <div className="relative mx-auto max-w-5xl px-5 sm:px-8">
        <SectionHeading
          kicker="AFTER YOU Music Room"
          title="Dengarkan Malam Ini"
          lead="Musik tidak akan berbunyi sebelum kamu menekan Play. Pilih lagu, biarkan ruangan ini ikut mendengarkan."
        />

        <div className="grid gap-8 lg:grid-cols-[1.15fr_1fr]">
          {/* Player panel */}
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-60px' }}
            transition={{ duration: 0.7 }}
            className="glass rounded-3xl p-6 sm:p-8"
          >
            <div className="flex items-start justify-between gap-4">
              <div className="relative h-24 w-24 shrink-0 overflow-hidden rounded-2xl bg-deeppurple shadow-lg shadow-neon/10 sm:h-28 sm:w-28">
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_30%,rgba(167,139,250,0.5),transparent_60%)]" />
                <div className="absolute inset-x-0 bottom-0 flex h-full items-end justify-center gap-1.5 p-4">
                  {EQUALIZER.slice(0, 9).map((bar) => (
                    <span
                      key={bar}
                      className={`eq-bar w-1 rounded-full ${current && !player.failed ? 'bg-lavender' : 'bg-lavender/30'}`}
                      style={{
                        height: current && !player.failed ? '100%' : '12%',
                        animationDelay: `${bar * 0.08}s`,
                        animationDuration: `${0.7 + (bar % 5) * 0.12}s`,
                        animationPlayState: player.playing ? 'running' : 'paused',
                      }}
                    />
                  ))}
                </div>
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-[11px] tracking-[0.3em] text-muted uppercase">
                  {player.playing
                    ? 'Sedang diputar'
                    : player.failed
                      ? 'Tidak dapat diputar'
                      : current
                        ? 'Siap diputar'
                        : 'Belum ada lagu'}
                </p>
                <h3 className="mt-2 truncate font-heading text-2xl text-softwhite sm:text-3xl">
                  {current?.title ?? 'Pilih lagu dari playlist'}
                </h3>
                <p className="mt-1 truncate text-sm text-lavender">{current?.artist ?? 'AFTER YOU Music Room'}</p>
                {current?.playlist ? (
                  <p className="mt-1 truncate text-xs text-muted">
                    {playlists.find((item) => item.id === current.playlist)?.name}
                  </p>
                ) : null}
              </div>
            </div>

            <Visualizer active={Boolean(current) && !player.failed} paused={!player.playing} />

            {/* Progress */}
            <div className="mt-4">
              <div className="h-1.5 w-full cursor-pointer overflow-hidden rounded-full bg-lavender/15">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-neon to-lavender transition-[width] duration-300"
                  style={{ width: `${progress}%` }}
                />
              </div>
              <input
                type="range"
                min={0}
                max={player.duration || 1}
                step={1}
                value={Math.min(player.time, player.duration || 1)}
                onChange={(event) => player.seek(Number(event.target.value))}
                className="mt-1 h-1 w-full cursor-pointer opacity-0"
                style={{ marginTop: '-6px' }}
                aria-label="Geser posisi lagu"
              />
              <div className="flex justify-between text-[11px] tabular-nums text-muted">
                <span>{formatClock(player.time)}</span>
                <span>{formatClock(player.duration)}</span>
              </div>
            </div>

            {/* Transport */}
            <div className="mt-4 flex items-center justify-center gap-4">
              <button
                type="button"
                onClick={player.toggleShuffle}
                className={`rounded-full p-2.5 transition ${
                  player.shuffle ? 'bg-neon/20 text-neon' : 'text-muted hover:text-lavender'
                }`}
                aria-label="Acak lagu"
              >
                <Shuffle size={17} />
              </button>
              <button
                type="button"
                onClick={player.previous}
                className="rounded-full p-3 text-lavender transition hover:bg-lavender/10"
                aria-label="Lagu sebelumnya"
              >
                <SkipBack size={21} />
              </button>
              <button
                type="button"
                onClick={player.togglePlay}
                disabled={current !== null && !current.videoId}
                className="flex h-16 w-16 items-center justify-center rounded-full bg-neon text-void shadow-xl shadow-neon/30 transition hover:brightness-110 disabled:opacity-40"
                aria-label={player.playing ? 'Jeda' : 'Putar'}
              >
                {player.playing ? <Pause size={26} /> : <Play size={26} className="ml-1" />}
              </button>
              <button
                type="button"
                onClick={player.next}
                className="rounded-full p-3 text-lavender transition hover:bg-lavender/10"
                aria-label="Lagu berikutnya"
              >
                <SkipForward size={21} />
              </button>
              <button
                type="button"
                onClick={player.cycleRepeat}
                className={`rounded-full p-2.5 transition ${
                  player.repeat !== 'off' ? 'bg-neon/20 text-neon' : 'text-muted hover:text-lavender'
                }`}
                aria-label={repeatLabel}
              >
                <Repeat size={17} />
              </button>
            </div>

            {/* Volume + YouTube */}
            <div className="mt-5 flex items-center justify-between gap-4">
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={player.toggleMute}
                  className="rounded-full p-2 text-muted transition hover:text-lavender"
                  aria-label={player.muted ? 'Nyalakan suara' : 'Bisukan'}
                >
                  {player.muted ? <VolumeX size={16} /> : <Volume2 size={16} />}
                </button>
                <input
                  type="range"
                  min={0}
                  max={100}
                  value={player.muted ? 0 : player.volume}
                  onChange={(event) => player.setVolume(Number(event.target.value))}
                  className="h-1 w-28 cursor-pointer accent-[#A78BFA]"
                  aria-label="Volume"
                />
              </div>
              <button
                type="button"
                onClick={() => current && player.openOnYouTube(current)}
                disabled={!current}
                className="flex items-center gap-2 rounded-full border border-lavender/25 px-4 py-2 text-xs text-lavender transition hover:bg-lavender/10 disabled:opacity-40"
              >
                <ExternalLink size={15} />
                Buka di YouTube
              </button>
            </div>

            {/* Failure state */}
            <AnimatePresence>
              {player.failed || (current && !current.videoId) ? (
                <motion.div
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  className="mt-5 rounded-xl border border-maroon/40 bg-maroon/15 p-4 text-center"
                >
                  <p className="text-sm text-red-200">
                    Video ini tidak dapat diputar di dalam pemutar (mungkin diblokir untuk embed).
                  </p>
                  <button
                    type="button"
                    onClick={() => current && player.openOnYouTube(current)}
                    className="mt-3 rounded-full bg-softwhite px-5 py-2 text-xs font-medium text-void transition hover:brightness-90"
                  >
                    Buka videonya di YouTube
                  </button>
                </motion.div>
              ) : null}
            </AnimatePresence>
          </motion.div>

          {/* Playlists */}
          <div>
            <div className="mb-4 flex flex-wrap gap-2">
              {playlists.map((playlist) => (
                <button
                  key={playlist.id}
                  type="button"
                  onClick={() => setActivePlaylist(playlist.id)}
                  className={`rounded-full border px-4 py-2 text-xs transition ${
                    activePlaylist === playlist.id
                      ? 'border-neon bg-neon/15 text-lavender'
                      : 'border-lavender/15 text-muted hover:border-lavender/35 hover:text-lavender'
                  }`}
                >
                  {playlist.name}
                </button>
              ))}
            </div>

            {playlists.map((playlist) => (
              <AnimatePresence key={playlist.id}>
                {activePlaylist === playlist.id ? (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.3 }}
                  >
                    <p className="mb-3 text-xs text-muted">{playlist.description}</p>
                    <ul className="space-y-2">
                      {tracksInPlaylist(playlist.id).map((_, index) => (
                        <TrackRow key={tracksInPlaylist(playlist.id)[index].id} playlist={playlist} index={index} />
                      ))}
                    </ul>
                  </motion.div>
                ) : null}
              </AnimatePresence>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
