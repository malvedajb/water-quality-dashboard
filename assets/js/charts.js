window.barChart = null;

window.renderBarChart = function renderBarChart(st) {
  const year = window.selectedYear || "2025";
  const quarter = window.selectedQuarter || "Q3";
  const showTrend = !!window.showTrend;

  const labels = ["DO", "pH", "BOD", "COD", "Turb.", "Temp"];

  // Helper: turn a quarter object into the bar values in label order
  const toValues = (p = {}) => [
    p.do_mgL ?? null,
    p.ph ?? null,
    p.bod_mgL ?? null,
    p.cod_mgL ?? null,
    p.turb_ntu ?? null,
    p.temp_c ?? null
  ];

  const yearData = st?.data?.[year] || {};

  let datasets = [];

  if (!showTrend) {
    // ---- Snapshot mode: one dataset for selected quarter ----
    const p = yearData?.[quarter] || {};
    datasets = [
      {
        label: `Snapshot • ${year} ${quarter}`,
        data: toValues(p)
      }
    ];
  } else {
    // ---- Trend mode (still BAR): grouped bars per parameter, one dataset per quarter ----
    const quarterOrder = ["Q1", "Q2", "Q3", "Q4"];

    datasets = quarterOrder
      .filter((q) => yearData[q]) // only quarters that exist
      .map((q) => ({
        label: `${year} ${q}`,
        data: toValues(yearData[q])
      }));
  }

  if (!window.barChart) {
    const ctx = document.getElementById("barChart");
    window.barChart = new Chart(ctx, {
      type: "bar",
      data: { labels, datasets },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: { labels: { color: "currentColor" } }
        },
        scales: {
          x: {
            ticks: { color: "currentColor" },
            grid: { color: "rgba(11,18,32,.1)" }
          },
          y: {
            ticks: { color: "currentColor" },
            grid: { color: "rgba(11,18,32,.1)" }
          }
        }
      }
    });
  } else {
    window.barChart.data.labels = labels;
    window.barChart.data.datasets = datasets;
    window.barChart.update();
  }
};
