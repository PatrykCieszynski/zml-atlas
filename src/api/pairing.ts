export type PairingApproval = {
  id: string
  label: string | null
  status: string
  createdAt: string
  expiresAt: string
  approvedAt: string | null
}

type CsrfResponse = {
  headerName: string
  parameterName: string
  token: string
}

export async function getPairingForApproval(
  pairingId: string,
  browserCode: string,
  signal?: AbortSignal,
): Promise<PairingApproval> {
  const response = await fetch(
    `/api/v1/account/pairings/${encodeURIComponent(pairingId)}?code=${encodeURIComponent(browserCode)}`,
    {
      credentials: 'same-origin',
      signal,
    },
  )

  if (!response.ok) {
    throw new Error(`Pairing request failed (${response.status})`)
  }

  return response.json() as Promise<PairingApproval>
}

export async function approvePairing(
  pairingId: string,
  browserCode: string,
): Promise<PairingApproval> {
  const csrfResponse = await fetch('/api/v1/csrf', {
    credentials: 'same-origin',
  })

  if (!csrfResponse.ok) {
    throw new Error(`CSRF request failed (${csrfResponse.status})`)
  }

  const csrf = (await csrfResponse.json()) as CsrfResponse
  const response = await fetch(
    `/api/v1/account/pairings/${encodeURIComponent(pairingId)}/approve`,
    {
      method: 'POST',
      credentials: 'same-origin',
      headers: {
        'Content-Type': 'application/json',
        [csrf.headerName]: csrf.token,
      },
      body: JSON.stringify({ code: browserCode }),
    },
  )

  if (!response.ok) {
    throw new Error(`Pairing approval failed (${response.status})`)
  }

  return response.json() as Promise<PairingApproval>
}
