import { useEffect, useState } from 'react'
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion'
import narrations from '../../data/taskNarrations.json'

export interface TaskImages {
  before: string
  during: string
  after: string
}

type Phase = 'before' | 'during' | 'after' | 'reward' | 'closing'
type TextPhase = 'before' | 'during' | 'after'

type NarrationKey = keyof typeof narrations

interface Props {
  images: TaskImages
  title: string
  reward: number
  longTask?: boolean
  narrationKey?: string
  onComplete: () => void
  onClose: () => void
}

const SPARKLE_OFFSETS = [
  { x: '20%', delay: 0 },
  { x: '50%', delay: 0.14 },
  { x: '75%', delay: 0.07 },
  { x: '38%', delay: 0.22 },
]

function pickRandomIndices(key: NarrationKey) {
  const n = narrations[key]
  return {
    before: Math.floor(Math.random() * n.before.length),
    during: Math.floor(Math.random() * n.during.length),
    after:  Math.floor(Math.random() * n.after.length),
  }
}

export default function TaskModal({
  images, title, reward, longTask = false,
  narrationKey, onComplete, onClose,
}: Props) {
  const [phase, setPhase]         = useState<Phase>('before')
  const [textPhase, setTextPhase] = useState<TextPhase>('before')
  const [sweeping, setSweeping]   = useState(false)
  const prefersReduced            = useReducedMotion()

  // Pick one random variant per state on mount (stable for this hotspot activation)
  const validKey = narrationKey && narrationKey in narrations ? (narrationKey as NarrationKey) : null
  const [variantIdx] = useState(() =>
    validKey ? pickRandomIndices(validKey) : { before: 0, during: 0, after: 0 }
  )

  // Preload all 3 task images immediately
  useEffect(() => {
    [images.before, images.during, images.after].forEach((src) => {
      const img = new window.Image()
      img.src = src
    })
  }, [])

  // Timing config (ms)
  const beforeMs = prefersReduced ? 800  : 2000
  const duringMs = longTask ? (prefersReduced ? 1500 : 4000) : (prefersReduced ? 1000 : 3000)
  const afterMs  = prefersReduced ? 800  : 2000
  const rewardMs = prefersReduced ? 800  : 2000
  const sweepMs  = prefersReduced ? 0    : 800
  // text lags 200ms behind image (0ms if reduced motion)
  const textLag  = prefersReduced ? 0    : 200

  useEffect(() => {
    const timers: ReturnType<typeof setTimeout>[] = []

    // before → during
    timers.push(setTimeout(() => { setPhase('during'); if (!prefersReduced) setSweeping(true) }, beforeMs))
    if (!prefersReduced) timers.push(setTimeout(() => setSweeping(false), beforeMs + sweepMs))
    timers.push(setTimeout(() => setTextPhase('during'), beforeMs + textLag))

    // during → after
    const t2 = beforeMs + duringMs
    timers.push(setTimeout(() => { setPhase('after'); if (!prefersReduced) setSweeping(true) }, t2))
    if (!prefersReduced) timers.push(setTimeout(() => setSweeping(false), t2 + sweepMs))
    timers.push(setTimeout(() => setTextPhase('after'), t2 + textLag))

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

  const narrationText = validKey
    ? narrations[validKey][textPhase][variantIdx[textPhase]]
    : null

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
        {/* ── Golden sweep overlay ── */}
        <AnimatePresence>
          {sweeping && (
            <>
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

        {/* Image area */}
        <div
          className="relative w-full flex items-center justify-center px-4"
          style={{ background: '#FAF5EC' }}
        >
          <AnimatePresence mode="sync">
            <motion.img
              key={imgSrc}
              src={imgSrc}
              alt={title}
              className="w-full object-contain"
              style={{
                background: 'transparent',
                maxHeight: 'min(42vh, 260px)',
              }}
              initial={{ opacity: 0 }}
              animate={
                phase === 'during' && !prefersReduced
                  ? { opacity: 1, scale: [1, 1.02, 1, 1.02, 1] }
                  : { opacity: 1, scale: 1 }
              }
              exit={{ opacity: 0, transition: { duration: 0.9, ease: 'easeInOut' } }}
              transition={
                phase === 'during' && !prefersReduced
                  ? {
                      opacity: { duration: 1.1, ease: 'easeInOut' },
                      scale: { duration: 1.6, repeat: Infinity, ease: 'easeInOut', delay: 1.2 },
                    }
                  : { duration: 1.1, ease: 'easeInOut' }
              }
              draggable={false}
            />
          </AnimatePresence>

          {/* Reward overlay — hearts float up inside image area */}
          <AnimatePresence>
            {phase === 'reward' && (
              <motion.div
                className="absolute inset-0 flex flex-col items-center justify-end pb-3 pointer-events-none"
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

        {/* Narration text block — always reserve space to avoid modal jump */}
        {narrationText !== null && (
          <div
            className="w-full flex items-center justify-center px-3 sm:px-4 md:px-6 lg:px-8 pt-4 pb-5"
            style={{ minHeight: 'clamp(65px, 15vw, 80px)' }}
          >
            <AnimatePresence mode="wait">
              <motion.p
                key={textPhase}
                className="text-center italic text-[#3D2E1F]/80 font-medium leading-[1.45]"
                style={{
                  fontSize: 'clamp(15px, 4.2vw, 22px)',
                  maxWidth: 'min(95%, 560px)',
                }}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.3, ease: 'easeInOut' }}
              >
                {narrationText}
              </motion.p>
            </AnimatePresence>
          </div>
        )}
      </motion.div>
    </motion.div>
  )
}
