export type Account = {
  userId: string
  status: string
  displayName: string
  avatarHash: string | null
}

export async function getAccount(signal?: AbortSignal): Promise<Account> {
  const response = await fetch('/api/v1/account', {
    credentials: 'same-origin',
    signal,
  })

  if (!response.ok) {
    throw new Error(`Account request failed (${response.status})`)
  }

  return response.json() as Promise<Account>
}
