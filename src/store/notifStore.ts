import { create } from 'zustand'

export type Notif =
  | { type: 'medal'; id: string }
  | { type: 'bio'; catId: string }

interface NotifState {
  queue: Notif[]
  push: (n: Notif) => void
  shift: () => void
  clear: () => void
}

export const useNotifStore = create<NotifState>((set) => ({
  queue: [],
  push: (n) => set((s) => ({ queue: [...s.queue, n] })),
  shift: () => set((s) => ({ queue: s.queue.slice(1) })),
  clear: () => set({ queue: [] }),
}))
