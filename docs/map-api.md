# Map API Expectations

This document describes what ZML Atlas expects from ZML Cloud. It is not a frozen OpenAPI contract.

## Public catalogs

Atlas needs anonymous catalog endpoints equivalent to:

```text
GET /api/v1/public/planets
GET /api/v1/public/resources
```

Use stable machine keys/IDs for requests and display names for UI labels.

Planet catalog data may later include verified map metadata needed to transform/render game coordinates. Do not invent that metadata before implementation has verified source data.

## Raw claim viewport query

MVP endpoint concept:

```text
GET /api/v1/public/map/claims
```

Atlas should send one planet and the current visible bounding box:

```text
planet=<planet-key>
minX=<number>
minY=<number>
maxX=<number>
maxY=<number>
```

Optional filters conceptually include:

```text
resource=<resource-key>
minSize=<1..30>
maxSize=<1..30>
from=<timestamp>   default: now - 30 days
to=<timestamp>     default: now
cursor=<opaque cursor, if needed>
```

The exact encoding for multiple resource filters is intentionally not frozen yet.

## Public observation DTO

Atlas needs only anonymous map fields:

```text
resource
x
y
size
occurredAt
```

A resource display name may be included for convenience or resolved from the catalog.

Never design Atlas around receiving:

- user IDs
- Discord identity
- contributor aliases
- stable contributor hashes
- sync-token/device IDs
- internal claim IDs when they are not needed for rendering
- moderation/anti-abuse metadata

If a transient rendering key is needed, derive it client-side or expose a non-identifying observation key that cannot be used to correlate a contributor. Decide this only when React rendering requirements make it necessary.

## Query behavior

### One planet per request

Do not issue cross-planet map queries. Each planet has its own game coordinate space and Atlas displays one at a time.

### Viewport-driven loading

Fetch the visible region rather than the full 30-day dataset on every load.

Recommended UI behavior:

```text
map settles after pan/zoom
        -> compute game-coordinate bbox
        -> cancel/ignore stale request
        -> fetch claims for bbox + filters
        -> render result
```

Debounce/throttle enough to avoid flooding the API while dragging.

### Raw observations first

The MVP wants raw points rather than a precomputed heatmap.

If Cloud later needs response limits, it must make partial data explicit with pagination or truncation metadata. Atlas must not display a partial response as though it contains every observation in the viewport.

Where practical, Atlas can follow pages for a stable viewport. If volumes become too large for raw points at low zoom levels, that is the trigger to design an aggregate/heatmap endpoint from measured data.

## Errors and loading

Differentiate at least:

- initial loading
- viewport/filter refresh
- no observations
- API/network error
- partial/paginated result

Do not clear useful currently rendered map data immediately on every refetch if keeping it visible during a short refresh produces a better UX.

## Caching

Planet/resource catalogs change rarely and can be cached aggressively using ordinary HTTP semantics.

Raw claim viewport data is time-sensitive but does not need realtime push for MVP. Short client/server cache windows are acceptable if they do not make the 30-day map confusingly stale.

## Future spatial APIs

Potential later layers:

```text
GET /api/v1/public/map/heatmap
GET /api/v1/public/map/resource-fields
GET /api/v1/public/map/activity
```

Do not implement speculative client models for these now. When real claim volumes justify them, define them as explicit alternate map layers while preserving the raw-observation API where practical.

## Coordinate rule

Every X/Y value is an Entropia planar game coordinate on the selected planet.

The frontend may need a transform between game coordinates and pixel/tile coordinates for the selected map renderer. Keep that transform planet-specific and isolated. Never reinterpret the values as latitude/longitude merely because a map library expects geographic coordinates.
