import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'

// Pages (stubs — se desarrollan en fases posteriores)
import Splash from './pages/Splash'
import CharacterSelect from './pages/CharacterSelect'
import Map from './pages/Map'
import ZoneInterior from './pages/ZoneInterior'
import TurnEnd from './pages/TurnEnd'

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Splash />} />
        <Route path="/select" element={<CharacterSelect />} />
        <Route path="/map" element={<Map />} />
        <Route path="/zone/:zoneId" element={<ZoneInterior />} />
        <Route path="/end" element={<TurnEnd />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  )
}
