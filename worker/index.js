const PROXIED_PREFIXES = ['/api/', '/oauth2/', '/login/', '/logout', '/error']

export default {
  async fetch(request, env) {
    const incomingUrl = new URL(request.url)

    if (!PROXIED_PREFIXES.some((prefix) => incomingUrl.pathname.startsWith(prefix))) {
      return env.ASSETS.fetch(request)
    }

    const cloudOrigin = env.ZML_CLOUD_ORIGIN
    if (!cloudOrigin) {
      return new Response('ZML Cloud origin is not configured', { status: 503 })
    }

    const targetUrl = new URL(incomingUrl.pathname + incomingUrl.search, cloudOrigin)
    const headers = new Headers(request.headers)

    headers.delete('forwarded')
    headers.delete('x-forwarded-for')
    headers.delete('x-forwarded-host')
    headers.delete('x-forwarded-port')
    headers.delete('x-forwarded-proto')

    headers.set('x-forwarded-host', incomingUrl.host)
    headers.set('x-forwarded-proto', incomingUrl.protocol.slice(0, -1))
    headers.set('x-forwarded-port', incomingUrl.port || (incomingUrl.protocol === 'https:' ? '443' : '80'))

    return fetch(
      new Request(targetUrl, {
        method: request.method,
        headers,
        body: request.body,
        redirect: 'manual',
      }),
    )
  },
}
