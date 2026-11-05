import { AnimatePresence, motion } from 'motion/react'
import type { ReactNode } from 'react'

interface ConfirmDialogProps {
  open: boolean
  title: string
  body: string
  confirmLabel?: string
  cancelLabel?: string
  danger?: boolean
  onConfirm: () => void
  onCancel: () => void
}

export default function ConfirmDialog({
  open,
  title,
  body,
  confirmLabel = 'Ya, lanjutkan',
  cancelLabel = 'Batal',
  danger = false,
  onConfirm,
  onCancel,
}: ConfirmDialogProps) {
  return (
    <AnimatePresence>
      {open ? (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[80] flex items-center justify-center bg-void/80 p-5 backdrop-blur-sm"
          role="dialog"
          aria-modal="true"
          aria-label={title}
          onClick={onCancel}
        >
          <motion.div
            initial={{ scale: 0.94, y: 14, opacity: 0 }}
            animate={{ scale: 1, y: 0, opacity: 1 }}
            exit={{ scale: 0.96, y: 8, opacity: 0 }}
            transition={{ duration: 0.22, ease: 'easeOut' }}
            className="glass w-full max-w-sm rounded-2xl p-6 shadow-2xl"
            onClick={(event) => event.stopPropagation()}
          >
            <h3 className="font-heading text-2xl font-medium text-softwhite">{title}</h3>
            <p className="mt-2 text-sm leading-relaxed text-muted">{body}</p>
            <div className="mt-6 flex justify-end gap-3">
              <button
                type="button"
                onClick={onCancel}
                className="rounded-full border border-lavender/20 px-4 py-2 text-sm text-lavender transition hover:bg-lavender/10"
              >
                {cancelLabel}
              </button>
              <button
                type="button"
                onClick={onConfirm}
                className={
                  danger
                    ? 'rounded-full bg-maroon px-4 py-2 text-sm font-medium text-softwhite transition hover:brightness-110'
                    : 'rounded-full bg-neon px-4 py-2 text-sm font-medium text-void transition hover:brightness-110'
                }
              >
                {confirmLabel}
              </button>
            </div>
          </motion.div>
        </motion.div>
      ) : null}
    </AnimatePresence>
  )
}

export function ModalShell({
  open,
  onClose,
  children,
  label,
}: {
  open: boolean
  onClose: () => void
  children: ReactNode
  label: string
}) {
  return (
    <AnimatePresence>
      {open ? (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[70] flex items-center justify-center bg-void/85 p-4 backdrop-blur-md sm:p-8"
          role="dialog"
          aria-modal="true"
          aria-label={label}
          onClick={onClose}
        >
          <motion.div
            initial={{ scale: 0.95, opacity: 0, y: 16 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.97, opacity: 0, y: 10 }}
            transition={{ duration: 0.28, ease: 'easeOut' }}
            className="w-full max-w-lg"
            onClick={(event) => event.stopPropagation()}
          >
            {children}
          </motion.div>
        </motion.div>
      ) : null}
    </AnimatePresence>
  )
}
