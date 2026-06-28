import { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useNotifStore } from '../../store/notifStore'
import catsData from '../../data/cats.json'

const MEDAL_META: Record<string, { emoji: string; name: string }> = {
  primer_cuidado: { emoji: '⭐', name: 'Primer Cuidado' },
  cuidador_atento: { emoji: '🌟', name: 'Cuidador Atento' },
  turno_completo: { emoji: '🏅', name: 'Turno Completo' },
  guardian: { emoji: '🐱', name: 'Guardián' },
}

export default function NotifToast() {
  const { queue, shift } = useNotifStore()
  const [visible, setVisible] = useState(false)

  const current = queue[0]

  useEffect(() => {
    if (!current) { setVisible(false); return }
    setVisible(true)
    const t = setTimeout(() => {
      setVisible(false)
      setTimeout(shift, 400)
    }, 3500)
    return () => clearTimeout(t)
  }, [current?.type === 'medal' ? current.id : current?.type === 'bio' ? current.catId : null])

  const cat = current?.type === 'bio'
    ? catsData.find((c) => c.id === current.catId)
    : null
  const medal = current?.type === 'medal'
    ? MEDAL_META[current.id]
    : null

  return (
    <AnimatePresence>
      {visible && current && (
        <motion.button
          key={current.type === 'medal' ? current.id : current.type === 'bio' ? current.catId : ''}
          className="fixed top-16 left-1/2 z-[60] -translate-x-1/2 flex items-center gap-3 rounded-2xl px-5 py-3 shadow-2xl cursor-pointer"
          style={{ background: current.type === 'medal' ? '#3D2E1F' : '#7BA577' }}
          initial={{ y: -60, opacity: 0, scale: 0.85 }}
          animate={{ y: 0, opacity: 1, scale: 1 }}
          exit={{ y: -60, opacity: 0, scale: 0.85 }}
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
        </motion.button>
      )}
    </AnimatePresence>
  )
}
