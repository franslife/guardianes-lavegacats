import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { useGameStore } from './store/gameStore'
import { ROUTES } from './lib/routes'

import Splash          from './pages/Splash'
import CharacterSelect from './pages/CharacterSelect'
import Map             from './pages/Map'
import ZoneInterior    from './pages/ZoneInterior'
import TurnEnd         from './pages/TurnEnd'
import AdminEditor     from './pages/AdminEditor'

const EDITOR_ENABLED = import.meta.env.VITE_EDITOR_ENABLED === 'true'

// ── Guards ────────────────────────────────────────────────────────────────
// Synchronous check before child renders → zero flicker

function GuardSelect({ children }: { children: React.ReactNode }) {
  const characterId = useGameStore((s) => s.characterId)
  if (characterId) return <Navigate to={ROUTES.map} replace />
  return <>{children}</>
}

function GuardMap({ children }: { children: React.ReactNode }) {
  const characterId = useGameStore((s) => s.characterId)
  if (!characterId) return <Navigate to={ROUTES.select} replace />
  return <>{children}</>
}

function GuardEnd({ children }: { children: React.ReactNode }) {
  const characterId       = useGameStore((s) => s.characterId)
  const missionsCompleted = useGameStore((s) => s.missionsCompleted)
  if (!characterId)            return <Navigate to={ROUTES.select} replace />
  if (missionsCompleted.length < 5) return <Navigate to={ROUTES.map} replace />
  return <>{children}</>
}

// ── App ───────────────────────────────────────────────────────────────────

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path={ROUTES.splash} element={<Splash />} />

        <Route
          path={ROUTES.select}
          element={<GuardSelect><CharacterSelect /></GuardSelect>}
        />
        <Route
          path={ROUTES.map}
          element={<GuardMap><Map /></GuardMap>}
        />
        {/* Zone slug: /z/01 … /z/05 */}
        <Route
          path="/z/:slug"
          element={<GuardMap><ZoneInterior /></GuardMap>}
        />
        <Route
          path={ROUTES.end}
          element={<GuardEnd><TurnEnd /></GuardEnd>}
        />

        {/* Legacy redirects — keep old URLs working */}
        <Route path="/select"        element={<Navigate to={ROUTES.select} replace />} />
        <Route path="/map"           element={<Navigate to={ROUTES.map}    replace />} />
        <Route path="/zone/:zoneId"  element={<Navigate to={ROUTES.map}    replace />} />
        <Route path="/turn-end"      element={<Navigate to={ROUTES.end}    replace />} />

        {EDITOR_ENABLED && (
          <Route path={ROUTES.admin} element={<AdminEditor />} />
        )}

        <Route path="*" element={<Navigate to={ROUTES.splash} replace />} />
      </Routes>
    </BrowserRouter>
  )
}
