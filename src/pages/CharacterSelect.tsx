import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { useGameStore } from '../store/gameStore'
import Character from '../components/game/Character'

const CHARACTERS = [
  { id: 'volunteer_f' as const, name: 'Voluntaria', emoji: '👩' },
  { id: 'volunteer_m' as const, name: 'Voluntario', emoji: '👨' },
  { id: 'volunteer_n' as const, name: 'Personaje neutro', emoji: '🧑' },
]

export default function CharacterSelect() {
  const navigate = useNavigate()
  const setCharacter = useGameStore((s) => s.setCharacter)
  const [selected, setSelected] = useState<string | null>(null)

  function handleContinue() {
    if (!selected) return
    setCharacter(selected as 'volunteer_f' | 'volunteer_m' | 'volunteer_n')
    navigate('/map')
  }

  return (
    <div className="flex flex-col min-h-dvh bg-[#F5EBD8] px-6 py-10">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center mb-8"
      >
        <h1 className="text-3xl font-bold text-[#3D2E1F] mb-2">Elige tu voluntario/a</h1>
        <p className="text-[#3D2E1F]/60">Hoy ayudas a los gatos del santuario</p>
      </motion.div>

      <div className="flex flex-col gap-4 flex-1">
        {CHARACTERS.map((char, i) => (
          <motion.button
            key={char.id}
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: i * 0.1 }}
            onClick={() => setSelected(char.id)}
            className={`flex items-center gap-5 p-5 rounded-3xl border-2 transition-all ${
              selected === char.id
                ? 'border-[#E07856] bg-[#E07856]/10 shadow-lg scale-[1.02]'
                : 'border-[#3D2E1F]/10 bg-white/50'
            }`}
          >
            <div className="w-20 h-20 rounded-2xl bg-[#7BA577]/20 flex items-center justify-center overflow-hidden flex-shrink-0">
              <Character characterId={char.id} size={56} />
            </div>
            <div className="text-left">
              <p className="font-bold text-[#3D2E1F] text-lg">{char.name}</p>
              <p className="text-[#3D2E1F]/50 text-sm mt-1">
                {char.id === 'volunteer_f' && 'Mujer joven, camiseta de La Vega Cats'}
                {char.id === 'volunteer_m' && 'Hombre joven, chaleco de La Vega Cats'}
                {char.id === 'volunteer_n' && 'Inclusivo, estilo fantástico amable'}
              </p>
            </div>
            {selected === char.id && (
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                className="ml-auto text-[#E07856] text-2xl"
              >
                ✓
              </motion.div>
            )}
          </motion.button>
        ))}
      </div>

      <motion.button
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: selected ? 1 : 0.4, y: 0 }}
        transition={{ delay: 0.4 }}
        onClick={handleContinue}
        disabled={!selected}
        className="mt-6 w-full bg-[#E07856] text-white font-bold py-4 rounded-2xl text-lg disabled:cursor-not-allowed active:scale-95 transition-transform shadow-lg"
      >
        Continuar
      </motion.button>
    </div>
  )
}
