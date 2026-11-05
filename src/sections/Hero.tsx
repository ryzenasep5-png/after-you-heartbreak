import { motion, useScroll, useTransform } from 'motion/react'
import { ChevronDown, Headphones, PenLine } from 'lucide-react'
import { useMemo } from 'react'

const RAIN_DROPS = Array.from({ length: 42 }, (_, index) => ({
  left: (index * 61.8) % 100,
  delay: (index * 0.37) % 4,
  duration: 0.9 + ((index * 0.13) % 1.1),
  opacity: 0.25 + ((index * 0.07) % 0.4),
}))

const PARTICLES = Array.from({ length: 16 }, (_, index) => ({
  left: (index * 43.7 + 11) % 92,
  top: 12 + ((index * 29.3) % 66),
  size: 2 + ((index * 7) % 4),
  duration: 6 + ((index * 1.7) % 7),
  delay: (index * 0.9) % 5,
}))

function scrollTo(href: string) {
  document.querySelector(href)?.scrollIntoView({ behavior: 'smooth', block: 'start' })
}

export default function Hero() {
  const { scrollY } = useScroll()
  const backgroundY = useTransform(scrollY, [0, 800], [0, 120])
  const titleY = useTransform(scrollY, [0, 500], [0, -60])
  const titleOpacity = useTransform(scrollY, [0, 420], [1, 0.15])

  const drops = useMemo(() => RAIN_DROPS, [])
  const particles = useMemo(() => PARTICLES, [])

  return (
    <section id="home" className="relative flex min-h-svh items-center justify-center overflow-hidden">
      {/* Background cinematic */}
      <motion.div style={{ y: backgroundY }} className="absolute inset-0 scale-[1.06]">
        <img
          src="/images/hero-rainy-window.jpg"
          alt=""
          className="h-full w-full object-cover"
          loading="eager"
          fetchPriority="high"
        />
      </motion.div>
      <div className="absolute inset-0 bg-gradient-to-b from-void/70 via-void/35 to-void" />
      <div className="absolute inset-0 bg-gradient-to-r from-void/55 via-transparent to-void/55" />

      {/* Rain */}
      <div className="pointer-events-none absolute inset-0" aria-hidden="true">
        {drops.map((drop, index) => (
          <span
            key={index}
            className="rain-drop"
            style={{
              left: `${drop.left}%`,
              height: `${44 + ((index * 5) % 60)}px`,
              animationDelay: `${drop.delay}s`,
              animationDuration: `${drop.duration}s`,
              ['--rain-opacity' as string]: drop.opacity,
            }}
          />
        ))}
      </div>

      {/* Fog */}
      <div
        className="fog-layer pointer-events-none absolute -inset-x-1/4 bottom-0 h-72 rounded-full bg-deeppurple/30 blur-3xl"
        aria-hidden="true"
      />

      {/* Floating particles */}
      <div className="pointer-events-none absolute inset-0" aria-hidden="true">
        {particles.map((particle, index) => (
          <span
            key={index}
            className="float-particle absolute rounded-full bg-lavender/50"
            style={{
              left: `${particle.left}%`,
              top: `${particle.top}%`,
              width: particle.size,
              height: particle.size,
              animationDuration: `${particle.duration}s`,
              animationDelay: `${particle.delay}s`,
            }}
          />
        ))}
      </div>

      {/* Moon glow accent */}
      <div
        className="moon-glow pointer-events-none absolute right-[12%] top-[14%] hidden h-24 w-24 rounded-full bg-lavender/80 sm:block"
        aria-hidden="true"
      />

      {/* Content */}
      <motion.div
        style={{ y: titleY, opacity: titleOpacity }}
        className="relative z-10 mx-auto max-w-4xl px-6 pt-24 pb-20 text-center"
      >
        <motion.p
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.9, delay: 0.15 }}
          className="mb-6 text-[11px] font-medium tracking-[0.5em] text-lavender uppercase"
        >
          Ruang untuk yang Kehilangan
        </motion.p>

        <motion.h1
          initial={{ opacity: 0, y: 26 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, delay: 0.3 }}
          className="font-heading text-5xl leading-[1.08] font-medium text-softwhite text-glow sm:text-6xl md:text-7xl lg:text-8xl"
        >
          ADA YANG PERGI.
          <br />
          <span className="text-lavender">TAPI TIDAK SEMUA</span>
          <br />
          KENANGAN IKUT PERGI.
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.9, delay: 0.55 }}
          className="mx-auto mt-7 max-w-xl text-sm leading-relaxed text-muted sm:text-lg"
        >
          Tempat untuk merasakan semuanya, tanpa harus berpura-pura baik-baik saja.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.9, delay: 0.75 }}
          className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row"
        >
          <button
            type="button"
            onClick={() => scrollTo('#curhat')}
            className="flex w-full items-center justify-center gap-2 rounded-full bg-neon px-7 py-3.5 text-sm font-medium text-void shadow-lg shadow-neon/25 transition hover:brightness-110 sm:w-auto"
          >
            <PenLine size={17} />
            Buka Ruang Curhat
          </button>
          <button
            type="button"
            onClick={() => scrollTo('#music')}
            className="flex w-full items-center justify-center gap-2 rounded-full border border-lavender/35 px-7 py-3.5 text-sm text-lavender backdrop-blur-sm transition hover:bg-lavender/10 sm:w-auto"
          >
            <Headphones size={17} />
            Dengarkan Malam Ini
          </button>
        </motion.div>

        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1.2, delay: 1 }}
          className="mt-8 font-quote text-sm text-lavender/80 italic"
        >
          Untuk hati yang masih belajar mengikhlaskan.
        </motion.p>
      </motion.div>

      {/* Scroll indicator */}
      <button
        type="button"
        onClick={() => scrollTo('#curhat')}
        className="absolute bottom-8 left-1/2 z-10 -translate-x-1/2 text-lavender/70"
        aria-label="Gulir ke bawah"
      >
        <span className="scroll-hint block">
          <ChevronDown size={26} />
        </span>
      </button>
    </section>
  )
}
