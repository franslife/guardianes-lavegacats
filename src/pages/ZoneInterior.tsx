import { useState, useEffect, useCallback } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { useGameStore } from '../store/gameStore'
import { usePositions } from '../hooks/usePositions'
import { useCharacterMovement } from '../hooks/useCharacterMovement'
import { supabase } from '../lib/supabase'
import Character from '../components/game/Character'
import Hotspot, { type HotspotState } from '../components/game/Hotspot'
import TaskModal, { type TaskImages } from '../components/game/TaskModal'
import MissionComplete from '../components/ui/MissionComplete'
import Hud from '../components/ui/Hud'
import zonesData from '../data/zones.json'
import positionsJson from '../data/positions.json'

type PosKey = keyof typeof positionsJson

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
  catio2:     { before: '/tasks/litter-dirty.png',  during: '/tasks/litter-cleaning.png', after: '/tasks/litter-clean.png' },
  comedor:    { before: '/tasks/feed-empty.png',    during: '/tasks/feed-pouring.png',    after: '/tasks/feed-full.png' },
  zona_relax: { before: '/tasks/water-murky.png',   during: '/tasks/water-refilling.png', after: '/tasks/water-clean.png' },
  enfermeria: { before: '/tasks/care-sad.png',      during: '/tasks/care-petting.png',    after: '/tasks/care-happy.png' },
  jardines:   { before: '/tasks/find-hidden.png',   during: '/tasks/find-moving.png',     after: '/tasks/find-found.png' },
}

const ZONE_NARRATION_KEYS: Record<string, string> = {
  catio2:     'clean_litter',
  comedor:    'feed',
  zona_relax: 'give_water',
  enfermeria: 'care',
  jardines:   'find',
}

const ZONE_TASK_TITLES: Record<string, string> = {
  catio2:     'Limpia los areneros',
  comedor:    'Alimenta a los gatos',
  zona_relax: 'Rellena los bebederos',
  enfermeria: 'Dale mimos a este gato',
  jardines:   'Encuentra al gato escondido',
}

const ZONE_CATS: Record<string, string[]> = {
  zona_relax: ['gandalf'], comedor: ['tito'],
  jardines: ['vainilla'], enfermeria: ['pepe'],
  catio2: ['sombra', 'frida'],
}

function getZoneHotspotIds(zoneId: string): string[] {
  return Object.keys(positionsJson).filter((key) => {
    const entry = (positionsJson as Record<string, { type: string; zone?: string }>)[key]
    return entry.type === 'hotspot' && entry.zone === zoneId
  })
}

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

interface ActiveTask {
  hotspotId: string
  reward: number
}

