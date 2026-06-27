import { motion } from 'framer-motion'

type Direction = 'front' | 'back' | 'left' | 'right'
type CharacterId = 'volunteer_f' | 'volunteer_m' | 'volunteer_n'

interface Props {
  characterId: CharacterId
  direction?: Direction
  isMoving?: boolean
  /** Width in px — height auto from natural 1696×2528 ratio (~0.67) */
  size?: number
}

const DIR_SUFFIX: Record<Direction, string> = {
  front: 'front',
  back: 'back',
  left: 'left',
  right: 'right',
}

const CHAR_PREFIX: Record<CharacterId, string> = {
  volunteer_f: 'volunteer-f',
  volunteer_m: 'volunteer-m',
  volunteer_n: 'volunteer-n',
}

export default function Character({ characterId, direction = 'front', isMoving = false, size = 64 }: Props) {
  const src = `/characters/${CHAR_PREFIX[characterId]}-${DIR_SUFFIX[direction]}.png`
  const height = Math.round(size * (2528 / 1696))

  return (
    <motion.div
      style={{ width: size, height }}
      animate={isMoving ? { y: [0, -6, 0, -6, 0] } : { y: 0 }}
      transition={{ duration: 0.35, repeat: isMoving ? Infinity : 0 }}
    >
      <img
        src={src}
        alt=""
        width={size}
        height={height}
        style={{ display: 'block', objectFit: 'contain' }}
      />
    </motion.div>
  )
}
