import { useState, useEffect, useCallback } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { useGameStore } from '../store/gameStore'
import { usePositions } from '../hooks/usePositions'
import { useCharacterMovement } from '../hooks/useCharacterMovement'
import { supabase } from '../lib/supabase'
import Character from '../components/game/Character'
import Hotspot, { type HotspotState, type TaskImages } from '../components/game/Hotspot'
import FloatingHearts from '../components/game/FloatingHearts'
import MissionComplete from '../components/ui/MissionComplete'
import Hud from '../components/ui/Hud'
import zonesData from '../data/zones.json'
import positionsJson from '../data/positions.json'

type PositionsJson = typeof positionsJson
type PosKey = keyof PositionsJson

function useIsMobile() {
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768)
  useEffect(() => {
    const handler = () => setIsMobile(window.innerWidth < 768)
    window.addEventListener('resize', handler)
    return () => window.removeEventListener('resize', handler)
  }, [])
  return isMobile
}

const ZONE_TASK_IMAGES: Record<string, TaskImages> = {
  catio2:     { before: '/tasks/litter-dirty.webp',  during: '/tasks/litter-cleaning.webp', after: '/tasks/litter-clean.webp' },
  comedor:    { before: '/tasks/feed-empty.webp',    during: '/tasks/feed-pouring.webp',    after: '/tasks/feed-full.webp' },
  zona_relax: { before: '/tasks/water-murky.webp',   during: '/tasks/water-refilling.webp', after: '/tasks/water-clean.webp' },
  enfermeria: { before: '/tasks/care-sad.webp',      during: '/tasks/care-petting.webp',    after: '/tasks/care-happy.webp' },
  jardines:   { before: '/tasks/find-hidden.webp',   during: '/tasks/find-moving.webp',     after: '/tasks/find-found.webp' },
}

// Derive hotspot IDs for a zone from positions.json
function getZoneHotspotIds(zoneId: string): string[] {
  return Object.keys(positionsJson).filter((key) => {
    const entry = (positionsJson as Record<string, { type: string; zone?: string }>)[key]
    return entry.type === 'hotspot' && entry.zone === zoneId
  })
}

// Save progress to Supabase (best-effort, non-blocking)
async function syncToSupabase(
  anonymousId: string,
  characterId: string,
  hearts: number,
  level: number,
  missionsCompleted: string[],
  hotspotsCompleted: Record<string, string[]>
) {
  await supabase.from('player_progress').upsert(
    {
      anonymous_id: anonymousId,
      character_id: characterId,
      hearts,
      level,
      missions_completed: missionsCompleted,
      hotspots_completed: hotspotsCompleted,
      updated_at: new Date().toISOString(),
    },
    { onConflict: 'anonymous_id' }
  )
}

