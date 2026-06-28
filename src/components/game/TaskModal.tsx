import { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

export interface TaskImages {
  before: string
  during: string
  after: string
}

type Phase = 'before' | 'during' | 'after' | 'reward' | 'closing'

interface Props {
  images: TaskImages
  title: string
  reward: number
  longTask?: boolean   // enfermeria: timings más largos
  onComplete: () => void
  onClose: () => void
}

const DURATIONS = {
  normal:    { before: 1000, during: 2500, after: 1000, reward: 1600 },
  longTask:  { before: 1000, during: 3500, after: 1000, reward: 1600 },
}

const IMAGE_SRC: Record<Phase, keyof TaskImages | null> = {
  before: 'before',
  during: 'during',
  after:  'after',
  reward: 'after',
  closing: null,
}

export default function TaskModal({ images, title, reward, longTask = false, onComplete, onClose }: Props) {
  const [phase, setPhase] = useState<Phase>('before')
  const timing = longTask ? DURATIONS.longTask : DURATIONS.normal

  useEffect(() => {
    const t1 = setTimeout(() => setPhase('during'),  timing.before)
    const t2 = setTimeout(() => setPhase('after'),   timing.before + timing.during)
    const t3 = setTimeout(() => setPhase('reward'),  timing.before + timing.during + timing.after)
    const t4 = setTimeout(() => {
      setPhase('closing')
      onComplete()
    }, timing.before + timing.during + timing.after + timing.reward)

    return () => { clearTimeout(t1); clearTimeout(t2); clearTimeout(t3); clearTimeout(t4) }
  }, [])

  const imgKey = IMAGE_SRC[phase]
  const imgSrc = imgKey ? images[imgKey] : images.after

  return (
    <motion.div
      className="fixed inset-0 z-[45] flex items-center justify-center p-4 md:p-10"
      initial={{ opacity: 0 }}
      animate={{ opacity: phase === 'closing' ? 0 : 1 }}
      transition={{ duration: 0.35 }}
    >
      {/* Backdrop with blur */}
      <div className="absolute inset-0 bg-black/55 backdrop-blur-[3px]" />

      {/* Modal card */}
      <motion.div
        className="relative z-10 w-full max-w-sm md:max-w-md flex flex-col items-center rounded-3xl bg-[#FAF5EC] shadow-2xl overflow-hidden"
        style={{ maxHeight: '90dvh' }}
        initial={{ scale: 0.88, opacity: 0, y: 24 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        transition={{ type: 'spring', damping: 22, stiffness: 280, delay: 0.05 }}
      >
        {/* Close button */}
        <button
          onClick={() => { setPhase('closing'); onClose() }}
          className="absolute top-3 right-3 z-20 w-8 h-8 flex items-center justify-center rounded-full bg-[#3D2E1F]/10 text-[#3D2E1F]/50 text-lg font-bold hover:bg-[#3D2E1F]/20 transition-colors"
        >
          ×
        </button>

        {/* Title */}
        <div className="w-full px-6 pt-6 pb-3">
          <p className="text-center text-lg font-extrabold text-[#3D2E1F] leading-tight">{title}</p>
        </div>

        {/* Task image — crossfade between phases */}
        <div className="relative w-full flex-1 flex items-center justify-center px-6 pb-4" style={{ minHeight: 220 }}>
          <AnimatePresence mode="sync">
            <motion.img
              key={imgSrc}
              src={imgSrc}
              alt={title}
              className="max-h-[52dvh] w-full object-contain"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.45 }}
              draggable={false}
            />
          </AnimatePresence>
        </div>

        {/* Reward footer — shown during 'reward' phase */}
        <AnimatePresence>
          {phase === 'reward' && (
            <motion.div
              className="w-full pb-7 flex flex-col items-center gap-1"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.35 }}
            >
              {/* Floating hearts */}
              <div className="flex gap-2 text-xl mb-1">
                {['💚', '💚', '💚'].map((h, i) => (
                  <motion.span
                    key={i}
                    initial={{ opacity: 0, y: 0 }}
                    animate={{ opacity: [0, 1, 0], y: -28 }}
                    transition={{ duration: 1.1, delay: i * 0.12, ease: 'easeOut' }}
                  >
                    {h}
                  </motion.span>
                ))}
              </div>
              <p className="text-base font-extrabold text-[#7BA577]">+{reward} corazones</p>
              <p className="text-xs text-[#3D2E1F]/50 font-semibold">¡Bien hecho!</p>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Progress dots */}
        <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex gap-1.5">
          {(['before', 'during', 'after'] as Phase[]).map((p) => (
            <div
              key={p}
              className={`h-1.5 rounded-full transition-all duration-300 ${
                phase === p ? 'w-4 bg-[#E07856]' : 'w-1.5 bg-[#3D2E1F]/20'
              }`}
            />
          ))}
        </div>
      </motion.div>
    </motion.div>
  )
}
