import { trackEvent } from './analytics'

interface EmailChoiceModal {
  gmailUrl: string
  mailtoUrl: string
  fallbackEmail: string
}

declare function showEmailChoiceModal(opts: EmailChoiceModal): void

export function openVolunteerEmail(fromScreen: string) {
  const to = 'gfamadrid@gmail.com'
  const subject = 'Quiero ser voluntario/a en La Vega Cats'
  const body = `Hola,\n\nHe estado jugando a Guardianes de La Vega Cats y me gustaría ayudar a los gatos del santuario de verdad.\n\n¿Me podéis contar cómo puedo colaborar como voluntario/a?\n\nGracias :)`

  const params = new URLSearchParams({ subject, body })
  const isMobile = /iPhone|iPad|Android/i.test(navigator.userAgent)

  if (isMobile) {
    window.location.href = `mailto:${to}?${params.toString()}`
  } else {
    showEmailChoiceModal({
      gmailUrl: `https://mail.google.com/mail/?view=cm&fs=1&to=${to}&su=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`,
      mailtoUrl: `mailto:${to}?${params.toString()}`,
      fallbackEmail: to,
    })
  }

  trackEvent('cta_volunteer_click', { from_screen: fromScreen })
}
