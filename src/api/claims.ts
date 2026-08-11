export type PublicClaim = {
  resource: string
  x: number
  y: number
  size: number
  occurredAt: string
}

export type PublicClaimsResponse = {
  claims: PublicClaim[]
  truncated: boolean
}

export type ClaimsBbox = {
  minX: number
  minY: number
  maxX: number
  maxY: number
}

export type ClaimLookbackDays = 1 | 7 | 30

export type ClaimFilters = {
  resource?: string
  minSize: number
  maxSize: number
  lookbackDays: ClaimLookbackDays
}

type FetchPublicClaimsParams = {
  planet: string
  bbox: ClaimsBbox
  filters: ClaimFilters
  signal?: AbortSignal
}

const DAY_MS = 24 * 60 * 60 * 1000

export async function fetchPublicClaims({
  planet,
  bbox,
  filters,
  signal,
}: FetchPublicClaimsParams): Promise<PublicClaimsResponse> {
  const query = new URLSearchParams({
    planet,
    minX: String(bbox.minX),
    minY: String(bbox.minY),
    maxX: String(bbox.maxX),
    maxY: String(bbox.maxY),
  })

  if (filters.resource !== undefined) {
    query.set('resource', filters.resource)
  }
  if (filters.minSize > 1) {
    query.set('minSize', String(filters.minSize))
  }
  if (filters.maxSize < 30) {
    query.set('maxSize', String(filters.maxSize))
  }
  if (filters.lookbackDays < 30) {
    query.set('from', new Date(Date.now() - filters.lookbackDays * DAY_MS).toISOString())
  }

  const response = await fetch(`/api/v1/public/map/claims?${query}`, { signal })

  if (!response.ok) {
    throw new Error(`Claims request failed with HTTP ${response.status}`)
  }

  return response.json() as Promise<PublicClaimsResponse>
}
