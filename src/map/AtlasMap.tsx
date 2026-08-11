import { useEffect, useMemo, useRef, useState } from 'react'
import { keepPreviousData, useQuery } from '@tanstack/react-query'
import { COORDINATE_SYSTEM, OrthographicView } from '@deck.gl/core'
import { BitmapLayer, ScatterplotLayer } from '@deck.gl/layers'
import { DeckGL } from '@deck.gl/react'
import { fetchPublicClaims, type PublicClaim } from '../api/claims'
import {
  CALYPSO_MAP,
  entropiaToMapPixel,
  getMapSizePx,
  viewToEntropiaBbox,
} from './planetConfig'

type AtlasViewState = {
  target: [number, number, number]
  zoom: number
  minZoom: number
  maxZoom: number
}

const atlasView = new OrthographicView({
  id: 'atlas-map',
  controller: true,
  flipY: true,
})

const mapSize = getMapSizePx(CALYPSO_MAP)

const initialViewState: AtlasViewState = {
  target: [mapSize.width / 2, mapSize.height / 2, 0],
  zoom: -0.6,
  minZoom: -2.5,
  maxZoom: 6,
}

function createMapTileLayers() {
  return CALYPSO_MAP.availableTiles.map(([x, y]) => {
    const left = x * CALYPSO_MAP.tileSize
    const top = y * CALYPSO_MAP.tileSize
    const right = left + CALYPSO_MAP.tileSize
    const bottom = top + CALYPSO_MAP.tileSize

    return new BitmapLayer({
      id: `calypso-tile-${x}-${y}`,
      image: CALYPSO_MAP.tileUrl(x, y),
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

export function AtlasMap() {
  const containerRef = useRef<HTMLDivElement>(null)
  const [viewportSize, setViewportSize] = useState({ width: 0, height: 0 })
  const [viewState, setViewState] = useState<AtlasViewState>(initialViewState)
  const [settledViewState, setSettledViewState] = useState<AtlasViewState>(initialViewState)

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
      CALYPSO_MAP,
      settledViewState,
      viewportSize.width,
      viewportSize.height,
    ),
    [settledViewState, viewportSize],
  )

  const claimsQuery = useQuery({
    queryKey: ['public-claims', CALYPSO_MAP.id, bbox],
    queryFn: ({ signal }) => {
      if (bbox === null) {
        throw new Error('Map viewport is not ready')
      }
      return fetchPublicClaims({ planet: CALYPSO_MAP.id, bbox, signal })
    },
    enabled: bbox !== null,
    placeholderData: keepPreviousData,
  })

  const mapTileLayers = useMemo(() => createMapTileLayers(), [])
  const claims = claimsQuery.data?.claims ?? []

  const claimLayer = useMemo(() => new ScatterplotLayer<PublicClaim>({
    id: 'public-claims',
    data: claims,
    coordinateSystem: COORDINATE_SYSTEM.CARTESIAN,
    getPosition: (claim) => entropiaToMapPixel(CALYPSO_MAP, claim.x, claim.y),
    getRadius: (claim) => Math.max(4, Math.min(10, 3 + claim.size * 0.25)),
    radiusUnits: 'pixels',
    getFillColor: [91, 192, 190, 225],
    getLineColor: [255, 255, 255, 180],
    lineWidthUnits: 'pixels',
    getLineWidth: 1,
    stroked: true,
    pickable: true,
  }), [claims])

  let statusLabel = `${claims.length} observations · last 30 days`
  if (claimsQuery.isError) {
    statusLabel = 'Cloud API unavailable'
  } else if (claimsQuery.isFetching) {
    statusLabel = 'Refreshing observations…'
  } else if (claimsQuery.data?.truncated) {
    statusLabel = `${claims.length} observations · partial viewport, zoom in`
  }

  return (
    <div ref={containerRef} className="atlas-map" aria-label="ZML Atlas Calypso mining map">
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
          return `${claim.resource}\nSize ${claim.size}\n${claim.x}, ${claim.y}\n${formatObservedAt(claim.occurredAt)}`
        }}
      />
      <div className="atlas-map__preview-badge">{statusLabel}</div>
    </div>
  )
}
