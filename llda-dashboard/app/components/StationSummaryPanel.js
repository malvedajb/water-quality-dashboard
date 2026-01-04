"use client";

import { useEffect, useMemo, useState } from "react";
import { useDashboard } from "../_state/DashboardStore";

const SPECS = [
  { key: "do_mgL", label: "Dissolved Oxygen", unit: "mg/L" },
  { key: "ph", label: "pH Level", unit: "" },
  { key: "bod_mgL", label: "BOD", unit: "mg/L" },
  { key: "nitrate_mgL", label: "Nitrate", unit: "mg/L" },
  { key: "total_suspended_solids_mgL", label: "TSS", unit: "mg/L" },
  { key: "phospate_mgL", label: "Phospate", unit: "mg/L" },
];

/**
 * Simple, local status helper (no window.*).
 * Adjust thresholds later to match your rubric/standards.
 */
function statusForParam(key, value) {
  if (value === null || value === undefined || Number.isNaN(value)) {
    return { label: "—", color: "rgba(11, 18, 32, .35)" };
  }

  const v = Number(value);

  // Lightweight heuristics (safe defaults)
  // You can replace these with DENR/LLDA thresholds when you're ready.
  switch (key) {
    case "do_mgL":
      // higher is better
      if (v >= 6) return { label: "Good", color: "#2EC4B6" };
      if (v >= 4) return { label: "Fair", color: "#FF9F1C" };
      return { label: "Poor", color: "#ff6b6b" };

    case "ph":
      // typical freshwater range ~6.5–8.5 (broad guideline)
      if (v >= 6.5 && v <= 8.5) return { label: "Normal", color: "#2EC4B6" };
      if ((v >= 6.0 && v < 6.5) || (v > 8.5 && v <= 9.0))
        return { label: "Watch", color: "#FF9F1C" };
      return { label: "Out of range", color: "#ff6b6b" };

    case "bod_mgL":
      // lower is better
      if (v <= 3) return { label: "Good", color: "#2EC4B6" };
      if (v <= 5) return { label: "Fair", color: "#FF9F1C" };
      return { label: "High", color: "#ff6b6b" };

    case "nitrate_mgL":
      // lower is better (very rough)
      if (v <= 10) return { label: "Low", color: "#2EC4B6" };
      if (v <= 50) return { label: "Moderate", color: "#FF9F1C" };
      return { label: "High", color: "#ff6b6b" };

    case "total_suspended_solids_mgL":
      // lower is better (rough)
      if (v <= 25) return { label: "Clear", color: "#2EC4B6" };
      if (v <= 50) return { label: "Turbid", color: "#FF9F1C" };
      return { label: "Very turbid", color: "#ff6b6b" };

    case "phospate_mgL":
      // lower is better (rough)
      if (v <= 0.05) return { label: "Low", color: "#2EC4B6" };
      if (v <= 0.1) return { label: "Moderate", color: "#FF9F1C" };
      return { label: "High", color: "#ff6b6b" };

    default:
      return { label: "—", color: "rgba(11, 18, 32, .35)" };
  }
}

export default function StationSummaryPanel() {
  const { stations, selectedId, year, quarter } = useDashboard();

  const station = useMemo(() => {
    if (!stations.length) return null;
    return stations.find((s) => s.id === selectedId) || stations[0] || null;
  }, [stations, selectedId]);

  const labelText = useMemo(() => {
    if (!station) return "No station selected";
    return `${station.name} (${station.code || station.id})`;
  }, [station]);

  const [snapshot, setSnapshot] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!station?.id) {
      setSnapshot(null);
      return;
    }

    let alive = true;
    setLoading(true);

    fetch(
      `/api/stations/${station.id}/snapshot?year=${encodeURIComponent(
        year
      )}&quarter=${encodeURIComponent(quarter)}`,
      { cache: "no-store" }
    )
      .then((r) => {
        if (!r.ok) throw new Error(`HTTP ${r.status}`);
        return r.json();
      })
      .then((json) => {
        if (!alive) return;
        setSnapshot(json?.snapshot || null);
      })
      .catch((err) => {
        console.error("StationSummaryPanel snapshot load failed:", err);
        if (!alive) return;
        setSnapshot(null);
      })
      .finally(() => {
        if (!alive) return;
        setLoading(false);
      });

    return () => {
      alive = false;
    };
  }, [station?.id, year, quarter]);

  return (
    <div className="panel">
      <h3>
        Station Summary
        <span id="selectedStationLabel">{labelText}</span>
      </h3>

      <div className="cards" data-react="true">
        {SPECS.map((s) => {
          const v = snapshot ? snapshot[s.key] : null;
          const stt = statusForParam(s.key, v);

          return (
            <div className="card" key={s.key}>
              <div className="label">{s.label}</div>

              <div className="value">
                {loading ? "…" : v ?? "—"}{" "}
                <span className="unit">{s.unit}</span>
              </div>

              <div className="status">
                <span
                  className="dot"
                  style={{
                    background: stt.color,
                    boxShadow: "0 0 0 3px rgba(255,255,255,.08)",
                  }}
                />
                {loading ? "Loading…" : stt.label}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
