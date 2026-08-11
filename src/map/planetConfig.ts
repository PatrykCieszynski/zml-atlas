import type { ClaimsBbox } from '../api/claims'

export type TileCoord = readonly [x: number, y: number]

export type PlanetMapConfig = {
  id: string
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

const desktopMapCommit = 'ca55edee1e48589012e947f9fae63685fd88bc7b'
const desktopMapRoot = `https://raw.githubusercontent.com/PatrykCieszynski/ZML/${desktopMapCommit}/apps/desktop/public/Maps`

export const CALYPSO_MAP: PlanetMapConfig = {
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
  tileUrl: (x, y) => `${desktopMapRoot}/Calypso/x${x}_y${y}.webp`,
}

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
