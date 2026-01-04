"use client";

import { useEffect, useMemo, useState } from "react";

export default function SnapshotControls() {
  const [years, setYears] = useState([]);
  const [availableQuarters, setAvailableQuarters] = useState([
    "Q1",
    "Q2",
    "Q3",
    "Q4",
  ]);
  const [year, setYear] = useState("2025");
  const [quarter, setQuarter] = useState("Q3");

  // Load available years/quarters from DB meta endpoint
  useEffect(() => {
    fetch("/api/meta/snapshots", { cache: "no-store" })
      .then((r) => {
        if (!r.ok) throw new Error(`HTTP ${r.status}`);
        return r.json();
      })
      .then((json) => {
        setYears(Array.isArray(json.years) ? json.years : []);
        setAvailableQuarters(
          Array.isArray(json.quarters) && json.quarters.length
            ? json.quarters
            : ["Q1", "Q2", "Q3", "Q4"]
        );
      })
      .catch((err) => console.error("SnapshotControls meta load failed:", err));
  }, []);

  // Pick safe defaults once years are known
  useEffect(() => {
    if (!years.length) return;

    const defaultYear = years.includes(year) ? year : years[years.length - 1];
    setYear(defaultYear);

    window.selectedYear = defaultYear;
    window.selectedQuarter = quarter;
  }, [years]); // keep same behavior you had

  // Notify the rest of the app whenever year/quarter changes
  useEffect(() => {
    window.selectedYear = year;
    window.selectedQuarter = quarter;

    window.dispatchEvent(
      new CustomEvent("snapshot:changed", {
        detail: { year, quarter },
      })
    );

    // Keep legacy compatibility: re-select current station to refresh views
    const st =
      window.STATIONS?.find((s) => s.id === window.selectedId) ||
      window.STATIONS?.[0];

    if (st && typeof window.selectStation === "function") {
      window.selectStation(st.id, false);
    }
  }, [year, quarter]);

  const quarterOptions = useMemo(() => {
    // Ensure a stable order Q1..Q4 if availableQuarters is weird
    const order = ["Q1", "Q2", "Q3", "Q4"];
    const set = new Set(availableQuarters);
    return order.filter((q) => set.has(q));
  }, [availableQuarters]);

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
          {quarterOptions.map((q) => (
            <option key={q} value={q}>
              {q}
            </option>
          ))}
        </select>
      </label>
    </div>
  );
}
