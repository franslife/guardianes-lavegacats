import { motion } from 'framer-motion'

interface Props {
  zoneName: string
  heartsEarned: number
  level: number
  onContinue: () => void
}

export default function MissionComplete({ zoneName, heartsEarned, level, onContinue }: Props) {
  return (
    <motion.div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-6"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.4 }}
    >
      <motion.div
        className="w-full max-w-sm rounded-3xl bg-[#F5EBD8] p-8 text-center shadow-2xl"
        initial={{ scale: 0.7, opacity: 0, y: 40 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        transition={{ type: 'spring', damping: 18, stiffness: 260, delay: 0.1 }}
      >
        {/* Celebración */}
        <motion.div
          className="mb-4 text-5xl"
          animate={{ scale: [1, 1.2, 1, 1.15, 1], rotate: [0, -8, 8, -4, 0] }}
          transition={{ duration: 0.7, delay: 0.3 }}
        >
          🎉
        </motion.div>

        <h2 className="mb-1 text-2xl font-extrabold text-[#3D2E1F]">¡Misión completada!</h2>
        <p className="mb-6 text-[#3D2E1F]/70 text-sm">{zoneName}</p>

        {/* Resumen */}
        <div className="mb-6 flex justify-center gap-6 text-sm">
          <div className="flex flex-col items-center gap-1">
            <span className="text-2xl font-extrabold text-[#7BA577]">+{heartsEarned}</span>
            <span className="text-[#3D2E1F]/60">corazones</span>
          </div>
          <div className="w-px bg-[#3D2E1F]/15" />
          <div className="flex flex-col items-center gap-1">
            <span className="text-2xl font-extrabold text-[#E07856]">{level}</span>
            <span className="text-[#3D2E1F]/60">nivel actual</span>
          </div>
        </div>

        {/* Botones */}
        <div className="flex flex-col gap-3">
          <motion.button
            className="w-full rounded-2xl bg-[#E07856] py-4 text-lg font-bold text-white active:scale-95 transition-transform"
            whileTap={{ scale: 0.96 }}
            onClick={onContinue}
          >
            Continuar mi turno
          </motion.button>
          <button className="py-2 text-sm text-[#3D2E1F]/50 font-medium">
            Quiero ser voluntario/a
          </button>
        </div>
      </motion.div>
    </motion.div>
  )
}
