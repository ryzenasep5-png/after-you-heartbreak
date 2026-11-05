import { AnimatePresence, motion } from 'motion/react'
import { ArrowRight, Moon } from 'lucide-react'
import { useEffect, useState } from 'react'

const STORAGE_KEY = 'afteryou.intro-seen.v1'

function hasSeenIntro() {
  try {
    return window.localStorage.getItem(STORAGE_KEY) === 'true'
  } catch {
    return false
  }
}

export default function IntroOverlay() {
  const [open, setOpen] = useState(() => !hasSeenIntro())

  useEffect(() => {
    if (!open) return
    const previousOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => {
      document.body.style.overflow = previousOverflow
    }
  }, [open])

  function enter() {
    try {
      window.localStorage.setItem(STORAGE_KEY, 'true')
    } catch {
      // Privasi pengguna tetap aman bila browser memblokir localStorage.
    }
    setOpen(false)
  }

  return (
    <AnimatePresence>
      {open ? (
        <motion.div
          className="fixed inset-0 z-[100] flex items-center justify-center overflow-hidden bg-void/95 px-5 py-8"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.65, ease: 'easeInOut' }}
          role="dialog"
          aria-modal="true"
          aria-labelledby="intro-title"
        >
          <motion.div
            className="absolute inset-0 bg-[url('/images/moon-city.jpg')] bg-cover bg-center"
            initial={{ scale: 1.08, opacity: 0.15 }}
            animate={{ scale: 1, opacity: 0.36 }}
            transition={{ duration: 1.7, ease: 'easeOut' }}
          />
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_35%,rgba(167,139,250,0.2),transparent_36%),linear-gradient(180deg,rgba(8,8,13,0.5),#08080d_92%)]" />
          <div className="fog-layer pointer-events-none absolute -inset-x-1/4 bottom-0 h-64 rounded-full bg-deeppurple/30 blur-3xl" />

          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.15, ease: 'easeOut' }}
            className="relative z-10 w-full max-w-2xl text-center"
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.7, rotate: -14 }}
              animate={{ opacity: 1, scale: 1, rotate: 0 }}
              transition={{ duration: 0.8, delay: 0.3, type: 'spring', stiffness: 120 }}
              className="mx-auto flex h-14 w-14 items-center justify-center rounded-full border border-lavender/30 bg-lavender/10 text-lavender shadow-[0_0_70px_rgba(167,139,250,0.25)]"
            >
              <Moon size={23} />
            </motion.div>
            <p className="mt-8 text-[10px] tracking-[0.52em] text-lavender/75 uppercase">
              Sebelum kamu masuk
            </p>
            <h1 id="intro-title" className="mt-5 font-heading text-4xl leading-tight text-softwhite sm:text-6xl">
              Penyesalan Terdalam
            </h1>
            <p className="mx-auto mt-7 max-w-xl font-quote text-xl leading-relaxed text-lavender/90 italic sm:text-2xl">
              “Penyesalan terdalam bukan saat seseorang pergi, tetapi saat ia masih di sini dan kita
              memilih diam pada semua kata yang seharusnya disampaikan.”
            </p>
            <p className="mx-auto mt-6 max-w-md text-sm leading-relaxed text-muted">
              Tarik napas pelan. Malam ini tidak perlu kamu lewati sendirian.
            </p>
            <button
              type="button"
              onClick={enter}
              className="group mx-auto mt-9 flex items-center gap-2 rounded-full bg-neon px-7 py-3.5 text-sm font-medium text-void shadow-xl shadow-neon/20 transition hover:brightness-110"
            >
              Masuk ke ruang malam
              <ArrowRight size={16} className="transition-transform group-hover:translate-x-1" />
            </button>
            <p className="mt-8 text-[11px] tracking-[0.2em] text-muted/70">BY: RYZEN</p>
          </motion.div>
        </motion.div>
      ) : null}
    </AnimatePresence>
  )
}
