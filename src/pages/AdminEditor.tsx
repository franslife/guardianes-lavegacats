import { useState, useRef, useCallback, useEffect } from 'react'
import {
  getDefaultPositions,
  loadPositionsFromSupabase,
  savePositionsToSupabase,
  type PositionsMap,
  type Viewport,
  type SaveRow,
  type ElementType,
} from '../lib/positions'

// ── Types ──────────────────────────────────────────────────────────────────

type Context = 'map' | string // 'map' | zoneId

const ZONE_IDS = ['catio2', 'zona_relax', 'enfermeria', 'comedor', 'jardines']
const ZONE_LABELS: Record<string, string> = {
  catio2: 'Catio 2', zona_relax: 'Zona Relax', enfermeria: 'Enfermería',
  comedor: 'Comedor', jardines: 'Jardines',
}

const TYPE_COLOR: Record<ElementType, string> = {
  zone_pin: '#E07856',
  hotspot: '#F7D87C',
  character_spawn: '#7BA577',
}
const TYPE_ICON: Record<ElementType, string> = {
  zone_pin: '📍',
  hotspot: '✨',
  character_spawn: '🧑',
}

function clamp(v: number) { return Math.max(0, Math.min(1, v)) }

// ── DraggablePin ──────────────────────────────────────────────────────────

interface DraggablePinProps {
  elementId: string
  x: number
  y: number
  type: ElementType
  label: string
  isSelected: boolean
  onSelect: (id: string) => void
  onMove: (id: string, x: number, y: number) => void
  mapRef: React.RefObject<HTMLDivElement | null>
}

function DraggablePin({ elementId, x, y, type, label, isSelected, onSelect, onMove, mapRef }: DraggablePinProps) {
  const pinRef = useRef<HTMLDivElement>(null)
  const dragging = useRef(false)

  function getMapRect() {
    return mapRef.current?.getBoundingClientRect() ?? null
  }

  function handlePointerDown(e: React.PointerEvent) {
    e.stopPropagation()
    e.preventDefault()
    dragging.current = true
    pinRef.current?.setPointerCapture(e.pointerId)
    onSelect(elementId)
  }

  function handlePointerMove(e: React.PointerEvent) {
    if (!dragging.current) return
    const rect = getMapRect()
    if (!rect) return
    const nx = clamp((e.clientX - rect.left) / rect.width)
    const ny = clamp((e.clientY - rect.top) / rect.height)
    onMove(elementId, nx, ny)
  }

  function handlePointerUp(e: React.PointerEvent) {
    if (!dragging.current) return
    dragging.current = false
    pinRef.current?.releasePointerCapture(e.pointerId)
  }

  const color = TYPE_COLOR[type]
  const icon = TYPE_ICON[type]

  return (
    <div
      ref={pinRef}
      style={{
        position: 'absolute',
        left: `${x * 100}%`,
        top: `${y * 100}%`,
        transform: 'translate(-50%, -50%)',
        cursor: 'grab',
        touchAction: 'none',
        userSelect: 'none',
        zIndex: isSelected ? 20 : 10,
      }}
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
    >
      <div
        style={{
          width: 36,
          height: 36,
          borderRadius: '50%',
          background: color,
          border: isSelected ? '3px solid white' : '2px solid rgba(0,0,0,0.3)',
          boxShadow: isSelected ? `0 0 0 2px ${color}, 0 4px 12px rgba(0,0,0,0.4)` : '0 2px 6px rgba(0,0,0,0.3)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: 16,
        }}
        title={label}
      >
        {icon}
      </div>
      {isSelected && (
        <div style={{
          position: 'absolute',
          top: '100%',
          left: '50%',
          transform: 'translateX(-50%)',
          marginTop: 4,
          background: 'rgba(0,0,0,0.8)',
          color: 'white',
          fontSize: 10,
          padding: '2px 6px',
          borderRadius: 4,
          whiteSpace: 'nowrap',
          pointerEvents: 'none',
        }}>
          {label}
        </div>
      )}
    </div>
  )
}

// ── Main Editor ───────────────────────────────────────────────────────────

