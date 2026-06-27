import { useState, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import { useGameStore } from '../store/gameStore'
import { useCharacterMovement } from '../hooks/useCharacterMovement'
import Character from '../components/game/Character'
import ZonePanel from '../components/ui/ZonePanel'
import Hud from '../components/ui/Hud'
import zonesData from '../data/zones.json'

type Zone = typeof zonesData[number]

const ZONE_ICONS: Record<string, string> = {
  catio2: '🪣',
  comedor: '🍽️',
  zona_relax: '💧',
  enfermeria: '🩺',
  jardines: '🌿',
  casa_azul: '🏠',
  caravana: '🚌',
  catio1: '🪣',
}

export default function Map() {
  const navigate = useNavigate()
  const characterId = useGameStore((s) => s.characterId)
  const missionsCompleted = useGameStore((s) => s.missionsCompleted)
  const mapRef = useRef<HTMLDivElement>(null)
  const [selectedZone, setSelectedZone] = useState<Zone | null>(null)
  const { position, direction, isMoving, moveTo } = useCharacterMovement({ x: 0.5, y: 0.5 })

  if (!characterId) {
    navigate('/select')
    return null
  }

  function handleZoneClick(zone: Zone) {
    moveTo(zone.mapPosition.x, zone.mapPosition.y, () => {
      setSelectedZone(zone)
    })
  }

  return (
    <div className="flex flex-col min-h-dvh bg-[#3D5E35] overflow-hidden">
      <Hud />

      {/* Mapa */}
      <div
        ref={mapRef}
        className="relative flex-1 mt-14 overflow-hidden"
        style={{ minHeight: 'calc(100dvh - 56px)' }}
      >
        {/* Fondo del mapa (placeholder ilustrado) */}
        <div className="absolute inset-0">
          <svg viewBox="0 0 100 100" className="w-full h-full" preserveAspectRatio="xMidYMid slice">
            {/* Fondo base */}
            <rect width="100" height="100" fill="#4A7C40" />
            {/* Caminos */}
            <path d="M20 50 Q35 45 50 50 Q65 55 80 50" stroke="#C8B896" strokeWidth="4" fill="none" strokeLinecap="round" />
            <path d="M50 20 Q52 35 50 50 Q48 65 50 80" stroke="#C8B896" strokeWidth="4" fill="none" strokeLinecap="round" />
            {/* Árboles decorativos */}
            {[[10,20],[85,15],[15,80],[90,75],[5,50],[95,45]].map(([x,y], i) => (
              <g key={i}>
                <circle cx={x} cy={y} r="5" fill="#2D5A1B" />
                <circle cx={x} cy={y-3} r="4" fill="#3A7024" />
              </g>
            ))}
            {/* Hierba */}
            <ellipse cx="50" cy="50" rx="35" ry="30" fill="#5A8F4A" opacity="0.3" />
          </svg>
        </div>

        {/* Pines de zona */}
        {zonesData.map((zone) => {
          const completed = missionsCompleted.includes(zone.id)
          return (
            <motion.button
              key={zone.id}
              className="absolute z-10 flex flex-col items-center gap-1 -translate-x-1/2 -translate-y-full"
              style={{
                left: `${zone.mapPosition.x * 100}%`,
                top: `${zone.mapPosition.y * 100}%`,
              }}
              onClick={() => handleZoneClick(zone as Zone)}
              whileTap={{ scale: 0.9 }}
            >
              {/* Pin */}
              <motion.div
                className={`w-12 h-12 rounded-full flex items-center justify-center shadow-lg border-2 ${
                  completed
                    ? 'bg-[#7BA577] border-white'
                    : zone.playable
                    ? 'bg-[#F5EBD8] border-[#E07856]'
                    : 'bg-[#F5EBD8]/60 border-[#3D2E1F]/30'
                }`}
                animate={zone.playable && !completed ? { scale: [1, 1.05, 1] } : {}}
                transition={{ duration: 2, repeat: Infinity }}
              >
                <span className="text-xl">
                  {completed ? '✓' : ZONE_ICONS[zone.id] || '📍'}
                </span>
              </motion.div>
              {/* Label */}
              <div className="bg-[#3D2E1F]/80 text-white text-xs font-bold px-2 py-0.5 rounded-full whitespace-nowrap">
                {zone.name}
              </div>
            </motion.button>
          )
        })}

        {/* Personaje en el mapa */}
        <motion.div
          className="absolute z-20 -translate-x-1/2 -translate-y-full pointer-events-none"
          animate={{
            left: `${position.x * 100}%`,
            top: `${position.y * 100}%`,
          }}
          transition={{ type: 'tween', ease: 'easeInOut', duration: 0.8 }}
        >
          <Character characterId={characterId} direction={direction} isMoving={isMoving} size={48} />
        </motion.div>

        {/* Tutorial primera vez */}
        <AnimatePresence>
          {!isMoving && missionsCompleted.length === 0 && !selectedZone && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              transition={{ delay: 1 }}
              className="absolute bottom-8 left-1/2 -translate-x-1/2 bg-[#3D2E1F]/90 text-white text-sm font-medium px-4 py-3 rounded-2xl text-center max-w-[260px]"
            >
              👆 Toca el pin de cualquier zona para empezar tu turno
            </motion.div>
          )}
        </AnimatePresence>

        {/* Progreso del turno */}
        {missionsCompleted.length > 0 && (
          <div className="absolute top-4 left-1/2 -translate-x-1/2 bg-[#F5EBD8]/90 px-4 py-2 rounded-full flex items-center gap-2 shadow">
            <span className="text-sm font-bold text-[#3D2E1F]">
              {missionsCompleted.length}/5 misiones
            </span>
            {missionsCompleted.length === 5 && (
              <button
                onClick={() => navigate('/end')}
                className="ml-2 bg-[#E07856] text-white text-xs font-bold px-3 py-1 rounded-full"
              >
                Ver resumen
              </button>
            )}
          </div>
        )}
      </div>

      {/* Panel de zona */}
      <ZonePanel zone={selectedZone} onClose={() => setSelectedZone(null)} />
    </div>
  )
}
