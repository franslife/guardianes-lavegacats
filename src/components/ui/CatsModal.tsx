import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useGameStore } from '../../store/gameStore'
import catsData from '../../data/cats.json'
import CatBioModal from './CatBioModal'

function Paw({ filled }: { filled: boolean }) {
  return (
    <span className={`text-base ${filled ? 'text-[#E07856]' : 'text-[#3D2E1F]/20'}`}>🐾</span>
  )
}

interface Props {
  onClose: () => void
}

export default function CatsModal({ onClose }: Props) {
  const catTrust = useGameStore((s) => s.catTrust)
  const biosUnlocked = useGameStore((s) => s.biosUnlocked)
  const [selectedCat, setSelectedCat] = useState<typeof catsData[number] | null>(null)

  return (
    <>
      <AnimatePresence>
        <motion.div
          className="fixed inset-0 z-[70] flex items-end justify-center bg-black/50"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
        >
          <motion.div
            className="w-full max-w-lg rounded-t-3xl bg-[#F5EBD8] p-6 pb-10 max-h-[85dvh] overflow-y-auto"
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            transition={{ type: 'spring', damping: 26, stiffness: 300 }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="mb-5 flex items-center justify-between">
              <h2 className="text-xl font-extrabold text-[#3D2E1F]">Mis gatos</h2>
              <button onClick={onClose} className="text-[#3D2E1F]/40 text-2xl leading-none">×</button>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {catsData.map((cat) => {
                const trust = catTrust[cat.id] ?? 0
                const bioUnlocked = biosUnlocked.includes(cat.id)

                return (
                  <div
                    key={cat.id}
                    className="flex flex-col items-center rounded-2xl bg-white/70 p-3 gap-2 shadow-sm"
                  >
                    <div className="relative">
                      <img
                        src={cat.portrait}
                        alt={cat.name}
                        className={`h-16 w-16 rounded-full object-cover ring-2 ${
                          bioUnlocked ? 'ring-[#E07856]' : 'ring-[#3D2E1F]/10'
                        } ${trust === 0 ? 'grayscale opacity-60' : ''}`}
                      />
                      {trust === 0 && (
                        <div className="absolute inset-0 flex items-center justify-center rounded-full bg-black/20">
                          <span className="text-white text-lg">?</span>
                        </div>
                      )}
                    </div>

                    <p className={`text-xs font-bold text-center ${trust === 0 ? 'text-[#3D2E1F]/40' : 'text-[#3D2E1F]'}`}>
                      {cat.name}
                    </p>

                    <div className="flex gap-0.5">
                      {Array.from({ length: 5 }, (_, i) => (
                        <Paw key={i} filled={i < trust} />
                      ))}
                    </div>

                    {bioUnlocked && (
                      <button
                        onClick={() => setSelectedCat(cat)}
                        className="mt-1 rounded-full bg-[#E07856] px-3 py-1 text-[10px] font-bold text-white"
                      >
                        Ver bio
                      </button>
                    )}
                    {!bioUnlocked && trust > 0 && (
                      <p className="text-[9px] text-[#3D2E1F]/40 text-center">
                        {5 - trust} misiones más
                      </p>
                    )}
                    {trust === 0 && (
                      <p className="text-[9px] text-[#3D2E1F]/30 text-center">Visita su zona</p>
                    )}
                  </div>
                )
              })}
            </div>
          </motion.div>
        </motion.div>
      </AnimatePresence>

      {selectedCat && (
        <CatBioModal cat={selectedCat} onClose={() => setSelectedCat(null)} />
      )}
    </>
  )
}
