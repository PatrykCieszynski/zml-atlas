# AGENTS.md

## Purpose

ZML Atlas is the public frontend for community mining observations collected by ZML Cloud.

Keep the frontend focused on answering:

- what resource was found
- where it was found
- at what claim size
- how recently it was observed

## Fixed product decisions

Treat these as current requirements unless the user explicitly changes them:

- Frontend: React + TypeScript.
- ZML Cloud is the only backend; Atlas never talks directly to PostgreSQL/PostGIS.
- One planet is displayed at a time.
- The default public data window is the last 30 days.
- MVP visualization is raw claim points.
- Resource and size filters are MVP features.
- Claim size is an integer `1..30`; textual size names are presentation metadata, not the primary value.
- Discord is the MVP login provider for account features.
- Heatmaps, clustering and automatically detected resource fields are later features based on real data.

Do not choose a map library, state framework, CSS framework or hosting provider until implementation requires the choice. Prefer the smallest dependency set that solves the product need.

## Privacy boundary

Public claim data may contain:

- planet
- X/Y position
- resource
- size
- observation timestamp

It must not expose:

- user IDs
- Discord IDs/names
- stable anonymous contributor IDs
- desktop sync-token metadata
- internal moderation/anti-abuse state

Do not infer or display contributor identity from timing or internal identifiers.

## Map behavior

The map must query ZML Cloud by planet and visible viewport/bounding box rather than downloading the entire database by default.

Do not request on every pixel of a drag. Debounce or trigger after meaningful viewport changes and cancel/ignore stale requests.

The MVP should preserve raw points. If the API reports pagination or truncation, handle it explicitly; never pretend a partial result is the complete observation set.

Game coordinates are planar Entropia coordinates, not latitude/longitude. Do not apply Earth/WGS84 assumptions in map code.

Planet-specific mapping/calibration should be isolated so different worlds can have different coordinate extents/assets.

## Authentication

The public map should remain usable without login unless product requirements change.

Discord login is for account capabilities such as viewing/creating/revoking ZML Desktop sync tokens.

Do not put Discord client secrets or any backend secret in this public repository or frontend bundle.

Prefer secure server-managed authentication/session behavior. Do not introduce long-lived sensitive tokens in `localStorage` merely for convenience.

## API boundary

Consume purpose-built public DTOs from ZML Cloud. Do not couple components to cloud database/entity shapes.

Keep API access behind a small typed client layer so endpoint/version changes do not spread through UI components.

When a formal OpenAPI contract exists, generated types/client code may replace handwritten transport types.

## UX direction

Optimize first for map readability and fast filtering, not dashboard density.

Useful MVP controls:

- planet selector
- resource selector/filter
- minimum/maximum claim size
- recent-time window if needed beyond the 30-day default
- clear legend for point/resource/size encoding

Do not imply unsupported game mechanics as facts. For example, later recent-activity layers may show where observations occurred recently, but the UI must not claim that an area is depleted unless evidence supports that conclusion.

## Scope discipline

Not MVP unless explicitly requested:

- heatmaps
- automatic resource-field polygons
- realtime streams
- social/user profiles
- leaderboards
- mining-cost/return analytics
- tool/amp optimization
- chat/community features

Build raw observation UX first, collect real usage/data, then design spatial aggregation from evidence.

## Documentation discipline

Update the relevant document when product decisions change:

- `docs/architecture.md`
- `docs/product-scope.md`
- `docs/map-api.md`

Do not present tentative implementation choices as settled architecture.
