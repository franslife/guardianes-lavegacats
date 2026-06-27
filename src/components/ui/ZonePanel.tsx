import { motion, AnimatePresence } from 'framer-motion'

interface Zone {
  id: string
  name: string
  playable: boolean
  comingSoon?: boolean
  mission?: {
    title: string
    description: string
    hotspots: number
    reward_hearts: number
  }
}

interface Props {
  zone: Zone | null
  onClose: () => void
  onStartMission: (zoneId: string) => void
}

export default function ZonePanel({ zone, onClose, onStartMission }: Props) {
  return (
    <AnimatePresence>
      {zone && (
        <>
          <motion.div
            className="fixed inset-0 bg-black/40 z-40"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
          />
          <motion.div
            className="fixed bottom-0 left-0 right-0 z-50 bg-[#F5EBD8] rounded-t-3xl p-6 max-w-lg mx-auto"
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
          >
            {zone.playable && zone.mission ? (
              <>
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-xs font-bold uppercase tracking-widest text-[#7BA577]">Zona</span>
                </div>
                <h2 className="text-2xl font-bold text-[#3D2E1F] mb-1">{zone.name}</h2>
                <p className="text-lg font-semibold text-[#E07856] mb-3">🎯 {zone.mission.title}</p>
                <p className="text-[#3D2E1F]/80 mb-4">{zone.mission.description}</p>
                <div className="flex gap-4 mb-6 text-sm text-[#3D2E1F]/70">
                  <span>📋 {zone.mission.hotspots} tareas pendientes</span>
                  <span>💚 +{zone.mission.reward_hearts} corazones</span>
                </div>
                <div className="flex flex-col gap-3">
                  <button
                    className="w-full bg-[#E07856] text-white font-bold py-4 rounded-2xl text-lg active:scale-95 transition-transform"
                    onClick={() => onStartMission(zone.id)}
                  >
                    Hacer la tarea
                  </button>
                  <button
                    className="w-full text-[#3D2E1F]/60 py-2 font-medium"
                    onClick={onClose}
                  >
                    Volver
                  </button>
                </div>
              </>
            ) : (
              <>
                <h2 className="text-2xl font-bold text-[#3D2E1F] mb-3">{zone.name}</h2>
                <div className="flex items-center gap-2 mb-3">
                  <span className="text-3xl">🔒</span>
                  <span className="text-xl font-semibold text-[#7BA577]">Próximamente</span>
                </div>
                <p className="text-[#3D2E1F]/70 mb-6">
                  Pronto podrás cuidar de los gatos que viven aquí.
                </p>
                <button
                  className="w-full text-[#3D2E1F]/60 py-2 font-medium"
                  onClick={onClose}
                >
                  Volver
                </button>
              </>
            )}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}
