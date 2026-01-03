"use client";

import { useEffect, useMemo, useState } from "react";

const SPECS = [
  { key: "do_mgL", label: "Dissolved Oxygen", unit: "mg/L" },
  { key: "ph", label: "pH Level", unit: "" },
  { key: "bod_mgL", label: "BOD", unit: "mg/L" },
  { key: "fecal_coliform_ml", label: "Fecal Coliform", unit: "MPN/100ml" },
  { key: "total_suspended_solids_mgL", label: "TSS", unit: "mg/L" },
  { key: "ammonia_mgL", label: "Ammonia", unit: "mg/L" },
];

export default function StationSummaryPanel() {
  const [stations, setStations] = useState([]);
  const [selectedId, setSelectedId] = useState(null);
  const [year, setYear] = useState("2025");
  const [quarter, setQuarter] = useState("Q3");

  // Read browser globals ONLY after mount
  useEffect(() => {
    setStations(window.STATIONS || []);
    setSelectedId(window.selectedId || null);
    setYear(window.selectedYear || "2025");
    setQuarter(window.selectedQuarter || "Q3");

    const onStation = (e) => {
      setSelectedId(e.detail?.id || window.selectedId || null);
      setStations(window.STATIONS || []);
    };

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

  const station = useMemo(() => {
    return stations.find((s) => s.id === selectedId) || stations[0] || null;
  }, [stations, selectedId]);

  const labelText = useMemo(() => {
    if (!station) return "No station selected";
    return `${station.name} (${station.code || station.id})`;
  }, [station]);

  const quarterData = useMemo(() => {
    if (!station) return null;
    return station?.data?.[year]?.[quarter] || null;
  }, [station, year, quarter]);

  return (
    <div className="panel">
      <h3>
        Station Summary
        <span id="selectedStationLabel">{labelText}</span>
      </h3>

      <div className="cards" data-react="true">
        {SPECS.map((s) => {
          const v = quarterData ? quarterData[s.key] : null;

          const stt =
            typeof window !== "undefined" &&
            typeof window.statusForParam === "function"
              ? window.statusForParam(s.key, v)
              : { label: "—", color: "currentColor" };

          return (
            <div className="card" key={s.key}>
              <div className="label">{s.label}</div>

              <div className="value">
                {v ?? "—"} <span className="unit">{s.unit}</span>
              </div>

              <div className="status">
                <span
                  className="dot"
                  style={{
                    background: stt.color,
                    boxShadow: "0 0 0 3px rgba(255,255,255,.08)",
                  }}
                />
                {stt.label}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
