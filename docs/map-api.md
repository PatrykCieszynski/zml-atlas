# Map API Expectations

This document describes what ZML Atlas expects from ZML Cloud. It is not a frozen OpenAPI contract.

## Public catalogs

Atlas uses anonymous resource metadata from:

```text
GET /api/v1/public/resources
```

Resource items expose stable `key`, display `name`, `type`, and canonical `displayColor`. The same color is used on Explore markers and on the Resources page.

## Raw claim viewport query

Explore uses:

```text
GET /api/v1/public/map/claims
```

Required query:

```text
planet=<planet-key>
minX=<number>
minY=<number>
maxX=<number>
maxY=<number>
```

Optional filters:

```text
resource=<resource-key>
minSize=<1..30>
maxSize=<1..30>
from=<ISO-8601 timestamp>
to=<ISO-8601 timestamp>
```

Raw map observations contain only `resource`, `x`, `y`, `size`, and `occurredAt`. Mining depth is intentionally not exposed per marker in this read model.

## Resource depth estimates

The Resources page uses:

```text
GET /api/v1/public/resources/depth-estimates
```

Depth estimates are global per resource, not per planet or per map deposit. Each item contains:

```text
resource
estimatedMinDepthM
sampleCount
```

`estimatedMinDepthM` is nullable until at least five valid depth observations exist. It is an estimate derived from the shallow end of the ZML dataset rather than the raw minimum:

- fewer than 5 observations: no estimate
- 5 to 9 observations: median of all available depths
- 10 or more observations: median of the 10 shallowest depths

This makes the displayed minimum less sensitive to one bad OCR/depth observation. It is an empirical ZML estimate, not an official game guarantee.

## Privacy

Never expose contributor/user IDs, Discord identity, sync-token/device IDs, internal claim IDs, or moderation/anti-abuse metadata through public Atlas endpoints.
