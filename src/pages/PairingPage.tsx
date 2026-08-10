import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { getAccount } from '../api/account'
import { approvePairing, getPairingForApproval } from '../api/pairing'

export function PairingPage() {
  const queryClient = useQueryClient()
  const params = new URLSearchParams(window.location.search)
  const pairingId = params.get('id')
  const browserCode = params.get('code')

  const accountQuery = useQuery({
    queryKey: ['account'],
    queryFn: ({ signal }) => getAccount(signal),
    enabled: false,
    retry: false,
  })

  const pairingQuery = useQuery({
    queryKey: ['pairing', pairingId, browserCode],
    queryFn: ({ signal }) =>
      getPairingForApproval(pairingId ?? '', browserCode ?? '', signal),
    enabled: false,
    retry: false,
  })

  const approvalMutation = useMutation({
    mutationFn: () => approvePairing(pairingId ?? '', browserCode ?? ''),
    onSuccess: (pairing) => {
      queryClient.setQueryData(['pairing', pairingId, browserCode], pairing)
    },
  })

  if (pairingId === null || browserCode === null) {
    return <InvalidPairingPage />
  }

  const checkSession = async () => {
    const accountResult = await accountQuery.refetch()
    if (accountResult.data !== undefined) {
      await pairingQuery.refetch()
    }
  }

  const openDiscordLogin = () => {
    window.open(
      '/oauth2/authorization/discord',
      'zml-discord-login',
      'popup,width=520,height=760',
    )
  }

  const pairing = pairingQuery.data
  const approved = pairing?.status === 'approved' || approvalMutation.data?.status === 'approved'

  return (
    <main className="pair-shell">
      <a className="brand pair-brand" href="/" aria-label="ZML Atlas home">
        <span className="brand__mark">Z</span>
        <span>
          <strong>ZML Atlas</strong>
          <small>Desktop connection</small>
        </span>
      </a>

      <section className="pair-card">
        <div className="eyebrow">ZML Desktop</div>
        <h1>Connect this device</h1>
        <p className="pair-lead">
          Sign in with Discord, review the device request, then approve it. ZML Desktop receives only a revocable ZML sync credential — never your Discord token.
        </p>

        <div className="pair-device">
          <div className="pair-device__icon">PC</div>
          <div>
            <strong>{pairing?.label || 'ZML Desktop'}</strong>
            <span>Pairing request {pairingId.slice(0, 8)}…</span>
          </div>
        </div>

        {approved ? (
          <div className="success-box">
            <strong>Device approved</strong>
            <span>You can return to ZML Desktop. It will finish the one-time token exchange automatically.</span>
          </div>
        ) : (
          <>
            <div className="pair-steps">
              <div className="pair-step">
                <span>1</span>
                <div>
                  <strong>Sign in with Discord</strong>
                  <p>Login opens in a separate window and stays on the Cloud side.</p>
                </div>
              </div>
              <button className="button button--secondary" type="button" onClick={openDiscordLogin}>
                Open Discord login
              </button>

              <div className="pair-step">
                <span>2</span>
                <div>
                  <strong>Confirm your session</strong>
                  <p>After Discord finishes, come back here and continue.</p>
                </div>
              </div>
              <button
                className="button button--secondary"
                type="button"
                onClick={() => void checkSession()}
                disabled={accountQuery.isFetching || pairingQuery.isFetching}
              >
                {accountQuery.isFetching || pairingQuery.isFetching ? 'Checking…' : 'I signed in'}
              </button>
            </div>

            {accountQuery.data !== undefined && (
              <div className="account-chip">
                <span className="status-dot" />
                Signed in as <strong>{accountQuery.data.displayName}</strong>
              </div>
            )}

            {pairing !== undefined && (
              <div className="approval-box">
                <div>
                  <span>Requested device</span>
                  <strong>{pairing.label || 'ZML Desktop'}</strong>
                </div>
                <div>
                  <span>Expires</span>
                  <strong>{new Date(pairing.expiresAt).toLocaleTimeString()}</strong>
                </div>
                <button
                  className="button button--primary"
                  type="button"
                  onClick={() => approvalMutation.mutate()}
                  disabled={approvalMutation.isPending}
                >
                  {approvalMutation.isPending ? 'Approving…' : 'Authorize this device'}
                </button>
              </div>
            )}
          </>
        )}

        {(accountQuery.isError || pairingQuery.isError || approvalMutation.isError) && (
          <div className="error-box">
            Could not complete this step. Make sure ZML Cloud is running and the pairing link has not expired.
          </div>
        )}

        <p className="security-note">
          The browser code is short-lived. The final <code>zml_…</code> token is delivered only to the desktop pairing session and can later be revoked per device.
        </p>
      </section>
    </main>
  )
}

function InvalidPairingPage() {
  return (
    <main className="pair-shell">
      <section className="pair-card">
        <div className="eyebrow">Pairing error</div>
        <h1>Invalid connection link</h1>
        <p className="pair-lead">Open the connection link again from ZML Desktop.</p>
        <a className="button button--secondary" href="/">Back to Atlas</a>
      </section>
    </main>
  )
}
