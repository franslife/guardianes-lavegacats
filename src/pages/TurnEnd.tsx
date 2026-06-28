import { motion, useReducedMotion } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import { useGameStore } from '../store/gameStore'
import { ROUTES } from '../lib/routes'
import {
  buildMailtoUrl, buildGmailUrl, isMobilePlatform, trackVolunteer, trackShare,
} from '../lib/mailto'
import levelsData from '../data/levels.json'
import { useState } from 'react'
import VolunteerModal from '../components/ui/VolunteerModal'
import ShareModal from '../components/ui/ShareModal'

// ── Icons ────────────────────────────────────────────────────────────────

function PawIcon({ className }: { className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className={className} aria-hidden>
      <ellipse cx="6"    cy="7.5" rx="1.8" ry="2.4" />
      <ellipse cx="10.5" cy="5.5" rx="1.8" ry="2.4" />
      <ellipse cx="15"   cy="5.5" rx="1.8" ry="2.4" />
      <ellipse cx="18.5" cy="7.5" rx="1.8" ry="2.4" />
      <path d="M12 9.5c-3.5 0-6.5 2.5-6.5 5.5 0 2 1.5 3.5 3 4 1 .3 2 .5 3.5.5s2.5-.2 3.5-.5c1.5-.5 3-2 3-4 0-3-3-5.5-6.5-5.5z" />
    </svg>
  )
}

function MailIcon({ className }: { className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className} aria-hidden>
      <rect x="2" y="4" width="20" height="16" rx="2" />
      <path d="m22 7-10 7L2 7" />
    </svg>
  )
}

function ShareIcon({ className }: { className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className} aria-hidden>
      <circle cx="18" cy="5" r="3" /><circle cx="6" cy="12" r="3" /><circle cx="18" cy="19" r="3" />
      <line x1="8.59" y1="13.51" x2="15.42" y2="17.49" /><line x1="15.41" y1="6.51" x2="8.59" y2="10.49" />
    </svg>
  )
}

// ── Gold particles ────────────────────────────────────────────────────────

const PARTICLES = [
  { left: '7%',  delay: 0,    dur: 7.2 },
  { left: '19%', delay: 1.8,  dur: 6.5 },
  { left: '33%', delay: 0.6,  dur: 8.1 },
  { left: '50%', delay: 2.5,  dur: 6.8 },
  { left: '64%', delay: 0.3,  dur: 7.6 },
  { left: '79%', delay: 1.4,  dur: 6.3 },
  { left: '91%', delay: 2.1,  dur: 8.4 },
]

function GoldParticles() {
  const prefersReduced = useReducedMotion()
  if (prefersReduced) return null
  return (
    <div className="pointer-events-none fixed inset-0 z-0 overflow-hidden" aria-hidden>
      {PARTICLES.map((p, i) => (
        <motion.div
          key={i}
          className="absolute bottom-[-8px] h-2 w-2 rounded-full bg-[#F7D87C]"
          style={{ left: p.left, opacity: 0 }}
          animate={{ y: [0, -900], opacity: [0, 0.75, 0.75, 0] }}
          transition={{ duration: p.dur, delay: p.delay, repeat: Infinity, ease: 'easeOut', times: [0, 0.1, 0.8, 1] }}
        />
      ))}
    </div>
  )
}

// ── Medal meta ───────────────────────────────────────────────────────────

const MEDAL_META: Record<string, { emoji: string; name: string }> = {
  primer_cuidado: { emoji: '⭐', name: 'Primer Cuidado' },
  cuidador_atento: { emoji: '🌟', name: 'Cuidador Atento' },
  turno_completo:  { emoji: '🏅', name: 'Turno Completo' },
  guardian:        { emoji: '🐱', name: 'Guardián' },
}

// ── Component ────────────────────────────────────────────────────────────

const finalLevel = levelsData.find((l) => l.level === 6)!

