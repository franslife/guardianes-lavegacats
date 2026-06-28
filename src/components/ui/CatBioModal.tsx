import { motion, AnimatePresence } from 'framer-motion'

interface Cat {
  id: string
  name: string
  personality: string
  zone: string
  isReal: boolean
  portrait: string
  bio: string
}

interface Props {
  cat: Cat
  onClose: () => void
}

export default function CatBioModal({ cat, onClose }: Props) {
  return (
    <AnimatePresence>
      <motion.div
        className="fixed inset-0 z-[80] flex items-end justify-center bg-black/60"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
      >
        <motion.div
          className="w-full max-w-lg rounded-t-3xl bg-[#F5EBD8] overflow-hidden"
          initial={{ y: '100%' }}
          animate={{ y: 0 }}
          exit={{ y: '100%' }}
          transition={{ type: 'spring', damping: 26, stiffness: 300 }}
          onClick={(e) => e.stopPropagation()}
        >
          {/* Portrait header */}
          <div className="relative h-52 bg-[#3D2E1F] overflow-hidden">
            <img
              src={cat.portrait}
              alt={cat.name}
              className="w-full h-full object-cover opacity-90"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-[#3D2E1F] via-transparent to-transparent" />
            <button
              onClick={onClose}
              className="absolute top-4 right-4 w-9 h-9 flex items-center justify-center rounded-full bg-black/40 text-white text-xl"
            >
              ×
            </button>
          </div>

          <div className="p-6 pb-10">
            <div className="flex items-start gap-3 mb-3">
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="text-2xl font-extrabold text-[#3D2E1F]">{cat.name}</h2>
                  {cat.isReal && <span title="Gato real del santuario">❤️</span>}
                </div>
                <p className="text-sm text-[#E07856] font-semibold italic">{cat.personality}</p>
              </div>
            </div>
            <p className="text-[#3D2E1F]/80 text-sm leading-relaxed">{cat.bio}</p>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  )
}
