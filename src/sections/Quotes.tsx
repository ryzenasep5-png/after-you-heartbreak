import { AnimatePresence, motion } from 'motion/react'
import { Check, Download, Heart, ImageDown, RefreshCw, Share2 } from 'lucide-react'
import { useCallback, useEffect, useState } from 'react'
import SectionHeading from '../components/SectionHeading'
import { quotes } from '../data/quotes'
import type { Quote } from '../data/quotes'
import { readJSON, writeJSON } from '../lib/store'
import { downloadQuoteImage, quoteBackgrounds, shareQuote } from '../lib/quoteImage'

const FAVORITES_KEY = 'afteryou.favoriteQuotes.v1'

function randomQuote(exclude?: Quote): Quote {
  if (quotes.length <= 1) return quotes[0]
  let index = Math.floor(Math.random() * quotes.length)
  if (exclude && quotes[index].text === exclude.text) {
    index = (index + 1) % quotes.length
  }
  return quotes[index]
}

export default function Quotes() {
  const [quote, setQuote] = useState<Quote>(() => randomQuote())
  const [backgroundIndex, setBackgroundIndex] = useState(0)
  const [favorites, setFavorites] = useState<string[]>(() => readJSON(FAVORITES_KEY, []))
  const [copied, setCopied] = useState(false)

  useEffect(() => {
    writeJSON(FAVORITES_KEY, favorites)
  }, [favorites])

  useEffect(() => {
    if (!copied) return
    const timer = window.setTimeout(() => setCopied(false), 1800)
    return () => window.clearTimeout(timer)
  }, [copied])

  const next = useCallback(() => {
    setQuote((current) => randomQuote(current))
  }, [])

  const isFavorite = favorites.includes(quote.text)

  function toggleFavorite() {
    setFavorites((current) =>
      isFavorite ? current.filter((text) => text !== quote.text) : [quote.text, ...current],
    )
  }

  function copy() {
    navigator.clipboard?.writeText(`"${quote.text}" — AFTER YOU`).then(() => setCopied(true)).catch(() => undefined)
  }

  const palette = quoteBackgrounds[backgroundIndex % quoteBackgrounds.length]

  return (
    <section id="quotes" className="relative scroll-mt-16 overflow-hidden bg-abyss py-24 sm:py-32">
      <div className="fog-layer pointer-events-none absolute -inset-x-1/4 top-0 h-80 rounded-full bg-deeppurple/35 blur-3xl" />
      <div className="relative mx-auto max-w-4xl px-5 sm:px-8">
        <SectionHeading
          kicker="Kata-Kata Malam Ini"
          title="Kata-Kata yang Tidak Pernah Sempat Aku Ucapkan."
          lead={`${quotes.length} kutipan original ditulis untuk malam ini. Tekan untuk mengganti, simpan yang menyentuh hatimu.`}
        />

        <motion.div
          key={quote.text}
          initial={{ opacity: 0, scale: 0.97 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.55, ease: 'easeOut' }}
          className="relative mx-auto max-w-2xl overflow-hidden rounded-3xl border border-lavender/15 p-8 shadow-2xl shadow-black/50 sm:p-12"
          style={{
            background: `linear-gradient(135deg, ${palette[0]} 0%, ${palette[1]} 55%, ${palette[2]} 100%)`,
          }}
        >
          <span className="pointer-events-none absolute -top-8 left-6 font-quote text-[120px] leading-none text-lavender/15 select-none" aria-hidden="true">
            “
          </span>
          <p className="relative font-quote text-2xl leading-relaxed text-softwhite italic sm:text-3xl">
            {quote.text}
          </p>
          <p className="relative mt-6 text-xs tracking-[0.3em] text-lavender uppercase">
            — {quote.theme}
          </p>
        </motion.div>

        <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
          <button
            type="button"
            onClick={next}
            className="flex items-center gap-2 rounded-full bg-neon px-5 py-2.5 text-sm font-medium text-void transition hover:brightness-110"
          >
            <RefreshCw size={15} />
            Kata Berikutnya
          </button>
          <button
            type="button"
            onClick={copy}
            className="flex items-center gap-2 rounded-full border border-lavender/25 px-4 py-2.5 text-sm text-lavender transition hover:bg-lavender/10"
          >
            {copied ? <Check size={15} /> : null}
            {copied ? 'Tersalin' : 'Salin'}
          </button>
          <button
            type="button"
            onClick={toggleFavorite}
            className={`flex items-center gap-2 rounded-full border px-4 py-2.5 text-sm transition ${
              isFavorite
                ? 'border-neon/60 bg-neon/15 text-neon'
                : 'border-lavender/25 text-lavender hover:bg-lavender/10'
            }`}
          >
            <Heart size={15} className={isFavorite ? 'fill-neon' : ''} />
            {isFavorite ? 'Difavoritkan' : 'Favorit'}
          </button>
          <button
            type="button"
            onClick={() => shareQuote(quote)}
            className="flex items-center gap-2 rounded-full border border-lavender/25 px-4 py-2.5 text-sm text-lavender transition hover:bg-lavender/10"
          >
            <Share2 size={15} />
            Bagikan
          </button>
          <button
            type="button"
            onClick={() => downloadQuoteImage(quote, backgroundIndex)}
            className="flex items-center gap-2 rounded-full border border-lavender/25 px-4 py-2.5 text-sm text-lavender transition hover:bg-lavender/10"
          >
            <Download size={15} />
            Unduh Gambar
          </button>
          <button
            type="button"
            onClick={() => setBackgroundIndex((index) => index + 1)}
            className="flex items-center gap-2 rounded-full border border-lavender/25 px-4 py-2.5 text-sm text-lavender transition hover:bg-lavender/10"
            aria-label="Ganti latar kutipan"
          >
            <ImageDown size={15} />
            Ganti Latar
          </button>
        </div>

        {/* Favorites */}
        {favorites.length > 0 ? (
          <div className="mx-auto mt-14 max-w-2xl">
            <h3 className="mb-4 font-heading text-2xl text-lavender">Kutipan Favoritmu ({favorites.length})</h3>
            <ul className="space-y-3">
              <AnimatePresence initial={false}>
                {favorites.slice(0, 12).map((text) => (
                  <motion.li
                    key={text}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0 }}
                    className="glass flex items-start justify-between gap-4 rounded-xl p-4"
                  >
                    <p className="font-quote text-sm leading-relaxed text-softwhite/90 italic">“{text}”</p>
                    <button
                      type="button"
                      onClick={() => setFavorites((current) => current.filter((item) => item !== text))}
                      className="shrink-0 rounded-full p-1.5 text-muted transition hover:bg-maroon/20 hover:text-red-300"
                      aria-label="Hapus dari favorit"
                    >
                      <Heart size={14} className="fill-neon text-neon" />
                    </button>
                  </motion.li>
                ))}
              </AnimatePresence>
            </ul>
          </div>
        ) : null}
      </div>
    </section>
  )
}
