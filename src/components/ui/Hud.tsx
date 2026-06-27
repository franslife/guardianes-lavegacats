import { useGameStore } from '../../store/gameStore'

const LEVEL_NAMES = ['', 'Visitante curioso', 'Voluntario novato', 'Aprendiz', 'Cuidador', 'Guardián']

export default function Hud() {
  const { hearts, level } = useGameStore()

  return (
    <div className="fixed top-0 left-0 right-0 z-30 flex items-center justify-between px-4 py-3 bg-[#F5EBD8]/90 backdrop-blur-sm border-b border-[#3D2E1F]/10">
      <div className="flex items-center gap-1">
        <img src="/ui/heart.svg" alt="corazones" className="w-5 h-5" />
        <span className="font-bold text-[#3D2E1F]">{hearts}</span>
      </div>
      <span className="text-sm font-semibold text-[#7BA577]">{LEVEL_NAMES[level]}</span>
      <div className="flex items-center gap-1">
        <span className="text-sm text-[#3D2E1F]/60">Nv.</span>
        <span className="font-bold text-[#E07856]">{level}</span>
      </div>
    </div>
  )
}
