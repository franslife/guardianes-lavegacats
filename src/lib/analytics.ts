import { supabase } from './supabase'

let anonymousId: string

function getAnonymousId(): string {
  if (anonymousId) return anonymousId
  const stored = localStorage.getItem('anon_id')
  if (stored) {
    anonymousId = stored
    return anonymousId
  }
  anonymousId = crypto.randomUUID()
  localStorage.setItem('anon_id', anonymousId)
  return anonymousId
}

export async function trackEvent(eventType: string, eventData?: Record<string, unknown>) {
  const anonId = getAnonymousId()
  await supabase.from('game_events').insert({
    anonymous_id: anonId,
    event_type: eventType,
    event_data: eventData ?? {},
  })
}
