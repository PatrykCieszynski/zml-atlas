# Product Scope

## Product statement

ZML Atlas is a community mining map for Entropia Universe powered by observations synchronized from ZML Desktop.

The first product question is deliberately narrow:

> What mining resources are being found, where, and at what claim sizes?

## MVP

### Public map

- choose one planet at a time
- display raw claim observations
- default to observations from the last 30 days
- load observations for the visible map viewport
- filter by one or more resources as supported by the API/UI
- filter by claim-size range (`1..30`)
- inspect resource, size and observation time for a point
- clear loading/error/partial-result states

### Catalog

- planet list
- mining-resource list
- display names separate from stable API keys

Claim-size names may be added as presentation labels, but the canonical value used by filters/data is the integer size.

### Account

- Continue with Discord
- show basic signed-in account state
- list ZML Desktop sync tokens/devices
- create a sync token
- revoke a sync token

The public mining map does not require login.

## Data semantics

A public point represents an anonymous observed claim, not a guarantee that the resource is currently available at that exact coordinate.

The UI must avoid turning community beliefs into factual mechanics. In particular, recent mining activity can later be visualized as observation activity, but it should not be labeled as resource depletion unless that mechanic is established independently.

## Deliberate non-goals for MVP

- heatmaps
- automatic detection/drawing of resource fields
- clustering as the primary visualization
- realtime claim updates
- contributor/user profiles on claims
- leaderboards
- chat/social features
- user bankroll, costs or profitability
- finder/tool/amp recommendations
- mining-run management (belongs to ZML Desktop)
- admin/moderation UI unless operationally required

## After MVP

Prioritize based on actual claim volume and map usage.

Likely next layers:

1. resource-specific heatmaps
2. recent mining activity
3. claim-size spatial distributions
4. inferred resource-field regions/polygons
5. historical comparison beyond the default 30-day window

Field detection should be designed from real observations. The expected shape may be roughly rectangular/elliptical or irregular; do not hard-code a geometric assumption before analyzing the data.

## Success criteria for the first release

The MVP is useful if a player can open a planet, select a resource, and quickly understand where that resource has recently been observed and what claim sizes appeared there.

Everything else is secondary until that workflow is reliable and readable.
