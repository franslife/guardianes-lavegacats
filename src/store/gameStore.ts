import { create } from 'zustand'
import { useNotifStore } from './notifStore'
import levelsData from '../data/levels.json'

type CharacterId = 'volunteer_f' | 'volunteer_m' | 'volunteer_n'

const ZONE_CATS: Record<string, string[]> = {
  zona_relax: ['gandalf'],
  comedor:    ['tito'],
  jardines:   ['vainilla'],
  enfermeria: ['pepe'],
  catio2:     ['sombra', 'frida'],
}

const ALL_CATS = ['gandalf', 'tito', 'vainilla', 'pepe', 'sombra', 'frida']

// Which zone unlocks after completing each playable zone
const UNLOCK_CHAIN: Record<string, string> = {
  comedor:    'catio2',
  catio2:     'zona_relax',
  zona_relax: 'jardines',
  jardines:   'enfermeria',
  // enfermeria has no successor → end of turn
}

function getSessionId(): string {
  const key = 'guardianes-session-id'
  const existing = sessionStorage.getItem(key)
  if (existing) return existing
  const fresh = crypto.randomUUID()
  sessionStorage.setItem(key, fresh)
  return fresh
}

function levelFromMissions(count: number): number {
  return Math.min(count + 1, 6)
}

const INITIAL_STATE = {
  anonymousId:       getSessionId(),
  characterId:       null as CharacterId | null,
  hearts:            0,
  level:             1,
  missionsCompleted: [] as string[],
  hotspotsCompleted: {} as Record<string, string[]>,
  turnsCompleted:    0,
  medals:            [] as string[],
  catTrust:          {} as Record<string, number>,
  biosUnlocked:      [] as string[],
  unlockedZones:     ['comedor'] as string[],
  justUnlockedZone:  null as string | null,
}

interface GameState {
  anonymousId:       string
  characterId:       CharacterId | null
  hearts:            number
  level:             number
  missionsCompleted: string[]
  hotspotsCompleted: Record<string, string[]>
  turnsCompleted:    number
  medals:            string[]
  catTrust:          Record<string, number>
  biosUnlocked:      string[]
  unlockedZones:     string[]
  justUnlockedZone:  string | null

  setCharacter:       (id: CharacterId) => void
  addHearts:          (amount: number) => void
  markHotspotDone:    (zoneId: string, hotspotId: string) => void
  completeMission:    (zoneId: string) => void
  completeTurn:       () => void
  unlockBio:          (catId: string) => void
  increaseCatTrust:   (catId: string) => void
  clearJustUnlocked:  () => void
  resetSession:       () => void
}

export const useGameStore = create<GameState>()((set) => ({
  ...INITIAL_STATE,

  setCharacter: (id) => set({ characterId: id }),

  addHearts: (amount) =>
    set((s) => ({ hearts: s.hearts + amount })),

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

      const missions    = [...s.missionsCompleted, zoneId]
      const newLevel    = levelFromMissions(missions.length)
      const medals      = [...s.medals]
      const catTrust    = { ...s.catTrust }
      let   biosUnlocked = [...s.biosUnlocked]

      // Medal: first zone completion
      if (!medals.includes('cuidador_atento')) {
        medals.push('cuidador_atento')
        useNotifStore.getState().push({ type: 'medal', id: 'cuidador_atento' })
      }

      // Level-up toast (not for level 6 — that's celebrated in TurnEnd)
      if (newLevel < 6) {
        const lvlData = levelsData.find((l) => l.level === newLevel)
        if (lvlData) {
          useNotifStore.getState().push({ type: 'levelup', level: newLevel, name: lvlData.name })
        }
      }

      // Cat trust
      for (const catId of ZONE_CATS[zoneId] ?? []) {
        const current  = catTrust[catId] ?? 0
        const newTrust = Math.min(current + 1, 5)
        catTrust[catId] = newTrust

        if (newTrust >= 5 && !biosUnlocked.includes(catId)) {
          biosUnlocked.push(catId)
          useNotifStore.getState().push({ type: 'bio', catId })

          if (ALL_CATS.every((c) => biosUnlocked.includes(c)) && !medals.includes('guardian')) {
            medals.push('guardian')
            useNotifStore.getState().push({ type: 'medal', id: 'guardian' })
          }
        }
      }

      // Zone unlock chain
      const nextZone        = UNLOCK_CHAIN[zoneId]
      const unlockedZones   = nextZone
        ? [...new Set([...s.unlockedZones, nextZone])]
        : [...s.unlockedZones]
      const justUnlockedZone = nextZone ?? null

      return {
        missionsCompleted: missions,
        level:             newLevel,
        medals,
        catTrust,
        biosUnlocked,
        unlockedZones,
        justUnlockedZone,
      }
    }),

  completeTurn: () =>
    set((s) => {
      const medals = [...s.medals]
      if (!medals.includes('turno_completo')) {
        medals.push('turno_completo')
        useNotifStore.getState().push({ type: 'medal', id: 'turno_completo' })
      }
      return {
        turnsCompleted:    s.turnsCompleted + 1,
        missionsCompleted: [],
        hotspotsCompleted: {},
        medals,
      }
    }),

  unlockBio: (catId) =>
    set((s) => {
      if (s.biosUnlocked.includes(catId)) return {}
      const biosUnlocked = [...s.biosUnlocked, catId]
      const medals       = [...s.medals]
      if (ALL_CATS.every((c) => biosUnlocked.includes(c)) && !medals.includes('guardian')) {
        medals.push('guardian')
        useNotifStore.getState().push({ type: 'medal', id: 'guardian' })
      }
      return { biosUnlocked, medals }
    }),

  increaseCatTrust: (catId) =>
    set((s) => {
      const current  = s.catTrust[catId] ?? 0
      const newTrust = Math.min(current + 1, 5)
      const catTrust = { ...s.catTrust, [catId]: newTrust }
      let biosUnlocked = [...s.biosUnlocked]
      if (newTrust >= 5 && !biosUnlocked.includes(catId)) {
        biosUnlocked.push(catId)
        useNotifStore.getState().push({ type: 'bio', catId })
      }
      return { catTrust, biosUnlocked }
    }),

  clearJustUnlocked: () => set({ justUnlockedZone: null }),

  resetSession: () => {
    sessionStorage.removeItem('guardianes-session-id')
    useNotifStore.getState().clear()
    set({ ...INITIAL_STATE, anonymousId: getSessionId() })
  },
}))
