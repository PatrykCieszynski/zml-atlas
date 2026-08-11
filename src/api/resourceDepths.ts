export type PublicResourceDepthEstimate = {
  resource: string
  estimatedMinDepthM: number | null
  sampleCount: number
}

export type PublicResourceDepthEstimatesResponse = {
  resources: PublicResourceDepthEstimate[]
}

export async function fetchPublicResourceDepthEstimates(
  signal?: AbortSignal,
): Promise<PublicResourceDepthEstimatesResponse> {
  const response = await fetch('/api/v1/public/resources/depth-estimates', { signal })

  if (!response.ok) {
    throw new Error(`Resource depth request failed with HTTP ${response.status}`)
  }

  return response.json() as Promise<PublicResourceDepthEstimatesResponse>
}
