import { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
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

// Zone names for locked tooltip messages
const ZONE_NAMES: Record<string, string> = {
  comedor:    'Comedor',
  catio2:     'Catio 2',
  zona_relax: 'Zona Relax',
  jardines:   'Jardines',
  enfermeria: 'Enfermería',
}
const UNLOCK_PREREQUISITE: Record<string, string> = {
  catio2:     'comedor',
  zona_relax: 'catio2',
  jardines:   'zona_relax',
  enfermeria: 'jardines',
}

// How long the "newly unlocked" golden-burst animation plays (ms)
const UNLOCK_ANIM_DURATION = 3500

export default function Map() {
  const navigate       = useNavigate()
  const prefersReduced = useReducedMotion()
  const { t }          = useTranslation()

  const {
    characterId,
    missionsCompleted,
    unlockedZones,
    justUnlockedZone,
    clearJustUnlocked,
  } = useGameStore()

  const isMobile  = useIsMobile()
  const viewport  = isMobile ? 'mobile' : 'desktop'
  const { getCoords } = usePositions()
  const [selectedZone, setSelectedZone] = useState<Zone | null>(null)

  // Bottom toast for locked / completed zones
  const [mapToast, setMapToast]   = useState<string | null>(null)
  const toastTimerRef             = useRef<ReturnType<typeof setTimeout> | null>(null)

  // Zone that was just unlocked — captured once on mount, then store is cleared
  const [unlockAnim, setUnlockAnim] = useState<string | null>(null)
  const [showLockIcon, setShowLockIcon] = useState<string | null>(null)

  const spawnCoords = getCoords('map_character_spawn', viewport)
  const { position, direction, isMoving, duration, moveTo } = useCharacterMovement(spawnCoords)

  // On mount: capture justUnlockedZone, trigger animation, clear from store
  useEffect(() => {
    if (!justUnlockedZone) return
    setShowLockIcon(justUnlockedZone)
    clearJustUnlocked()

    // After 500ms delay: drop the lock icon and show burst
    const t1 = setTimeout(() => {
      setShowLockIcon(null)
      setUnlockAnim(justUnlockedZone)
    }, 500)

    // After animation: return to normal pulse
    const t2 = setTimeout(() => {
      setUnlockAnim(null)
    }, 500 + UNLOCK_ANIM_DURATION)

    return () => { clearTimeout(t1); clearTimeout(t2) }
  }, [])

  if (!characterId) {
    navigate('/select')
    return null
  }

  function showToast(msg: string) {
    setMapToast(msg)
    if (toastTimerRef.current) clearTimeout(toastTimerRef.current)
    toastTimerRef.current = setTimeout(() => setMapToast(null), 2500)
  }

  function getZonePos(zone: Zone) {
    return getCoords(zone.id, viewport)
  }

  function handleZoneClick(zone: Zone) {
    if (!zone.playable) {
      showToast('Esta zona estará disponible próximamente')
      return
    }
    const isUnlocked  = unlockedZones.includes(zone.id)
    const isCompleted = missionsCompleted.includes(zone.id)

    if (!isUnlocked) {
      const prereq = UNLOCK_PREREQUISITE[zone.id]
      const prereqName = prereq ? ZONE_NAMES[prereq] : ''
      showToast(`Completa ${prereqName} para desbloquear esta zona`)
      return
    }
    if (isCompleted) {
      showToast('¡Misión completada! · Buen trabajo 🐾')
      return
    }
    setSelectedZone(zone)
  }

  function handleStartMission(zoneId: string) {
    const zone = zonesData.find((item) => item.id === zoneId)
    if (!zone || !zone.playable) return
    const pos = getZonePos(zone)
    setSelectedZone(null)
    moveTo(pos.x, pos.y, () => navigate(`/zone/${zone.id}`))
  }

  const mapSrc    = isMobile ? '/map/map-mobile.webp' : '/map/map-desktop.webp'
  const aspectClass = isMobile ? 'aspect-[1536/2752]' : 'aspect-[2752/1536]'

  return (
    <div className="flex flex-col min-h-dvh bg-[#2A3D20] overflow-hidden">
      <Hud />

      <div className="flex-1 mt-14 overflow-y-auto overflow-x-hidden">
        <div
          className={`relative w-full ${isMobile ? '' : 'max-w-[calc(100dvh*2752/1536)] mx-auto'}`}
          style={isMobile ? {} : { maxHeight: 'calc(100dvh - 56px)' }}
        >
          <img
            src={mapSrc}
            alt="Mapa del santuario La Vega Cats"
            className={`w-full ${aspectClass} object-cover block`}
            draggable={false}
          />

          {/* ── Sanctuary title overlay ── */}
          {(() => {
            const pos = getCoords('sanctuary_title', viewport)
            return (
              <div
                className="absolute pointer-events-none select-none z-[5]"
                style={{
                  left:      `${pos.x * 100}%`,
                  top:       `${pos.y * 100}%`,
                  transform: 'translate(-50%, -50%) rotate(-1deg)',
                }}
              >
                <span
                  style={{
                    fontFamily:    '"Fraunces", Georgia, serif',
                    fontSize:      'clamp(9px, 1vw + 4px, 14px)',
                    fontWeight:    700,
                    color:         '#3D2E1F',
                    letterSpacing: '0.02em',
                    textShadow:    '0 1px 0 rgba(255,255,255,0.30)',
                    whiteSpace:    'nowrap',
                    display:       'block',
                    lineHeight:    1,
                  }}
                >
                  {t('map.sanctuary_title')}
                </span>
              </div>
            )
          })()}

          {/* Zone pins */}
          {zonesData.map((zone) => {
            const isPlayable  = zone.playable
            const isUnlocked  = unlockedZones.includes(zone.id)
            const isCompleted = missionsCompleted.includes(zone.id)
            const isSelected  = selectedZone?.id === zone.id
            const isLocked    = isPlayable && !isUnlocked
            // "Available": unlocked, playable, not completed
            const isAvailable = isPlayable && isUnlocked && !isCompleted
            const isNewUnlock = unlockAnim === zone.id
            const showLock    = showLockIcon === zone.id

            const pos = getZonePos(zone)

            return (
              <button
                key={zone.id}
                className="absolute z-10 flex h-11 w-11 items-center justify-center md:h-12 md:w-12"
                style={{
                  left:      `${pos.x * 100}%`,
                  top:       `${pos.y * 100}%`,
                  transform: 'translate(-50%, -50%)',
                  opacity:   isLocked || !isPlayable ? 0.6 : 1,
                  transition: 'opacity 0.4s',
                }}
                onClick={() => handleZoneClick(zone as Zone)}
                aria-label={zone.name}
              >
                {/* Pin circle */}
                <motion.div
                  className="relative flex h-10 w-10 items-center justify-center rounded-full bg-white/75 shadow-[0_3px_10px_rgba(61,46,31,0.3)] ring-1 ring-[#3D2E1F]/25 md:h-11 md:w-11"
                  animate={
                    isNewUnlock && !prefersReduced
                      ? { scale: [1, 1.18, 0.94, 1.12, 1] }
                      : isAvailable
                        ? { scale: [1, 1.08, 1] }
                        : {}
                  }
                  whileTap={{ scale: 0.92 }}
                  transition={
                    isNewUnlock && !prefersReduced
                      ? { duration: 0.6, times: [0, 0.3, 0.55, 0.75, 1], repeat: 0 }
                      : { duration: 2.5, repeat: Infinity, ease: 'easeInOut' }
                  }
                >
                  <img
                    src="/ui/zone-pin.png"
                    alt=""
                    className={`h-9 w-9 drop-shadow-[0_2px_2px_rgba(0,0,0,0.4)] md:h-10 md:w-10 ${
                      isCompleted ? 'hue-rotate-[100deg]' : ''
                    }`}
                  />

                  {/* Completed check */}
                  {isCompleted && (
                    <span className="absolute inset-0 flex items-center justify-center text-white text-sm font-bold drop-shadow">✓</span>
                  )}

                  {/* Permanent lock for non-playable (Próximamente) */}
                  {!isPlayable && (
                    <span className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full bg-[#3D2E1F] text-[10px] text-white shadow">
                      🔒
                    </span>
                  )}

                  {/* Session lock — candado animado */}
                  <AnimatePresence>
                    {(isLocked || showLock) && (
                      <motion.span
                        key="session-lock"
                        className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full bg-[#E07856] text-[10px] text-white shadow"
                        initial={{ opacity: 1, y: 0, rotate: 0 }}
                        exit={
                          prefersReduced
                            ? { opacity: 0 }
                            : { opacity: 0, y: 16, rotate: 25, transition: { duration: 0.7, ease: 'easeOut' } }
                        }
                      >
                        🔒
                      </motion.span>
                    )}
                  </AnimatePresence>

                  {/* Golden burst ring when newly unlocked */}
                  <AnimatePresence>
                    {isNewUnlock && !prefersReduced && (
                      <motion.div
                        key="unlock-burst"
                        className="absolute inset-0 rounded-full pointer-events-none"
                        initial={{ scale: 1, opacity: 0.9, boxShadow: '0 0 0 0px rgba(247,216,124,0.9)' }}
                        animate={{ scale: 1.6, opacity: 0, boxShadow: '0 0 0 12px rgba(247,216,124,0)' }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.7, ease: 'easeOut' }}
                      />
                    )}
                  </AnimatePresence>

                  {/* Extra pulse ring for newly unlocked (3s intense) */}
                  {isNewUnlock && !prefersReduced && (
                    <motion.div
                      className="absolute inset-0 rounded-full bg-[#F7D87C]/30 pointer-events-none"
                      animate={{ scale: [1, 1.55, 1], opacity: [0.5, 0, 0.5] }}
                      transition={{ duration: 1.4, repeat: Infinity, ease: 'easeInOut' }}
                    />
                  )}
                </motion.div>

                {/* Label */}
                <div
                  className={`absolute left-1/2 top-full mt-1 -translate-x-1/2 text-white text-[10px] md:text-xs font-bold px-2 py-0.5 rounded-full whitespace-nowrap shadow ${
                    isSelected
                      ? 'bg-[#F7D87C] text-[#3D2E1F] ring-2 ring-white'
                      : isCompleted
                        ? 'bg-[#7BA577]'
                        : isLocked
                          ? 'bg-[#3D2E1F]/60'
                          : 'bg-[#E07856]'
                  }`}
                >
                  {zone.name}
                </div>
              </button>
            )
          })}

          {/* Character */}
          <motion.div
            className="absolute z-20 pointer-events-none"
            animate={{ left: `${position.x * 100}%`, top: `${position.y * 100}%` }}
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

          {/* Tutorial tooltip */}
          <AnimatePresence>
            {!isMoving && missionsCompleted.length === 0 && !selectedZone && (
              <motion.div
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                transition={{ delay: 1.2 }}
                className="absolute bottom-6 left-1/2 -translate-x-1/2 bg-[#3D2E1F]/90 text-white text-sm font-medium px-4 py-3 rounded-2xl text-center max-w-[240px] shadow-lg"
              >
                👆 Empieza por el Comedor
              </motion.div>
            )}
          </AnimatePresence>

          {/* Missions progress counter */}
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

      {/* Bottom toast for locked / completed zones */}
      <AnimatePresence>
        {mapToast && (
          <motion.div
            key={mapToast}
            className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 bg-[#3D2E1F]/90 text-white text-sm font-semibold px-5 py-3 rounded-2xl shadow-xl max-w-[280px] text-center"
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 16 }}
            transition={{ duration: 0.25 }}
          >
            {mapToast}
          </motion.div>
        )}
      </AnimatePresence>

      <ZonePanel
        zone={selectedZone}
        onClose={() => setSelectedZone(null)}
        onStartMission={handleStartMission}
      />
    </div>
  )
}
