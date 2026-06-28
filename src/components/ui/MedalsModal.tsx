import { motion, AnimatePresence } from 'framer-motion'
import { useGameStore } from '../../store/gameStore'

const MEDALS = [
  {
    id: 'primer_cuidado',
    emoji: '⭐',
    name: 'Primer Cuidado',
    desc: 'Completaste tu primera tarea en el santuario.',
    how: 'Completa cualquier tarea en una zona.',
  },
  {
    id: 'cuidador_atento',
    emoji: '🌟',
    name: 'Cuidador Atento',
    desc: 'Completaste una misión entera de principio a fin.',
    how: 'Completa todos los hotspots de cualquier zona.',
  },
  {
    id: 'turno_completo',
    emoji: '🏅',
    name: 'Turno Completo',
    desc: 'Completaste un turno entero en el santuario.',
    how: 'Termina las 5 misiones disponibles.',
  },
  {
    id: 'guardian',
    emoji: '🐱',
    name: 'Guardián',
    desc: 'Te ganaste la confianza de todos los gatos del santuario.',
    how: 'Desbloquea las bios de los 6 gatos.',
  },
]

interface Props {
  onClose: () => void
}

export default function MedalsModal({ onClose }: Props) {
  const medals = useGameStore((s) => s.medals)

  return (
    <AnimatePresence>
      <motion.div
        className="fixed inset-0 z-[70] flex items-end justify-center bg-black/50 p-0"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
      >
        <motion.div
          className="w-full max-w-lg rounded-t-3xl bg-[#F5EBD8] p-6 pb-10"
          initial={{ y: '100%' }}
          animate={{ y: 0 }}
          exit={{ y: '100%' }}
          transition={{ type: 'spring', damping: 26, stiffness: 300 }}
          onClick={(e) => e.stopPropagation()}
        >
          <div className="mb-5 flex items-center justify-between">
            <h2 className="text-xl font-extrabold text-[#3D2E1F]">Mis medallas</h2>
            <button onClick={onClose} className="text-[#3D2E1F]/40 text-2xl leading-none">×</button>
          </div>

          <div className="flex flex-col gap-3">
            {MEDALS.map((m) => {
              const unlocked = medals.includes(m.id)
              return (
                <div
                  key={m.id}
                  className={`flex items-center gap-4 rounded-2xl p-4 ${
                    unlocked ? 'bg-[#3D2E1F] text-white' : 'bg-[#3D2E1F]/10 text-[#3D2E1F]/40'
                  }`}
                >
                  <span className={`text-3xl ${unlocked ? '' : 'grayscale opacity-40'}`}>{m.emoji}</span>
                  <div className="flex-1 min-w-0">
                    <p className={`font-bold text-sm ${unlocked ? 'text-white' : 'text-[#3D2E1F]/50'}`}>{m.name}</p>
                    <p className={`text-xs mt-0.5 ${unlocked ? 'text-white/70' : 'text-[#3D2E1F]/40'}`}>
                      {unlocked ? m.desc : `🔒 ${m.how}`}
                    </p>
                  </div>
                  {unlocked && <span className="text-[#F7D87C] text-lg">✓</span>}
                </div>
              )
            })}
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  )
}
