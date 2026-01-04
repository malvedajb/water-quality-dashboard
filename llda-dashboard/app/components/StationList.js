"use client";

import { useEffect, useMemo, useState } from "react";
import { useDashboard } from "../_state/DashboardStore";

export default function StationList() {
  const { stations, setStations, selectedId, setSelectedId } = useDashboard();
  const [query, setQuery] = useState("");

  // Load stations once from SQLITE
  useEffect(() => {
    let alive = true;

    fetch("/api/stations", { cache: "no-store" })
      .then((r) => {
        if (!r.ok) throw new Error(`HTTP ${r.status}`);
        return r.json();
      })
      .then((json) => {
        const list = Array.isArray(json) ? json : json.stations || [];
        if (!alive) return;

        setStations(list);

        // pick a default selection if none yet
        if (!selectedId && list.length) setSelectedId(list[0].id);
      })
      .catch((err) => console.error("StationList failed to load:", err));

    return () => {
      alive = false;
    };
  }, [setStations, setSelectedId]);

  // DOM input inregration

  useEffect(() => {
    const input = document.getElementById("searchInput");
    if (!input) return;

    const handler = (e) => setQuery(e.target.value || "");
    input.addEventListener("input", handler);

    setQuery(input.value || "");
    return () => input.removeEventListener("input", handler);
  }, []);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return stations;

    return stations.filter((s) => {
      const hay = `${s.id} ${s.code} ${s.name} ${s.municipality}`.toLowerCase();
      return hay.includes(q);
    });
  }, [stations, query]);

  function onPickStation(id) {
    setSelectedId(id);
    document.querySelector(".sidebar")?.classList.remove("open");
  }

  return (
    <div id="stationList" className="station-list" data-react="true">
      {filtered.map((s) => (
        <div
          key={s.id}
          className={`station-item ${selectedId === s.id ? "active" : ""}`}
          onClick={() => onPickStation(s.id)}
          role="button"
          tabIndex={0}
          onKeyDown={(e) => e.key === "Enter" && onPickStation(s.id)}
        >
          <div>
            <div className="station-name">{s.name}</div>
            <div className="station-meta">{s.municipality}</div>
          </div>
          <span className="badge">{s.code}</span>
        </div>
      ))}

      {filtered.length === 0 && (
        <div style={{ padding: 10, color: "rgba(11, 18, 32, .65)" }}>
          No stations match “{query}”.
        </div>
      )}
    </div>
  );
}
