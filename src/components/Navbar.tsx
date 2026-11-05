import { AnimatePresence, motion } from 'motion/react'
import { Menu, X } from 'lucide-react'
import { useEffect, useState } from 'react'

const LINKS = [
  { href: '#home', label: 'Home' },
  { href: '#curhat', label: 'Curhat' },
  { href: '#surat', label: 'Surat' },
  { href: '#music', label: 'Music Room' },
  { href: '#healing', label: 'Healing' },
]

function scrollTo(href: string) {
  const target = document.querySelector(href)
  if (target) target.scrollIntoView({ behavior: 'smooth', block: 'start' })
}

export default function Navbar() {
  const [open, setOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24)
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  const navigate = (href: string) => {
    setOpen(false)
    scrollTo(href)
  }

  return (
    <header
      className={`fixed inset-x-0 top-0 z-50 transition-all duration-500 ${
        scrolled ? 'glass shadow-lg shadow-black/40' : 'bg-transparent'
      }`}
    >
      <nav className="mx-auto flex h-16 max-w-6xl items-center justify-between px-5 sm:px-8">
        <button
          type="button"
          onClick={() => navigate('#home')}
          className="font-heading text-xl font-semibold tracking-[0.18em] text-softwhite"
          aria-label="AFTER YOU — kembali ke atas"
        >
          AFTER&nbsp;YOU
        </button>

        <ul className="hidden items-center gap-8 md:flex">
          {LINKS.map((link) => (
            <li key={link.href}>
              <button
                type="button"
                onClick={() => navigate(link.href)}
                className="text-sm text-muted transition hover:text-lavender"
              >
                {link.label}
              </button>
            </li>
          ))}
        </ul>

        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => navigate('#curhat')}
            className="hidden rounded-full border border-neon/40 px-4 py-2 text-sm text-lavender transition hover:bg-neon/10 md:block"
          >
            Masuk ke Ruang Malam
          </button>
          <button
            type="button"
            onClick={() => setOpen((value) => !value)}
            className="rounded-lg p-2 text-lavender md:hidden"
            aria-label={open ? 'Tutup menu' : 'Buka menu'}
          >
            {open ? <X size={22} /> : <Menu size={22} />}
          </button>
        </div>
      </nav>

      <AnimatePresence>
        {open ? (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.25, ease: 'easeOut' }}
            className="glass overflow-hidden md:hidden"
          >
            <ul className="flex flex-col px-5 py-3">
              {LINKS.map((link) => (
                <li key={link.href}>
                  <button
                    type="button"
                    onClick={() => navigate(link.href)}
                    className="w-full border-b border-lavender/10 py-3 text-left text-sm text-softwhite"
                  >
                    {link.label}
                  </button>
                </li>
              ))}
              <li>
                <button
                  type="button"
                  onClick={() => navigate('#curhat')}
                  className="mt-3 mb-3 w-full rounded-full bg-neon px-4 py-3 text-sm font-medium text-void"
                >
                  Masuk ke Ruang Malam
                </button>
              </li>
            </ul>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </header>
  )
}
