
window.selectStation = function selectStation(id, panTo = false) {
  const st = window.STATIONS.find((s) => s.id === id);
  if (!st) {
    console.warn("selectStation: station not found", id);
    return;
  }

  // Ensure global defaults exist (safe even if already set elsewhere)
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
    window.map.setView(
      [st.lat, st.lng],
      Math.max(window.map.getZoom(), 12),
      { animate: true }
    );
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
      COD: <b>${p.cod_mgL ?? "—"}</b> mg/L<br/>
      Turbidity: <b>${p.turb_ntu ?? "—"}</b> NTU<br/>
      Temp: <b>${p.temp_c ?? "—"}</b> °C
    </div>
  `;

  if (st.__marker) {
    st.__marker.bindPopup(popupHtml).openPopup();
  }
};


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
}

const sidebar = document.querySelector(".sidebar");
const toggle = document.getElementById("stationToggle");

toggle?.addEventListener("click", () => {
  sidebar.classList.toggle("open");
});

// Optional: close dropdown after selecting a station
document.getElementById("stationList")?.addEventListener("click", (e) => {
  if (e.target.closest(".station-item")) {
    sidebar.classList.remove("open");
  }
});

document.addEventListener("DOMContentLoaded", bootstrap);
