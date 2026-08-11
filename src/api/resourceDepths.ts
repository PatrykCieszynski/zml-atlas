export type PublicResourceDepthRange = {
  resource: string
  observedMinDepthM: number
  observedMaxDepthM: number
  sampleCount: number
}

export type PublicResourceDepthRangesResponse = {
  resources: PublicResourceDepthRange[]
}

export async function fetchPublicResourceDepthRanges(
  planet: string,
  signal?: AbortSignal,
): Promise<PublicResourceDepthRangesResponse> {
  const query = new URLSearchParams({ planet })
  const response = await fetch(`/api/v1/public/resources/depth-ranges?${query}`, { signal })

  if (!response.ok) {
    throw new Error(`Resource depth request failed with HTTP ${response.status}`)
  }

  return response.json() as Promise<PublicResourceDepthRangesResponse>
}
