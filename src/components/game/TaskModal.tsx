import { useEffect, useState } from 'react'
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion'

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

const SPARKLE_OFFSETS = [
  { x: '20%', delay: 0 },
  { x: '50%', delay: 0.14 },
  { x: '75%', delay: 0.07 },
  { x: '38%', delay: 0.22 },
]

export default function TaskModal({ images, title, reward, longTask = false, onComplete, onClose }: Props) {
  const [phase, setPhase] = useState<Phase>('before')
  const [sweeping, setSweeping] = useState(false)
  const prefersReduced = useReducedMotion()

  // Preload all 3 images on mount
  useEffect(() => {
    [images.before, images.during, images.after].forEach((src) => {
      const img = new window.Image()
      img.src = src
    })
  }, [])

  // Timing config (ms)
  const beforeMs  = prefersReduced ? 800  : 2000
  const duringMs  = longTask ? (prefersReduced ? 1500 : 4000) : (prefersReduced ? 1000 : 3000)
  const afterMs   = prefersReduced ? 800  : 2000
  const rewardMs  = prefersReduced ? 800  : 2000
  const sweepMs   = prefersReduced ? 0    : 800

  useEffect(() => {
    const timers: ReturnType<typeof setTimeout>[] = []

    // before → during
    timers.push(setTimeout(() => { setPhase('during'); if (!prefersReduced) setSweeping(true) }, beforeMs))
    if (!prefersReduced) timers.push(setTimeout(() => setSweeping(false), beforeMs + sweepMs))

    // during → after
    const t2 = beforeMs + duringMs
    timers.push(setTimeout(() => { setPhase('after'); if (!prefersReduced) setSweeping(true) }, t2))
    if (!prefersReduced) timers.push(setTimeout(() => setSweeping(false), t2 + sweepMs))

    // after → reward
    timers.push(setTimeout(() => setPhase('reward'), t2 + afterMs))

    // reward → close
    timers.push(setTimeout(() => { setPhase('closing'); onComplete() }, t2 + afterMs + rewardMs))

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
      transition={{ duration: 0.6 }}
    >
      {/* Blurred backdrop */}
      <div className="absolute inset-0 bg-black/55 backdrop-blur-[3px]" />

      {/* Modal card — overflow-hidden clips the sweep overlay */}
      <motion.div
        className="relative z-10 w-full max-w-sm md:max-w-md flex flex-col items-center rounded-3xl bg-[#FAF5EC] shadow-2xl overflow-hidden"
        style={{ maxHeight: '90dvh' }}
        initial={{ scale: 0.88, opacity: 0, y: 20 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        transition={{ type: 'spring', damping: 22, stiffness: 280, delay: 0.05 }}
      >
        {/* ── Golden sweep overlay (z above image, below close btn) ── */}
        <AnimatePresence>
          {sweeping && (
            <>
              {/* Main sweep band */}
              <motion.div
                key="sweep"
                className="absolute inset-0 z-[15] pointer-events-none"
                style={{
                  background: 'linear-gradient(90deg, transparent 0%, rgba(247,216,124,0.55) 50%, transparent 100%)',
                }}
                initial={{ x: '-100%' }}
                animate={{ x: '120%' }}
                transition={{ duration: sweepMs / 1000, ease: 'easeInOut' }}
              />

              {/* Sparkles rising during sweep */}
              {SPARKLE_OFFSETS.map(({ x, delay }, i) => (
                <motion.div
                  key={`spark-${i}`}
                  className="absolute z-[16] w-2 h-2 rounded-full bg-[#F7D87C] pointer-events-none"
                  style={{ left: x, bottom: '30%' }}
                  initial={{ opacity: 0, y: 0, scale: 0.5 }}
                  animate={{ opacity: [0, 1, 0], y: -60, scale: [0.5, 1.2, 0.3] }}
                  transition={{ duration: 0.9, delay, ease: 'easeOut' }}
                />
              ))}
            </>
          )}
        </AnimatePresence>

        {/* Close button — z above sweep */}
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

        {/* Image area — explicit cream bg prevents checkered on transparency */}
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
              animate={
                phase === 'during' && !prefersReduced
                  ? { opacity: 1, scale: [1, 1.02, 1, 1.02, 1] }
                  : { opacity: 1, scale: 1 }
              }
              exit={{ opacity: 0 }}
              transition={
                phase === 'during' && !prefersReduced
                  ? { opacity: { duration: 0.6, ease: 'easeInOut' }, scale: { duration: 1.6, repeat: Infinity, ease: 'easeInOut' } }
                  : { duration: 0.6, ease: 'easeInOut' }
              }
              draggable={false}
            />
          </AnimatePresence>

          {/* Reward overlay — hearts float up */}
          <AnimatePresence>
            {phase === 'reward' && (
              <motion.div
                className="absolute inset-0 flex flex-col items-center justify-end pb-5 pointer-events-none"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.35 }}
              >
                <div className="relative flex gap-2.5 text-2xl mb-3">
                  {[0, 1, 2, 3, 4].map((i) => (
                    <motion.span
                      key={i}
                      style={{ display: 'inline-block' }}
                      initial={{ opacity: 0, y: 0, rotate: (i - 2) * 10 }}
                      animate={{ opacity: [0, 1, 1, 0], y: -80 - i * 8 }}
                      transition={{ duration: 1.4, delay: i * 0.1, ease: 'easeOut' }}
                    >
                      💚
                    </motion.span>
                  ))}
                </div>

                <motion.div
                  className="rounded-2xl bg-[#3D2E1F]/85 px-5 py-2.5 text-center shadow-lg"
                  initial={{ opacity: 0, scale: 0.82 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.25, type: 'spring', damping: 18, stiffness: 280 }}
                >
                  <p className="text-base font-extrabold text-[#F7D87C]">+{reward} corazones</p>
                  <p className="text-xs text-white/70 font-semibold mt-0.5">¡Bien hecho!</p>
                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </motion.div>
    </motion.div>
  )
}
