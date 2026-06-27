import { useEffect, useRef, useState } from 'react'

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
  const [duration, setDuration] = useState(0.9)
  const hasMoved = useRef(false)

  useEffect(() => {
    if (!hasMoved.current) setPosition(initialPosition)
  }, [initialPosition.x, initialPosition.y])

  function moveTo(targetX: number, targetY: number, onArrival?: () => void) {
    hasMoved.current = true
    const dx = targetX - position.x
    const dy = targetY - position.y
    setDirection(chooseDirection(dx, dy))
    setIsMoving(true)

    const distance = Math.sqrt(dx * dx + dy * dy)
    const nextDuration = Math.min(3.4, Math.max(1.4, distance * 4.2))
    setDuration(nextDuration)
    setPosition({ x: targetX, y: targetY })

    setTimeout(() => {
      setIsMoving(false)
      setDirection('front')
      onArrival?.()
    }, nextDuration * 1000)
  }

  return { position, direction, isMoving, duration, moveTo }
}
