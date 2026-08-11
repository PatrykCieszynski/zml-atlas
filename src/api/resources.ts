export type PublicResource = {
  key: string
  name: string
  type: 'ore' | 'enmatter' | 'treasure' | 'other'
  displayColor: string
}

export async function fetchPublicResources(signal?: AbortSignal): Promise<PublicResource[]> {
  const response = await fetch('/api/v1/public/resources', { signal })

  if (!response.ok) {
    throw new Error(`Resource catalog request failed with HTTP ${response.status}`)
  }

  return response.json() as Promise<PublicResource[]>
}
