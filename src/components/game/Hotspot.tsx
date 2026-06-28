import { motion, AnimatePresence } from 'framer-motion'

export type HotspotState = 'pending' | 'in_progress' | 'done'

export interface TaskImages {
  before: string   // pending
  during: string   // in_progress
  after: string    // done
}

interface Props {
  x: number
  y: number
  label: string
  state: HotspotState
  taskImages: TaskImages
  onClick: () => void
}

export default function Hotspot({ x, y, label, state, taskImages, onClick }: Props) {
  const clickable = state === 'pending'

  const imageSrc =
    state === 'pending' ? taskImages.before :
    state === 'in_progress' ? taskImages.during :
    taskImages.after

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
      <div className="relative flex flex-col items-center">
        {/* Image container — fixed size, crossfade between states */}
        <div
          className={`relative w-16 h-16 rounded-2xl overflow-hidden shadow-lg ${
            clickable ? 'cursor-pointer' : ''
          }`}
          onClick={clickable ? onClick : undefined}
        >
          <AnimatePresence mode="sync">
            <motion.img
              key={imageSrc}
              src={imageSrc}
              alt={label}
              className="absolute inset-0 w-full h-full object-cover"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.4 }}
              draggable={false}
            />
          </AnimatePresence>

          {/* Pending: pulsing golden glow overlay */}
          {state === 'pending' && (
            <>
              <motion.div
                className="absolute inset-0 rounded-2xl ring-4 ring-[#F7D87C]"
                animate={{ opacity: [0.8, 0.2, 0.8] }}
                transition={{ duration: 1.8, repeat: Infinity, ease: 'easeInOut' }}
              />
              {/* Outer pulse ring */}
              <motion.div
                className="absolute -inset-2 rounded-3xl bg-[#F7D87C]/25"
                animate={{ scale: [1, 1.15, 1], opacity: [0.5, 0, 0.5] }}
                transition={{ duration: 1.8, repeat: Infinity, ease: 'easeInOut' }}
              />
            </>
          )}

          {/* In progress: subtle shimmer overlay */}
          {state === 'in_progress' && (
            <motion.div
              className="absolute inset-0 bg-white/15"
              animate={{ opacity: [0.1, 0.3, 0.1] }}
              transition={{ duration: 0.9, repeat: Infinity, ease: 'easeInOut' }}
            />
          )}

          {/* Done: soft green overlay */}
          {state === 'done' && (
            <div className="absolute inset-0 bg-[#7BA577]/20 flex items-end justify-end p-1">
              <div className="w-5 h-5 rounded-full bg-[#7BA577] flex items-center justify-center">
                <span className="text-white text-[10px] font-bold">✓</span>
              </div>
            </div>
          )}
        </div>

        {/* Label */}
        <div
          className={`mt-1.5 whitespace-nowrap text-[10px] font-bold px-2 py-0.5 rounded-full shadow ${
            state === 'done'
              ? 'bg-[#7BA577]/80 text-white'
              : state === 'in_progress'
                ? 'bg-[#E07856] text-white'
                : 'bg-[#3D2E1F]/80 text-white'
          }`}
        >
          {label}
        </div>
      </div>
    </div>
  )
}
