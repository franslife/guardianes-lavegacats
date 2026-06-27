import { useState, useEffect } from 'react'
import {
  getDefaultPositions,
  loadPositionsFromSupabase,
  type PositionsMap,
  type Coords,
  type Viewport,
} from '../lib/positions'

interface UsePositionsResult {
  positions: PositionsMap
  loading: boolean
  getCoords: (id: string, viewport: Viewport) => Coords
}

export function usePositions(): UsePositionsResult {
  const [positions, setPositions] = useState<PositionsMap>(getDefaultPositions)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadPositionsFromSupabase().then((remote) => {
      if (remote) {
        setPositions((base) => ({ ...base, ...(remote as PositionsMap) }))
      }
      setLoading(false)
    })
  }, [])

  function getCoords(id: string, viewport: Viewport): Coords {
    return positions[id]?.[viewport] ?? { x: 0.5, y: 0.5 }
  }

  return { positions, loading, getCoords }
}
