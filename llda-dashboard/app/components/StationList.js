"use client";

import { useEffect, useMemo, useState } from "react";

export default function StationList() {
  const [stations, setStations] = useState([]);
  const [query, setQuery] = useState("");
  const [activeId, setActiveId] = useState(null);

  useEffect(() => {
    let isMounted = true;

    fetch("/assets/data/stations.json", { cache: "no-store" })
      .then((r) => r.json())
      .then((json) => {
        const list = Array.isArray(json) ? json : json.stations || [];
        if (isMounted) setStations(list);
      })
      .catch((err) => console.error("StationList failed to load:", err));

    return () => {
      isMounted = false;
    };
  }, []);

  // Listen to the existing search input (we haven't converted it yet)
  useEffect(() => {
    const input = document.getElementById("searchInput");
    if (!input) return;

    const handler = (e) => setQuery(e.target.value || "");
    input.addEventListener("input", handler);

    setQuery(input.value || "");

    return () => input.removeEventListener("input", handler);
  }, []);

  useEffect(() => {
    const timer = setInterval(() => {
      if (window.selectedId !== activeId)
        setActiveId(window.selectedId || null);
    }, 150);

    return () => clearInterval(timer);
  }, [activeId]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return stations;

    return stations.filter((s) => {
      const hay = `${s.id} ${s.code} ${s.name} ${s.municipality}`.toLowerCase();
      return hay.includes(q);
    });
  }, [stations, query]);

  function onPickStation(id) {
    if (typeof window.selectStation === "function") {
      window.selectStation(id, true);
    }

    // close mobile dropdown after picking
    document.querySelector(".sidebar")?.classList.remove("open");
  }

  return (
    <div id="stationList" className="station-list" data-react="true">
      {filtered.map((s) => (
        <div
          key={s.id}
          className={`station-item ${activeId === s.id ? "active" : ""}`}
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
