"use client";

import { useEffect, useMemo, useState } from "react";
import SnapshotControls from "./SnapshotControls";
import StationList from "./StationList";
import { useDashboard } from "../_state/DashboardStore";

export default function Sidebar() {
  const { stations } = useDashboard();

  const [query, setQuery] = useState("");
  const [open, setOpen] = useState(false);

  // years list can be computed once from stations (if SnapshotControls needs it)
  const years = useMemo(() => {
    const set = new Set();
    for (const st of stations) {
      const data = st?.data || {};
      Object.keys(data).forEach((y) => set.add(y));
    }
    return Array.from(set).sort();
  }, [stations]);

  // close sidebar on Escape (nice UX)
  useEffect(() => {
    const onKey = (e) => e.key === "Escape" && setOpen(false);
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  return (
    <aside className={`sidebar ${open ? "open" : ""}`}>
      <div className="side-top">
        <div className="search">
          <input
            id="searchInput"
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search station (e.g., Station 01, Bay, Victoria)..."
          />
        </div>

        <button
          className="station-toggle"
          id="stationToggle"
          type="button"
          onClick={() => setOpen((v) => !v)}
          aria-expanded={open}
        >
          Select Station
          <span className="chev" />
        </button>
      </div>

      <SnapshotControls years={years} />

      <StationList
        query={query}
        onPicked={() => setOpen(false)} // ✅ closes dropdown on mobile after selecting
      />
    </aside>
  );
}
