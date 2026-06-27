import { supabase } from './supabase'
import positionsJson from '../data/positions.json'

export type Viewport = 'desktop' | 'mobile'
export type ElementType = 'zone_pin' | 'hotspot' | 'character_spawn'

export interface Coords {
  x: number
  y: number
}

export interface PositionEntry {
  type: ElementType
  label: string
  zone?: string
  desktop: Coords
  mobile: Coords
}

export type PositionsMap = Record<string, PositionEntry>

export function getDefaultPositions(): PositionsMap {
  return positionsJson as unknown as PositionsMap
}

export async function loadPositionsFromSupabase(): Promise<Partial<PositionsMap> | null> {
  try {
    const { data, error } = await supabase
      .from('element_positions')
      .select('element_id, viewport, x, y, element_type')

    if (error || !data?.length) return null

    const result: Partial<PositionsMap> = {}
    for (const row of data) {
      if (!result[row.element_id]) {
        const defaults = (positionsJson as any)[row.element_id]
        result[row.element_id] = {
          type: row.element_type as ElementType,
          label: defaults?.label ?? row.element_id,
          zone: defaults?.zone,
          desktop: defaults?.desktop ?? { x: 0.5, y: 0.5 },
          mobile: defaults?.mobile ?? { x: 0.5, y: 0.5 },
        }
      }
      result[row.element_id]![row.viewport as Viewport] = { x: row.x, y: row.y }
    }
    return result
  } catch {
    return null
  }
}

export interface SaveRow {
  elementId: string
  elementType: ElementType
  viewport: Viewport
  x: number
  y: number
}

export async function savePositionsToSupabase(rows: SaveRow[]): Promise<{ error: string | null }> {
  const payload = rows.map((r) => ({
    element_type: r.elementType,
    element_id: r.elementId,
    viewport: r.viewport,
    x: r.x,
    y: r.y,
    updated_at: new Date().toISOString(),
  }))

  const { error } = await supabase
    .from('element_positions')
    .upsert(payload, { onConflict: 'element_type,element_id,viewport' })

  return { error: error?.message ?? null }
}
