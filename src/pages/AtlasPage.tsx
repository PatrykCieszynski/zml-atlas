import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { type ClaimLookbackDays } from '../api/claims'
import { fetchPublicResources } from '../api/resources'
import { AtlasMap } from '../map/AtlasMap'
import { PLANET_MAPS, PLANET_OPTIONS, type PlanetId } from '../map/planetConfig'

const MIN_CLAIM_SIZE = 1
const MAX_CLAIM_SIZE = 30

function clampClaimSize(value: number) {
  return Math.max(MIN_CLAIM_SIZE, Math.min(MAX_CLAIM_SIZE, Math.trunc(value)))
}

function formatLookback(lookbackDays: ClaimLookbackDays) {
  return lookbackDays === 1 ? '24 hours' : `${lookbackDays} days`
}

export function AtlasPage() {
  const [planetId, setPlanetId] = useState<PlanetId>('calypso')
  const [resourceKey, setResourceKey] = useState('all')
  const [minSize, setMinSize] = useState(MIN_CLAIM_SIZE)
  const [maxSize, setMaxSize] = useState(MAX_CLAIM_SIZE)
  const [lookbackDays, setLookbackDays] = useState<ClaimLookbackDays>(30)
  const planet = PLANET_MAPS[planetId]

  const resourcesQuery = useQuery({
    queryKey: ['public-resources'],
    queryFn: ({ signal }) => fetchPublicResources(signal),
    staleTime: 60 * 60 * 1000,
  })

  const filters = {
    resource: resourceKey === 'all' ? undefined : resourceKey,
    minSize,
    maxSize,
    lookbackDays,
  }

  return (
    <main className="app-shell">
      <header className="topbar">
        <a className="brand" href="/" aria-label="ZML Atlas home">
          <span className="brand__mark">Z</span>
          <span>
            <strong>ZML Atlas</strong>
            <small>Community mining map</small>
          </span>
        </a>
        <div className="topbar__status">
          <span className="status-dot" />
          Live observations
        </div>
      </header>

      <section className="atlas-layout">
        <aside className="filter-panel">
          <div className="eyebrow">Planet</div>
          <h1>{planet.name}</h1>
          <p className="muted">Raw mining observations from the last {formatLookback(lookbackDays)}.</p>

          <label className="field">
            <span>Planet</span>
            <select
              value={planetId}
              onChange={(event) => setPlanetId(event.target.value as PlanetId)}
            >
              {PLANET_OPTIONS.map((option) => (
                <option key={option.id} value={option.id}>{option.name}</option>
              ))}
            </select>
          </label>

          <label className="field">
            <span>Time range</span>
            <select
              value={lookbackDays}
              onChange={(event) => setLookbackDays(Number(event.target.value) as ClaimLookbackDays)}
            >
              <option value={1}>Last 24 hours</option>
              <option value={7}>Last 7 days</option>
              <option value={30}>Last 30 days</option>
            </select>
          </label>

          <label className="field">
            <span>Resource</span>
            <select
              value={resourceKey}
              onChange={(event) => setResourceKey(event.target.value)}
              disabled={resourcesQuery.isPending || resourcesQuery.isError}
            >
              <option value="all">All resources</option>
              {(resourcesQuery.data ?? []).map((resource) => (
                <option key={resource.key} value={resource.key}>{resource.name}</option>
              ))}
            </select>
          </label>

          <div className="field">
            <span>Claim size</span>
            <div className="range-row">
              <input
                type="number"
                min={MIN_CLAIM_SIZE}
                max={MAX_CLAIM_SIZE}
                aria-label="Minimum claim size"
                value={minSize}
                onChange={(event) => {
                  const nextMin = clampClaimSize(Number(event.target.value))
                  setMinSize(nextMin)
                  if (nextMin > maxSize) {
                    setMaxSize(nextMin)
                  }
                }}
              />
              <span>to</span>
              <input
                type="number"
                min={MIN_CLAIM_SIZE}
                max={MAX_CLAIM_SIZE}
                aria-label="Maximum claim size"
                value={maxSize}
                onChange={(event) => {
                  const nextMax = clampClaimSize(Number(event.target.value))
                  setMaxSize(nextMax)
                  if (nextMax < minSize) {
                    setMinSize(nextMax)
                  }
                }}
              />
            </div>
          </div>

          <div className="panel-note">
            Filters are applied server-side to the current viewport. Claim colors identify resources through the shared Cloud catalog.
          </div>
        </aside>

        <section className="map-panel">
          <AtlasMap key={planetId} planetId={planetId} filters={filters} />
          <div className="map-legend" aria-label="Map legend">
            <span>
              <i
                className="legend-dot"
                style={{ background: 'linear-gradient(135deg, #E8E8E2, #C3C780 45%, #5D77C5 75%, #DA96DA)' }}
              />
              Color identifies resource
            </span>
          </div>
        </section>
      </section>
    </main>
  )
}
