import { motion, AnimatePresence } from 'framer-motion'
import { useEffect, useState } from 'react'

interface Props {
  amount: number
  trigger: boolean
  onDone?: () => void
}

export default function FloatingHearts({ amount, trigger, onDone }: Props) {
  const [particles, setParticles] = useState<number[]>([])

  useEffect(() => {
    if (!trigger) return
    const ids = Array.from({ length: 6 }, (_, i) => Date.now() + i)
    setParticles(ids)
    const t = setTimeout(() => {
      setParticles([])
      onDone?.()
    }, 1400)
    return () => clearTimeout(t)
  }, [trigger])

  return (
    <AnimatePresence>
      {particles.map((id, i) => (
        <motion.div
          key={id}
          className="pointer-events-none fixed z-50 text-xl select-none"
          style={{
            left: `${42 + i * 4}%`,
            top: '55%',
          }}
          initial={{ opacity: 1, y: 0, scale: 1 }}
          animate={{ opacity: 0, y: -100 - i * 12, scale: 1.3 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 1.2, delay: i * 0.08, ease: 'easeOut' }}
        >
          💚
        </motion.div>
      ))}
      {particles.length > 0 && (
        <motion.div
          key="amount"
          className="pointer-events-none fixed z-50 font-extrabold text-[#7BA577] text-2xl select-none"
          style={{ left: '50%', top: '52%', transform: 'translateX(-50%)' }}
          initial={{ opacity: 1, y: 0, scale: 0.8 }}
          animate={{ opacity: 0, y: -60, scale: 1.2 }}
          transition={{ duration: 1.1, ease: 'easeOut' }}
        >
          +{amount}
        </motion.div>
      )}
    </AnimatePresence>
  )
}
