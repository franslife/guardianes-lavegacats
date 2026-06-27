import { motion } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import { useGameStore } from '../store/gameStore'
import { openVolunteerEmail } from '../lib/mailto'

export default function TurnEnd() {
  const navigate = useNavigate()
  const { hearts, completeTurn } = useGameStore()

  function handlePlayAgain() {
    completeTurn()
    navigate('/map')
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-dvh bg-[#7BA577] px-6 py-12 text-center">
      <motion.div
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ type: 'spring', damping: 15 }}
        className="text-8xl mb-6"
      >
        🐱
      </motion.div>

      <motion.h1
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="text-3xl font-bold text-white mb-4 leading-tight"
      >
        Has completado tu turno de voluntario virtual
      </motion.h1>

      <motion.p
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
        className="text-white/80 mb-4"
      >
        En La Vega Cats hay personas que hacen esto todos los días, de verdad. Los gatos te están esperando.
      </motion.p>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.6 }}
        className="bg-white/20 rounded-2xl px-6 py-3 mb-8"
      >
        <span className="text-white font-bold text-xl">💚 {hearts} corazones ganados</span>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.7 }}
        className="flex flex-col gap-3 w-full max-w-sm"
      >
        <button
          onClick={() => openVolunteerEmail('turn_end')}
          className="w-full bg-[#E07856] text-white font-bold py-4 rounded-2xl text-lg shadow-lg active:scale-95 transition-transform"
        >
          Quiero ser voluntario/a
        </button>
        <a
          href="https://lavegacats.com"
          target="_blank"
          rel="noopener noreferrer"
          className="w-full bg-white text-[#3D2E1F] font-bold py-4 rounded-2xl text-lg text-center shadow active:scale-95 transition-transform"
        >
          Visitar lavegacats.com
        </a>
        <button
          onClick={handlePlayAgain}
          className="text-white/70 py-2 text-sm font-medium"
        >
          Jugar otro turno
        </button>
      </motion.div>
    </div>
  )
}
