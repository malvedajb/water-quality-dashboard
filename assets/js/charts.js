window.barChart = null;

window.renderBarChart = function renderBarChart(st) {
  const year = window.selectedYear || "2025";
  const quarter = window.selectedQuarter || "Q3";

  // The new data source (quarter snapshot)
  const p = st?.data?.[year]?.[quarter] || {};

  const labels = ["DO", "pH", "BOD", "COD", "Turb.", "Temp"];
  const values = [
    p.do_mgL ?? null,
    p.ph ?? null,
    p.bod_mgL ?? null,
    p.cod_mgL ?? null,
    p.turb_ntu ?? null,
    p.temp_c ?? null
  ];

  const datasetLabel = `Station Snapshot • ${year} ${quarter}`;

  if (!window.barChart) {
    const ctx = document.getElementById("barChart");
    window.barChart = new Chart(ctx, {
      type: "bar",
      data: {
        labels,
        datasets: [
          {
            label: datasetLabel,
            data: values
          }
        ]
      },
      options: {
        plugins: {
          legend: {
            labels: {
              color: "currentColor"
            }
          }
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
    window.barChart.data.datasets[0].label = datasetLabel;
    window.barChart.data.datasets[0].data = values;
    window.barChart.update();
  }
};
