# Map API Expectations

This document describes what ZML Atlas expects from ZML Cloud. It is not a frozen OpenAPI contract.

## Public catalogs

Atlas needs anonymous catalog endpoints equivalent to:

```text
GET /api/v1/public/planets
GET /api/v1/public/resources
```

Use stable machine keys/IDs for requests and display names for UI labels.

Resource catalog items may also carry presentation metadata shared with ZML Desktop:

```json
{
  "key": "belkar-stone",
  "name": "Belkar Stone",
  "type": "ore",
  "displayColor": "#C3C780"
}
```

`type` is one of `ore`, `enmatter`, `treasure` or `other`. `displayColor` is a canonical UI hint, not an ingestion requirement. Known resources can use resource-specific colors while category colors remain useful fallbacks for uncatalogued or newly introduced resources. Atlas must tolerate a missing/unknown resource and render a neutral fallback instead of failing the map.

Planet catalog data may later include verified map metadata needed to transform/render game coordinates. Do not invent that metadata before implementation has verified source data.

## Raw claim viewport query

Implemented endpoint:

```text
GET /api/v1/public/map/claims
```

Atlas sends one planet and the current visible bounding box:

```text
planet=<planet-key>
minX=<number>
minY=<number>
maxX=<number>
maxY=<number>
```

Implemented optional filters:

```text
resource=<resource-key>
minSize=<1..30>
maxSize=<1..30>
from=<ISO-8601 timestamp>
to=<ISO-8601 timestamp>
```

The current resource filter selects one resource key at a time. Multiple-resource encoding is intentionally not frozen yet. Missing size bounds mean the full `1..30` range.

The public time window may be at most 30 days. Missing `to` means server time now; missing `from` means 30 days before the effective `to`. Atlas currently exposes presets for the last 7, 14, or 30 days. The 7/14-day presets send `from`; the 30-day preset relies on the backend default. A custom date-range UI can later use the same `from`/`to` contract without changing the endpoint.

Future query controls may include:

```text
cursor=<opaque cursor, if needed>
```

## Public observation DTO

Atlas needs only anonymous map fields:

```text
resource
x
y
size
occurredAt
```

Display name, resource type and color are resolved from the public resource catalog rather than duplicated on each observation.

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

Fetch the visible region rather than the full selected time window on every load.

Recommended UI behavior:

```text
map settles after pan/zoom
        -> compute game-coordinate bbox
        -> cancel/ignore stale request
        -> fetch claims for bbox + filters
        -> render result
```

Debounce/throttle enough to avoid flooding the API while dragging.

Resource, size, and time filters are server-side query inputs. Do not fetch a capped viewport and then pretend client-side filtering represents all matching claims.

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

For same-planet, same-filter viewport refreshes, keeping useful points visible during a short refetch is acceptable. When the filter selection changes, do not display stale points from the previous filter as though they matched the new selection.

## Caching

Planet/resource catalogs change rarely and can be cached aggressively using ordinary HTTP semantics.

Raw claim viewport data is time-sensitive but does not need realtime push for MVP. Short client/server cache windows are acceptable if they do not make the selected recent window confusingly stale.

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
