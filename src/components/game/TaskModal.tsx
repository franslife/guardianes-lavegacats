import { useEffect, useRef, useState } from 'react'
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion'
import narrations from '../../data/taskNarrations.json'

export interface TaskImages {
  before: string
  during: string
  after: string
}

type Phase    = 'before' | 'during' | 'after' | 'reward' | 'closing'
type TextPhase = 'before' | 'during' | 'after'
type NarrationKey = keyof typeof narrations

interface Props {
  images:       TaskImages
  title:        string
  reward:       number
  longTask?:    boolean
  narrationKey?: string
  onComplete:   () => void
  onClose:      () => void
}

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
  const prefersReduced = useReducedMotion()

  // ── State ──────────────────────────────────────────────────
  const [imagesReady, setImagesReady] = useState(false)
  const [phase,       setPhase]       = useState<Phase>('before')
  const [textPhase,   setTextPhase]   = useState<TextPhase>('before')
  const [flashing,    setFlashing]    = useState(false)

  // Skip the flash on first render (phase = 'before', no change yet)
  const skipFirstFlash = useRef(true)

  const validKey    = narrationKey && narrationKey in narrations ? (narrationKey as NarrationKey) : null
  const [variantIdx] = useState(() => validKey ? pickRandomIndices(validKey) : { before: 0, during: 0, after: 0 })

  // ── Image preload ──────────────────────────────────────────
  useEffect(() => {
    let loaded = 0
    const srcs = [images.before, images.during, images.after]
    // Fallback: show modal after 800ms even if images haven't loaded
    const fallback = setTimeout(() => setImagesReady(true), 800)

    srcs.forEach((src) => {
      const img = new window.Image()
      img.onload = img.onerror = () => {
        loaded++
        if (loaded >= srcs.length) { clearTimeout(fallback); setImagesReady(true) }
      }
      img.src = src
    })
    return () => clearTimeout(fallback)
  }, [])

  // ── Golden flash on each phase change (not on mount) ──────
  useEffect(() => {
    if (skipFirstFlash.current) { skipFirstFlash.current = false; return }
    if (prefersReduced || phase === 'reward' || phase === 'closing') return
    setFlashing(true)
    const t = setTimeout(() => setFlashing(false), 600)
    return () => clearTimeout(t)
  }, [phase])

  // ── Timers — start only after images are ready ─────────────
  const dissolveMs = prefersReduced ? 200 : 900
  const beforeMs   = prefersReduced ? 800  : 2000
  const duringMs   = longTask ? (prefersReduced ? 1500 : 4000) : (prefersReduced ? 1000 : 3000)
  const afterMs    = prefersReduced ? 800  : 2000
  const rewardMs   = prefersReduced ? 800  : 2000
  const textLag    = prefersReduced ? 0    : 200

  useEffect(() => {
    if (!imagesReady) return
    const T: ReturnType<typeof setTimeout>[] = []

    // before → during
    T.push(setTimeout(() => setPhase('during'),    beforeMs))
    T.push(setTimeout(() => setTextPhase('during'), beforeMs + textLag))

    // during → after
    const t2 = beforeMs + duringMs
    T.push(setTimeout(() => setPhase('after'),    t2))
    T.push(setTimeout(() => setTextPhase('after'), t2 + textLag))

    // after → reward
    T.push(setTimeout(() => setPhase('reward'), t2 + afterMs))

    // reward → close
    T.push(setTimeout(() => { setPhase('closing'); onComplete() }, t2 + afterMs + rewardMs))

    return () => T.forEach(clearTimeout)
  }, [imagesReady])

  // ── Derived ────────────────────────────────────────────────
  const narrationText = validKey ? narrations[validKey][textPhase][variantIdx[textPhase]] : null

  const imgOpacity = (img: 'before' | 'during' | 'after') => {
    if (!imagesReady) return 0
    if (img === 'before') return phase === 'before' ? 1 : 0
    if (img === 'during') return phase === 'during' ? 1 : 0
    // 'after': visible from after → reward → closing
    return ['after', 'reward', 'closing'].includes(phase) ? 1 : 0
  }

  return (
    <motion.div
      className="fixed inset-0 z-[45] flex items-center justify-center p-4 md:p-10"
      initial={{ opacity: 0 }}
      animate={{ opacity: phase === 'closing' ? 0 : 1 }}
      transition={{ duration: 0.6 }}
    >
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/55 backdrop-blur-[3px]" />

      {/* Modal card */}
      <motion.div
        className="relative z-10 w-full max-w-sm md:max-w-md flex flex-col items-center rounded-3xl bg-[#FAF5EC] shadow-2xl overflow-hidden"
        style={{ maxHeight: '90dvh' }}
        initial={{ scale: 0.88, opacity: 0, y: 20 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        transition={{ type: 'spring', damping: 22, stiffness: 280, delay: 0.05 }}
      >
        {/* Close */}
        <button
          onClick={() => { setPhase('closing'); onClose() }}
          className="absolute top-3 right-3 z-20 w-8 h-8 flex items-center justify-center rounded-full bg-[#3D2E1F]/10 text-[#3D2E1F]/40 text-xl font-bold hover:bg-[#3D2E1F]/20 transition-colors"
        >×</button>

        {/* Title */}
        <div className="w-full px-8 pt-6 pb-3 text-center">
          <p className="text-lg font-extrabold text-[#3D2E1F] leading-tight">{title}</p>
        </div>

        {/* ── Image area: fixed height, all 3 stacked absolutely ── */}
        <div
          className="relative w-full px-4"
          style={{ height: 'min(42vh, 260px)', background: '#FAF5EC', flexShrink: 0 }}
        >
          {/* Loading dots — shown briefly if images take >300ms */}
          <AnimatePresence>
            {!imagesReady && (
              <motion.div
                className="absolute inset-0 flex items-center justify-center gap-2 z-10"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ delay: 0.3, duration: 0.3 }}
              >
                {[0, 1, 2].map((i) => (
                  <motion.div
                    key={i}
                    className="w-2.5 h-2.5 rounded-full bg-[#3D2E1F]/20"
                    animate={{ scale: [1, 1.5, 1], opacity: [0.3, 1, 0.3] }}
                    transition={{ duration: 0.8, repeat: Infinity, delay: i * 0.18, ease: 'easeInOut' }}
                  />
                ))}
              </motion.div>
            )}
          </AnimatePresence>

          {/* BEFORE image */}
          <motion.img
            src={images.before}
            alt={title}
            className="absolute inset-0 w-full h-full object-contain"
            animate={{ opacity: imgOpacity('before') }}
            transition={{ duration: dissolveMs / 1000, ease: 'easeInOut' }}
            draggable={false}
          />

          {/* DURING image — with subtle shimmer loop when active */}
          <motion.img
            src={images.during}
            alt={title}
            className="absolute inset-0 w-full h-full object-contain"
            animate={{
              opacity: imgOpacity('during'),
              scale:   phase === 'during' && !prefersReduced ? [1, 1.02, 1] : 1,
            }}
            transition={{
              opacity: { duration: dissolveMs / 1000, ease: 'easeInOut' },
              scale:   { duration: 1.5, repeat: Infinity, ease: 'easeInOut', delay: 1.0 },
            }}
            draggable={false}
          />

          {/* AFTER image */}
          <motion.img
            src={images.after}
            alt={title}
            className="absolute inset-0 w-full h-full object-contain"
            animate={{ opacity: imgOpacity('after') }}
            transition={{ duration: dissolveMs / 1000, ease: 'easeInOut' }}
            draggable={false}
          />

          {/* Golden radial pulse during cross-dissolve */}
          <AnimatePresence>
            {flashing && (
              <motion.div
                key="flash"
                className="absolute inset-0 pointer-events-none z-10"
                style={{
                  background: 'radial-gradient(circle at 50% 50%, rgba(247,216,124,0.30) 0%, transparent 70%)',
                }}
                initial={{ opacity: 0 }}
                animate={{ opacity: [0, 1, 0] }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.6, ease: 'easeInOut', times: [0, 0.4, 1] }}
              />
            )}
          </AnimatePresence>

          {/* Reward overlay */}
          <AnimatePresence>
            {phase === 'reward' && (
              <motion.div
                className="absolute inset-0 flex flex-col items-center justify-end pb-3 pointer-events-none z-20"
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
                    >💚</motion.span>
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

        {/* ── Narration text — appears in sync with image ── */}
        {narrationText !== null && (
          <motion.div
            className="w-full flex items-center justify-center px-3 sm:px-4 md:px-6 lg:px-8 pt-4 pb-5"
            style={{ minHeight: 'clamp(60px, 15vw, 80px)' }}
            animate={{ opacity: imagesReady ? 1 : 0 }}
            transition={{ duration: 0.4, ease: 'easeOut' }}
          >
            <AnimatePresence mode="wait">
              <motion.p
                key={textPhase}
                className="text-center italic text-[#3D2E1F]/80 font-medium leading-[1.45]"
                style={{ fontSize: 'clamp(15px, 4.2vw, 22px)', maxWidth: 'min(95%, 560px)' }}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.3, ease: 'easeInOut' }}
              >
                {narrationText}
              </motion.p>
            </AnimatePresence>
          </motion.div>
        )}
      </motion.div>
    </motion.div>
  )
}
