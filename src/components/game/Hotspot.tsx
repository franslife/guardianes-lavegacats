import { motion } from 'framer-motion'

export type HotspotState = 'pending' | 'in_progress' | 'done'

interface Props {
  x: number
  y: number
  label: string
  state: HotspotState
  onClick: () => void
}

export default function Hotspot({ x, y, label, state, onClick }: Props) {
  const clickable = state === 'pending'

  return (
    <div
      className="absolute z-10"
      style={{
        left: `${x * 100}%`,
        top: `${y * 100}%`,
        transform: 'translate(-50%, -50%)',
        pointerEvents: clickable ? 'auto' : 'none',
      }}
    >
      {state === 'pending' && (
        <motion.button
          onClick={onClick}
          className="relative flex h-12 w-12 items-center justify-center rounded-full focus:outline-none"
          whileTap={{ scale: 0.88 }}
          title={label}
        >
          {/* Outer glow ring */}
          <motion.div
            className="absolute inset-0 rounded-full bg-[#F7D87C]/40"
            animate={{ scale: [1, 1.5, 1], opacity: [0.7, 0, 0.7] }}
            transition={{ duration: 1.8, repeat: Infinity, ease: 'easeInOut' }}
          />
          {/* Core */}
          <motion.div
            className="h-9 w-9 rounded-full bg-[#F7D87C] shadow-[0_0_12px_4px_rgba(247,216,124,0.6)] border-2 border-white flex items-center justify-center text-lg"
            animate={{ scale: [1, 1.08, 1] }}
            transition={{ duration: 1.8, repeat: Infinity, ease: 'easeInOut' }}
          >
            ✨
          </motion.div>
        </motion.button>
      )}

      {state === 'in_progress' && (
        <div className="relative flex h-12 w-12 items-center justify-center">
          <motion.div
            className="h-10 w-10 rounded-full bg-[#E07856] border-2 border-white shadow-lg flex items-center justify-center text-lg"
            animate={{ rotate: 360 }}
            transition={{ duration: 1.2, repeat: Infinity, ease: 'linear' }}
          >
            ⚙️
          </motion.div>
        </div>
      )}

      {state === 'done' && (
        <div className="flex h-12 w-12 items-center justify-center">
          <div className="h-9 w-9 rounded-full bg-[#7BA577]/60 border-2 border-white/60 flex items-center justify-center text-lg opacity-70">
            ✓
          </div>
        </div>
      )}

      {/* Label shown below */}
      <div
        className={`absolute left-1/2 top-full mt-1 -translate-x-1/2 whitespace-nowrap text-[10px] font-bold px-2 py-0.5 rounded-full shadow ${
          state === 'done'
            ? 'bg-[#7BA577]/70 text-white/80'
            : state === 'in_progress'
              ? 'bg-[#E07856] text-white'
              : 'bg-[#3D2E1F]/80 text-white'
        }`}
      >
        {label}
      </div>
    </div>
  )
}
