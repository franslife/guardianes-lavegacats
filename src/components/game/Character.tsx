import { motion } from 'framer-motion'

type Direction = 'front' | 'back' | 'left' | 'right'
type CharacterId = 'volunteer_f' | 'volunteer_m' | 'volunteer_n'

interface Props {
  characterId: CharacterId
  direction?: Direction
  isMoving?: boolean
  size?: number
}

const COLORS: Record<CharacterId, { skin: string; shirt: string; hair: string }> = {
  volunteer_f: { skin: '#F5C5A3', shirt: '#7BA577', hair: '#3D2E1F' },
  volunteer_m: { skin: '#E8B48A', shirt: '#4A7C59', hair: '#1A1008' },
  volunteer_n: { skin: '#C8A882', shirt: '#E07856', hair: '#7BA577' },
}

export default function Character({ characterId, direction = 'front', isMoving = false, size = 64 }: Props) {
  const c = COLORS[characterId]
  const facingLeft = direction === 'left'

  return (
    <motion.div
      style={{ width: size, height: size * 1.5 }}
      animate={isMoving ? { y: [0, -4, 0, -4, 0] } : { y: 0 }}
      transition={{ duration: 0.4, repeat: isMoving ? Infinity : 0 }}
    >
      <svg
        viewBox="0 0 40 60"
        width={size}
        height={size * 1.5}
        style={{ transform: facingLeft ? 'scaleX(-1)' : undefined }}
      >
        {/* Hair */}
        <ellipse cx="20" cy="11" rx="10" ry="11" fill={c.hair} />
        {/* Head */}
        <ellipse cx="20" cy="14" rx="9" ry="9" fill={c.skin} />
        {/* Eyes */}
        {direction !== 'back' && (
          <>
            <circle cx="17" cy="13" r="1.5" fill="#3D2E1F" />
            <circle cx="23" cy="13" r="1.5" fill="#3D2E1F" />
            <path d="M17 17 Q20 19 23 17" stroke="#3D2E1F" strokeWidth="1" fill="none" />
          </>
        )}
        {/* Body */}
        <rect x="12" y="23" width="16" height="18" rx="4" fill={c.shirt} />
        {/* Arms */}
        <rect x="4" y="23" width="8" height="14" rx="4" fill={c.shirt} />
        <rect x="28" y="23" width="8" height="14" rx="4" fill={c.shirt} />
        {/* Hands */}
        <circle cx="8" cy="37" r="3.5" fill={c.skin} />
        <circle cx="32" cy="37" r="3.5" fill={c.skin} />
        {/* Legs */}
        <rect x="13" y="40" width="6" height="14" rx="3" fill="#3D2E1F" />
        <rect x="21" y="40" width="6" height="14" rx="3" fill="#3D2E1F" />
        {/* Feet */}
        <ellipse cx="16" cy="54" rx="5" ry="3" fill="#1A1008" />
        <ellipse cx="24" cy="54" rx="5" ry="3" fill="#1A1008" />
      </svg>
    </motion.div>
  )
}
