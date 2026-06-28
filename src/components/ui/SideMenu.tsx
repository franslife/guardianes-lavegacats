import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import MedalsModal from './MedalsModal'
import CatsModal from './CatsModal'

interface Props {
  onClose: () => void
}

export default function SideMenu({ onClose }: Props) {
  const [modal, setModal] = useState<'medals' | 'cats' | null>(null)

  return (
    <>
      <AnimatePresence>
        {!modal && (
          <>
            {/* Backdrop */}
            <motion.div
              className="fixed inset-0 z-[55] bg-black/40"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={onClose}
            />
            {/* Panel */}
            <motion.div
              className="fixed right-0 top-0 bottom-0 z-[56] w-72 bg-[#F5EBD8] shadow-2xl flex flex-col py-10 px-6 gap-1"
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 28, stiffness: 280 }}
            >
              <button
                onClick={onClose}
                className="absolute top-4 right-4 text-2xl text-[#3D2E1F]/40 leading-none"
              >
                ×
              </button>

              <p className="text-[10px] font-bold uppercase tracking-widest text-[#3D2E1F]/40 mb-3">Menú</p>

              {[
                { label: '🏅 Mis medallas', action: () => setModal('medals') },
                { label: '🐱 Mis gatos',    action: () => setModal('cats') },
                { label: '🔊 Sonido on/off', action: () => {}, disabled: true, badge: 'Fase 6' },
              ].map(({ label, action, disabled, badge }) => (
                <button
                  key={label}
                  onClick={action}
                  disabled={disabled}
                  className={`w-full text-left py-4 px-4 rounded-2xl font-semibold text-sm transition-colors ${
                    disabled
                      ? 'text-[#3D2E1F]/30 cursor-default'
                      : 'text-[#3D2E1F] hover:bg-[#E07856]/10 active:bg-[#E07856]/20'
                  }`}
                >
                  {label}
                  {badge && <span className="ml-2 text-[10px] text-[#3D2E1F]/30">({badge})</span>}
                </button>
              ))}

              <div className="mt-auto flex flex-col gap-1">
                <button
                  className="w-full text-left py-4 px-4 rounded-2xl font-semibold text-sm text-[#3D2E1F]/50 cursor-default"
                  disabled
                >
                  ✉️ Quiero ser voluntario/a
                  <span className="ml-2 text-[10px] text-[#3D2E1F]/30">(Fase 5)</span>
                </button>
                <a
                  href="https://lavegacats.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full text-left py-4 px-4 rounded-2xl font-semibold text-sm text-[#7BA577] hover:bg-[#7BA577]/10"
                  onClick={onClose}
                >
                  🌐 Visitar lavegacats.com
                </a>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {modal === 'medals' && <MedalsModal onClose={() => setModal(null)} />}
      {modal === 'cats' && <CatsModal onClose={() => setModal(null)} />}
    </>
  )
}
