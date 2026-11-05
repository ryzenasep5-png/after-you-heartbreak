import type { Quote } from '../data/quotes'

export const quoteBackgrounds = [
  ['#0d0a1c', '#241640', '#3b1d55'],
  ['#10101f', '#1c1433', '#2b1c4a'],
  ['#0b1020', '#1a1a35', '#32204f'],
  ['#120d1a', '#241530', '#3d1f4a'],
] as const

function wrapText(
  context: CanvasRenderingContext2D,
  text: string,
  maxWidth: number,
): string[] {
  const words = text.split(' ')
  const lines: string[] = []
  let line = ''
  for (const word of words) {
    const candidate = line ? `${line} ${word}` : word
    if (context.measureText(candidate).width > maxWidth && line) {
      lines.push(line)
      line = word
    } else {
      line = candidate
    }
  }
  if (line) lines.push(line)
  return lines
}

export function downloadQuoteImage(quote: Quote, backgroundIndex = 0): void {
  const size = 1080
  const canvas = document.createElement('canvas')
  canvas.width = size
  canvas.height = size
  const context = canvas.getContext('2d')
  if (!context) return

  const palette = quoteBackgrounds[backgroundIndex % quoteBackgrounds.length]
  const gradient = context.createLinearGradient(0, 0, size, size)
  gradient.addColorStop(0, palette[0])
  gradient.addColorStop(0.55, palette[1])
  gradient.addColorStop(1, palette[2])
  context.fillStyle = gradient
  context.fillRect(0, 0, size, size)

  // Vignette lembut
  const vignette = context.createRadialGradient(size / 2, size / 2, size * 0.3, size / 2, size / 2, size * 0.75)
  vignette.addColorStop(0, 'rgba(0,0,0,0)')
  vignette.addColorStop(1, 'rgba(0,0,0,0.45)')
  context.fillStyle = vignette
  context.fillRect(0, 0, size, size)

  // Bintang halus
  context.fillStyle = 'rgba(196,181,253,0.5)'
  for (let i = 0; i < 90; i++) {
    const x = (i * 137.5) % size
    const y = (i * 89.3) % (size * 0.6)
    context.globalAlpha = 0.15 + ((i * 7) % 10) / 30
    context.fillRect(x, y, 2, 2)
  }
  context.globalAlpha = 1

  // Kutipan
  context.fillStyle = '#F5F3F7'
  context.font = '600 52px "Playfair Display", Georgia, serif'
  context.textBaseline = 'top'
  const lines = wrapText(context, quote.text, size - 240)
  const lineHeight = 76
  const startY = (size - lines.length * lineHeight) / 2
  lines.forEach((line, index) => {
    context.fillText(line, 120, startY + index * lineHeight)
  })

  // Footer
  context.fillStyle = '#A78BFA'
  context.font = '500 30px "Inter", sans-serif'
  context.fillText('— AFTER YOU', 120, size - 160)
  context.fillStyle = 'rgba(196,181,253,0.75)'
  context.font = '400 24px "Inter", sans-serif'
  context.fillText(quote.theme, 120, size - 120)

  const link = document.createElement('a')
  link.download = `after-you-${Date.now()}.png`
  link.href = canvas.toDataURL('image/png')
  link.click()
}

export function shareQuote(quote: Quote): void {
  const shareData = {
    title: 'AFTER YOU — Kata-Kata Malam Ini',
    text: `"${quote.text}" — AFTER YOU`,
    url: typeof window !== 'undefined' ? window.location.href : undefined,
  }
  if (typeof navigator !== 'undefined' && navigator.share) {
    navigator.share(shareData).catch(() => {
      // Pengguna membatalkan share — tidak perlu tindakan.
    })
  } else {
    navigator.clipboard?.writeText(`"${quote.text}" — AFTER YOU`).catch(() => undefined)
  }
}
