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

type FetchPublicClaimsParams = {
  planet: string
  bbox: ClaimsBbox
  signal?: AbortSignal
}

export async function fetchPublicClaims({
  planet,
  bbox,
  signal,
}: FetchPublicClaimsParams): Promise<PublicClaimsResponse> {
  const query = new URLSearchParams({
    planet,
    minX: String(bbox.minX),
    minY: String(bbox.minY),
    maxX: String(bbox.maxX),
    maxY: String(bbox.maxY),
  })

  const response = await fetch(`/api/v1/public/map/claims?${query}`, { signal })

  if (!response.ok) {
    throw new Error(`Claims request failed with HTTP ${response.status}`)
  }

  return response.json() as Promise<PublicClaimsResponse>
}
