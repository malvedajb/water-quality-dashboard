"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useDashboard } from "../_state/DashboardStore";

export default function ParameterChartPanel() {
  const { stations, selectedId, year, quarter } = useDashboard();

  const canvasRef = useRef(null);
  const chartRef = useRef(null);
  const ChartCtorRef = useRef(null);

  const station = useMemo(() => {
    if (!stations.length) return null;
    return stations.find((s) => s.id === selectedId) || stations[0] || null;
  }, [stations, selectedId]);

  const [quartersData, setQuartersData] = useState({});
  const [loading, setLoading] = useState(false);

  // Fetch all quarters for the selected year (EAV pivot endpoint)
  useEffect(() => {
    if (!station?.id) {
      setQuartersData({});
      return;
    }

    let alive = true;
    setLoading(true);

    fetch(`/api/stations/${station.id}/year?year=${encodeURIComponent(year)}`, {
      cache: "no-store",
    })
      .then((r) => {
        if (!r.ok) throw new Error(`HTTP ${r.status}`);
        return r.json();
      })
      .then((json) => {
        if (!alive) return;
        setQuartersData(json?.quarters || {});
      })
      .catch((err) => {
        console.error("ParameterChartPanel year load failed:", err);
        if (!alive) return;
        setQuartersData({});
      })
      .finally(() => alive && setLoading(false));

    return () => {
      alive = false;
    };
  }, [station?.id, year]);

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

    const quarterOrder = ["Q1", "Q2", "Q3", "Q4"];
    const cutoffIndex = Math.max(0, quarterOrder.indexOf(quarter));
    const quartersToShow = quarterOrder
      .slice(0, cutoffIndex + 1)
      .filter((q) => quartersData?.[q]);

    let datasets = quartersToShow.map((q) => ({
      label: `${year} ${q}`,
      data: toValues(quartersData[q]),
    }));

    if (!datasets.length) {
      const p = quartersData?.[quarter] || {};
      datasets = [
        { label: `Snapshot • ${year} ${quarter}`, data: toValues(p) },
      ];
    }

    return { labels, datasets };
  }, [quartersData, year, quarter]);

  // Create chart once + update on model changes
  useEffect(() => {
    let alive = true;

    (async () => {
      const canvas = canvasRef.current;
      if (!canvas) return;

      // Load Chart.js only on client
      if (!ChartCtorRef.current) {
        const mod = await import("chart.js/auto");
        ChartCtorRef.current = mod.default; // Chart constructor
      }
      const Chart = ChartCtorRef.current;
      if (!alive) return;

      if (!chartRef.current) {
        chartRef.current = new Chart(canvas, {
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
    })().catch(console.error);

    return () => {
      alive = false;
    };
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
        {loading && (
          <div style={{ fontSize: 12, opacity: 0.7, paddingTop: 2 }}>
            Loading {station?.code || station?.id} • {year}…
          </div>
        )}
      </div>

      <div id="chartWrap" data-react="true">
        <canvas id="barChart" ref={canvasRef} />
      </div>
    </div>
  );
}
