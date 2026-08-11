import type { ClaimsBbox } from '../api/claims'

export type PlanetId =
  | 'arkadia'
  | 'calypso'
  | 'cyrene'
  | 'monria'
  | 'next_island'
  | 'rocktropia'
  | 'toulan'

export type TileCoord = readonly [x: number, y: number]

export type PlanetMapConfig = {
  id: PlanetId
  name: string
  tileSize: number
  tileCountX: number
  tileCountY: number
  minX: number
  maxX: number
  minY: number
  maxY: number
  availableTiles: readonly TileCoord[]
  tileUrl: (x: number, y: number) => string
}

function fullTileGrid(tileCountX: number, tileCountY: number): TileCoord[] {
  return Array.from({ length: tileCountX }, (_, x) =>
    Array.from({ length: tileCountY }, (__, y) => [x, y] as const),
  ).flat()
}

function createTileUrl(folder: string) {
  return (x: number, y: number) => `/Maps/${folder}/x${x}_y${y}.webp`
}

export const PLANET_MAPS: Record<PlanetId, PlanetMapConfig> = {
  arkadia: {
    id: 'arkadia',
    name: 'Arkadia',
    tileSize: 512,
    tileCountX: 3,
    tileCountY: 3,
    minX: 8_192,
    maxX: 32_768,
    minY: 8_192,
    maxY: 32_768,
    availableTiles: fullTileGrid(3, 3),
    tileUrl: createTileUrl('Arkadia'),
  },
  calypso: {
    id: 'calypso',
    name: 'Calypso',
    tileSize: 512,
    tileCountX: 9,
    tileCountY: 9,
    minX: 16_384,
    maxX: 90_112,
    minY: 24_576,
    maxY: 98_304,
    availableTiles: [
      [0, 4], [0, 5], [0, 6], [0, 7], [0, 8],
      [1, 4], [1, 5], [1, 6], [1, 7], [1, 8],
      [2, 4], [2, 5], [2, 6], [2, 7], [2, 8],
      [3, 4],
      [4, 3], [4, 4],
      [5, 1], [5, 2], [5, 3],
      [6, 1], [6, 2], [6, 3],
      [7, 0], [7, 1], [7, 2], [7, 3],
      [8, 0], [8, 1], [8, 2],
    ],
    tileUrl: createTileUrl('Calypso'),
  },
  cyrene: {
    id: 'cyrene',
    name: 'Cyrene',
    tileSize: 512,
    tileCountX: 2,
    tileCountY: 2,
    minX: 122_880,
    maxX: 139_264,
    minY: 73_728,
    maxY: 90_112,
    availableTiles: fullTileGrid(2, 2),
    tileUrl: createTileUrl('Cyrene'),
  },
  monria: {
    id: 'monria',
    name: 'Monria',
    tileSize: 512,
    tileCountX: 1,
    tileCountY: 1,
    minX: 32_768,
    maxX: 40_960,
    minY: 16_384,
    maxY: 24_576,
    availableTiles: fullTileGrid(1, 1),
    tileUrl: createTileUrl('Monria'),
  },
  next_island: {
    id: 'next_island',
    name: 'Next Island',
    tileSize: 512,
    tileCountX: 3,
    tileCountY: 2,
    minX: 122_880,
    maxX: 147_456,
    minY: 81_920,
    maxY: 98_304,
    availableTiles: [
      [0, 0], [0, 1],
      [1, 0], [1, 1],
      [2, 1],
    ],
    tileUrl: createTileUrl('Next Island'),
  },
  rocktropia: {
    id: 'rocktropia',
    name: 'Rocktropia',
    tileSize: 512,
    tileCountX: 2,
    tileCountY: 2,
    minX: 122_880,
    maxX: 139_264,
    minY: 81_920,
    maxY: 98_304,
    availableTiles: fullTileGrid(2, 2),
    tileUrl: createTileUrl('Rocktropia'),
  },
  toulan: {
    id: 'toulan',
    name: 'Toulan',
    tileSize: 512,
    tileCountX: 1,
    tileCountY: 1,
    minX: 131_072,
    maxX: 139_264,
    minY: 90_112,
    maxY: 98_304,
    availableTiles: fullTileGrid(1, 1),
    tileUrl: createTileUrl('Toulan'),
  },
}

export const PLANET_OPTIONS = [
  PLANET_MAPS.arkadia,
  PLANET_MAPS.calypso,
  PLANET_MAPS.cyrene,
  PLANET_MAPS.monria,
  PLANET_MAPS.next_island,
  PLANET_MAPS.rocktropia,
  PLANET_MAPS.toulan,
] as const

export function getMapSizePx(config: PlanetMapConfig) {
  return {
    width: config.tileCountX * config.tileSize,
    height: config.tileCountY * config.tileSize,
  }
}

export function entropiaToMapPixel(config: PlanetMapConfig, x: number, y: number) {
  const { width, height } = getMapSizePx(config)
  const px = ((x - config.minX) / (config.maxX - config.minX)) * width
  const py = height - ((y - config.minY) / (config.maxY - config.minY)) * height

  return [px, py, 0] as [number, number, number]
}

type MapView = {
  target: [number, number, number]
  zoom: number
}

export function viewToEntropiaBbox(
  config: PlanetMapConfig,
  view: MapView,
  viewportWidth: number,
  viewportHeight: number,
): ClaimsBbox | null {
  if (viewportWidth <= 0 || viewportHeight <= 0) {
    return null
  }

  const { width, height } = getMapSizePx(config)
  const scale = 2 ** view.zoom
  const visibleWidth = viewportWidth / scale
  const visibleHeight = viewportHeight / scale

  const left = Math.max(0, view.target[0] - visibleWidth / 2)
  const right = Math.min(width, view.target[0] + visibleWidth / 2)
  const top = Math.max(0, view.target[1] - visibleHeight / 2)
  const bottom = Math.min(height, view.target[1] + visibleHeight / 2)

  if (left >= right || top >= bottom) {
    return null
  }

  const xRange = config.maxX - config.minX
  const yRange = config.maxY - config.minY

  const minX = config.minX + (left / width) * xRange
  const maxX = config.minX + (right / width) * xRange
  const minY = config.minY + ((height - bottom) / height) * yRange
  const maxY = config.minY + ((height - top) / height) * yRange

  return {
    minX: Math.floor(minX),
    minY: Math.floor(minY),
    maxX: Math.ceil(maxX),
    maxY: Math.ceil(maxY),
  }
}
