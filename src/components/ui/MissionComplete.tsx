import { motion } from 'framer-motion'
import catsData from '../../data/cats.json'

interface CatGain {
  catId: string
  newTrust: number
  bioUnlocked: boolean
}

interface Props {
  zoneName: string
  heartsEarned: number
  level: number
  newMedals: string[]
  catGains: CatGain[]
  onContinue: () => void
}

const MEDAL_META: Record<string, { emoji: string; name: string }> = {
  primer_cuidado: { emoji: '⭐', name: 'Primer Cuidado' },
  cuidador_atento: { emoji: '🌟', name: 'Cuidador Atento' },
  turno_completo: { emoji: '🏅', name: 'Turno Completo' },
  guardian: { emoji: '🐱', name: 'Guardián' },
}

export default function MissionComplete({ zoneName, heartsEarned, level, newMedals, catGains, onContinue }: Props) {
  return (
    <motion.div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-6"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.4 }}
    >
      <motion.div
        className="w-full max-w-sm rounded-3xl bg-[#F5EBD8] p-7 text-center shadow-2xl overflow-y-auto max-h-[90dvh]"
        initial={{ scale: 0.7, opacity: 0, y: 40 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        transition={{ type: 'spring', damping: 18, stiffness: 260, delay: 0.1 }}
      >
        <motion.div
          className="mb-3 text-5xl"
          animate={{ scale: [1, 1.2, 1, 1.15, 1], rotate: [0, -8, 8, -4, 0] }}
          transition={{ duration: 0.7, delay: 0.3 }}
        >
          🎉
        </motion.div>

        <h2 className="mb-1 text-2xl font-extrabold text-[#3D2E1F]">¡Misión completada!</h2>
        <p className="mb-4 text-[#3D2E1F]/60 text-sm">{zoneName}</p>

        {/* Resumen de corazones y nivel */}
        <div className="mb-4 flex justify-center gap-6 text-sm">
          <div className="flex flex-col items-center gap-1">
            <span className="text-2xl font-extrabold text-[#7BA577]">+{heartsEarned}</span>
            <span className="text-[#3D2E1F]/60 text-xs">corazones</span>
          </div>
          <div className="w-px bg-[#3D2E1F]/15" />
          <div className="flex flex-col items-center gap-1">
            <span className="text-2xl font-extrabold text-[#E07856]">{level}</span>
            <span className="text-[#3D2E1F]/60 text-xs">nivel actual</span>
          </div>
        </div>

        {/* Nuevas medallas */}
        {newMedals.length > 0 && (
          <div className="mb-4 rounded-2xl bg-[#3D2E1F] p-3">
            <p className="text-[10px] font-bold uppercase tracking-widest text-white/50 mb-2">Medalla desbloqueada</p>
            {newMedals.map((id) => {
              const m = MEDAL_META[id]
              return m ? (
                <div key={id} className="flex items-center gap-2">
                  <span className="text-xl">{m.emoji}</span>
                  <span className="text-sm font-bold text-white">{m.name}</span>
                </div>
              ) : null
            })}
          </div>
        )}

        {/* Gatos con progreso */}
        {catGains.length > 0 && (
          <div className="mb-4 rounded-2xl bg-white/60 p-3">
            <p className="text-[10px] font-bold uppercase tracking-widest text-[#3D2E1F]/40 mb-2">Confianza de gatos</p>
            {catGains.map(({ catId, newTrust, bioUnlocked }) => {
              const cat = catsData.find((c) => c.id === catId)
              if (!cat) return null
              return (
                <div key={catId} className="flex items-center gap-2 mb-1">
                  <img src={cat.portrait} alt={cat.name} className="h-8 w-8 rounded-full object-cover" />
                  <span className="text-xs font-semibold text-[#3D2E1F] flex-1">{cat.name}</span>
                  <div className="flex gap-0.5">
                    {Array.from({ length: 5 }, (_, i) => (
                      <span key={i} className={`text-xs ${i < newTrust ? 'text-[#E07856]' : 'text-[#3D2E1F]/20'}`}>🐾</span>
                    ))}
                  </div>
                  {bioUnlocked && <span className="text-xs text-[#7BA577] font-bold ml-1">✓ bio</span>}
                </div>
              )
            })}
          </div>
        )}

        {/* Botones */}
        <div className="flex flex-col gap-3">
          <motion.button
            className="w-full rounded-2xl bg-[#E07856] py-4 text-lg font-bold text-white active:scale-95 transition-transform"
            whileTap={{ scale: 0.96 }}
            onClick={onContinue}
          >
            Continuar mi turno
          </motion.button>
          <button className="py-2 text-sm text-[#3D2E1F]/40 font-medium">
            Quiero ser voluntario/a
          </button>
        </div>
      </motion.div>
    </motion.div>
  )
}
