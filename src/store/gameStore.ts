import { create } from 'zustand'
import { persist } from 'zustand/middleware'

type CharacterId = 'volunteer_f' | 'volunteer_m' | 'volunteer_n'

interface GameState {
  anonymousId: string
  characterId: CharacterId | null
  hearts: number
  level: number
  missionsCompleted: string[]
  // zoneId → array of completed hotspot IDs
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
          if (!medals.includes('primer_cuidado')) medals.push('primer_cuidado')
          return {
            hotspotsCompleted: { ...s.hotspotsCompleted, [zoneId]: [...prev, hotspotId] },
            medals,
          }
        }),

      completeMission: (zoneId) =>
        set((s) => {
          const missions = s.missionsCompleted.includes(zoneId)
            ? s.missionsCompleted
            : [...s.missionsCompleted, zoneId]
          const medals = [...s.medals]
          if (!medals.includes('cuidador_atento')) medals.push('cuidador_atento')
          return { missionsCompleted: missions, medals }
        }),

      completeTurn: () =>
        set((s) => {
          const medals = [...s.medals]
          if (!medals.includes('turno_completo')) medals.push('turno_completo')
          return {
            turnsCompleted: s.turnsCompleted + 1,
            missionsCompleted: [],
            hotspotsCompleted: {},
            medals,
          }
        }),

      unlockBio: (catId) =>
        set((s) => {
          const bios = s.biosUnlocked.includes(catId)
            ? s.biosUnlocked
            : [...s.biosUnlocked, catId]
          const allCats = ['gandalf', 'tito', 'vainilla', 'pepe', 'sombra', 'frida']
          const medals = [...s.medals]
          if (allCats.every((c) => bios.includes(c)) && !medals.includes('guardian')) {
            medals.push('guardian')
          }
          return { biosUnlocked: bios, medals }
        }),

      increaseCatTrust: (catId) =>
        set((s) => {
          const current = s.catTrust[catId] ?? 0
          const newTrust = Math.min(current + 1, 5)
          const catTrust = { ...s.catTrust, [catId]: newTrust }
          let biosUnlocked = [...s.biosUnlocked]
          if (newTrust >= 5 && !biosUnlocked.includes(catId)) {
            biosUnlocked.push(catId)
          }
          return { catTrust, biosUnlocked }
        }),
    }),
    { name: 'guardianes-game' }
  )
)
