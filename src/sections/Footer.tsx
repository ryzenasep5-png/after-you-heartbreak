import { Heart } from 'lucide-react'

export default function Footer() {
  return (
    <footer className="border-t border-lavender/10 bg-void py-12">
      <div className="mx-auto max-w-6xl px-5 text-center sm:px-8">
        <p className="font-heading text-2xl font-semibold tracking-[0.18em] text-softwhite">
          AFTER YOU
        </p>
        <p className="mt-2 text-xs tracking-[0.35em] text-muted uppercase">
          Ruang untuk yang Kehilangan
        </p>
        <p className="mx-auto mt-6 max-w-md font-quote text-sm text-muted italic">
          “Ada yang pergi. Tapi tidak semua kenangan ikut pergi.”
        </p>
        <p className="mt-8 flex items-center justify-center gap-1.5 text-xs text-muted">
          Dibuat dengan
          <Heart size={12} className="fill-maroon text-maroon" aria-label="cinta" />
          untuk hati yang masih belajar mengikhlaskan.
        </p>
        <p className="mt-4 text-[11px] tracking-[0.28em] text-muted/70">
          By: Ryzen
        </p>
        <p className="mt-3 text-[11px] text-muted/60">
          AFTER YOU bukan pengganti bantuan profesional. Jika kamu butuh bantuan, jangan ragu
          menghubungi layanan kesehatan jiwa terdekat.
        </p>
      </div>
    </footer>
  )
}
