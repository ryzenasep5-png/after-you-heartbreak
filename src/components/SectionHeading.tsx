import { motion } from 'motion/react'

interface SectionHeadingProps {
  kicker: string
  title: string
  lead?: string
}

export default function SectionHeading({ kicker, title, lead }: SectionHeadingProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 26 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-80px' }}
      transition={{ duration: 0.7, ease: 'easeOut' }}
      className="mx-auto mb-12 max-w-3xl text-center sm:mb-16"
    >
      <p className="mb-3 text-[11px] font-medium tracking-[0.35em] text-neon uppercase">
        {kicker}
      </p>
      <h2 className="font-heading text-4xl leading-tight font-medium text-softwhite text-glow sm:text-5xl md:text-6xl">
        {title}
      </h2>
      {lead ? (
        <p className="mx-auto mt-5 max-w-xl text-sm leading-relaxed text-muted sm:text-base">
          {lead}
        </p>
      ) : null}
    </motion.div>
  )
}
