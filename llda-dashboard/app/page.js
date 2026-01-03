export default function HomePage() {
  return (
    <>
      <header>
        <div className="title">Laguna Lake Water Quality Dashboard</div>
        <div className="subtitle">Click a station to view details.</div>
      </header>

      <div className="layout">
        {/* Stations */}
        <aside className="sidebar">
          <div className="side-top">
            <div className="search">
              <input
                id="searchInput"
                type="text"
                placeholder="Search station (e.g., Station 01, Bay, Victoria)..."
              />
            </div>

            {/* Mobile Dropdown toggle */}
            <button className="station-toggle" id="stationToggle" type="button">
              Select Station
              <span className="chev"></span>
            </button>
          </div>

          <div className="snapshot-controls">
            <label>
              Year:
              <select id="yearSelect"></select>
            </label>
            <label>
              Quarter:
              <select id="quarterSelect" defaultValue="Q1">
                <option value="Q1">Q1</option>
                <option value="Q2">Q2</option>
                <option value="Q3">Q3</option>
                <option value="Q4">Q4</option>
              </select>
            </label>
          </div>

          <div id="stationList" className="station-list"></div>
        </aside>

        <main className="main">
          <section className="map-wrap">
            <div id="map"></div>
          </section>

          <section className="dashboard">
            <div className="panel">
              <h3>
                Station Summary
                <span id="selectedStationLabel">No station selected</span>
              </h3>
              <div className="cards" id="paramCards"></div>
            </div>

            <div className="panel">
              <h3>
                Parameter Chart
                <span>DO, pH, BOD, COD, Turbidity, Temp</span>
              </h3>

              <label
                style={{ display: "none", alignItems: "center", gap: ".5rem" }}
              >
                <input type="checkbox" id="trendToggle" defaultChecked />
                Show trend (by quarter)
              </label>

              <div id="chartWrap">
                <canvas id="barChart" height="160"></canvas>
              </div>
            </div>
          </section>
        </main>
      </div>
    </>
  );
}
