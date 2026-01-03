"use client";

import { useEffect, useMemo, useRef, useState } from "react";

export default function ParameterChartPanel() {
  const canvasRef = useRef(null);
  const chartRef = useRef(null);

  const [stations, setStations] = useState([]);
  const [selectedId, setSelectedId] = useState(null);
  const [year, setYear] = useState("2025");
  const [quarter, setQuarter] = useState("Q3"); // kept for snapshot logic elsewhere

  // Sync from legacy globals + events
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

  const chartModel = useMemo(() => {
    const labels = ["DO", "pH", "BOD", "Nitrate", "TSS.", "Phospate"];

    const toValues = (p = {}) => [
      p.do_mgL ?? null,
      p.ph ?? null,
      p.bod_mgL ?? null,
      p.nitrate_mgL ?? null,
      p.total_suspended_solids_mgL ?? null,
      p.phospate_mgL ?? null,
    ];

    const yearData = station?.data?.[year] || {};

    // Always show all available quarters for the year
    const quarterOrder = ["Q1", "Q2", "Q3", "Q4"];

    // cutoff up to the selected quarter (Q2 -> [Q1,Q2])
    const cutoffIndex = Math.max(0, quarterOrder.indexOf(quarter));
    const quartersToShow = quarterOrder
      .slice(0, cutoffIndex + 1)
      .filter((q) => yearData[q]); // only quarters that exist in data

    let datasets = quartersToShow.map((q) => ({
      label: `${year} ${q}`,
      data: toValues(yearData[q]),
    }));

    // Fallback safety
    if (!datasets.length) {
      const p = yearData?.[quarter] || {};
      datasets = [
        { label: `Snapshot • ${year} ${quarter}`, data: toValues(p) },
      ];
    }

    return { labels, datasets };
  }, [station, year, quarter]);

  // Create chart once, update thereafter
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
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

  // Cleanup
  useEffect(() => {
    return () => {
      if (chartRef.current) {
        chartRef.current.destroy();
        chartRef.current = null;
      }
    };
  }, []);

  return (
    <div className="panel">
      <div className="panel-header">
        <h3>
          Parameter Chart
          <span>DO, pH, BOD, Nitrate, TSS, Phospate</span>
        </h3>
      </div>

      <div id="chartWrap" data-react="true">
        <canvas id="barChart" ref={canvasRef} />
      </div>
    </div>
  );
}
