import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import { useGameStore } from '../store/gameStore'
import { useCharacterMovement } from '../hooks/useCharacterMovement'
import { usePositions } from '../hooks/usePositions'
import Character from '../components/game/Character'
import ZonePanel from '../components/ui/ZonePanel'
import Hud from '../components/ui/Hud'
import zonesData from '../data/zones.json'

type Zone = typeof zonesData[number]

function useIsMobile() {
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768)
  useEffect(() => {
    const handler = () => setIsMobile(window.innerWidth < 768)
    window.addEventListener('resize', handler)
    return () => window.removeEventListener('resize', handler)
  }, [])
  return isMobile
}

export default function Map() {
  const navigate = useNavigate()
  const characterId = useGameStore((s) => s.characterId)
  const missionsCompleted = useGameStore((s) => s.missionsCompleted)
  const isMobile = useIsMobile()
  const viewport = isMobile ? 'mobile' : 'desktop'
  const { getCoords } = usePositions()
  const [selectedZone, setSelectedZone] = useState<Zone | null>(null)

  const spawnCoords = getCoords('map_character_spawn', viewport)
  const { position, direction, isMoving, duration, moveTo } = useCharacterMovement(spawnCoords)

  if (!characterId) {
    navigate('/select')
    return null
  }

  function getZonePos(zone: Zone) {
    return getCoords(zone.id, viewport)
  }

  function handleZoneClick(zone: Zone) {
    setSelectedZone(zone)
  }

  function handleStartMission(zoneId: string) {
    const zone = zonesData.find((item) => item.id === zoneId)
    if (!zone || !zone.playable) return
    const pos = getZonePos(zone)
    setSelectedZone(null)
    moveTo(pos.x, pos.y, () => navigate(`/zone/${zone.id}`))
  }

  const mapSrc = isMobile ? '/map/map-mobile.webp' : '/map/map-desktop.webp'
  // aspect ratio: mobile 1536/2752, desktop 2752/1536
  const aspectClass = isMobile ? 'aspect-[1536/2752]' : 'aspect-[2752/1536]'

  return (
    <div className="flex flex-col min-h-dvh bg-[#2A3D20] overflow-hidden">
      <Hud />

      <div className="flex-1 mt-14 overflow-y-auto overflow-x-hidden">
        {/* Contenedor del mapa con aspect ratio real */}
        <div
          className={`relative w-full ${isMobile ? '' : 'max-w-[calc(100dvh*2752/1536)] mx-auto'}`}
          style={isMobile ? {} : { maxHeight: 'calc(100dvh - 56px)' }}
        >
          {/* Imagen del mapa */}
          <img
            src={mapSrc}
            alt="Mapa del santuario La Vega Cats"
            className={`w-full ${aspectClass} object-cover block`}
            draggable={false}
          />

          {/* Pines de zona — posicionados sobre la imagen */}
          {zonesData.map((zone) => {
            const completed = missionsCompleted.includes(zone.id)
            const selected = selectedZone?.id === zone.id
            const pos = getZonePos(zone)
            return (
              <button
                key={zone.id}
                className="absolute z-10 flex h-11 w-11 items-center justify-center md:h-12 md:w-12"
                style={{
                  left: `${pos.x * 100}%`,
                  top: `${pos.y * 100}%`,
                  transform: 'translate(-50%, -50%)',
                }}
                onClick={() => handleZoneClick(zone as Zone)}
                aria-label={zone.name}
              >
                {/* Imagen de pin UI */}
                <motion.div
                  className="relative flex h-10 w-10 items-center justify-center rounded-full bg-white/75 shadow-[0_3px_10px_rgba(61,46,31,0.3)] ring-1 ring-[#3D2E1F]/25 md:h-11 md:w-11"
                  animate={zone.playable && !completed ? { scale: [1, 1.08, 1] } : {}}
                  whileTap={{ scale: 0.92 }}
                  transition={{ duration: 2.5, repeat: Infinity, ease: 'easeInOut' }}
                >
                  <img
                    src="/ui/zone-pin.png"
                    alt=""
                    className={`h-9 w-9 drop-shadow-[0_2px_2px_rgba(0,0,0,0.4)] md:h-10 md:w-10 ${
                      completed ? 'hue-rotate-[100deg]' : ''
                    }`}
                  />
                  {completed && (
                    <span className="absolute inset-0 flex items-center justify-center text-white text-sm font-bold">✓</span>
                  )}
                  {!zone.playable && (
                    <span className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full bg-[#3D2E1F] text-[10px] text-white shadow">
                      🔒
                    </span>
                  )}
                </motion.div>
                {/* Label */}
                <div
                  className={`absolute left-1/2 top-full mt-1 -translate-x-1/2 text-white text-[10px] md:text-xs font-bold px-2 py-0.5 rounded-full whitespace-nowrap shadow ${
                    selected
                      ? 'bg-[#F7D87C] text-[#3D2E1F] ring-2 ring-white'
                      : completed
                        ? 'bg-[#7BA577]'
                        : 'bg-[#E07856]'
                  }`}
                >
                  {zone.name}
                </div>
              </button>
            )
          })}

          {/* Personaje sobre el mapa */}
          <motion.div
            className="absolute z-20 pointer-events-none"
            animate={{
              left: `${position.x * 100}%`,
              top: `${position.y * 100}%`,
            }}
            style={{ transform: 'translate(-50%, -100%)' }}
            transition={{ type: 'tween', ease: 'easeInOut', duration }}
          >
            <Character
              characterId={characterId}
              direction={direction}
              isMoving={isMoving}
              size={isMobile ? 52 : 64}
            />
          </motion.div>

          {/* Tooltip tutorial */}
          <AnimatePresence>
            {!isMoving && missionsCompleted.length === 0 && !selectedZone && (
              <motion.div
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                transition={{ delay: 1.2 }}
                className="absolute bottom-6 left-1/2 -translate-x-1/2 bg-[#3D2E1F]/90 text-white text-sm font-medium px-4 py-3 rounded-2xl text-center max-w-[240px] shadow-lg"
              >
                👆 Toca el pin de cualquier zona para empezar tu turno
              </motion.div>
            )}
          </AnimatePresence>

          {/* Progreso del turno */}
          {missionsCompleted.length > 0 && (
            <div className="absolute top-3 left-1/2 -translate-x-1/2 bg-[#F5EBD8]/95 px-4 py-2 rounded-full flex items-center gap-2 shadow-md">
              <span className="text-sm font-bold text-[#3D2E1F]">
                {missionsCompleted.length}/5 misiones
              </span>
              {missionsCompleted.length === 5 && (
                <button
                  onClick={() => navigate('/end')}
                  className="ml-2 bg-[#E07856] text-white text-xs font-bold px-3 py-1 rounded-full"
                >
                  Finalizar turno
                </button>
              )}
            </div>
          )}
        </div>
      </div>

      <ZonePanel
        zone={selectedZone}
        onClose={() => setSelectedZone(null)}
        onStartMission={handleStartMission}
      />
    </div>
  )
}