export default function ZoneInterior() {
  const { zoneId } = useParams<{ zoneId: string }>()
  const navigate = useNavigate()
  const isMobile = useIsMobile()
  const viewport = isMobile ? 'mobile' : 'desktop'

  const { getCoords, loading: posLoading } = usePositions()
  const {
    anonymousId, characterId, hearts, level,
    missionsCompleted, hotspotsCompleted,
    addHearts, markHotspotDone, completeMission,
  } = useGameStore()

  const zone = zonesData.find((z) => z.id === zoneId)
  const hotspotIds = zoneId ? getZoneHotspotIds(zoneId) : []

  // Hotspot states: derive from store
  const [hotspotStates, setHotspotStates] = useState<Record<string, HotspotState>>(() => {
    const done = hotspotsCompleted[zoneId ?? ''] ?? []
    return Object.fromEntries(hotspotIds.map((id) => [id, done.includes(id) ? 'done' : 'pending']))
  })

  // Re-sync when store loads (in case of reload)
  useEffect(() => {
    if (!zoneId) return
    const done = hotspotsCompleted[zoneId] ?? []
    setHotspotStates(
      Object.fromEntries(hotspotIds.map((id) => [id, done.includes(id) ? 'done' : 'pending']))
    )
  }, [zoneId, hotspotsCompleted])

  const [heartsTrigger, setHeartsTrigger] = useState(false)
  const [lastHearts, setLastHearts] = useState(0)
  const [showMissionComplete, setShowMissionComplete] = useState(false)
  const [heartsEarned, setHeartsEarned] = useState(0)
  const [missionNewMedals, setMissionNewMedals] = useState<string[]>([])
  const [missionCatGains, setMissionCatGains] = useState<Array<{ catId: string; newTrust: number; bioUnlocked: boolean }>>([])

  // Zone-to-cats mapping (mirrors gameStore)
  const ZONE_CATS: Record<string, string[]> = {
    zona_relax: ['gandalf'], comedor: ['tito'],
    jardines: ['vainilla'], enfermeria: ['pepe'],
    catio2: ['sombra', 'frida'],
  }

  const spawnId = `${zoneId}_spawn`
  const spawnCoords = getCoords(spawnId, viewport)
  const { position, direction, isMoving, duration, moveTo } = useCharacterMovement(spawnCoords)

  // Redirect if not a valid/playable zone
  useEffect(() => {
    if (!zone || !zone.playable) navigate('/map', { replace: true })
  }, [zone])

  const handleHotspotClick = useCallback((hotspotId: string) => {
    if (hotspotStates[hotspotId] !== 'pending') return
    const coords = getCoords(hotspotId, viewport)

    moveTo(coords.x, coords.y, () => {
      // Arrived → start task
      setHotspotStates((prev) => ({ ...prev, [hotspotId]: 'in_progress' }))

      // Task animation: 3.5s placeholder
      setTimeout(() => {
        const reward = Math.round((zone?.mission?.reward_hearts ?? 20) / hotspotIds.length)
        setLastHearts(reward)
        setHeartsTrigger(true)

        setHotspotStates((prev) => ({ ...prev, [hotspotId]: 'done' }))
        addHearts(reward)
        if (zoneId) markHotspotDone(zoneId, hotspotId)

        // Check all done
        setHotspotStates((prev) => {
          const updated: Record<string, HotspotState> = { ...prev, [hotspotId]: 'done' }
          const allDone = Object.values(updated).every((s) => s === 'done')
          if (allDone && zoneId) {
            const totalReward = zone?.mission?.reward_hearts ?? 20
            setHeartsEarned(totalReward)

            // Snapshot before completeMission mutates the store
            const prevMedals = useGameStore.getState().medals
            const prevBios = useGameStore.getState().biosUnlocked
            const prevTrust = { ...useGameStore.getState().catTrust }

            completeMission(zoneId)

            // Compute what changed
            const nextMedals = useGameStore.getState().medals
            const nextBios = useGameStore.getState().biosUnlocked
            const nextTrust = useGameStore.getState().catTrust
            setMissionNewMedals(nextMedals.filter((m) => !prevMedals.includes(m)))

            const gains = (ZONE_CATS[zoneId] ?? []).map((catId) => ({
              catId,
              newTrust: nextTrust[catId] ?? 0,
              bioUnlocked: !prevBios.includes(catId) && nextBios.includes(catId),
            })).filter(({ newTrust }) => newTrust > (prevTrust[newTrust] ?? 0) || true)
            setMissionCatGains(gains)

            setTimeout(() => setShowMissionComplete(true), 800)
          }
          return updated
        })

        // Persist to Supabase
        if (zoneId && characterId) {
          const updatedDone = { ...hotspotsCompleted, [zoneId]: [...(hotspotsCompleted[zoneId] ?? []), hotspotId] }
          syncToSupabase(anonymousId, characterId, hearts + reward, level, missionsCompleted, updatedDone)
        }
      }, 3500)
    })
  }, [hotspotStates, viewport, getCoords, moveTo, zone, hotspotIds, zoneId, addHearts, markHotspotDone, completeMission, characterId, anonymousId, hearts, level, missionsCompleted, hotspotsCompleted])

  if (!zone || !characterId) return null

  const interiorSrc = isMobile
    ? (zone as any).interiorImageMobile
    : (zone as any).interiorImageDesktop

  const pendingCount = Object.values(hotspotStates).filter((s) => s === 'pending').length

  return (
    <div className="flex flex-col min-h-dvh bg-[#1A1008] overflow-hidden">
      <Hud />

      <div className="flex-1 mt-14 overflow-y-auto overflow-x-hidden">
        <div className="relative w-full">
          {/* Interior image */}
          {posLoading ? (
            <div className="flex items-center justify-center h-64 text-white/50">Cargando...</div>
          ) : (
            <>
              <img
                src={interiorSrc}
                alt={zone.name}
                className="w-full block object-cover"
                draggable={false}
              />

              {/* Hotspots */}
              {hotspotIds.map((hid) => {
                const coords = getCoords(hid as PosKey, viewport)
                const entry = (positionsJson as Record<string, { label: string }>)[hid]
                const taskImages = ZONE_TASK_IMAGES[zoneId ?? ''] ?? {
                  before: '/tasks/litter-dirty.webp',
                  during: '/tasks/litter-cleaning.webp',
                  after: '/tasks/litter-clean.webp',
                }
                return (
                  <Hotspot
                    key={hid}
                    x={coords.x}
                    y={coords.y}
                    label={entry?.label ?? hid}
                    state={hotspotStates[hid] ?? 'pending'}
                    taskImages={taskImages}
                    onClick={() => handleHotspotClick(hid)}
                  />
                )
              })}

              {/* Character */}
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
            </>
          )}
        </div>
      </div>

      {/* Botón salir */}
      <button
        onClick={() => navigate('/map')}
        className="fixed top-16 left-4 z-30 flex items-center gap-1.5 rounded-full bg-[#3D2E1F]/80 px-4 py-2 text-sm font-bold text-white shadow-lg backdrop-blur-sm active:scale-95 transition-transform"
      >
        ← Salir
      </button>

      {/* Contador de tareas pendientes */}
      <div className="fixed top-16 right-4 z-30 rounded-full bg-[#3D2E1F]/80 px-3 py-2 text-xs font-bold text-white shadow backdrop-blur-sm">
        {pendingCount} pendiente{pendingCount !== 1 ? 's' : ''}
      </div>

      {/* Título de zona */}
      <div className="fixed bottom-4 left-1/2 -translate-x-1/2 z-30 rounded-full bg-[#F5EBD8]/95 px-5 py-2 shadow-lg">
        <span className="text-sm font-bold text-[#3D2E1F]">{zone.name}</span>
        {(zone as any).mission && (
          <span className="ml-2 text-xs text-[#E07856] font-semibold">— {(zone as any).mission.title}</span>
        )}
      </div>

      {/* Corazones flotantes */}
      <FloatingHearts
        amount={lastHearts}
        trigger={heartsTrigger}
        onDone={() => setHeartsTrigger(false)}
      />

      {/* Misión completada */}
      {showMissionComplete && (
        <MissionComplete
          zoneName={zone.name}
          heartsEarned={heartsEarned}
          level={level}
          newMedals={missionNewMedals}
          catGains={missionCatGains}
          onContinue={() => navigate('/map')}
        />
      )}
    </div>
  )
}
