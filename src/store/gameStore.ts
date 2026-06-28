import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { useNotifStore } from './notifStore'

type CharacterId = 'volunteer_f' | 'volunteer_m' | 'volunteer_n'

// Which cats gain trust when a zone mission is completed
const ZONE_CATS: Record<string, string[]> = {
  zona_relax: ['gandalf'],
  comedor: ['tito'],
  jardines: ['vainilla'],
  enfermeria: ['pepe'],
  catio2: ['sombra', 'frida'],
}

const ALL_CATS = ['gandalf', 'tito', 'vainilla', 'pepe', 'sombra', 'frida']

interface GameState {
  anonymousId: string
  characterId: CharacterId | null
  hearts: number
  level: number
  missionsCompleted: string[]
  hotspotsCompleted: Record<string, string[]>
  turnsCompleted: number
  medals: string[]
  catTrust: Record<string, number>
  biosUnlocked: string[]

  setCharacter: (id: CharacterId) => void
  addHearts: (amount: number) => void
  markHotspotDone: (zoneId: string, hotspotId: string) => void
  completeMission: (zoneId: string) => void
  completeTurn: () => void
  unlockBio: (catId: string) => void
  increaseCatTrust: (catId: string) => void
}

function calcLevel(hearts: number): number {
  if (hearts >= 800) return 5
  if (hearts >= 400) return 4
  if (hearts >= 150) return 3
  if (hearts >= 50) return 2
  return 1
}

export const useGameStore = create<GameState>()(
  persist(
    (set) => ({
      anonymousId: crypto.randomUUID(),
      characterId: null,
      hearts: 0,
      level: 1,
      missionsCompleted: [],
      hotspotsCompleted: {},
      turnsCompleted: 0,
      medals: [],
      catTrust: {},
      biosUnlocked: [],

      setCharacter: (id) => set({ characterId: id }),

      addHearts: (amount) =>
        set((s) => {
          const newHearts = s.hearts + amount
          return { hearts: newHearts, level: calcLevel(newHearts) }
        }),

      markHotspotDone: (zoneId, hotspotId) =>
        set((s) => {
          const prev = s.hotspotsCompleted[zoneId] ?? []
          if (prev.includes(hotspotId)) return {}
          const medals = [...s.medals]
          if (!medals.includes('primer_cuidado')) {
            medals.push('primer_cuidado')
            useNotifStore.getState().push({ type: 'medal', id: 'primer_cuidado' })
          }
          return {
            hotspotsCompleted: { ...s.hotspotsCompleted, [zoneId]: [...prev, hotspotId] },
            medals,
          }
        }),

      completeMission: (zoneId) =>
        set((s) => {
          if (s.missionsCompleted.includes(zoneId)) return {}

          const missions = [...s.missionsCompleted, zoneId]
          const medals = [...s.medals]

          if (!medals.includes('cuidador_atento')) {
            medals.push('cuidador_atento')
            useNotifStore.getState().push({ type: 'medal', id: 'cuidador_atento' })
          }

          // Cat trust
          const catTrust = { ...s.catTrust }
          let biosUnlocked = [...s.biosUnlocked]

          for (const catId of ZONE_CATS[zoneId] ?? []) {
            const current = catTrust[catId] ?? 0
            const newTrust = Math.min(current + 1, 5)
            catTrust[catId] = newTrust

            if (newTrust >= 5 && !biosUnlocked.includes(catId)) {
              biosUnlocked.push(catId)
              useNotifStore.getState().push({ type: 'bio', catId })

              // Guardian medal: all bios unlocked
              if (ALL_CATS.every((c) => biosUnlocked.includes(c)) && !medals.includes('guardian')) {
                medals.push('guardian')
                useNotifStore.getState().push({ type: 'medal', id: 'guardian' })
              }
            }
          }

          return { missionsCompleted: missions, medals, catTrust, biosUnlocked }
        }),

      completeTurn: () =>
        set((s) => {
          const medals = [...s.medals]
          if (!medals.includes('turno_completo')) {
            medals.push('turno_completo')
            useNotifStore.getState().push({ type: 'medal', id: 'turno_completo' })
          }
          return {
            turnsCompleted: s.turnsCompleted + 1,
            missionsCompleted: [],
            hotspotsCompleted: {},
            medals,
          }
        }),

      unlockBio: (catId) =>
        set((s) => {
          if (s.biosUnlocked.includes(catId)) return {}
          const biosUnlocked = [...s.biosUnlocked, catId]
          const medals = [...s.medals]
          if (ALL_CATS.every((c) => biosUnlocked.includes(c)) && !medals.includes('guardian')) {
            medals.push('guardian')
            useNotifStore.getState().push({ type: 'medal', id: 'guardian' })
          }
          return { biosUnlocked, medals }
        }),

      increaseCatTrust: (catId) =>
        set((s) => {
          const current = s.catTrust[catId] ?? 0
          const newTrust = Math.min(current + 1, 5)
          const catTrust = { ...s.catTrust, [catId]: newTrust }
          let biosUnlocked = [...s.biosUnlocked]
          if (newTrust >= 5 && !biosUnlocked.includes(catId)) {
            biosUnlocked.push(catId)
            useNotifStore.getState().push({ type: 'bio', catId })
          }
          return { catTrust, biosUnlocked }
        }),
    }),
    { name: 'guardianes-game' }
  )
)
