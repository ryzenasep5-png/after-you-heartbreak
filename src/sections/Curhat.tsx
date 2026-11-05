import { motion } from 'motion/react'
import { BookOpen, Edit3, Lock, PenLine, Trash2 } from 'lucide-react'
import { useEffect, useMemo, useState } from 'react'
import ConfirmDialog from '../components/ConfirmDialog'
import SectionHeading from '../components/SectionHeading'
import { MOOD_OPTIONS } from '../types'
import type { JournalEntry } from '../types'
import { formatDate, readJSON, uid, writeJSON } from '../lib/store'

const STORAGE_KEY = 'afteryou.journal.v1'

export default function Curhat() {
  const [entries, setEntries] = useState<JournalEntry[]>(() => readJSON(STORAGE_KEY, []))
  const [title, setTitle] = useState('')
  const [mood, setMood] = useState<string>('Rindu')
  const [text, setText] = useState('')
  const [editingId, setEditingId] = useState<string | null>(null)
  const [openEntryId, setOpenEntryId] = useState<string | null>(null)
  const [pendingDeleteId, setPendingDeleteId] = useState<string | null>(null)
  const [savedFlash, setSavedFlash] = useState(false)

  useEffect(() => {
    writeJSON(STORAGE_KEY, entries)
  }, [entries])

  useEffect(() => {
    if (!savedFlash) return
    const timer = window.setTimeout(() => setSavedFlash(false), 2200)
    return () => window.clearTimeout(timer)
  }, [savedFlash])

  const sorted = useMemo(
    () => [...entries].sort((a, b) => b.updatedAt - a.updatedAt),
    [entries],
  )

  const editingEntry = editingId ? entries.find((entry) => entry.id === editingId) : null

  function startEdit(entry: JournalEntry) {
    setEditingId(entry.id)
    setTitle(entry.title)
    setMood(entry.mood)
    setText(entry.text)
    document.getElementById('curhat')?.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }

  function resetForm() {
    setEditingId(null)
    setTitle('')
    setMood('Rindu')
    setText('')
  }

  function save() {
    const body = text.trim()
    if (!body) return
    if (editingEntry) {
      setEntries((current) =>
        current.map((entry) =>
          entry.id === editingEntry.id
            ? { ...entry, title: title.trim() || 'Tanpa Judul', mood, text: body, updatedAt: Date.now() }
            : entry,
        ),
      )
    } else {
      const entry: JournalEntry = {
        id: uid(),
        title: title.trim() || 'Tanpa Judul',
        mood,
        text: body,
        createdAt: Date.now(),
        updatedAt: Date.now(),
      }
      setEntries((current) => [entry, ...current])
    }
    resetForm()
    setSavedFlash(true)
  }

  function confirmDelete() {
    if (!pendingDeleteId) return
    setEntries((current) => current.filter((entry) => entry.id !== pendingDeleteId))
    if (editingId === pendingDeleteId) resetForm()
    if (openEntryId === pendingDeleteId) setOpenEntryId(null)
    setPendingDeleteId(null)
  }

  return (
    <section id="curhat" className="relative scroll-mt-16 bg-abyss py-24 sm:py-32">
      <div className="pointer-events-none absolute inset-x-0 top-0 h-40 bg-gradient-to-b from-void to-transparent" />
      <div className="relative mx-auto max-w-5xl px-5 sm:px-8">
        <SectionHeading
          kicker="Ruang Curhat"
          title="Kadang, yang paling ingin didengar hanyalah isi hati kita sendiri."
          lead="Semua tulisanmu tersimpan lokal di browser perangkatmu. Tidak dikirim ke server mana pun, tidak dibaca siapa pun selain kamu."
        />

        {/* Form */}
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-60px' }}
          transition={{ duration: 0.7 }}
          className="paper mx-auto max-w-2xl rounded-3xl p-6 sm:p-9"
        >
          <div className="flex items-center justify-between gap-3">
            <h3 className="font-heading text-2xl font-medium text-softwhite">
              {editingEntry ? 'Edit Cerita' : 'Tulis Ceritamu'}
            </h3>
            <span className="flex items-center gap-1.5 rounded-full border border-lavender/20 px-3 py-1 text-[11px] text-lavender">
              <Lock size={11} />
              Private — hanya di perangkatmu
            </span>
          </div>

          <input
            value={title}
            onChange={(event) => setTitle(event.target.value)}
            placeholder="Judul ceritamu (opsional)"
            className="mt-6 w-full border-b border-lavender/15 bg-transparent pb-2 font-heading text-xl text-softwhite placeholder:text-muted/50 focus:border-neon focus:outline-none"
            maxLength={80}
            aria-label="Judul curhatan"
          />

          <div className="mt-5 flex flex-wrap gap-2">
            {MOOD_OPTIONS.map((option) => (
              <button
                key={option}
                type="button"
                onClick={() => setMood(option)}
                className={`rounded-full border px-3.5 py-1.5 text-xs transition ${
                  mood === option
                    ? 'border-neon bg-neon/15 text-lavender'
                    : 'border-lavender/15 text-muted hover:border-lavender/35 hover:text-lavender'
                }`}
              >
                {option}
              </button>
            ))}
          </div>

          <textarea
            value={text}
            onChange={(event) => setText(event.target.value)}
            placeholder="Kalau tidak ada yang bisa kamu ceritakan, tuliskan semuanya di sini..."
            rows={6}
            maxLength={4000}
            className="mt-6 w-full resize-none rounded-xl border border-lavender/15 bg-void/50 p-4 text-sm leading-relaxed text-softwhite placeholder:text-muted/50 focus:border-neon focus:outline-none"
            aria-label="Isi curhatan"
          />

          <div className="mt-5 flex flex-wrap items-center justify-between gap-3">
            <p className="text-xs text-muted">{text.length}/4000 karakter</p>
            <div className="flex gap-3">
              {editingEntry ? (
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
                <PenLine size={15} />
                {editingEntry ? 'Perbarui Cerita' : 'Simpan Ceritaku'}
              </button>
            </div>
          </div>
          {savedFlash ? (
            <p className="fade-up mt-3 text-center text-xs text-neon">Tersimpan di perangkatmu ✦</p>
          ) : null}
        </motion.div>

        {/* Riwayat */}
        <div className="mx-auto mt-14 max-w-3xl">
          <h3 className="mb-5 font-heading text-2xl text-lavender">Riwayat Curhat</h3>
          {sorted.length === 0 ? (
            <motion.div
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              className="glass rounded-2xl p-10 text-center"
            >
              <BookOpen className="mx-auto mb-4 text-lavender/60" size={30} />
              <p className="font-quote text-lg text-softwhite italic">
                Belum ada cerita di sini.
              </p>
              <p className="mt-2 text-sm text-muted">
                Ruang ini kosong, menunggu apa pun yang selama ini hanya kamu simpan sendiri.
              </p>
            </motion.div>
          ) : (
            <ul className="space-y-3">
              {sorted.map((entry, index) => (
                <motion.li
                  key={entry.id}
                  initial={{ opacity: 0, y: 14 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: '-40px' }}
                  transition={{ duration: 0.45, delay: index * 0.04 }}
                  className="glass rounded-2xl p-5"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <p className="font-heading text-xl text-softwhite">{entry.title}</p>
                      <p className="mt-1 text-xs text-muted">
                        {formatDate(entry.createdAt)} · mood:{' '}
                        <span className="text-lavender">{entry.mood}</span>
                      </p>
                    </div>
                    <div className="flex shrink-0 gap-1">
                      <button
                        type="button"
                        onClick={() => setOpenEntryId(openEntryId === entry.id ? null : entry.id)}
                        className="rounded-full p-2 text-muted transition hover:bg-lavender/10 hover:text-lavender"
                        aria-label={openEntryId === entry.id ? 'Tutup cerita' : 'Baca kembali'}
                      >
                        <BookOpen size={15} />
                      </button>
                      <button
                        type="button"
                        onClick={() => startEdit(entry)}
                        className="rounded-full p-2 text-muted transition hover:bg-lavender/10 hover:text-lavender"
                        aria-label="Edit"
                      >
                        <Edit3 size={15} />
                      </button>
                      <button
                        type="button"
                        onClick={() => setPendingDeleteId(entry.id)}
                        className="rounded-full p-2 text-muted transition hover:bg-maroon/20 hover:text-red-300"
                        aria-label="Hapus"
                      >
                        <Trash2 size={15} />
                      </button>
                    </div>
                  </div>
                  {openEntryId === entry.id ? (
                    <p className="mt-3 rounded-xl bg-void/40 p-4 text-sm leading-relaxed whitespace-pre-wrap text-softwhite/90">
                      {entry.text}
                    </p>
                  ) : null}
                </motion.li>
              ))}
            </ul>
          )}
        </div>
      </div>

      <ConfirmDialog
        open={pendingDeleteId !== null}
        title="Hapus cerita ini?"
        body="Cerita yang dihapus tidak bisa dikembalikan. Yakin ingin melanjutkan?"
        confirmLabel="Hapus"
        danger
        onConfirm={confirmDelete}
        onCancel={() => setPendingDeleteId(null)}
      />
    </section>
  )
}
