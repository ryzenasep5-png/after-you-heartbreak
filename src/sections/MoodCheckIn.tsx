import { AnimatePresence, motion } from 'motion/react'
import { Headphones, Sparkles } from 'lucide-react'
import { useState } from 'react'
import SectionHeading from '../components/SectionHeading'
import { moods } from '../data/moods'
import { playlists } from '../data/playlists'

export default function MoodCheckIn() {
  const [selected, setSelected] = useState<string | null>(null)

  function listen(playlistId: string) {
    document.getElementById('music')?.scrollIntoView({ behavior: 'smooth', block: 'start' })
    window.setTimeout(() => {
      window.dispatchEvent(new CustomEvent('afteryou:select-playlist', { detail: playlistId }))
    }, 350)
  }

  const active = moods.find((mood) => mood.id === selected)
  const activePlaylist = active ? playlists.find((item) => item.name === active.playlist) : undefined

  return (
    <section id="mood" className="relative scroll-mt-16 bg-void py-24 sm:py-32">
      <div className="mx-auto max-w-6xl px-5 sm:px-8">
        <SectionHeading
          kicker="Mood Check-in"
          title="Malam ini, apa yang paling kamu rasakan?"
          lead="Pilih satu. Tidak ada jawaban yang salah, tidak ada perasaan yang perlu disembunyikan."
        />

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {moods.map((mood, index) => (
            <motion.button
              key={mood.id}
              type="button"
              initial={{ opacity: 0, y: 18 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-50px' }}
              transition={{ duration: 0.5, delay: index * 0.05 }}
              onClick={() => setSelected(selected === mood.id ? null : mood.id)}
              className={`glass rounded-2xl p-5 text-left transition hover:-translate-y-0.5 ${
                selected === mood.id ? 'border-neon/60 shadow-lg shadow-neon/10' : ''
              }`}
            >
              <span className="text-3xl" aria-hidden="true">
                {mood.emoji}
              </span>
              <p className="mt-3 text-sm font-medium text-softwhite">{mood.label}</p>
            </motion.button>
          ))}
        </div>

        <AnimatePresence>
          {active ? (
            <motion.div
              initial={{ opacity: 0, y: 22, height: 0 }}
              animate={{ opacity: 1, y: 0, height: 'auto' }}
              exit={{ opacity: 0, y: 10, height: 0 }}
              transition={{ duration: 0.45, ease: 'easeOut' }}
              className="overflow-hidden"
            >
              <div className="paper mx-auto mt-10 max-w-3xl rounded-3xl p-7 sm:p-10">
                <p className="text-[11px] tracking-[0.35em] text-neon uppercase">
                  {active.label}
                </p>
                <p className="mt-4 font-quote text-xl leading-relaxed text-softwhite italic sm:text-2xl">
                  “{active.message}”
                </p>
                <p className="mt-3 text-sm text-muted">— AFTER YOU</p>

                <div className="mt-8 grid gap-4 sm:grid-cols-2">
                  <div className="rounded-2xl border border-lavender/15 bg-void/40 p-5">
                    <p className="flex items-center gap-2 text-xs tracking-wide text-lavender uppercase">
                      <Headphones size={13} /> Playlist yang cocok
                    </p>
                    <p className="mt-2 font-heading text-xl text-softwhite">{active.playlist}</p>
                    {activePlaylist ? (
                      <button
                        type="button"
                        onClick={() => listen(activePlaylist.id)}
                        className="mt-3 rounded-full bg-neon px-4 py-2 text-xs font-medium text-void transition hover:brightness-110"
                      >
                        Dengarkan sekarang
                      </button>
                    ) : null}
                  </div>
                  <div className="rounded-2xl border border-lavender/15 bg-void/40 p-5">
                    <p className="flex items-center gap-2 text-xs tracking-wide text-lavender uppercase">
                      <Sparkles size={13} /> Langkah kecil untukmu
                    </p>
                    <p className="mt-2 text-sm leading-relaxed text-softwhite/90">{active.activity}</p>
                  </div>
                </div>
              </div>
            </motion.div>
          ) : null}
        </AnimatePresence>
      </div>
    </section>
  )
}
