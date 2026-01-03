// ===============================
// main.js (DROP-IN REPLACEMENT)
// Adds Year/Quarter selectors + makes popups/cards/chart use st.data[year][quarter]
// Defaults to 2025 Q3
// ===============================

window.selectedId = null;

// Global snapshot selection (shared by cards, chart, popup)
window.selectedYear = window.selectedYear || "2025";
window.selectedQuarter = window.selectedQuarter || "Q3";

// -------------------------------
// Snapshot controls (Year/Quarter)
// -------------------------------
function setupSnapshotControls() {
  const yearSel = document.getElementById("yearSelect");
  const qSel = document.getElementById("quarterSelect");

  // If the controls don't exist in HTML yet, silently skip (no breaking)
  if (!yearSel || !qSel) return;

  // Collect available years across stations
  const years = Array.from(
    new Set((window.STATIONS || []).flatMap((st) => Object.keys(st.data || {})))
  ).sort();

  yearSel.innerHTML = "";
  years.forEach((y) => {
    const opt = document.createElement("option");
    opt.value = y;
    opt.textContent = y;
    yearSel.appendChild(opt);
  });

  // Pick a safe default year
  const defaultYear = years.includes(window.selectedYear)
    ? window.selectedYear
    : (years[years.length - 1] || "2025");

  window.selectedYear = defaultYear;
  yearSel.value = defaultYear;

  // Quarter default
  qSel.value = window.selectedQuarter || "Q3";

  function refreshCurrentStationViews() {
    const st =
      window.STATIONS.find((s) => s.id === window.selectedId) || window.STATIONS[0];
    if (!st) return;

    // Update panels
    if (typeof window.renderParamCards === "function") window.renderParamCards(st);
    if (typeof window.renderBarChart === "function") window.renderBarChart(st);

    // Refresh popup snapshot too (no pan)
    if (typeof window.selectStation === "function") window.selectStation(st.id, false);
  }

  yearSel.addEventListener("change", () => {
    window.selectedYear = yearSel.value;
    refreshCurrentStationViews();
  });

  qSel.addEventListener("change", () => {
    window.selectedQuarter = qSel.value;
    refreshCurrentStationViews();
  });
}

// -------------------------------
// Station selection (map + panels)
// -------------------------------
window.selectStation = function selectStation(id, panTo = false) {
  const st = window.STATIONS.find((s) => s.id === id);
  if (!st) {
    console.warn("selectStation: station not found", id);
    return;
  }

  // Ensure defaults exist
  window.selectedYear = window.selectedYear || "2025";
  window.selectedQuarter = window.selectedQuarter || "Q3";

  window.selectedId = id;

  if (typeof window.renderList === "function") {
    window.renderList(document.getElementById("searchInput")?.value || "");
  }

  // Marker emphasis
  window.STATIONS.forEach((s) => {
    if (!s.__marker) return;
    const active = s.id === id;
    s.__marker.setStyle({
      radius: active ? 10 : 7,
      weight: active ? 3 : 2,
      fillOpacity: active ? 0.55 : 0.35
    });
  });

  if (panTo && window.map) {
    window.map.setView([st.lat, st.lng], Math.max(window.map.getZoom(), 12), {
      animate: true
    });
  }

  const label = document.getElementById("selectedStationLabel");
  if (label) {
    label.textContent = `${st.name} (${st.code || st.id})`;
  }

  if (typeof window.renderParamCards === "function") {
    window.renderParamCards(st);
  }

  if (typeof window.renderBarChart === "function") {
    window.renderBarChart(st);
  }

  // ---- Snapshot source (year/quarter) ----
  const year = window.selectedYear;
  const quarter = window.selectedQuarter;

  // SAFE quarter data access
  const p =
    (st?.data?.[year]?.[quarter] && typeof st.data[year][quarter] === "object")
      ? st.data[year][quarter]
      : {};

  const popupHtml = `
    <div style="font-family:system-ui;font-size:12px;line-height:1.25">
      <b>${st.name}</b><br/>
      <span style="opacity:.8">${st.municipality || ""}</span><br/>
      <span style="opacity:.8">${year} ${quarter} Snapshot</span><br/><br/>
      DO: <b>${p.do_mgL ?? "—"}</b> mg/L<br/>
      pH: <b>${p.ph ?? "—"}</b><br/>
      BOD: <b>${p.bod_mgL ?? "—"}</b> mg/L<br/>
      COD: <b>${p.fecal_coliform_ml ?? "—"}</b> mg/L<br/>
      Turbidity: <b>${p.turb_ntu ?? "—"}</b> NTU<br/>
      Temp: <b>${p.temp_c ?? "—"}</b> °C
    </div>
  `;

  if (st.__marker) {
    st.__marker.bindPopup(popupHtml).openPopup();
  }
};

// -------------------------------
// App bootstrap
// -------------------------------
function bootstrap() {
  if (typeof window.loadStations !== "function") {
    console.error("loadStations is not defined");
    return;
  }

  window.loadStations()
    .then(() => {
      console.log("stations loaded:", window.STATIONS.length);

      if (typeof window.renderList === "function") {
        window.renderList();
      }

      // Initialize year/quarter controls (if present in HTML)
      setupSnapshotControls();

      const trendToggle = document.getElementById("trendToggle");
      if (trendToggle) {
        window.showTrend = trendToggle.checked;

        trendToggle.addEventListener("change", () => {
          window.showTrend = trendToggle.checked;

          const st =
            window.STATIONS.find((s) => s.id === window.selectedId) || window.STATIONS[0];
          if (st && typeof window.renderBarChart === "function") {
            window.renderBarChart(st);
          }
        });
      }


      const search = document.getElementById("searchInput");
      if (search) {
        search.addEventListener("input", (e) => {
          window.renderList(e.target.value);
        });
      } else {
        console.warn("searchInput not found");
      }

      if (typeof window.initMap !== "function") {
        console.error("initMap is not defined");
        return;
      }

      return window.initMap();
    })
    .then(() => {
      if (window.STATIONS.length) {
        window.selectStation(window.STATIONS[0].id, false);
      } else {
        console.warn("No stations available to select");
      }
    })
    .catch((err) => {
      console.error("bootstrap failed:", err);
      alert("Prototype failed to load.\n\n" + err.message);
    });

  // Sidebar toggle (safe)
  const sidebar = document.querySelector(".sidebar");
  const toggle = document.getElementById("stationToggle");

  toggle?.addEventListener("click", () => {
    sidebar?.classList.toggle("open");
  });

  // Optional: close sidebar after selecting a station
  document.getElementById("stationList")?.addEventListener("click", (e) => {
    if (e.target.closest(".station-item")) {
      sidebar?.classList.remove("open");
    }
  });
}

document.addEventListener("DOMContentLoaded", bootstrap);
