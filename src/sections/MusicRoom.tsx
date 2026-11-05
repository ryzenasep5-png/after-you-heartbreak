import { AnimatePresence, motion } from 'motion/react'
import {
  ChevronDown,
  ExternalLink,
  Expand,
  Heart,
  Pause,
  Play,
  Repeat,
  Shuffle,
  SkipBack,
  SkipForward,
  Volume2,
  VolumeX,
} from 'lucide-react'
import { useEffect, useMemo, useState } from 'react'
import SectionHeading from '../components/SectionHeading'
import { usePlayer } from '../context/player'
import { playlists, tracksInPlaylist } from '../data/playlists'
import type { PlaylistDef } from '../types'
import { formatClock } from '../lib/store'

const EQUALIZER = Array.from({ length: 34 }, (_, index) => index)
const QUOTES = [
  'aku masih di sini, meski kau telah pergi.',
  'barangkali rindu hanya cara hati mengingat rumahnya.',
  'kita pernah menjadi seluruh dunia, sebelum menjadi kenangan.',
  'malam selalu tahu nama yang paling ingin kita lupakan.',
]

function Visualizer({ active, paused }: { active: boolean; paused: boolean }) {
  return (
    <div className="flex h-12 items-end justify-center gap-[3px]" aria-hidden="true">
      {EQUALIZER.map((bar) => (
        <span
          key={bar}
          className={`eq-bar w-[3px] rounded-full ${active ? 'bg-lavender/80' : 'bg-lavender/20'}`}
          style={{
            height: active ? `${18 + ((bar * 17) % 72)}%` : '14%',
            animationDelay: `${(bar * 0.07) % 0.9}s`,
            animationDuration: `${0.65 + ((bar * 5) % 8) / 10}s`,
            animationPlayState: active && !paused ? 'running' : 'paused',
          }}
        />
      ))}
    </div>
  )
}

function TrackRow({ playlist, index }: { playlist: PlaylistDef; index: number }) {
  const player = usePlayer()
  const track = tracksInPlaylist(playlist.id)[index]
  if (!track) return null
  const isCurrent = player.current?.id === track.id

  return (
    <li>
      <button
        type="button"
        onClick={() => player.playTrack(track)}
        className={`group flex w-full items-center gap-3 rounded-xl border px-3 py-2.5 text-left transition ${
          isCurrent
            ? 'border-neon/50 bg-neon/12'
            : 'border-lavender/10 bg-void/30 hover:border-lavender/30 hover:bg-lavender/8'
        }`}
      >
        <span className="w-6 shrink-0 text-center text-[11px] tabular-nums text-muted">
          {isCurrent && player.playing ? (
            <span className="flex h-4 items-end justify-center gap-[2px]" aria-label="Sedang diputar">
              <span className="eq-bar w-[3px] rounded-full bg-neon" style={{ height: '100%' }} />
              <span className="eq-bar w-[3px] rounded-full bg-neon" style={{ height: '70%', animationDelay: '0.15s' }} />
              <span className="eq-bar w-[3px] rounded-full bg-neon" style={{ height: '90%', animationDelay: '0.3s' }} />
            </span>
          ) : (
            String(index + 1).padStart(2, '0')
          )}
        </span>
        <span className="min-w-0 flex-1">
          <span className={`block truncate text-sm ${isCurrent ? 'text-lavender' : 'text-softwhite/90'}`}>
            {track.title}
          </span>
          <span className="block truncate text-[11px] text-muted">{track.artist}</span>
        </span>
        {track.videoId ? (
          <Play size={13} className="shrink-0 text-muted transition group-hover:text-lavender" />
        ) : (
          <ExternalLink size={13} className="shrink-0 text-muted" />
        )}
      </button>
    </li>
  )
}

