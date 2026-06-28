import { trackEvent } from './analytics'

export const VOLUNTEER_TO      = 'gfamadrid@gmail.com'
export const VOLUNTEER_SUBJECT = 'Quiero ser voluntario/a en La Vega Cats'
export const VOLUNTEER_BODY    =
  'Hola,\n\nAcabo de completar mi turno de voluntario virtual en Guardianes de La Vega Cats y me gustaría ayudar a los gatos del santuario de verdad.\n\n¿Me podéis contar cómo puedo colaborar como voluntario/a?\n\nGracias :)'

export function buildMailtoUrl(): string {
  const p = new URLSearchParams({ subject: VOLUNTEER_SUBJECT, body: VOLUNTEER_BODY })
  return `mailto:${VOLUNTEER_TO}?${p.toString()}`
}

export function buildGmailUrl(): string {
  return (
    `https://mail.google.com/mail/?view=cm&fs=1` +
    `&to=${encodeURIComponent(VOLUNTEER_TO)}` +
    `&su=${encodeURIComponent(VOLUNTEER_SUBJECT)}` +
    `&body=${encodeURIComponent(VOLUNTEER_BODY)}`
  )
}

export function isMobilePlatform(): boolean {
  return /iPhone|iPad|Android/i.test(navigator.userAgent)
}

export function trackVolunteer(
  fromScreen: string,
  platform: 'mobile' | 'desktop',
  choice?: string
) {
  trackEvent('cta_volunteer_click', {
    from_screen: fromScreen,
    platform,
    ...(choice ? { choice } : {}),
  })
}

export function trackShare(channel: string) {
  trackEvent('cta_share_click', { channel })
}

// Legacy export kept so existing callers don't break during migration
export function openVolunteerEmail(fromScreen: string) {
  const isMobile = isMobilePlatform()
  if (isMobile) {
    window.location.href = buildMailtoUrl()
    trackVolunteer(fromScreen, 'mobile', 'mailto')
  }
  // Desktop: callers must open VolunteerModal themselves
}
