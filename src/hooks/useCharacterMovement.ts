import { useState } from 'react'

type Direction = 'front' | 'back' | 'left' | 'right'

interface Position {
  x: number
  y: number
}

function chooseDirection(dx: number, dy: number): Direction {
  if (Math.abs(dx) > Math.abs(dy)) return dx > 0 ? 'right' : 'left'
  return dy > 0 ? 'front' : 'back'
}

export function useCharacterMovement(initialPosition: Position = { x: 0.5, y: 0.5 }) {
  const [position, setPosition] = useState<Position>(initialPosition)
  const [direction, setDirection] = useState<Direction>('front')
  const [isMoving, setIsMoving] = useState(false)

  function moveTo(targetX: number, targetY: number, onArrival?: () => void) {
    const dx = targetX - position.x
    const dy = targetY - position.y
    setDirection(chooseDirection(dx, dy))
    setIsMoving(true)
    setPosition({ x: targetX, y: targetY })

    const distance = Math.sqrt(dx * dx + dy * dy)
    const duration = Math.max(500, distance * 2000)

    setTimeout(() => {
      setIsMoving(false)
      setDirection('front')
      onArrival?.()
    }, duration)
  }

  return { position, direction, isMoving, moveTo }
}
