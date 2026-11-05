import { motion } from 'motion/react'
import { Check, HeartHandshake, Info } from 'lucide-react'
import { useEffect, useState } from 'react'
import SectionHeading from '../components/SectionHeading'
import { readJSON, writeJSON } from '../lib/store'

const STEPS = [
  { id: 'air', label: 'Minum air', detail: 'Segelas air putih, pelan-pelan.' },
  { id: 'rest', label: 'Beristirahat', detail: 'Tidur lebih awal, atau sekadar rebahan tanpa layar.' },
  { id: 'write', label: 'Menulis perasaan', detail: 'Satu paragraf di Ruang Curhat sudah cukup.' },
  { id: 'music', label: 'Mendengarkan musik', detail: 'Satu lagu dari Music Room, tidak lebih dulu.' },
  { id: 'friend', label: 'Menghubungi teman yang dipercaya', detail: 'Cukup satu pesan singkat: "lagi gimana?"' },
  { id: 'media', label: 'Mengurangi memeriksa media sosialnya', detail: 'Satu malam tanpa membuka profilnya.' },
  {
    id: 'worth',
    label: 'Mengingat nilai dirimu',
    detail: 'Nilai dirimu tidak ditentukan oleh seseorang yang pergi.',
  },
]

const STORAGE_KEY = 'afteryou.healing.v1'

export default function HealingRoom() {
  const [checked, setChecked] = useState<Record<string, boolean>>(() =>
    readJSON(STORAGE_KEY, {}),
  )

  useEffect(() => {
    writeJSON(STORAGE_KEY, checked)
  }, [checked])

  const doneCount = STEPS.filter((step) => checked[step.id]).length
  const progress = Math.round((doneCount / STEPS.length) * 100)

  function toggle(id: string) {
    setChecked((current) => ({ ...current, [id]: !current[id] }))
  }

  return (
    <section id="healing" className="relative scroll-mt-16 overflow-hidden bg-void py-24 sm:py-32">
      <div
        className="pointer-events-none absolute inset-0 opacity-30"
        style={{
          backgroundImage: 'url(/images/healing-dawn.jpg)',
          backgroundSize: 'cover',
          backgroundPosition: 'center',
        }}
        aria-hidden="true"
      />
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-void via-void/75 to-void" />

      <div className="relative mx-auto max-w-5xl px-5 sm:px-8">
        <SectionHeading
          kicker="Healing Room"
          title="Kamu Tidak Harus Sembuh Malam Ini."
          lead="Pemulihan bukan perlombaan. Lakukan satu langkah kecil saja — itu sudah cukup untuk hari ini."
        />

        <div className="mx-auto mb-10 max-w-md">
          <div className="flex items-center justify-between text-xs text-muted">
            <span className="flex items-center gap-1.5">
              <HeartHandshake size={13} className="text-neon" />
              Perjalanan pulihmu
            </span>
            <span>
              {doneCount}/{STEPS.length} langkah
            </span>
          </div>
          <div className="mt-2 h-2 overflow-hidden rounded-full bg-lavender/15">
            <motion.div
              className="h-full rounded-full bg-gradient-to-r from-neon to-lavender"
              animate={{ width: `${progress}%` }}
              transition={{ duration: 0.6, ease: 'easeOut' }}
            />
          </div>
        </div>

        <div className="grid gap-3 sm:grid-cols-2">
          {STEPS.map((step, index) => {
            const isChecked = Boolean(checked[step.id])
            return (
              <motion.button
                key={step.id}
                type="button"
                initial={{ opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: '-40px' }}
                transition={{ duration: 0.45, delay: index * 0.05 }}
                onClick={() => toggle(step.id)}
                aria-pressed={isChecked}
                className={`glass flex items-start gap-4 rounded-2xl p-5 text-left transition ${
                  isChecked ? 'border-neon/50 bg-neon/5' : ''
                }`}
              >
                <span
                  className={`mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full border transition ${
                    isChecked ? 'border-neon bg-neon text-void' : 'border-lavender/30 text-transparent'
                  }`}
                  aria-hidden="true"
                >
                  <Check size={14} />
                </span>
                <span>
                  <span className={`block text-sm font-medium ${isChecked ? 'text-lavender' : 'text-softwhite'}`}>
                    {step.label}
                  </span>
                  <span className="mt-1 block text-xs leading-relaxed text-muted">{step.detail}</span>
                </span>
              </motion.button>
            )
          })}
        </div>

        <div className="mx-auto mt-12 flex max-w-2xl items-start gap-3 rounded-2xl border border-lavender/15 bg-abyss/60 p-5">
          <Info size={16} className="mt-0.5 shrink-0 text-lavender" />
          <p className="text-xs leading-relaxed text-muted">
            AFTER YOU adalah ruang untuk didampingi, bukan pengganti bantuan profesional. Jika rasa sakit
            terasa terlalu berat dan berkepanjangan, berbicara dengan psikolog atau konselor adalah bentuk
            keberanian, bukan kelemahan.
          </p>
        </div>
      </div>
    </section>
  )
}