export default function AdminEditor() {
  const [viewport, setViewport] = useState<Viewport>('mobile')
  const [context, setContext] = useState<Context>('map')
  const [positions, setPositions] = useState<PositionsMap>(() => getDefaultPositions())
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [status, setStatus] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const mapRef = useRef<HTMLDivElement>(null)

  // Load from Supabase on mount
  useEffect(() => {
    loadPositionsFromSupabase().then((remote) => {
      if (remote) setPositions((base) => ({ ...base, ...(remote as PositionsMap) }))
      setLoading(false)
    })
  }, [])

  // Move handler
  const handleMove = useCallback((id: string, x: number, y: number) => {
    setPositions((prev) => ({
      ...prev,
      [id]: { ...prev[id], [viewport]: { x, y } },
    }))
  }, [viewport])

  // Elements visible in current context
  const visibleElements = Object.entries(positions).filter(([, entry]) => {
    if (context === 'map') return entry.type === 'zone_pin'
    return (entry.type === 'hotspot' || entry.type === 'character_spawn') && entry.zone === context
  })

  // Map/interior image for current context + viewport
  function getImageSrc() {
    if (context === 'map') {
      return viewport === 'mobile' ? '/map/map-mobile.webp' : '/map/map-desktop.webp'
    }
    return viewport === 'mobile'
      ? `/zones/${context.replace('_', '-')}-interior-mobile.webp`
      : `/zones/${context.replace('_', '-')}-interior-desktop.webp`
  }

  // Save to Supabase
  async function handleSave() {
    setStatus('Guardando...')
    const rows: SaveRow[] = []
    for (const [id, entry] of Object.entries(positions)) {
      for (const vp of ['desktop', 'mobile'] as Viewport[]) {
        rows.push({ elementId: id, elementType: entry.type, viewport: vp, x: entry[vp].x, y: entry[vp].y })
      }
    }
    const { error } = await savePositionsToSupabase(rows)
    setStatus(error ? `Error: ${error}` : '✓ Guardado en Supabase')
    setTimeout(() => setStatus(null), 3000)
  }

  // Export JSON
  function handleExport() {
    const blob = new Blob([JSON.stringify(positions, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'positions.json'
    a.click()
    URL.revokeObjectURL(url)
  }

  const selected = selectedId ? positions[selectedId] : null
  const selectedCoords = selected ? selected[viewport] : null

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100dvh', background: '#1A1008', color: 'white', fontFamily: 'system-ui, sans-serif' }}>

      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '10px 16px', background: '#3D2E1F', borderBottom: '2px solid #E07856', flexShrink: 0, flexWrap: 'wrap' }}>
        <span style={{ fontWeight: 800, fontSize: 14, color: '#F7D87C' }}>🐱 Editor Guardianes</span>

        {/* Viewport toggle */}
        <div style={{ display: 'flex', gap: 4, background: '#1A1008', borderRadius: 8, padding: 3 }}>
          {(['mobile', 'desktop'] as Viewport[]).map((vp) => (
            <button
              key={vp}
              onClick={() => setViewport(vp)}
              style={{
                padding: '5px 14px', borderRadius: 6, border: 'none', cursor: 'pointer', fontWeight: 700, fontSize: 13,
                background: viewport === vp ? '#E07856' : 'transparent',
                color: viewport === vp ? 'white' : '#888',
              }}
            >
              {vp === 'mobile' ? '📱 Mobile' : '🖥️ Desktop'}
            </button>
          ))}
        </div>

        <div style={{ background: viewport === 'mobile' ? '#7BA577' : '#4A7C59', color: 'white', padding: '3px 10px', borderRadius: 6, fontSize: 12, fontWeight: 700 }}>
          Editando: {viewport.toUpperCase()}
        </div>

        <div style={{ marginLeft: 'auto', display: 'flex', gap: 8, alignItems: 'center' }}>
          {status && <span style={{ fontSize: 12, color: '#7BA577' }}>{status}</span>}
          <button onClick={handleSave} style={{ background: '#7BA577', color: 'white', border: 'none', borderRadius: 8, padding: '6px 14px', fontWeight: 700, cursor: 'pointer', fontSize: 13 }}>
            💾 Guardar en Supabase
          </button>
          <button onClick={handleExport} style={{ background: '#4A6FA5', color: 'white', border: 'none', borderRadius: 8, padding: '6px 14px', fontWeight: 700, cursor: 'pointer', fontSize: 13 }}>
            ⬇️ Exportar JSON
          </button>
        </div>
      </div>

      {/* Body */}
      <div style={{ display: 'flex', flex: 1, overflow: 'hidden' }}>

        {/* Sidebar */}
        <div style={{ width: 220, background: '#2A1E12', borderRight: '1px solid #3D2E1F', display: 'flex', flexDirection: 'column', overflow: 'hidden', flexShrink: 0 }}>
          <div style={{ padding: '10px 12px', borderBottom: '1px solid #3D2E1F', fontSize: 11, fontWeight: 700, color: '#888', textTransform: 'uppercase', letterSpacing: 1 }}>
            Contexto
          </div>
          <div style={{ overflow: 'auto', flex: 1 }}>
            {/* Map */}
            <button
              onClick={() => { setContext('map'); setSelectedId(null) }}
              style={{ width: '100%', textAlign: 'left', padding: '8px 12px', background: context === 'map' ? '#3D2E1F' : 'transparent', border: 'none', color: 'white', cursor: 'pointer', fontSize: 13, borderLeft: context === 'map' ? '3px solid #E07856' : '3px solid transparent' }}
            >
              🗺️ Mapa principal
            </button>

            <div style={{ padding: '8px 12px 4px', fontSize: 11, color: '#888', textTransform: 'uppercase', letterSpacing: 1 }}>Zonas interiores</div>
            {ZONE_IDS.map((zid) => (
              <button
                key={zid}
                onClick={() => { setContext(zid); setSelectedId(null) }}
                style={{ width: '100%', textAlign: 'left', padding: '7px 12px 7px 20px', background: context === zid ? '#3D2E1F' : 'transparent', border: 'none', color: 'white', cursor: 'pointer', fontSize: 13, borderLeft: context === zid ? '3px solid #E07856' : '3px solid transparent' }}
              >
                {ZONE_LABELS[zid]}
              </button>
            ))}

            {/* Legend */}
            <div style={{ padding: '12px 12px 4px', fontSize: 11, color: '#888', textTransform: 'uppercase', letterSpacing: 1 }}>Leyenda</div>
            {(Object.entries(TYPE_COLOR) as [ElementType, string][]).map(([type, color]) => (
              <div key={type} style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '4px 12px', fontSize: 12 }}>
                <div style={{ width: 14, height: 14, borderRadius: '50%', background: color }} />
                <span style={{ color: '#ccc' }}>{TYPE_ICON[type]} {type.replace('_', ' ')}</span>
              </div>
            ))}
          </div>

          {/* Selected element info */}
          {selected && selectedCoords && (
            <div style={{ borderTop: '1px solid #3D2E1F', padding: '10px 12px', background: '#1A1008', flexShrink: 0 }}>
              <div style={{ fontSize: 11, color: '#888', marginBottom: 4 }}>Seleccionado</div>
              <div style={{ fontSize: 13, fontWeight: 700, color: '#F7D87C', marginBottom: 6 }}>{selected.label}</div>
              <div style={{ display: 'flex', gap: 8, fontSize: 12 }}>
                <div style={{ background: '#2A1E12', padding: '4px 8px', borderRadius: 6 }}>
                  <span style={{ color: '#888' }}>x </span>
                  <span style={{ fontWeight: 700, color: '#E07856' }}>{selectedCoords.x.toFixed(4)}</span>
                </div>
                <div style={{ background: '#2A1E12', padding: '4px 8px', borderRadius: 6 }}>
                  <span style={{ color: '#888' }}>y </span>
                  <span style={{ fontWeight: 700, color: '#E07856' }}>{selectedCoords.y.toFixed(4)}</span>
                </div>
              </div>
              {/* Fine-tune inputs */}
              <div style={{ marginTop: 8, display: 'flex', flexDirection: 'column', gap: 4 }}>
                {(['x', 'y'] as const).map((axis) => (
                  <label key={axis} style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12 }}>
                    <span style={{ color: '#888', width: 12 }}>{axis}</span>
                    <input
                      type="number"
                      step="0.005"
                      min={0}
                      max={1}
                      value={selectedCoords[axis].toFixed(4)}
                      onChange={(e) => {
                        const v = parseFloat(e.target.value)
                        if (!isNaN(v) && selectedId) {
                          handleMove(selectedId, axis === 'x' ? clamp(v) : selectedCoords.x, axis === 'y' ? clamp(v) : selectedCoords.y)
                        }
                      }}
                      style={{ flex: 1, background: '#2A1E12', border: '1px solid #3D2E1F', color: 'white', padding: '3px 6px', borderRadius: 4, fontSize: 12 }}
                    />
                  </label>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Map canvas */}
        <div style={{ flex: 1, overflow: 'auto', display: 'flex', alignItems: 'flex-start', justifyContent: 'center', padding: 16 }}>
          {loading ? (
            <div style={{ color: '#888', marginTop: 80 }}>Cargando posiciones...</div>
          ) : (
            <div
              ref={mapRef}
              style={{ position: 'relative', display: 'inline-block', cursor: 'crosshair' }}
              onClick={(e) => {
                // Deselect when clicking empty map area
                if (e.target === mapRef.current || e.target === mapRef.current?.querySelector('img')) {
                  setSelectedId(null)
                }
              }}
            >
              <img
                src={getImageSrc()}
                alt="mapa"
                style={{
                  display: 'block',
                  maxHeight: 'calc(100dvh - 120px)',
                  maxWidth: '100%',
                  objectFit: 'contain',
                  userSelect: 'none',
                  pointerEvents: 'none',
                  border: '2px solid #3D2E1F',
                  borderRadius: 8,
                }}
                draggable={false}
              />

              {visibleElements.map(([id, entry]) => {
                const coords = entry[viewport]
                return (
                  <DraggablePin
                    key={`${id}-${viewport}`}
                    elementId={id}
                    x={coords.x}
                    y={coords.y}
                    type={entry.type}
                    label={entry.label}
                    isSelected={selectedId === id}
                    onSelect={setSelectedId}
                    onMove={handleMove}
                    mapRef={mapRef}
                  />
                )
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
