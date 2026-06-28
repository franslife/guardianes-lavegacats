import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { trackShare } from '../../lib/mailto'

const GAME_URL  = 'https://guardianes-lavegacats.vercel.app'
const SHARE_TEXT =
  'Acabo de completar mi turno de voluntario virtual en La Vega Cats. Un juego para conocer un santuario de gatos real. ¡Pruébalo!'

interface Props {
  open:    boolean
  onClose: () => void
}

export default function ShareModal({ open, onClose }: Props) {
  const [copied, setCopied] = useState(false)

  const encodedText = encodeURIComponent(`${SHARE_TEXT} ${GAME_URL}`)
  const waUrl       = `https://wa.me/?text=${encodedText}`
  const twUrl       =
    `https://twitter.com/intent/tweet` +
    `?text=${encodeURIComponent(SHARE_TEXT)}` +
    `&url=${encodeURIComponent(GAME_URL)}`

  async function handleCopy() {
    try {
      await navigator.clipboard.writeText(GAME_URL)
      setCopied(true)
      trackShare('copy')
      setTimeout(() => setCopied(false), 2000)
    } catch {
      // Silently ignore
    }
  }

  const OPTIONS = [
    {
      label: 'WhatsApp',
      emoji: '💬',
      color: 'hover:border-[#25D366]',
      action() { trackShare('whatsapp'); window.open(waUrl, '_blank', 'noopener') },
    },
    {
      label: 'X / Twitter',
      emoji: '✖',
      color: 'hover:border-[#1DA1F2]',
      action() { trackShare('twitter'); window.open(twUrl, '_blank', 'noopener') },
    },
  ]

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
            className="relative w-full max-w-sm rounded-3xl bg-[#F5EBD8] p-7 shadow-2xl"
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
              Comparte el santuario
            </h2>
            <p className="text-sm text-[#3D2E1F]/60 mb-5">
              Ayuda a más gatos difundiendo el juego
            </p>

            <div className="flex gap-3 mb-5">
              {OPTIONS.map((o) => (
                <button
                  key={o.label}
                  onClick={() => { o.action(); onClose() }}
                  className={`flex-1 flex flex-col items-center gap-2 rounded-2xl bg-white border-2 border-[#3D2E1F]/10 ${o.color} py-5 px-2 transition-colors shadow-sm`}
                >
                  <span className="text-3xl">{o.emoji}</span>
                  <span className="text-xs font-bold text-[#3D2E1F]">{o.label}</span>
                </button>
              ))}
            </div>

            <div className="border-t border-[#3D2E1F]/10 pt-4">
              <p className="text-xs text-[#3D2E1F]/50 mb-2">O copia el enlace:</p>
              <div className="flex items-center gap-2">
                <span className="flex-1 rounded-xl bg-white border border-[#3D2E1F]/10 px-3 py-2 text-xs font-mono text-[#3D2E1F] truncate select-all">
                  {GAME_URL}
                </span>
                <button
                  onClick={handleCopy}
                  className={`rounded-xl px-3 py-2 text-sm font-semibold transition-colors ${
                    copied
                      ? 'bg-[#7BA577] text-white'
                      : 'bg-[#3D2E1F]/10 text-[#3D2E1F] hover:bg-[#3D2E1F]/20'
                  }`}
                >
                  {copied ? '✓' : 'Copiar'}
                </button>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
