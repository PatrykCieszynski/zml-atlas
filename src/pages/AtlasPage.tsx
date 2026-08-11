import { AtlasMap } from '../map/AtlasMap'

export function AtlasPage() {
  return (
    <main className="app-shell">
      <header className="topbar">
        <a className="brand" href="/" aria-label="ZML Atlas home">
          <span className="brand__mark">Z</span>
          <span>
            <strong>ZML Atlas</strong>
            <small>Community mining map</small>
          </span>
        </a>
        <div className="topbar__status">
          <span className="status-dot" />
          Live observations
        </div>
      </header>

      <section className="atlas-layout">
        <aside className="filter-panel">
          <div className="eyebrow">Planet</div>
          <h1>Calypso</h1>
          <p className="muted">Raw mining observations from the last 30 days.</p>

          <label className="field">
            <span>Resource</span>
            <select disabled defaultValue="all">
              <option value="all">All resources</option>
            </select>
          </label>

          <div className="field">
            <span>Claim size</span>
            <div className="range-row">
              <input disabled aria-label="Minimum claim size" value="1" readOnly />
              <span>to</span>
              <input disabled aria-label="Maximum claim size" value="30" readOnly />
            </div>
          </div>

          <div className="panel-note">
            The map loads real observations for the visible viewport. Resource colors come from the shared Cloud catalog; filters are the next Explore slice.
          </div>
        </aside>

        <section className="map-panel">
          <AtlasMap />
          <div className="map-legend" aria-label="Map legend">
            <span><i className="legend-dot legend-dot--ore" /> Ore</span>
            <span><i className="legend-dot legend-dot--enmatter" /> Enmatter</span>
            <span><i className="legend-dot legend-dot--treasure" /> Treasure</span>
          </div>
        </section>
      </section>
    </main>
  )
}