export default function TurnEnd() {
  const navigate       = useNavigate()
  const prefersReduced = useReducedMotion()

  const { hearts, medals, biosUnlocked, resetSession } = useGameStore()

  const [showVolunteer, setShowVolunteer] = useState(false)
  const [showShare,     setShowShare]     = useState(false)

  const isMobile = isMobilePlatform()

  function handleVolunteer() {
    if (isMobile) {
      trackVolunteer('turn_end', 'mobile', 'mailto')
      window.location.href = buildMailtoUrl()
    } else {
      setShowVolunteer(true)
    }
  }

  function handleShare() {
    const shareText =
      'Acabo de completar mi turno de voluntario virtual en La Vega Cats. Un juego para conocer un santuario de gatos real. ¡Pruébalo!'
    const shareUrl = 'https://guardianes-lavegacats.vercel.app'

    if (navigator.share) {
      trackShare('native')
      navigator.share({
        title: 'Mi turno en Guardianes de La Vega Cats',
        text:  shareText,
        url:   shareUrl,
      }).catch(() => {/* cancelled */})
    } else {
      setShowShare(true)
    }
  }

  function handleGmailDesktop() {
    trackVolunteer('turn_end', 'desktop', 'gmail')
    window.open(buildGmailUrl(), '_blank', 'noopener')
  }
  void handleGmailDesktop // used by VolunteerModal internally

  function handlePlayAgain() {
    resetSession()
    navigate(ROUTES.select, { replace: true })
  }

  return (
    <>
      {/* ── Modals ── */}
      <VolunteerModal open={showVolunteer} onClose={() => setShowVolunteer(false)} fromScreen="turn_end" />
      <ShareModal     open={showShare}     onClose={() => setShowShare(false)} />

      {/* ── Background: blurred map ── */}
      <div className="pointer-events-none fixed inset-0 z-0 overflow-hidden" aria-hidden>
        <img
          src="/map/map-desktop.webp"
          alt=""
          className="h-full w-full object-cover"
          style={{ filter: 'blur(14px)', transform: 'scale(1.08)' }}
        />
        {/* Warm cream overlay */}
        <div className="absolute inset-0 bg-[#F5EBD8]/82" />
      </div>

      <GoldParticles />

      {/* ── Content ── */}
      <div className="relative z-10 flex min-h-dvh flex-col items-center justify-start overflow-y-auto px-5 py-12 text-center">

        {/* Level badge */}
        <motion.div
          initial={{ opacity: 0, y: -12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: 'easeOut' }}
          className="mb-2 flex flex-col items-center gap-0.5"
        >
          <span
            className="text-[#3D2E1F]/50 text-xs font-bold uppercase tracking-widest"
          >
            Has alcanzado
          </span>
          <span
            style={{ fontFamily: '"Fraunces", Georgia, serif', fontWeight: 700 }}
            className="text-3xl sm:text-4xl text-[#3D2E1F] leading-tight"
          >
            {finalLevel.name}
          </span>
          <span className="text-[#3D2E1F]/55 text-sm font-medium mt-0.5">
            Nivel 6 · Has completado tu turno
          </span>
        </motion.div>

        {/* Emotional message */}
        <motion.p
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.25, duration: 0.7, ease: 'easeOut' }}
          className="mt-7 max-w-[600px] text-[#3D2E1F] leading-relaxed"
          style={{
            fontFamily:  '"Fraunces", Georgia, serif',
            fontSize:    'clamp(15px, 1.6vw + 8px, 20px)',
            lineHeight:  1.65,
            whiteSpace:  'pre-line',
          }}
        >
          {"Hoy has cuidado de los gatos del santuario.\nHas limpiado, has alimentado, has dado mimos\na quienes más lo necesitan.\n\nEn La Vega Cats hay personas que hacen esto\ntodos los días, de verdad. Y siempre hacen\nfalta más manos."}
        </motion.p>

        {/* Summary card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.45, duration: 0.6 }}
          className="mt-8 w-full max-w-[520px] rounded-3xl border-2 border-[#7BA577]/40 bg-white/70 px-6 py-5 backdrop-blur-sm text-left"
        >
          <p className="text-xs font-bold uppercase tracking-widest text-[#3D2E1F]/40 mb-3">
            Tu turno de hoy
          </p>

          <div className="flex flex-col gap-2.5">
            <div className="flex items-center gap-3">
              <span className="text-lg">✅</span>
              <span className="font-semibold text-[#3D2E1F]">5 misiones completadas</span>
            </div>
            <div className="flex items-center gap-3">
              <span className="text-lg">💚</span>
              <span className="font-semibold text-[#3D2E1F]">{hearts} corazones ganados</span>
            </div>

            {medals.length > 0 && (
              <div className="flex items-center gap-3 flex-wrap">
                <span className="text-lg">🏅</span>
                <div className="flex gap-2 flex-wrap">
                  {medals.map((id) => {
                    const m = MEDAL_META[id]
                    if (!m) return null
                    return (
                      <span
                        key={id}
                        className="inline-flex items-center gap-1 rounded-full bg-[#3D2E1F]/8 px-2.5 py-1 text-xs font-semibold text-[#3D2E1F]"
                        title={m.name}
                      >
                        {m.emoji} {m.name}
                      </span>
                    )
                  })}
                </div>
              </div>
            )}

            {biosUnlocked.length > 0 && (
              <div className="flex items-center gap-3">
                <span className="text-lg">🐱</span>
                <span className="text-sm text-[#3D2E1F]/70">
                  Conociste a {biosUnlocked.length} gato{biosUnlocked.length > 1 ? 's' : ''} del santuario
                </span>
              </div>
            )}
          </div>
        </motion.div>

        {/* CTAs */}
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6, duration: 0.6 }}
          className="mt-8 flex w-full max-w-[400px] flex-col items-center gap-4"
        >

          {/* PRIMARY — Quiero ser voluntario/a */}
          <motion.button
            onClick={handleVolunteer}
            className="flex w-full items-center justify-center gap-3 rounded-2xl bg-[#E07856] px-6 text-white font-semibold shadow-[0_4px_18px_rgba(224,120,86,0.45)] hover:shadow-[0_6px_24px_rgba(224,120,86,0.55)]"
            style={{ height: 64, fontSize: 'clamp(16px, 2vw + 10px, 20px)' }}
            animate={prefersReduced ? {} : { scale: [1, 1.018, 1] }}
            transition={prefersReduced ? {} : { duration: 3.2, repeat: Infinity, ease: 'easeInOut', repeatDelay: 0.8 }}
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
          >
            <MailIcon className="w-5 h-5 flex-shrink-0" />
            Quiero ser voluntario/a
          </motion.button>

          {/* SECONDARY — Visitar web */}
          <a
            href="https://lavegacats.com"
            target="_blank"
            rel="noopener noreferrer"
            className="flex w-[85%] items-center justify-center gap-2 rounded-2xl border-2 border-[#7BA577] bg-transparent text-[#7BA577] font-semibold transition-colors hover:bg-[#7BA577]/10 active:scale-95"
            style={{ height: 52, fontSize: 'clamp(14px, 1.5vw + 9px, 18px)' }}
          >
            🌐 Visitar lavegacats.com
          </a>

          {/* TERTIARY — Compartir */}
          <button
            onClick={handleShare}
            className="flex items-center gap-2 rounded-xl bg-[#F5EBD8] border border-[#3D2E1F]/15 px-5 py-2.5 text-sm font-semibold text-[#3D2E1F]/70 hover:bg-[#EDE0C8] active:scale-95 transition-all"
          >
            <ShareIcon className="w-4 h-4" />
            Compartir mi turno
          </button>

          <div className="h-px w-full bg-[#3D2E1F]/12 my-1" />

          {/* FOURTH — Repetir turno */}
          <motion.button
            onClick={handlePlayAgain}
            className="flex w-full items-center gap-3 rounded-[18px] bg-[#F5EBD8] border-2 border-[#7BA577] px-5 py-4 shadow-[0_2px_8px_rgba(0,0,0,0.07)] text-left hover:shadow-[0_4px_14px_rgba(0,0,0,0.12)] hover:border-[#5a8f57] active:scale-[0.98] transition-all duration-150"
            animate={prefersReduced ? {} : { scale: [1, 1.015, 1] }}
            transition={prefersReduced ? {} : { duration: 3, repeat: Infinity, ease: 'easeInOut', repeatDelay: 1 }}
            whileTap={{ scale: 0.97 }}
          >
            <PawIcon className="w-7 h-7 text-[#7BA577] flex-shrink-0" />
            <div className="flex flex-col items-start leading-tight">
              <span className="text-[17px] sm:text-[19px] font-semibold text-[#3D2E1F]">¿Repetimos turno?</span>
              <span className="text-[13px] text-[#3D2E1F]/55 italic mt-0.5">Nuevo día en el santuario</span>
            </div>
          </motion.button>

        </motion.div>

        {/* Bottom breathing room */}
        <div className="h-10" />
      </div>
    </>
  )
}