export default function ZoneInterior() {
  const { zoneId } = useParams<{ zoneId: string }>()
  const navigate = useNavigate()
  const isMobile = useIsMobile()
  const viewport = isMobile ? 'mobile' : 'desktop'

  const { getCoords, loading: posLoading } = usePositions()
  const {
    anonymousId, characterId, hearts, level,
    missionsCompleted, hotspotsCompleted, unlockedZones,
    addHearts, markHotspotDone, completeMission,
  } = useGameStore()

  const zone = zonesData.find((z) => z.id === zoneId)
  const hotspotIds = zoneId ? getZoneHotspotIds(zoneId) : []

  const [hotspotStates, setHotspotStates] = useState<Record<string, HotspotState>>(() => {
    const done = hotspotsCompleted[zoneId ?? ''] ?? []
    return Object.fromEntries(hotspotIds.map((id) => [id, done.includes(id) ? 'done' : 'pending']))
  })

  useEffect(() => {
    if (!zoneId) return
    const done = hotspotsCompleted[zoneId] ?? []
    setHotspotStates(
      Object.fromEntries(hotspotIds.map((id) => [id, done.includes(id) ? 'done' : 'pending']))
    )
  }, [zoneId, hotspotsCompleted])

  const [activeTask, setActiveTask] = useState<ActiveTask | null>(null)
  const [showMissionComplete, setShowMissionComplete] = useState(false)
  const [heartsEarned, setHeartsEarned] = useState(0)
  const [missionNewMedals, setMissionNewMedals] = useState<string[]>([])
  const [missionCatGains, setMissionCatGains] = useState<Array<{ catId: string; newTrust: number; bioUnlocked: boolean }>>([])

  const spawnId = `${zoneId}_spawn`
  const spawnCoords = getCoords(spawnId, viewport)
  const { position, direction, isMoving, duration, moveTo } = useCharacterMovement(spawnCoords)

  const [isLastMission, setIsLastMission] = useState(false)

  useEffect(() => {
    if (!zone || !zone.playable) { navigate('/map', { replace: true }); return }
    if (zoneId && !unlockedZones.includes(zoneId)) navigate('/map', { replace: true })
  }, [zone, unlockedZones])

  const handleTaskComplete = useCallback((hotspotId: string, reward: number) => {
    setActiveTask(null)
    setHotspotStates((prev) => ({ ...prev, [hotspotId]: 'done' }))
    addHearts(reward)
    if (zoneId) markHotspotDone(zoneId, hotspotId)

    // Persist and check mission complete
    setHotspotStates((prev) => {
      const updated: Record<string, HotspotState> = { ...prev, [hotspotId]: 'done' }
      const allDone = Object.values(updated).every((s) => s === 'done')
      if (allDone && zoneId) {
        const totalReward = zone?.mission?.reward_hearts ?? 20
        setHeartsEarned(totalReward)

        const prevMedals = useGameStore.getState().medals
        const prevBios = useGameStore.getState().biosUnlocked

        completeMission(zoneId)

        const completedAfter = useGameStore.getState().missionsCompleted
        if (completedAfter.length >= 5) setIsLastMission(true)

        const nextMedals = useGameStore.getState().medals
        const nextBios = useGameStore.getState().biosUnlocked
        const nextTrust = useGameStore.getState().catTrust

        setMissionNewMedals(nextMedals.filter((m) => !prevMedals.includes(m)))
        setMissionCatGains(
          (ZONE_CATS[zoneId] ?? []).map((catId) => ({
            catId,
            newTrust: nextTrust[catId] ?? 0,
            bioUnlocked: !prevBios.includes(catId) && nextBios.includes(catId),
          }))
        )

        setTimeout(() => setShowMissionComplete(true), 400)
      }
      return updated
    })

    if (zoneId && characterId) {
      const updatedDone = {
        ...hotspotsCompleted,
        [zoneId]: [...(hotspotsCompleted[zoneId] ?? []), hotspotId],
      }
      syncToSupabase(anonymousId, characterId, hearts + reward, level, missionsCompleted, updatedDone)
    }
  }, [zoneId, addHearts, markHotspotDone, completeMission, characterId, anonymousId, hearts, level, missionsCompleted, hotspotsCompleted, zone])

  const handleHotspotClick = useCallback((hotspotId: string) => {
    if (hotspotStates[hotspotId] !== 'pending') return
    const coords = getCoords(hotspotId, viewport)

    // Walk slightly above the hotspot so character doesn't cover it completely
    const targetY = Math.max(0.05, coords.y - 0.06)

    moveTo(coords.x, targetY, () => {
      const reward = Math.round((zone?.mission?.reward_hearts ?? 20) / hotspotIds.length)
      setHotspotStates((prev) => ({ ...prev, [hotspotId]: 'in_progress' }))
      setActiveTask({ hotspotId, reward })
    })
  }, [hotspotStates, viewport, getCoords, moveTo, zone, hotspotIds])

  if (!zone || !characterId) return null

  const interiorSrc = isMobile
    ? (zone as any).interiorImageMobile
    : (zone as any).interiorImageDesktop

  const taskImages = ZONE_TASK_IMAGES[zoneId ?? ''] ?? ZONE_TASK_IMAGES.catio2
  const taskTitle = ZONE_TASK_TITLES[zoneId ?? ''] ?? ''
  const isLongTask = zoneId === 'enfermeria'
  const pendingCount = Object.values(hotspotStates).filter((s) => s === 'pending').length

  return (
    <div className="flex flex-col min-h-dvh bg-[#1A1008] overflow-hidden">
      <Hud />

      <div className="flex-1 mt-14 overflow-y-auto overflow-x-hidden">
        <div className="relative w-full">
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

              {hotspotIds.map((hid) => {
                const coords = getCoords(hid as PosKey, viewport)
                return (
                  <Hotspot
                    key={hid}
                    x={coords.x}
                    y={coords.y}
                    state={hotspotStates[hid] ?? 'pending'}
                    onClick={() => handleHotspotClick(hid)}
                  />
                )
              })}

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
                  size={isMobile ? 72 : 88}
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

      {/* Task modal */}
      {activeTask && (
        <TaskModal
          images={taskImages}
          title={taskTitle}
          reward={activeTask.reward}
          longTask={isLongTask}
          narrationKey={ZONE_NARRATION_KEYS[zoneId ?? '']}
          onComplete={() => handleTaskComplete(activeTask.hotspotId, activeTask.reward)}
          onClose={() => {
            // Early close: mark as done immediately
            handleTaskComplete(activeTask.hotspotId, activeTask.reward)
          }}
        />
      )}

      {/* Misión completada */}
      {showMissionComplete && (
        <MissionComplete
          zoneName={zone.name}
          heartsEarned={heartsEarned}
          level={level}
          newMedals={missionNewMedals}
          catGains={missionCatGains}
          onContinue={() => navigate(isLastMission ? '/end' : '/map')}
        />
      )}
    </div>
  )
}
