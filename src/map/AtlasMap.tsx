import { COORDINATE_SYSTEM, OrthographicView } from '@deck.gl/core'
import { ScatterplotLayer } from '@deck.gl/layers'
import { DeckGL } from '@deck.gl/react'

export type PreviewClaim = {
  id: string
  x: number
  y: number
  size: number
  resource: string
}

const previewClaims: PreviewClaim[] = [
  { id: 'preview-1', x: 64_700, y: 79_900, size: 8, resource: 'Belkar Stone' },
  { id: 'preview-2', x: 65_100, y: 80_220, size: 14, resource: 'Lysterium Stone' },
  { id: 'preview-3', x: 65_450, y: 79_650, size: 21, resource: 'Belkar Stone' },
]

const atlasView = new OrthographicView({
  id: 'atlas-map',
  controller: true,
  flipY: false,
})

const initialViewState = {
  target: [65_000, 80_000, 0] as [number, number, number],
  zoom: -3,
  minZoom: -6,
  maxZoom: 2,
}

export function AtlasMap() {
  const claimLayer = new ScatterplotLayer<PreviewClaim>({
    id: 'preview-claims',
    data: previewClaims,
    coordinateSystem: COORDINATE_SYSTEM.CARTESIAN,
    getPosition: (claim) => [claim.x, claim.y],
    getRadius: (claim) => Math.max(5, claim.size * 0.55),
    radiusUnits: 'pixels',
    getFillColor: (claim) =>
      claim.resource === 'Belkar Stone' ? [91, 192, 190, 220] : [222, 166, 79, 220],
    getLineColor: [255, 255, 255, 170],
    lineWidthUnits: 'pixels',
    getLineWidth: 1,
    stroked: true,
    pickable: true,
  })

  return (
    <div className="atlas-map" aria-label="ZML Atlas map preview">
      <DeckGL
        views={atlasView}
        initialViewState={initialViewState}
        layers={[claimLayer]}
        getTooltip={({ object }) => {
          if (object == null) {
            return null
          }
          const claim = object as PreviewClaim
          return `${claim.resource}\nSize ${claim.size}\n${claim.x}, ${claim.y}`
        }}
      />
      <div className="atlas-map__preview-badge">Development preview · sample points</div>
    </div>
  )
}
