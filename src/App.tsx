import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'

import Splash from './pages/Splash'
import CharacterSelect from './pages/CharacterSelect'
import Map from './pages/Map'
import ZoneInterior from './pages/ZoneInterior'
import TurnEnd from './pages/TurnEnd'
import AdminEditor from './pages/AdminEditor'

const EDITOR_ENABLED = import.meta.env.VITE_EDITOR_ENABLED === 'true'

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Splash />} />
        <Route path="/select" element={<CharacterSelect />} />
        <Route path="/map" element={<Map />} />
        <Route path="/zone/:zoneId" element={<ZoneInterior />} />
        <Route path="/end" element={<TurnEnd />} />
        {EDITOR_ENABLED && (
          <Route path="/admin-vega-cats-editor" element={<AdminEditor />} />
        )}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  )
}
