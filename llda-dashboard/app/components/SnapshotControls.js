"use client";

import { useEffect, useMemo, useState } from "react";
import { useDashboard } from "../_state/DashboardStore";

export default function SnapshotControls() {
  const { year, setYear, quarter, setQuarter } = useDashboard();
  const [years, setYears] = useState([]);

  const quarters = useMemo(() => ["Q1", "Q2", "Q3", "Q4"], []);

  // Load available years from DB
  useEffect(() => {
    fetch("/api/meta/snapshots", { cache: "no-store" })
      .then((r) => {
        if (!r.ok) throw new Error(`HTTP ${r.status}`);
        return r.json();
      })
      .then((json) => {
        const ys = Array.isArray(json.years) ? json.years : [];
        setYears(ys);

        // ensure current year is valid
        if (ys.length && !ys.includes(year)) setYear(ys[ys.length - 1]);
      })
      .catch((err) => {
        console.error("SnapshotControls meta load failed:", err);
        // fallback if meta route is missing
        setYears(["2024", "2025"]);
      });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // If years are still loading, show safe defaults
  const yearOptions = years.length ? years : ["2024", "2025"];

  return (
    <div className="snapshot-controls" data-react="true">
      <label>
        Year:
        <select value={year} onChange={(e) => setYear(e.target.value)}>
          {yearOptions.map((y) => (
            <option key={y} value={y}>
              {y}
            </option>
          ))}
        </select>
      </label>

      <label>
        Quarter:
        <select value={quarter} onChange={(e) => setQuarter(e.target.value)}>
          {quarters.map((q) => (
            <option key={q} value={q}>
              {q}
            </option>
          ))}
        </select>
      </label>
    </div>
  );
}
