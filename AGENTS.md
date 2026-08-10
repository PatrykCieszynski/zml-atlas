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
- Build/dev tooling: Vite.
- Map renderer: deck.gl directly, using `OrthographicView` and Cartesian game coordinates rather than a geographic map engine.
- Server state: TanStack Query.
- Initial styling: plain CSS; do not add a CSS framework without a concrete need.
- ZML Cloud is the only backend; Atlas never talks directly to PostgreSQL/PostGIS.
- One planet is displayed at a time.
- The default public data window is the last 30 days.
- MVP visualization is raw claim points.
- Resource and size filters are MVP features.
- Claim size is an integer `1..30`; textual size names are presentation metadata, not the primary value.
- Discord is the MVP login provider for account features.
- Heatmaps, clustering and automatically detected resource fields are later features based on real data.

Keep dependencies small. Do not add a second map engine, global state framework, router, design system or CSS framework unless the implementation has a concrete need that the current stack cannot solve cleanly.

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

Do not request on every pixel of a drag. Commit/debounce viewport changes and cancel or ignore stale requests.

React owns controls and application state. deck.gl owns the viewport, layers and point rendering. Do not render every map point as a React component.

The MVP should preserve raw points. If the API reports pagination or truncation, handle it explicitly; never pretend a partial result is the complete observation set.

Game coordinates are planar Entropia coordinates, not latitude/longitude. Do not apply Earth/WGS84 assumptions in map code.

Planet-specific mapping/calibration should be isolated so different worlds can have different coordinate extents/assets.

## Authentication

The public map should remain usable without login unless product requirements change.

Discord login is for account capabilities and browser approval of ZML Desktop pairing requests.

Do not put Discord client secrets or any backend secret in this public repository or frontend bundle.

Prefer secure server-managed authentication/session behavior. Do not introduce long-lived sensitive tokens in `localStorage` merely for convenience.

Desktop pairing must not expose the final `zml_...` token to Atlas. The browser only approves the short-lived pairing request; the desktop exchanges its separate device secret with ZML Cloud.

## API boundary

Consume purpose-built public DTOs from ZML Cloud. Do not couple components to cloud database/entity shapes.

Keep API access behind a small typed client layer so endpoint/version changes do not spread through UI components.

During local development, use relative same-origin paths and Vite's proxy to ZML Cloud rather than scattering absolute backend URLs through components.

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
