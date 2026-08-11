import { useMemo } from 'react'
import { useQuery } from '@tanstack/react-query'
import { fetchPublicResourceDepthEstimates } from '../api/resourceDepths'
import { fetchPublicResources } from '../api/resources'

function formatDepth(value: number) {
  return Number.isInteger(value) ? String(value) : value.toFixed(1)
}

export function ResourcesPage() {
  const resourcesQuery = useQuery({
    queryKey: ['public-resources'],
    queryFn: ({ signal }) => fetchPublicResources(signal),
    staleTime: 60 * 60 * 1000,
  })

  const depthsQuery = useQuery({
    queryKey: ['public-resource-depth-estimates'],
    queryFn: ({ signal }) => fetchPublicResourceDepthEstimates(signal),
    staleTime: 10 * 60 * 1000,
  })

  const depthsByResource = useMemo(
    () => new Map((depthsQuery.data?.resources ?? []).map((item) => [item.resource, item])),
    [depthsQuery.data],
  )

  const resources = useMemo(
    () => [...(resourcesQuery.data ?? [])].sort((a, b) => a.name.localeCompare(b.name)),
    [resourcesQuery.data],
  )

  return (
    <main className="app-shell resources-shell">
      <header className="topbar">
        <a className="brand" href="/" aria-label="ZML Atlas home">
          <span className="brand__mark">Z</span>
          <span>
            <strong>ZML Atlas</strong>
            <small>Community mining map</small>
          </span>
        </a>
        <nav className="topbar__nav" aria-label="Atlas sections">
          <a className="topbar__nav-link" href="/">Explore</a>
          <a className="topbar__nav-link topbar__nav-link--active" href="/resources">Resources</a>
        </nav>
        <div className="topbar__status">
          <span className="status-dot" />
          Community data
        </div>
      </header>

      <section className="resources-page">
        <div className="resources-page__header">
          <div>
            <div className="eyebrow">Mining catalog</div>
            <h1>Resources</h1>
            <p className="muted">
              Estimated minimum mining depth from ZML observations. Colors match the Explore map.
            </p>
          </div>
          <div className="resources-page__method">
            Minimum depth is estimated from the shallowest observations rather than a raw minimum, so one bad OCR result cannot define the resource.
          </div>
        </div>

        {resourcesQuery.isPending && <div className="resources-state">Loading resource catalog…</div>}
        {resourcesQuery.isError && <div className="resources-state resources-state--error">Resource catalog unavailable.</div>}

        {!resourcesQuery.isPending && !resourcesQuery.isError && (
          <div className="resource-grid">
            {resources.map((resource) => {
              const depth = depthsByResource.get(resource.key)
              const estimate = depth?.estimatedMinDepthM
              const hasEstimate = estimate !== null && estimate !== undefined

              return (
                <article className="resource-card" key={resource.key}>
                  <div className="resource-card__heading">
                    <span
                      className="resource-card__swatch"
                      style={{ backgroundColor: resource.displayColor }}
                      aria-hidden="true"
                    />
                    <div>
                      <h2>{resource.name}</h2>
                      <span className="resource-card__type">{resource.type}</span>
                    </div>
                  </div>

                  <div className="resource-card__depth">
                    <span>Estimated minimum depth</span>
                    <strong>{hasEstimate ? `~${formatDepth(estimate)} m` : 'Not enough data'}</strong>
                  </div>

                  <div className="resource-card__samples">
                    {depthsQuery.isPending && 'Loading observations…'}
                    {depthsQuery.isError && 'Depth data unavailable'}
                    {!depthsQuery.isPending && !depthsQuery.isError && depth === undefined && 'No depth observations yet'}
                    {!depthsQuery.isPending && !depthsQuery.isError && depth !== undefined
                      && `${depth.sampleCount} ${depth.sampleCount === 1 ? 'observation' : 'observations'}`}
                  </div>
                </article>
              )
            })}
          </div>
        )}
      </section>
    </main>
  )
}
