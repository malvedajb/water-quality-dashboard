"use client";

import { useEffect, useMemo, useState } from "react";

export default function SnapshotControls() {
  const [stations, setStations] = useState([]);
  const [year, setYear] = useState("2025");
  const [quarter, setQuarter] = useState("Q3");

  // Grab stations from the same JSON
  useEffect(() => {
    fetch("/assets/data/stations.json", { cache: "no-store" })
      .then((r) => r.json())
      .then((json) => {
        const list = Array.isArray(json) ? json : json.stations || [];
        setStations(list);
      })
      .catch((err) => console.error("SnapshotControls load failed:", err));
  }, []);

  // Compute available years from data
  const years = useMemo(() => {
    const set = new Set();
    for (const st of stations) {
      const data = st.data || {};
      Object.keys(data).forEach((y) => set.add(y));
    }
    return Array.from(set).sort();
  }, [stations]);

  // Pick safe defaults once years are known
  useEffect(() => {
    if (!years.length) return;

    const defaultYear = years.includes(year) ? year : years[years.length - 1];
    setYear(defaultYear);

    window.selectedYear = defaultYear;
    window.selectedQuarter = quarter;
  }, [years]);

  // Refresh views whenever we chaange values.
  useEffect(() => {
    window.selectedYear = year;
    window.selectedQuarter = quarter;

    // Refresh current station views using legacy functions (for now)
    const st =
      window.STATIONS?.find((s) => s.id === window.selectedId) ||
      window.STATIONS?.[0];

    if (!st) return;

    // Tell the rest of the app (React + legacy) that snapshot changed
    window.dispatchEvent(
      new CustomEvent("snapshot:changed", {
        detail: { year: window.selectedYear, quarter: window.selectedQuarter },
      })
    );

    if (st && typeof window.selectStation === "function") {
      // false = do not pan; selectStation will rebuild popup HTML using new year/quarter
      window.selectStation(st.id, false);
    }
  }, [year, quarter]);

  return (
    <div className="snapshot-controls" data-react="true">
      <label>
        Year:
        <select value={year} onChange={(e) => setYear(e.target.value)}>
          {years.map((y) => (
            <option key={y} value={y}>
              {y}
            </option>
          ))}
        </select>
      </label>

      <label>
        Quarter:
        <select value={quarter} onChange={(e) => setQuarter(e.target.value)}>
          <option value="Q1">Q1</option>
          <option value="Q2">Q2</option>
          <option value="Q3">Q3</option>
          <option value="Q4">Q4</option>
        </select>
      </label>
    </div>
  );
}
