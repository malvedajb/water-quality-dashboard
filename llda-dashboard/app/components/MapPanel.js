"use client";

import { useEffect, useMemo, useRef, useState } from "react";

function waitForLeaflet(timeoutMs = 8000) {
  return new Promise((resolve, reject) => {
    const start = Date.now();
    const tick = () => {
      if (typeof window !== "undefined" && window.L) return resolve(window.L);
      if (Date.now() - start > timeoutMs)
        return reject(new Error("Leaflet (window.L) not loaded"));
      requestAnimationFrame(tick);
    };
    tick();
  });
}

export default function MapPanel() {
  const mapRef = useRef(null);
  const markersRef = useRef(new Map()); // id -> marker
  const [stations, setStations] = useState([]);
  const [selectedId, setSelectedId] = useState(null);
  const [year, setYear] = useState("2025");
  const [quarter, setQuarter] = useState("Q3");

  // Load stations once (same JSON for now)
  useEffect(() => {
    fetch("/assets/data/stations.json", { cache: "no-store" })
      .then((r) => r.json())
      .then((json) => {
        const list = Array.isArray(json) ? json : json.stations || [];
        setStations(list);
      })
      .catch(console.error);
  }, []);

  // Keep state in sync with legacy globals + events
  useEffect(() => {
    setSelectedId(window.selectedId || null);
    setYear(window.selectedYear || "2025");
    setQuarter(window.selectedQuarter || "Q3");

    const onStation = (e) =>
      setSelectedId(e.detail?.id || window.selectedId || null);
    const onSnap = (e) => {
      setYear(e.detail?.year || window.selectedYear || "2025");
      setQuarter(e.detail?.quarter || window.selectedQuarter || "Q3");
    };

    window.addEventListener("station:selected", onStation);
    window.addEventListener("snapshot:changed", onSnap);

    return () => {
      window.removeEventListener("station:selected", onStation);
      window.removeEventListener("snapshot:changed", onSnap);
    };
  }, []);

  const stationById = useMemo(() => {
    const m = new Map();
    for (const s of stations) m.set(s.id, s);
    return m;
  }, [stations]);

  // Helper: build popup HTML using selected year/quarter (same as your legacy)
  function popupHtml(st) {
    const p =
      st?.data?.[year]?.[quarter] && typeof st.data[year][quarter] === "object"
        ? st.data[year][quarter]
        : {};

    return `
      <div style="font-family:system-ui;font-size:12px;line-height:1.25">
        <b>${st.name}</b><br/>
        <span style="opacity:.8">${st.municipality || ""}</span><br/>
        <span style="opacity:.8">${year} ${quarter} Snapshot</span><br/><br/>
        DO: <b>${p.do_mgL ?? "—"}</b> mg/L<br/>
        pH: <b>${p.ph ?? "—"}</b><br/>
        BOD: <b>${p.bod_mgL ?? "—"}</b> mg/L<br/>
        Fecal Coliform: <b>${p.fecal_coliform_ml ?? "—"}</b> MPN/100ml<br/>
        TSS: <b>${p.total_suspended_solids_mgL ?? "—"}</b> mg/L<br/>
        Ammonia: <b>${p.ammonia_mgL ?? "-"}</b> mg/L
      </div>
    `;
  }

  // Initialize map once
  useEffect(() => {
    let cancelled = false;

    (async () => {
      const L = await waitForLeaflet();
      if (cancelled) return;

      // Create map if not created
      if (!mapRef.current) {
        const map = L.map("map", {
          zoomControl: true,
        }).setView([14.3, 121.2], 10); // Laguna de Bay-ish

        L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
          attribution: "&copy; OpenStreetMap contributors",
        }).addTo(map);

        mapRef.current = map;
      }
    })().catch((err) => console.error("Map init failed:", err));

    return () => {
      cancelled = true;
    };
  }, []);

  // Create/update markers when stations load
  useEffect(() => {
    (async () => {
      const L = await waitForLeaflet();
      const map = mapRef.current;
      if (!map) return;

      // Clear old markers
      for (const [, mk] of markersRef.current) {
        mk.remove();
      }
      markersRef.current.clear();

      // Add markers
      stations.forEach((st) => {
        if (typeof st.lat !== "number" || typeof st.lng !== "number") return;

        const mk = L.circleMarker([st.lat, st.lng], {
          radius: 7,
          weight: 2,
          fillOpacity: 0.35,
        })
          .addTo(map)
          .bindPopup(popupHtml(st));

        mk.on("click", () => {
          // publish selection (React + legacy compatible)
          window.selectedId = st.id;

          // keep sidebar label logic consistent
          window.dispatchEvent(
            new CustomEvent("station:selected", { detail: { id: st.id } })
          );

          // close mobile sidebar if open
          document.querySelector(".sidebar")?.classList.remove("open");
        });

        markersRef.current.set(st.id, mk);
      });
    })().catch(console.error);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [stations, year, quarter]); // popup content depends on snapshot

  // React to selection changes: emphasize marker + pan/open popup
  useEffect(() => {
    (async () => {
      const L = await waitForLeaflet();
      const map = mapRef.current;
      if (!map) return;

      // style all markers
      for (const [id, mk] of markersRef.current) {
        const active = id === selectedId;
        mk.setStyle({
          radius: active ? 10 : 7,
          weight: active ? 3 : 2,
          fillOpacity: active ? 0.55 : 0.35,
        });
      }

      if (!selectedId) return;

      const st = stationById.get(selectedId);
      const mk = markersRef.current.get(selectedId);
      if (!st || !mk) return;

      // update popup with current year/quarter + open
      mk.bindPopup(popupHtml(st)).openPopup();

      // pan a bit closer
      map.setView([st.lat, st.lng], Math.max(map.getZoom(), 12), {
        animate: true,
      });
    })().catch(console.error);
  }, [selectedId, stationById, year, quarter]);

  return (
    <section className="map-wrap" data-react="true">
      <div id="map" style={{ height: "100%", width: "100%" }} />
    </section>
  );
}
