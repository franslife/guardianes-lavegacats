import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  VOLUNTEER_TO, buildMailtoUrl, buildGmailUrl, trackVolunteer,
} from '../../lib/mailto'

interface Props {
  open:       boolean
  onClose:    () => void
  fromScreen: string
}

export default function VolunteerModal({ open, onClose, fromScreen }: Props) {
  const [copied, setCopied] = useState(false)

  function handleGmail() {
    trackVolunteer(fromScreen, 'desktop', 'gmail')
    window.open(buildGmailUrl(), '_blank', 'noopener')
    onClose()
  }

  function handleMailto() {
    trackVolunteer(fromScreen, 'desktop', 'mailto')
    window.location.href = buildMailtoUrl()
    onClose()
  }

  async function handleCopy() {
    try {
      await navigator.clipboard.writeText(VOLUNTEER_TO)
      setCopied(true)
      trackVolunteer(fromScreen, 'desktop', 'copy')
      setTimeout(() => setCopied(false), 2000)
    } catch {
      // Clipboard API not available — silently ignore
    }
  }

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className="fixed inset-0 z-[90] flex items-center justify-center p-4 bg-black/50"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
        >
          <motion.div
            className="relative w-full max-w-md rounded-3xl bg-[#F5EBD8] p-8 shadow-2xl"
            initial={{ scale: 0.92, opacity: 0, y: 16 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.92, opacity: 0, y: 16 }}
            transition={{ type: 'spring', damping: 24, stiffness: 300 }}
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={onClose}
              className="absolute top-4 right-4 text-2xl text-[#3D2E1F]/30 hover:text-[#3D2E1F]/60 leading-none"
              aria-label="Cerrar"
            >
              ×
            </button>

            <h2 className="text-xl font-extrabold text-[#3D2E1F] mb-1">
              ✉️ Escríbenos
            </h2>
            <p className="text-sm text-[#3D2E1F]/60 mb-6">
              Elige cómo quieres abrir el correo:
            </p>

            <div className="flex gap-3 mb-6">
              <button
                onClick={handleGmail}
                className="flex-1 flex flex-col items-center gap-2 rounded-2xl bg-white border-2 border-[#E07856]/30 hover:border-[#E07856] py-5 px-3 transition-colors shadow-sm"
              >
                <span className="text-3xl">📬</span>
                <span className="text-sm font-bold text-[#3D2E1F]">Abrir en Gmail</span>
                <span className="text-[11px] text-[#3D2E1F]/40">Nueva pestaña</span>
              </button>

              <button
                onClick={handleMailto}
                className="flex-1 flex flex-col items-center gap-2 rounded-2xl bg-white border-2 border-[#7BA577]/30 hover:border-[#7BA577] py-5 px-3 transition-colors shadow-sm"
              >
                <span className="text-3xl">📧</span>
                <span className="text-sm font-bold text-[#3D2E1F]">Mi cliente de correo</span>
                <span className="text-[11px] text-[#3D2E1F]/40">App predeterminada</span>
              </button>
            </div>

            <div className="border-t border-[#3D2E1F]/10 pt-5">
              <p className="text-xs text-[#3D2E1F]/50 mb-2">
                ¿No se abre? Copia esta dirección:
              </p>
              <div className="flex items-center gap-2">
                <span className="flex-1 rounded-xl bg-white border border-[#3D2E1F]/10 px-3 py-2 text-sm font-mono text-[#3D2E1F] select-all truncate">
                  {VOLUNTEER_TO}
                </span>
                <button
                  onClick={handleCopy}
                  className={`rounded-xl px-3 py-2 text-sm font-semibold transition-colors ${
                    copied
                      ? 'bg-[#7BA577] text-white'
                      : 'bg-[#3D2E1F]/10 text-[#3D2E1F] hover:bg-[#3D2E1F]/20'
                  }`}
                >
                  {copied ? '✓ Copiado' : 'Copiar'}
                </button>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
