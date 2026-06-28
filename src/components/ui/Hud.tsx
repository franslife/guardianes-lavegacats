import { useState } from 'react'
import { useGameStore } from '../../store/gameStore'
import NotifToast from './NotifToast'
import SideMenu from './SideMenu'

const LEVEL_NAMES = ['', 'Visitante curioso', 'Voluntario novato', 'Aprendiz', 'Cuidador', 'Guardián']
const LEVEL_THRESHOLDS = [0, 50, 150, 400, 800]

const CHAR_AVATAR: Record<string, string> = {
  volunteer_f: '/characters/volunteer-f-front.png',
  volunteer_m: '/characters/volunteer-m-front.png',
  volunteer_n: '/characters/volunteer-n-front.png',
}

function levelProgress(hearts: number, level: number): number {
  if (level >= 5) return 1
  const from = LEVEL_THRESHOLDS[level - 1]
  const to = LEVEL_THRESHOLDS[level]
  return Math.min(1, (hearts - from) / (to - from))
}

export default function Hud() {
  const { hearts, level, characterId } = useGameStore()
  const [menuOpen, setMenuOpen] = useState(false)
  const progress = levelProgress(hearts, level)
  const avatarSrc = characterId ? CHAR_AVATAR[characterId] : null

  return (
    <>
      <div className="fixed top-0 left-0 right-0 z-30 bg-[#F5EBD8]/95 backdrop-blur-sm border-b border-[#3D2E1F]/10 shadow-sm">
        <div className="flex items-center gap-3 px-3 py-2">
          <div className="h-9 w-9 flex-shrink-0 overflow-hidden rounded-full ring-2 ring-[#E07856]/60 bg-[#3D2E1F]/10">
            {avatarSrc && (
              <img src={avatarSrc} alt="personaje" className="h-full w-full object-cover object-top scale-125 translate-y-1" />
            )}
          </div>

          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between mb-0.5">
              <span className="text-[11px] font-bold text-[#7BA577] truncate">{LEVEL_NAMES[level]}</span>
              <span className="text-[10px] text-[#3D2E1F]/40 font-semibold ml-1 flex-shrink-0">Nv.{level}</span>
            </div>
            <div className="h-1.5 w-full rounded-full bg-[#3D2E1F]/10 overflow-hidden">
              <div
                className="h-full rounded-full bg-gradient-to-r from-[#7BA577] to-[#E07856] transition-all duration-700"
                style={{ width: progress * 100 + '%' }}
              />
            </div>
          </div>

          <div className="flex items-center gap-1 flex-shrink-0">
            <img src="/ui/heart.png" alt="" className="w-5 h-5" />
            <span className="font-extrabold text-[#E07856] text-sm">{hearts}</span>
          </div>

          <button
            onClick={() => setMenuOpen(true)}
            className="flex-shrink-0 h-9 w-9 flex items-center justify-center rounded-full bg-[#3D2E1F]/10 text-[#3D2E1F] text-lg font-bold active:scale-90 transition-transform"
            aria-label="Menú"
          >
            ☰
          </button>
        </div>
      </div>

      <NotifToast />
      {menuOpen && <SideMenu onClose={() => setMenuOpen(false)} />}
    </>
  )
}
