// Centralised route paths — single source of truth
export const ROUTES = {
  splash: '/',
  select: '/s',
  map:    '/m',
  zone:   (slug: string) => `/z/${slug}`,
  end:    '/end',
  admin:  '/admin-vega-cats-editor',
} as const

// Zone id → short numeric slug (keeps zone names off the URL)
export const ZONE_SLUGS: Record<string, string> = {
  comedor:    '01',
  catio2:     '02',
  zona_relax: '03',
  jardines:   '04',
  enfermeria: '05',
}

// Reverse: slug → zone id
export const SLUG_TO_ZONE: Record<string, string> = Object.fromEntries(
  Object.entries(ZONE_SLUGS).map(([id, slug]) => [slug, id])
)
