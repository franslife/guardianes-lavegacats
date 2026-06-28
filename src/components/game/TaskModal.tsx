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
  longTask?: boolean
  onComplete: () => void
  onClose: () => void
}

export default function TaskModal({ images, title, reward, longTask = false, onComplete, onClose }: Props) {
  const [phase, setPhase] = useState<Phase>('before')

  // Preload all 3 images immediately on mount to avoid flicker
  useEffect(() => {
    [images.before, images.during, images.after].forEach((src) => {
      const img = new window.Image()
      img.src = src
    })
  }, [])

  // Timings (ms). Crossfade is 600ms handled by Framer Motion.
  // before visible → switch to during → during visible → switch to after → after visible → reward → close
  const duringMs = longTask ? 3000 : 2500
  const t1 = 1200                        // → during
  const t2 = t1 + duringMs              // → after
  const t3 = t2 + 1200                  // → reward
  const t4 = t3 + 1600                  // → complete

  useEffect(() => {
    const timers = [
      setTimeout(() => setPhase('during'),  t1),
      setTimeout(() => setPhase('after'),   t2),
      setTimeout(() => setPhase('reward'),  t3),
      setTimeout(() => { setPhase('closing'); onComplete() }, t4),
    ]
    return () => timers.forEach(clearTimeout)
  }, [])

  const imgSrc =
    phase === 'before' ? images.before :
    phase === 'during' ? images.during :
    images.after

  return (
    <motion.div
      className="fixed inset-0 z-[45] flex items-center justify-center p-4 md:p-10"
      animate={{ opacity: phase === 'closing' ? 0 : 1 }}
      initial={{ opacity: 0 }}
      transition={{ duration: 0.4 }}
    >
      {/* Blurred backdrop */}
      <div className="absolute inset-0 bg-black/55 backdrop-blur-[3px]" />

      {/* Modal card */}
      <motion.div
        className="relative z-10 w-full max-w-sm md:max-w-md flex flex-col items-center rounded-3xl bg-[#FAF5EC] shadow-2xl overflow-hidden"
        style={{ maxHeight: '90dvh' }}
        initial={{ scale: 0.88, opacity: 0, y: 20 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        transition={{ type: 'spring', damping: 22, stiffness: 280, delay: 0.05 }}
      >
        {/* Close button */}
        <button
          onClick={() => { setPhase('closing'); onClose() }}
          className="absolute top-3 right-3 z-20 w-8 h-8 flex items-center justify-center rounded-full bg-[#3D2E1F]/10 text-[#3D2E1F]/40 text-xl font-bold hover:bg-[#3D2E1F]/20 transition-colors"
        >
          ×
        </button>

        {/* Title */}
        <div className="w-full px-8 pt-6 pb-3 text-center">
          <p className="text-lg font-extrabold text-[#3D2E1F] leading-tight">{title}</p>
        </div>

        {/* Image area — solid cream background so transparency composes cleanly */}
        <div
          className="relative w-full flex items-center justify-center px-6 pb-6"
          style={{ minHeight: 220, background: '#FAF5EC' }}
        >
          <AnimatePresence mode="sync">
            <motion.img
              key={imgSrc}
              src={imgSrc}
              alt={title}
              className="max-h-[50dvh] w-full object-contain"
              style={{ background: 'transparent' }}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.6, ease: 'easeInOut' }}
              draggable={false}
            />
          </AnimatePresence>

          {/* Reward overlay — hearts float up from image area */}
          <AnimatePresence>
            {phase === 'reward' && (
              <motion.div
                className="absolute inset-0 flex flex-col items-center justify-end pb-4 pointer-events-none"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.35 }}
              >
                {/* Floating hearts */}
                <div className="relative flex gap-3 text-2xl mb-2">
                  {[0, 1, 2, 3, 4].map((i) => (
                    <motion.span
                      key={i}
                      style={{ display: 'inline-block' }}
                      initial={{ opacity: 0, y: 0, rotate: (i - 2) * 8 }}
                      animate={{ opacity: [0, 1, 1, 0], y: -70 - i * 6 }}
                      transition={{
                        duration: 1.3,
                        delay: i * 0.1,
                        ease: 'easeOut',
                      }}
                    >
                      💚
                    </motion.span>
                  ))}
                </div>

                {/* Reward text */}
                <motion.div
                  className="rounded-2xl bg-[#3D2E1F]/80 px-5 py-2 text-center"
                  initial={{ opacity: 0, scale: 0.85 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.3, duration: 0.35 }}
                >
                  <p className="text-base font-extrabold text-[#F7D87C]">+{reward} corazones</p>
                  <p className="text-xs text-white/70 font-semibold">¡Bien hecho!</p>
                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </motion.div>
    </motion.div>
  )
}