export default function MusicRoom() {
  const player = usePlayer()
  const [activePlaylist, setActivePlaylist] = useState(playlists[0].id)
  const [showPlaylists, setShowPlaylists] = useState(false)

  useEffect(() => {
    const onSelect = (event: Event) => {
      const detail = (event as CustomEvent<string>).detail
      if (playlists.some((item) => item.id === detail)) {
        setActivePlaylist(detail)
        setShowPlaylists(true)
      }
    }
    window.addEventListener('afteryou:select-playlist', onSelect)
    return () => window.removeEventListener('afteryou:select-playlist', onSelect)
  }, [])

  const current = player.current
  const featuredTrack = current ?? tracksInPlaylist(playlists[0].id)[0]
  const progress = player.duration > 0 ? (player.time / player.duration) * 100 : 0
  const quote = useMemo(() => {
    if (!current) return QUOTES[0]
    const index = Math.abs(current.id.split('').reduce((sum, char) => sum + char.charCodeAt(0), 0)) % QUOTES.length
    return QUOTES[index]
  }, [current])
  const activePlaylistDef = playlists.find((playlist) => playlist.id === activePlaylist) ?? playlists[0]
  const repeatLabel =
    player.repeat === 'off' ? 'Ulangi: mati' : player.repeat === 'all' ? 'Ulangi: semua' : 'Ulangi: satu'

  return (
    <section id="music" className="relative scroll-mt-16 overflow-hidden bg-void py-20 sm:py-28">
      <div className="absolute inset-0" aria-hidden="true">
        <img
          src="/images/hero-rainy-window.jpg"
          alt=""
          className="h-full w-full object-cover object-center opacity-65"
          loading="lazy"
        />
        <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(8,8,13,0.78)_0%,rgba(8,8,13,0.36)_38%,rgba(8,8,13,0.95)_100%)]" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_55%_33%,rgba(167,139,250,0.18),transparent_34%)]" />
      </div>

      <div className="relative mx-auto max-w-6xl px-5 sm:px-8">
        <div className="mb-10 flex items-center justify-between gap-4 text-lavender/75">
          <div>
            <p className="flex items-center gap-2 font-heading text-xl tracking-wide text-softwhite sm:text-2xl">
              <span className="text-2xl" aria-hidden="true">☾</span>
              Ruang Setelah Hujan
            </p>
            <p className="mt-1 pl-9 text-xs text-muted">Untuk hati yang belum selesai...</p>
          </div>
          <div className="flex items-center gap-3">
            <Heart size={18} strokeWidth={1.5} aria-hidden="true" />
            <span className="h-5 w-px bg-lavender/25" />
            <Expand size={18} strokeWidth={1.5} aria-hidden="true" />
          </div>
        </div>

        <SectionHeading
          kicker="AFTER YOU Music Room"
          title="Dengarkan Malam Ini"
          lead="Musik tidak akan dimulai sebelum kamu memilihnya. Biarkan hujan mengisi jeda yang belum selesai."
        />

        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-60px' }}
          transition={{ duration: 0.75 }}
          className="mx-auto max-w-4xl"
        >
          <div className="text-center">
            <p className="font-quote text-base text-lavender/65 italic sm:text-lg">
              “Beberapa luka memang hanya bisa disembuhkan dengan waktu.”
            </p>
            <p className="mt-7 font-quote text-xl text-softwhite/50 italic sm:text-2xl">dan kini aku hanya tinggal kenangan</p>
            <AnimatePresence mode="wait">
              <motion.p
                key={quote}
                initial={{ opacity: 0, y: 12, filter: 'blur(7px)' }}
                animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
                exit={{ opacity: 0, y: -10, filter: 'blur(7px)' }}
                transition={{ duration: 0.45 }}
                className="mt-3 font-heading text-4xl leading-[1.06] text-softwhite sm:text-6xl md:text-7xl"
              >
                {quote}
              </motion.p>
            </AnimatePresence>
            <p className="mt-6 font-quote text-base text-lavender/55 italic sm:text-lg">entah kapan hati ini akan berhenti mencari</p>
          </div>

          <div className="mt-10 rounded-3xl border border-lavender/15 bg-void/45 px-5 py-5 shadow-2xl shadow-black/35 backdrop-blur-xl sm:px-10 sm:py-7">
            <div className="flex items-center justify-between gap-4 text-[11px] tabular-nums text-muted">
              <span>{formatClock(player.time)}</span>
              <span>{formatClock(player.duration)}</span>
            </div>
            <div className="relative mt-2 h-1.5 overflow-hidden rounded-full bg-lavender/15">
              <div className="absolute inset-y-0 left-0 rounded-full bg-lavender transition-[width] duration-300" style={{ width: `${progress}%` }} />
            </div>
            <input
              type="range"
              min={0}
              max={player.duration || 1}
              step={1}
              value={Math.min(player.time, player.duration || 1)}
              onChange={(event) => player.seek(Number(event.target.value))}
              className="mt-1 h-4 w-full cursor-pointer opacity-0"
              style={{ marginBottom: '-12px' }}
              aria-label="Geser posisi lagu"
            />

            <div className="mt-5 flex items-center justify-center gap-5 text-lavender sm:gap-8">
              <button
                type="button"
                onClick={player.toggleShuffle}
                className={`rounded-full p-2 transition ${player.shuffle ? 'bg-neon/20 text-neon' : 'text-lavender/75 hover:text-softwhite'}`}
                aria-label="Acak lagu"
              >
                <Shuffle size={18} />
              </button>
              <button type="button" onClick={player.previous} className="rounded-full p-2 transition hover:bg-lavender/10" aria-label="Lagu sebelumnya">
                <SkipBack size={22} />
              </button>
              <button
                type="button"
                onClick={player.togglePlay}
                disabled={Boolean(current && !current.videoId)}
                className="flex h-16 w-16 items-center justify-center rounded-full border border-softwhite/75 bg-softwhite text-void shadow-[0_0_35px_rgba(196,181,253,0.22)] transition hover:scale-105 hover:bg-lavender disabled:cursor-not-allowed disabled:opacity-40"
                aria-label={player.playing ? 'Jeda' : 'Putar'}
              >
                {player.playing ? <Pause size={26} /> : <Play size={26} className="ml-1" />}
              </button>
              <button type="button" onClick={player.next} className="rounded-full p-2 transition hover:bg-lavender/10" aria-label="Lagu berikutnya">
                <SkipForward size={22} />
              </button>
              <button
                type="button"
                onClick={player.cycleRepeat}
                className={`rounded-full p-2 transition ${player.repeat !== 'off' ? 'bg-neon/20 text-neon' : 'text-lavender/75 hover:text-softwhite'}`}
                aria-label={repeatLabel}
              >
                <Repeat size={18} />
              </button>
            </div>

            <div className="mt-6 text-center">
              <p className="font-heading text-2xl text-softwhite sm:text-3xl">{current ? featuredTrack.title : 'Pilih lagu untuk memulai'}</p>
              <p className="mt-1 text-sm text-lavender">{current ? featuredTrack.artist : 'AFTER YOU Music Room'}</p>
              <Visualizer active={Boolean(current) && !player.failed} paused={!player.playing} />
            </div>

            <div className="mt-2 flex items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <button type="button" onClick={player.toggleMute} className="rounded-full p-2 text-muted transition hover:text-lavender" aria-label={player.muted ? 'Nyalakan suara' : 'Bisukan'}>
                  {player.muted ? <VolumeX size={16} /> : <Volume2 size={16} />}
                </button>
                <input
                  type="range"
                  min={0}
                  max={100}
                  value={player.muted ? 0 : player.volume}
                  onChange={(event) => player.setVolume(Number(event.target.value))}
                  className="h-1 w-24 cursor-pointer accent-[#A78BFA]"
                  aria-label="Volume"
                />
              </div>
              <button
                type="button"
                onClick={() => current && player.openOnYouTube(current)}
                disabled={!current}
                className="flex items-center gap-1.5 rounded-full border border-lavender/20 px-3 py-1.5 text-[11px] text-lavender transition hover:bg-lavender/10 disabled:opacity-40"
              >
                <ExternalLink size={13} />
                Buka di YouTube
              </button>
            </div>
          </div>

          <div className="mt-5 rounded-3xl border border-lavender/15 bg-[rgba(15,14,25,0.68)] p-4 shadow-2xl shadow-black/35 backdrop-blur-xl sm:p-5">
            <div className="grid gap-5 sm:grid-cols-[120px_1fr_1fr] sm:items-center">
              <div className="relative aspect-square overflow-hidden rounded-2xl bg-deeppurple">
                <img src="/images/empty-street.jpg" alt="" className="h-full w-full object-cover opacity-80" loading="lazy" />
                <div className="absolute inset-0 bg-gradient-to-tr from-deeppurple/70 to-transparent" />
                <span className="absolute bottom-3 left-3 font-heading text-2xl text-softwhite">☾</span>
              </div>
              <div className="min-w-0 sm:border-r sm:border-lavender/20 sm:pr-6">
                <p className="text-[10px] tracking-[0.35em] text-lavender uppercase">{activePlaylistDef.name}</p>
                <p className="mt-3 font-heading text-2xl text-softwhite">{featuredTrack.title}</p>
                <p className="mt-1 text-sm text-muted">{activePlaylistDef.description}</p>
              </div>
              <p className="font-hand text-2xl leading-snug text-lavender/85 italic sm:pl-2">
                Karena pada akhirnya...<br />
                kita semua pernah menjadi seseorang yang menunggu.
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={() => setShowPlaylists((value) => !value)}
            className="mx-auto mt-7 flex items-center gap-2 rounded-full border border-lavender/20 bg-void/45 px-5 py-2.5 text-xs text-lavender transition hover:bg-lavender/10"
            aria-expanded={showPlaylists}
          >
            {showPlaylists ? 'Sembunyikan playlist' : 'Pilih lagu lain'}
            <ChevronDown size={14} className={`transition-transform ${showPlaylists ? 'rotate-180' : ''}`} />
          </button>

          <AnimatePresence initial={false}>
            {showPlaylists ? (
              <motion.div
                initial={{ opacity: 0, height: 0, y: -10 }}
                animate={{ opacity: 1, height: 'auto', y: 0 }}
                exit={{ opacity: 0, height: 0, y: -10 }}
                className="mt-5 overflow-hidden"
              >
                <div className="mb-4 flex flex-wrap justify-center gap-2">
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
                <p className="mb-3 text-center text-xs text-muted">{activePlaylistDef.description}</p>
                <ul className="grid gap-2 sm:grid-cols-2">
                  {tracksInPlaylist(activePlaylist).map((track, index) => (
                    <TrackRow key={track.id} playlist={activePlaylistDef} index={index} />
                  ))}
                </ul>
              </motion.div>
            ) : null}
          </AnimatePresence>

          <AnimatePresence>
            {player.failed ? (
              <motion.div
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className="mx-auto mt-5 max-w-xl rounded-2xl border border-maroon/40 bg-maroon/20 p-4 text-center"
              >
                <p className="text-sm text-red-100">Lagu ini tidak bisa diputar di dalam embed YouTube.</p>
                <button
                  type="button"
                  onClick={() => current && player.openOnYouTube(current)}
                  className="mt-3 rounded-full bg-softwhite px-5 py-2 text-xs font-medium text-void transition hover:brightness-90"
                >
                  Buka di YouTube
                </button>
              </motion.div>
            ) : null}
          </AnimatePresence>
        </motion.div>
      </div>
    </section>
  )
}
