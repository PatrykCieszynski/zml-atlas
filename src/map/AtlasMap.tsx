import { useEffect, useMemo, useRef, useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { COORDINATE_SYSTEM, OrthographicView } from '@deck.gl/core'
import { BitmapLayer, ScatterplotLayer } from '@deck.gl/layers'
import { DeckGL } from '@deck.gl/react'
import { fetchPublicClaims, type PublicClaim } from '../api/claims'
import { fetchPublicResources } from '../api/resources'
import {
  PLANET_MAPS,
  entropiaToMapPixel,
  getMapSizePx,
  viewToEntropiaBbox,
  type PlanetId,
  type PlanetMapConfig,
} from './planetConfig'

type AtlasViewState = {
  target: [number, number, number]
  zoom: number
  minZoom: number
  maxZoom: number
}

type DeckColor = [number, number, number, number]

type AtlasMapProps = {
  planetId: PlanetId
}

const FALLBACK_CLAIM_COLOR: DeckColor = [167, 162, 154, 225]

const atlasView = new OrthographicView({
  id: 'atlas-map',
  controller: true,
  flipY: true,
})

function createInitialViewState(config: PlanetMapConfig): AtlasViewState {
  const mapSize = getMapSizePx(config)
  const largestDimension = Math.max(config.tileCountX, config.tileCountY)
  const zoom = largestDimension >= 6 ? -0.6 : largestDimension >= 3 ? -0.3 : 0.4

  return {
    target: [mapSize.width / 2, mapSize.height / 2, 0],
    zoom,
    minZoom: -2.5,
    maxZoom: 6,
  }
}

function createMapTileLayers(config: PlanetMapConfig) {
  return config.availableTiles.map(([x, y]) => {
    const left = x * config.tileSize
    const top = y * config.tileSize
    const right = left + config.tileSize
    const bottom = top + config.tileSize

    return new BitmapLayer({
      id: `${config.id}-tile-${x}-${y}`,
      image: config.tileUrl(x, y),
      bounds: [left, bottom, right, top],
      coordinateSystem: COORDINATE_SYSTEM.CARTESIAN,
      pickable: false,
    })
  })
}

function formatObservedAt(value: string) {
  const date = new Date(value)
  return Number.isNaN(date.getTime()) ? value : date.toLocaleString()
}

function hexToDeckColor(value: string): DeckColor {
  const match = /^#([0-9a-f]{6})$/i.exec(value)
  if (match === null) {
    return FALLBACK_CLAIM_COLOR
  }

  const rgb = Number.parseInt(match[1], 16)
  return [
    (rgb >> 16) & 0xff,
    (rgb >> 8) & 0xff,
    rgb & 0xff,
    225,
  ]
}

export function AtlasMap({ planetId }: AtlasMapProps) {
  const config = PLANET_MAPS[planetId]
  const containerRef = useRef<HTMLDivElement>(null)
  const [viewportSize, setViewportSize] = useState({ width: 0, height: 0 })
  const [viewState, setViewState] = useState<AtlasViewState>(() => createInitialViewState(config))
  const [settledViewState, setSettledViewState] = useState<AtlasViewState>(() => createInitialViewState(config))

  useEffect(() => {
    const element = containerRef.current
    if (element === null) {
      return
    }

    const observer = new ResizeObserver(([entry]) => {
      if (entry === undefined) {
        return
      }
      setViewportSize({
        width: entry.contentRect.width,
        height: entry.contentRect.height,
      })
    })

    observer.observe(element)
    return () => observer.disconnect()
  }, [])

  useEffect(() => {
    const timeout = window.setTimeout(() => setSettledViewState(viewState), 250)
    return () => window.clearTimeout(timeout)
  }, [viewState])

  const bbox = useMemo(
    () => viewToEntropiaBbox(
      config,
      settledViewState,
      viewportSize.width,
      viewportSize.height,
    ),
    [config, settledViewState, viewportSize],
  )

  const claimsQuery = useQuery({
    queryKey: ['public-claims', config.id, bbox],
    queryFn: ({ signal }) => {
      if (bbox === null) {
        throw new Error('Map viewport is not ready')
      }
      return fetchPublicClaims({ planet: config.id, bbox, signal })
    },
    enabled: bbox !== null,
    placeholderData: (previousData, previousQuery) =>
      previousQuery?.queryKey[1] === config.id ? previousData : undefined,
  })

  const resourcesQuery = useQuery({
    queryKey: ['public-resources'],
    queryFn: ({ signal }) => fetchPublicResources(signal),
    staleTime: 60 * 60 * 1000,
  })

  const resourcesByKey = useMemo(
    () => new Map((resourcesQuery.data ?? []).map((resource) => [resource.key, resource])),
    [resourcesQuery.data],
  )

  const mapTileLayers = useMemo(() => createMapTileLayers(config), [config])
  const claims = claimsQuery.data?.claims ?? []

  const claimLayer = useMemo(() => new ScatterplotLayer<PublicClaim>({
    id: `public-claims-${config.id}`,
    data: claims,
    coordinateSystem: COORDINATE_SYSTEM.CARTESIAN,
    getPosition: (claim) => entropiaToMapPixel(config, claim.x, claim.y),
    getRadius: (claim) => Math.max(4, Math.min(10, 3 + claim.size * 0.25)),
    radiusUnits: 'pixels',
    getFillColor: (claim) => {
      const resource = resourcesByKey.get(claim.resource)
      return resource === undefined
        ? FALLBACK_CLAIM_COLOR
        : hexToDeckColor(resource.displayColor)
    },
    getLineColor: [18, 23, 29, 210],
    lineWidthUnits: 'pixels',
    getLineWidth: 1.25,
    stroked: true,
    pickable: true,
  }), [claims, config, resourcesByKey])

  let statusLabel = `${claims.length} observations · last 30 days`
  if (claimsQuery.isError) {
    statusLabel = 'Cloud API unavailable'
  } else if (claimsQuery.isFetching) {
    statusLabel = 'Refreshing observations…'
  } else if (claimsQuery.data?.truncated) {
    statusLabel = `${claims.length} observations · partial viewport, zoom in`
  }

  return (
    <div ref={containerRef} className="atlas-map" aria-label={`ZML Atlas ${config.name} mining map`}>
      <DeckGL
        views={atlasView}
        viewState={viewState}
        layers={[...mapTileLayers, claimLayer]}
        onViewStateChange={({ viewState: nextViewState }) => {
          setViewState(nextViewState as AtlasViewState)
        }}
        getTooltip={({ object }) => {
          if (object == null) {
            return null
          }
          const claim = object as PublicClaim
          const resource = resourcesByKey.get(claim.resource)
          const resourceLabel = resource?.name ?? claim.resource
          return `${resourceLabel}\nSize ${claim.size}\n${claim.x}, ${claim.y}\n${formatObservedAt(claim.occurredAt)}`
        }}
      />
      <div className="atlas-map__preview-badge">{statusLabel}</div>
    </div>
  )
}
