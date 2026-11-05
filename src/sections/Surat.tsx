import { AnimatePresence, motion } from 'motion/react'
import { Feather, Flame, MailOpen, Send, Trash2, Wind } from 'lucide-react'
import { useEffect, useMemo, useRef, useState } from 'react'
import ConfirmDialog, { ModalShell } from '../components/ConfirmDialog'
import SectionHeading from '../components/SectionHeading'
import type { Letter, LetterAction } from '../types'
import { formatDate, readJSON, uid, writeJSON } from '../lib/store'

const STORAGE_KEY = 'afteryou.letters.v1'

const ASH = Array.from({ length: 26 }, (_, index) => ({
  left: 30 + ((index * 17.3) % 40),
  delay: (index * 0.09) % 1.6,
  time: 1.8 + ((index * 0.11) % 1.2),
  dx: ((index % 2 === 0 ? 1 : -1) * (10 + ((index * 3) % 30))),
}))

type Ritual = { letter: Letter; action: LetterAction; phase: 'running' | 'done' }

export default function Surat() {
  const [letters, setLetters] = useState<Letter[]>(() => readJSON(STORAGE_KEY, []))
  const [to, setTo] = useState('')
  const [text, setText] = useState('')
  const [editingId, setEditingId] = useState<string | null>(null)
  const [openId, setOpenId] = useState<string | null>(null)
  const [pendingDeleteId, setPendingDeleteId] = useState<string | null>(null)
  const [ritual, setRitual] = useState<Ritual | null>(null)
  const ritualTimer = useRef<number | null>(null)

  useEffect(() => {
    writeJSON(STORAGE_KEY, letters)
  }, [letters])

  useEffect(() => {
    return () => {
      if (ritualTimer.current) window.clearTimeout(ritualTimer.current)
    }
  }, [])

  const sorted = useMemo(() => [...letters].sort((a, b) => b.createdAt - a.createdAt), [letters])
  const editingLetter = editingId ? letters.find((letter) => letter.id === editingId) : null

  function startEdit(letter: Letter) {
    setEditingId(letter.id)
    setTo(letter.to)
    setText(letter.text)
    document.getElementById('surat')?.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }

  function resetForm() {
    setEditingId(null)
    setTo('')
    setText('')
  }

  function save() {
    const body = text.trim()
    if (!body) return
    if (editingLetter) {
      setLetters((current) =>
        current.map((letter) =>
          letter.id === editingLetter.id
            ? { ...letter, to: to.trim() || 'Seseorang', text: body }
            : letter,
        ),
      )
    } else {
      const letter: Letter = {
        id: uid(),
        to: to.trim() || 'Seseorang',
        text: body,
        createdAt: Date.now(),
      }
      setLetters((current) => [letter, ...current])
    }
    resetForm()
  }

  function startRitual(letter: Letter, action: Exclude<LetterAction, null>) {
    setRitual({ letter, action, phase: 'running' })
    ritualTimer.current = window.setTimeout(() => {
      setLetters((current) => current.filter((item) => item.id !== letter.id))
      setRitual((current) => (current ? { ...current, phase: 'done' } : null))
    }, action === 'fly' ? 3400 : 3000)
  }

  function closeRitual() {
    if (ritual?.phase === 'running') return
    setRitual(null)
  }

  const ritualMessage: Record<string, string> = {
    burn: 'Beberapa hal tidak perlu dilupakan. Cukup berhenti menyakitimu.',
    tear: 'Kamu tidak harus menyimpan semua lembar cerita untuk bisa melanjutkan hidup.',
    fly: 'Biarkan ia pergi bersama angin. Langit malam akan menjaganya.',
  }

  return (
    <section id="surat" className="relative scroll-mt-16 overflow-hidden bg-void py-24 sm:py-32">
      <div
        className="pointer-events-none absolute inset-0 opacity-40"
        style={{
          backgroundImage: 'url(/images/moon-city.jpg)',
          backgroundSize: 'cover',
          backgroundPosition: 'center',
        }}
        aria-hidden="true"
      />
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-void/85 via-void/70 to-void" />

      <div className="relative mx-auto max-w-5xl px-5 sm:px-8">
        <SectionHeading
          kicker="Surat yang Tak Terkirim"
          title="Jika malam ini kamu bisa bicara dengannya sekali lagi..."
          lead="Tuliskan, simpan, atau lepaskan. Bakar, sobek, atau terbangkan ke langit malam — semua pilihan ada di tanganmu."
        />

        <div className="grid gap-8 lg:grid-cols-2">
          {/* Form */}
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-60px' }}
            transition={{ duration: 0.7 }}
            className="paper rounded-3xl p-6 sm:p-8"
          >
            <h3 className="flex items-center gap-2 font-heading text-2xl text-softwhite">
              <Feather size={19} className="text-lavender" />
              {editingLetter ? 'Perbaiki Surat' : 'Tulis Surat Baru'}
            </h3>
            <label className="mt-6 block text-xs tracking-wide text-muted uppercase" htmlFor="letter-to">
              Untuk
            </label>
            <input
              id="letter-to"
              value={to}
              onChange={(event) => setTo(event.target.value)}
              placeholder="Nama dia, atau cukup 'Seseorang'..."
              maxLength={60}
              className="mt-2 w-full border-b border-lavender/15 bg-transparent pb-2 font-hand text-2xl text-softwhite placeholder:text-muted/40 focus:border-neon focus:outline-none"
            />
            <textarea
              value={text}
              onChange={(event) => setText(event.target.value)}
              placeholder="Apa yang ingin kamu katakan kepadanya, jika kamu tidak lagi takut kehilangan?"
              rows={8}
              maxLength={3000}
              className="mt-6 w-full resize-none rounded-xl border border-lavender/15 bg-void/40 p-4 font-hand text-xl leading-snug text-softwhite placeholder:text-muted/40 focus:border-neon focus:outline-none"
              aria-label="Isi surat"
            />
            <div className="mt-5 flex flex-wrap items-center justify-between gap-3">
              <p className="text-xs text-muted">{text.length}/3000 karakter</p>
              <div className="flex gap-3">
                {editingLetter ? (
                  <button
                    type="button"
                    onClick={resetForm}
                    className="rounded-full border border-lavender/25 px-5 py-2.5 text-sm text-lavender transition hover:bg-lavender/10"
                  >
                    Batal
                  </button>
                ) : null}
                <button
                  type="button"
                  onClick={save}
                  disabled={!text.trim()}
                  className="flex items-center gap-2 rounded-full bg-neon px-6 py-2.5 text-sm font-medium text-void transition hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-40"
                >
                  <Send size={15} />
                  {editingLetter ? 'Perbarui Surat' : 'Simpan Surat'}
                </button>
              </div>
            </div>
          </motion.div>

          {/* List */}
          <div>
            <h3 className="mb-5 font-heading text-2xl text-lavender">Surat yang Tersimpan</h3>
            {sorted.length === 0 ? (
              <motion.div
                initial={{ opacity: 0 }}
                whileInView={{ opacity: 1 }}
                viewport={{ once: true }}
                className="glass rounded-2xl p-10 text-center"
              >
                <MailOpen className="mx-auto mb-4 text-lavender/60" size={30} />
                <p className="font-quote text-lg text-softwhite italic">Belum ada surat di sini.</p>
                <p className="mt-2 text-sm text-muted">
                  Bahkan kalimat yang tidak pernah terkirim layak dituliskan.
                </p>
              </motion.div>
            ) : (
              <ul className="space-y-3">
                {sorted.map((letter, index) => (
                  <motion.li
                    key={letter.id}
                    initial={{ opacity: 0, y: 14 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true, margin: '-40px' }}
                    transition={{ duration: 0.45, delay: index * 0.05 }}
                    className="paper rounded-2xl p-5"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <p className="font-hand text-2xl text-softwhite">Untuk {letter.to}</p>
                        <p className="mt-1 text-xs text-muted">{formatDate(letter.createdAt)}</p>
                      </div>
                      <div className="flex shrink-0 gap-1">
                        <button
                          type="button"
                          onClick={() => setOpenId(openId === letter.id ? null : letter.id)}
                          className="rounded-full p-2 text-muted transition hover:bg-lavender/10 hover:text-lavender"
                          aria-label="Baca surat"
                        >
                          <MailOpen size={15} />
                        </button>
                        <button
                          type="button"
                          onClick={() => startEdit(letter)}
                          className="rounded-full p-2 text-muted transition hover:bg-lavender/10 hover:text-lavender"
                          aria-label="Edit surat"
                        >
                          <Feather size={15} />
                        </button>
                        <button
                          type="button"
                          onClick={() => setPendingDeleteId(letter.id)}
                          className="rounded-full p-2 text-muted transition hover:bg-maroon/20 hover:text-red-300"
                          aria-label="Hapus surat"
                        >
                          <Trash2 size={15} />
                        </button>
                      </div>
                    </div>
                    {openId === letter.id ? (
                      <p className="mt-3 rounded-xl bg-void/40 p-4 font-hand text-lg leading-snug whitespace-pre-wrap text-softwhite/90">
                        {letter.text}
                      </p>
                    ) : null}
                    <div className="mt-4 flex flex-wrap gap-2">
                      <button
                        type="button"
                        onClick={() => startRitual(letter, 'burn')}
                        className="flex items-center gap-1.5 rounded-full border border-maroon/50 px-3 py-1.5 text-xs text-red-300 transition hover:bg-maroon/20"
                      >
                        <Flame size={13} /> Bakar Surat
                      </button>
                      <button
                        type="button"
                        onClick={() => startRitual(letter, 'tear')}
                        className="flex items-center gap-1.5 rounded-full border border-lavender/25 px-3 py-1.5 text-xs text-lavender transition hover:bg-lavender/10"
                      >
                        <Wind size={13} /> Sobek Surat
                      </button>
                      <button
                        type="button"
                        onClick={() => startRitual(letter, 'fly')}
                        className="flex items-center gap-1.5 rounded-full border border-neon/40 px-3 py-1.5 text-xs text-neon transition hover:bg-neon/10"
                      >
                        <Send size={13} /> Terbangkan ke Langit
                      </button>
                    </div>
                  </motion.li>
                ))}
              </ul>
            )}
          </div>
        </div>
      </div>

      {/* Ritual modal */}
      <ModalShell
        open={ritual !== null}
        onClose={closeRitual}
        label={`Pelepasan surat — ${ritual?.action ?? ''}`}
      >
        {ritual ? (
          <div className="relative overflow-hidden rounded-3xl bg-abyss p-8 text-center">
            <AnimatePresence mode="wait">
              {ritual.phase === 'running' ? (
                <motion.div key="running" exit={{ opacity: 0 }}>
                  {ritual.action === 'burn' ? (
                    <div className="relative mx-auto flex h-64 max-w-sm items-center justify-center">
                      <div className="paper relative flex h-56 w-full flex-col justify-center rounded-lg px-6">
                        <div className="absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-maroon/70 to-transparent" />
                        <span className="flame absolute -top-10 left-1/2 -translate-x-1/2 text-5xl" aria-hidden="true">
                          🔥
                        </span>
                        <div className="pointer-events-none absolute inset-0">
                          {ASH.map((ash, index) => (
                            <span
                              key={index}
                              className="ash absolute bottom-0 h-1.5 w-1.5 rounded-full bg-lavender/70"
                              style={{
                                left: `${ash.left}%`,
                                animationDelay: `${ash.delay}s`,
                                animationDuration: `${ash.time}s`,
                                ['--ash-dx' as string]: `${ash.dx}px`,
                                ['--ash-time' as string]: `${ash.time}s`,
                              }}
                            />
                          ))}
                        </div>
                        <p className="font-hand text-xl text-softwhite/90">Untuk {ritual.letter.to}</p>
                        <p className="mt-1 line-clamp-3 font-hand text-lg text-softwhite/70">{ritual.letter.text}</p>
                      </div>
                    </div>
                  ) : null}

                  {ritual.action === 'tear' ? (
                    <div className="relative mx-auto flex h-64 max-w-sm items-center justify-center gap-1">
                      <motion.div
                        animate={{ rotate: -7, x: -36, opacity: 0.25 }}
                        transition={{ duration: 2.6, ease: 'easeIn' }}
                        className="paper h-56 w-1/2 rounded-l-lg"
                      />
                      <motion.div
                        animate={{ rotate: 7, x: 36, opacity: 0.25 }}
                        transition={{ duration: 2.6, ease: 'easeIn' }}
                        className="paper h-56 w-1/2 rounded-r-lg"
                      />
                      <p className="absolute bottom-2 font-hand text-lg text-softwhite/60">Untuk {ritual.letter.to}</p>
                    </div>
                  ) : null}

                  {ritual.action === 'fly' ? (
                    <div className="relative mx-auto flex h-64 items-center justify-center">
                      <div className="letter-fly paper flex h-40 w-56 flex-col items-center justify-center rounded-lg px-4">
                        <p className="font-hand text-xl text-softwhite">Untuk {ritual.letter.to}</p>
                      </div>
                    </div>
                  ) : null}
                </motion.div>
              ) : (
                <motion.div key="done" initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }}>
                  <p className="text-4xl" aria-hidden="true">
                    ✦
                  </p>
                  <p className="mx-auto mt-4 max-w-sm font-quote text-xl text-softwhite italic">
                    {ritualMessage[ritual.action ?? 'burn']}
                  </p>
                  <button
                    type="button"
                    onClick={closeRitual}
                    className="mt-6 rounded-full bg-neon px-6 py-2.5 text-sm font-medium text-void transition hover:brightness-110"
                  >
                    Tutup
                  </button>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        ) : null}
      </ModalShell>

      <ConfirmDialog
        open={pendingDeleteId !== null}
        title="Hapus surat ini?"
        body="Surat yang dihapus tidak bisa dikembalikan. Kamu juga bisa melepaskannya lewat ritual bakar, sobek, atau terbangkan."
        confirmLabel="Hapus"
        danger
        onConfirm={() => {
          if (pendingDeleteId) {
            setLetters((current) => current.filter((letter) => letter.id !== pendingDeleteId))
          }
          setPendingDeleteId(null)
        }}
        onCancel={() => setPendingDeleteId(null)}
      />
    </section>
  )
}
