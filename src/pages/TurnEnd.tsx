import { motion, useReducedMotion } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import { useGameStore } from '../store/gameStore'
import { openVolunteerEmail } from '../lib/mailto'
import levelsData from '../data/levels.json'

function PawPrintIcon({ className }: { className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className={className} aria-hidden>
      <ellipse cx="6"    cy="7.5" rx="1.8" ry="2.4" />
      <ellipse cx="10.5" cy="5.5" rx="1.8" ry="2.4" />
      <ellipse cx="15"   cy="5.5" rx="1.8" ry="2.4" />
      <ellipse cx="18.5" cy="7.5" rx="1.8" ry="2.4" />
      <path d="M12 9.5c-3.5 0-6.5 2.5-6.5 5.5 0 2 1.5 3.5 3 4 1 .3 2 .5 3.5.5s2.5-.2 3.5-.5c1.5-.5 3-2 3-4 0-3-3-5.5-6.5-5.5z" />
    </svg>
  )
}

const finalLevel = levelsData.find((l) => l.level === 6)!

export default function TurnEnd() {
  const navigate       = useNavigate()
  const prefersReduced = useReducedMotion()
  const { hearts, resetSession } = useGameStore()

  function handlePlayAgain() {
    resetSession()
    navigate('/select', { replace: true })
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-dvh bg-[#7BA577] px-6 py-12 text-center">
      <motion.div
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ type: 'spring', damping: 15 }}
        className="text-8xl mb-4"
      >
        🐱
      </motion.div>

      {/* Final level badge */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.25 }}
        className="mb-3 flex flex-col items-center gap-1"
      >
        <span className="text-xs font-bold uppercase tracking-widest text-white/60">Has alcanzado</span>
        <span className="text-2xl font-extrabold text-[#F7D87C] drop-shadow-[0_1px_3px_rgba(0,0,0,0.3)]">
          ⭐ {finalLevel.name}
        </span>
      </motion.div>

      <motion.h1
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="text-2xl font-bold text-white mb-3 leading-tight max-w-xs"
      >
        Has sido el alma del santuario hoy.
      </motion.h1>

      <motion.p
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.55 }}
        className="text-white/80 mb-4 max-w-sm text-sm"
      >
        En La Vega Cats hay personas que hacen esto todos los días, de verdad. Los gatos te están esperando.
      </motion.p>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.65 }}
        className="bg-white/20 rounded-2xl px-6 py-3 mb-8"
      >
        <span className="text-white font-bold text-xl">💚 {hearts} corazones ganados</span>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.75 }}
        className="flex flex-col gap-3 w-full max-w-sm items-center"
      >
        {/* CTA 1 — Voluntario */}
        <button
          onClick={() => openVolunteerEmail('turn_end')}
          className="w-full bg-[#E07856] text-white font-bold py-4 rounded-2xl text-lg shadow-lg active:scale-95 transition-transform"
        >
          Quiero ser voluntario/a
        </button>

        {/* CTA 2 — Web */}
        <a
          href="https://lavegacats.com"
          target="_blank"
          rel="noopener noreferrer"
          className="w-full bg-white text-[#3D2E1F] font-bold py-4 rounded-2xl text-lg text-center shadow active:scale-95 transition-transform"
        >
          Visitar lavegacats.com
        </a>

        {/* CTA 3 — Compartir (futuro) */}
        <button
          disabled
          className="w-full border-2 border-white/40 text-white/50 font-semibold py-3.5 rounded-2xl text-base cursor-default"
        >
          Compartir mi turno <span className="text-xs font-normal opacity-60">(pronto)</span>
        </button>

        <div className="w-full h-px bg-white/20 my-1" />

        {/* CTA 4 — Jugar otro turno */}
        <motion.button
          onClick={handlePlayAgain}
          className="w-full flex items-center gap-3 rounded-[18px] bg-[#F5EBD8] border-2 border-[#7BA577] px-5 py-4 shadow-[0_2px_8px_rgba(0,0,0,0.08)] text-left cursor-pointer hover:shadow-[0_4px_14px_rgba(0,0,0,0.13)] hover:border-[#5a8f57] active:scale-[0.98] transition-all duration-150"
          animate={prefersReduced ? {} : { scale: [1, 1.015, 1] }}
          transition={prefersReduced ? {} : { duration: 3, repeat: Infinity, ease: 'easeInOut', repeatDelay: 1 }}
          whileTap={{ scale: 0.97 }}
        >
          <PawPrintIcon className="w-7 h-7 text-[#7BA577] flex-shrink-0" />
          <div className="flex flex-col items-start leading-tight">
            <span className="text-[17px] sm:text-[19px] font-semibold text-[#3D2E1F]">¿Repetimos turno?</span>
            <span className="text-[13px] text-[#3D2E1F]/55 italic mt-0.5">Nuevo día en el santuario</span>
          </div>
        </motion.button>
      </motion.div>
    </div>
  )
}
