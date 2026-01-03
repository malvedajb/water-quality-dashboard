"use client";

import { useEffect, useMemo, useRef, useState } from "react";

export default function ParameterChartPanel() {
  const canvasRef = useRef(null);
  const chartRef = useRef(null);

  const [stations, setStations] = useState([]);
  const [selectedId, setSelectedId] = useState(null);
  const [year, setYear] = useState("2025");
  const [quarter, setQuarter] = useState("Q3");
  const [showTrend, setShowTrend] = useState(true);

  // Read browser globals ONLY after mount + listen for events
  useEffect(() => {
    setStations(window.STATIONS || []);
    setSelectedId(window.selectedId || null);
    setYear(window.selectedYear || "2025");
    setQuarter(window.selectedQuarter || "Q3");
    setShowTrend(!!window.showTrend);

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

  const chartModel = useMemo(() => {
    const labels = ["DO", "pH", "BOD", "Fcl. Col.", "TSS.", "Ammonia"];

    const toValues = (p = {}) => [
      p.do_mgL ?? null,
      p.ph ?? null,
      p.bod_mgL ?? null,
      p.fecal_coliform_ml ?? null,
      p.total_suspended_solids_mgL ?? null,
      p.ammonia_mgL ?? null,
    ];

    const yearData = station?.data?.[year] || {};
    const quarterOrder = ["Q1", "Q2", "Q3", "Q4"];
    const cutoffIndex = Math.max(0, quarterOrder.indexOf(quarter));
    const quartersToShow = quarterOrder.slice(0, cutoffIndex + 1);

    let datasets = [];

    if (!showTrend) {
      const p = yearData?.[quarter] || {};
      datasets = [
        { label: `Snapshot • ${year} ${quarter}`, data: toValues(p) },
      ];
    } else {
      datasets = quartersToShow
        .filter((q) => yearData[q])
        .map((q) => ({ label: `${year} ${q}`, data: toValues(yearData[q]) }));

      if (!datasets.length) {
        const p = yearData?.[quarter] || {};
        datasets = [
          { label: `Snapshot • ${year} ${quarter}`, data: toValues(p) },
        ];
      }
    }

    return { labels, datasets };
  }, [station, year, quarter, showTrend]);

  // Create chart once, then update on model change
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    if (typeof window === "undefined") return; // extra safety
    if (typeof window.Chart !== "function") return;

    if (!chartRef.current) {
      chartRef.current = new window.Chart(canvas, {
        type: "bar",
        data: chartModel,
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            legend: { labels: { color: "currentColor" } },
          },
          scales: {
            x: {
              ticks: { color: "currentColor" },
              grid: { color: "rgba(11,18,32,.1)" },
            },
            y: {
              ticks: { color: "currentColor" },
              grid: { color: "rgba(11,18,32,.1)" },
            },
          },
        },
      });
    } else {
      chartRef.current.data.labels = chartModel.labels;
      chartRef.current.data.datasets = chartModel.datasets;
      chartRef.current.update();
    }
  }, [chartModel]);

  // Cleanup chart instance
  useEffect(() => {
    return () => {
      if (chartRef.current) {
        chartRef.current.destroy();
        chartRef.current = null;
      }
    };
  }, []);

  function onToggleTrend(e) {
    const v = !!e.target.checked;
    setShowTrend(v);

    // keep legacy in sync
    if (typeof window !== "undefined") window.showTrend = v;
  }

  return (
    <div className="panel">
      <h3>
        Parameter Chart
        <span>DO, pH, BOD, COD, Turbidity, Temp</span>
      </h3>

      <label style={{ display: "flex", alignItems: "center", gap: ".5rem" }}>
        <input type="checkbox" checked={showTrend} onChange={onToggleTrend} />
        Show trend (by quarter)
      </label>

      <div id="chartWrap" data-react="true">
        <canvas id="barChart" ref={canvasRef} />
      </div>
    </div>
  );
}
