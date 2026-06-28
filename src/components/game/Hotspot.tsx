import { motion } from 'framer-motion'

export type HotspotState = 'pending' | 'in_progress' | 'done'

interface Props {
  x: number
  y: number
  state: HotspotState
  onClick: () => void
}

export default function Hotspot({ x, y, state, onClick }: Props) {
  return (
    <div
      className="absolute z-10"
      style={{
        left: `${x * 100}%`,
        top: `${y * 100}%`,
        transform: 'translate(-50%, -50%)',
        pointerEvents: state === 'pending' ? 'auto' : 'none',
      }}
    >
      {state === 'pending' && (
        <motion.button
          onClick={onClick}
          className="relative flex h-10 w-10 items-center justify-center rounded-full focus:outline-none"
          whileTap={{ scale: 0.85 }}
        >
          {/* outer pulse ring */}
          <motion.div
            className="absolute inset-0 rounded-full bg-[#F7D87C]/35"
            animate={{ scale: [1, 1.6, 1], opacity: [0.6, 0, 0.6] }}
            transition={{ duration: 1.9, repeat: Infinity, ease: 'easeInOut' }}
          />
          {/* core glow */}
          <motion.div
            className="h-7 w-7 rounded-full bg-[#F7D87C] shadow-[0_0_10px_3px_rgba(247,216,124,0.7)] ring-2 ring-white/80"
            animate={{ scale: [1, 1.1, 1] }}
            transition={{ duration: 1.9, repeat: Infinity, ease: 'easeInOut' }}
          />
        </motion.button>
      )}

      {/* in_progress: invisible — character is there, modal is open */}
      {state === 'in_progress' && <div className="h-10 w-10" />}

      {state === 'done' && (
        <div className="flex h-10 w-10 items-center justify-center">
          <motion.div
            className="h-9 w-9 rounded-full bg-[#7BA577] border-[3px] border-white shadow-lg flex items-center justify-center"
            initial={{ scale: 0 }}
            animate={{ scale: [0, 1.25, 0.92, 1.05, 1] }}
            transition={{ duration: 0.5, times: [0, 0.45, 0.65, 0.82, 1], ease: 'easeOut' }}
          >
            <span className="text-white text-sm font-extrabold leading-none select-none">✓</span>
          </motion.div>
        </div>
      )}
    </div>
  )
}
