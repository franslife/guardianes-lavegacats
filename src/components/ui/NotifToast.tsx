import { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useNotifStore } from '../../store/notifStore'
import catsData from '../../data/cats.json'

const MEDAL_META: Record<string, { emoji: string; name: string }> = {
  primer_cuidado:  { emoji: '⭐', name: 'Primer Cuidado' },
  cuidador_atento: { emoji: '🌟', name: 'Cuidador Atento' },
  turno_completo:  { emoji: '🏅', name: 'Turno Completo' },
  guardian:        { emoji: '🐱', name: 'Guardián' },
}

// Paw print SVG (inline, no external dependency)
function PawIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className} aria-hidden>
      <ellipse cx="6"    cy="7.5" rx="1.8" ry="2.4" />
      <ellipse cx="10.5" cy="5.5" rx="1.8" ry="2.4" />
      <ellipse cx="15"   cy="5.5" rx="1.8" ry="2.4" />
      <ellipse cx="18.5" cy="7.5" rx="1.8" ry="2.4" />
      <path d="M12 9.5c-3.5 0-6.5 2.5-6.5 5.5 0 2 1.5 3.5 3 4 1 .3 2 .5 3.5.5s2.5-.2 3.5-.5c1.5-.5 3-2 3-4 0-3-3-5.5-6.5-5.5z" />
    </svg>
  )
}

export default function NotifToast() {
  const { queue, shift } = useNotifStore()
  const [visible, setVisible] = useState(false)

  const current = queue[0]

  // Unique key for the current item to reset the timer on each new notif
  const itemKey = !current ? ''
    : current.type === 'medal'   ? current.id
    : current.type === 'bio'     ? current.catId
    : `levelup-${current.level}`

  useEffect(() => {
    if (!current) { setVisible(false); return }
    setVisible(true)
    const t = setTimeout(() => {
      setVisible(false)
      setTimeout(shift, 400)
    }, 3500)
    return () => clearTimeout(t)
  }, [itemKey])

  const cat   = current?.type === 'bio'   ? catsData.find((c) => c.id === current.catId) : null
  const medal = current?.type === 'medal' ? MEDAL_META[current.id] : null

  return (
    <AnimatePresence>
      {visible && current && (
        <motion.button
          key={itemKey}
          className="fixed top-16 left-1/2 z-[60] -translate-x-1/2 flex items-center gap-3 rounded-2xl px-5 py-3 shadow-2xl cursor-pointer"
          style={{
            background:
              current.type === 'medal'   ? '#3D2E1F' :
              current.type === 'bio'     ? '#7BA577' :
              /* levelup */               '#F5EBD8',
          }}
          initial={{ y: -60, opacity: 0, scale: 0.85 }}
          animate={{ y: 0,   opacity: 1, scale: 1 }}
          exit={{    y: -60, opacity: 0, scale: 0.85 }}
          transition={{ type: 'spring', damping: 20, stiffness: 300 }}
          onClick={() => { setVisible(false); setTimeout(shift, 300) }}
        >
          {current.type === 'medal' && medal && (
            <>
              <span className="text-2xl">{medal.emoji}</span>
              <div className="text-left">
                <p className="text-[10px] font-bold uppercase tracking-widest text-white/60">¡Nueva medalla!</p>
                <p className="text-sm font-extrabold text-white">{medal.name}</p>
              </div>
            </>
          )}

          {current.type === 'bio' && cat && (
            <>
              <img src={cat.portrait} alt={cat.name} className="h-10 w-10 rounded-full object-cover ring-2 ring-white" />
              <div className="text-left">
                <p className="text-[10px] font-bold uppercase tracking-widest text-white/80">¡Bio desbloqueada!</p>
                <p className="text-sm font-extrabold text-white">{cat.name} confía en ti</p>
              </div>
            </>
          )}

          {current.type === 'levelup' && (
            <>
              <PawIcon className="w-8 h-8 text-[#7BA577] flex-shrink-0" />
              <div className="text-left">
                <p className="text-[10px] font-bold uppercase tracking-widest text-[#3D2E1F]/50">¡Nuevo nivel!</p>
                <p className="text-sm font-extrabold text-[#3D2E1F]">{current.name}</p>
              </div>
            </>
          )}
        </motion.button>
      )}
    </AnimatePresence>
  )
}
