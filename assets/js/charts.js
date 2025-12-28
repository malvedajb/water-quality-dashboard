window.barChart = null;

window.renderBarChart = function renderBarChart(st) {
  const p = st.parameters;
  const labels = ["DO", "pH", "BOD", "COD", "Turb.", "Temp"];
  const values = [p.do_mgL, p.ph, p.bod_mgL, p.cod_mgL, p.turb_ntu, p.temp_c];

  if (!window.barChart) {
    const ctx = document.getElementById("barChart");
    window.barChart = new Chart(ctx, {
      type: "bar",
      data: {
        labels,
        datasets: [{
          label: "Station Snapshot",
          data: values
        }]
      },
      options: {
        responsive: true,
        plugins: {
          legend: { display: false },
          tooltip: { enabled: true }
        },
        scales: {
          x: { ticks: { color: "rgba(234,241,255,.75)" }, grid: { color: "rgba(255,255,255,.06)" } },
          y: { ticks: { color: "rgba(234,241,255,.75)" }, grid: { color: "rgba(255,255,255,.06)" } }
        }
      }
    });
  } else {
    window.barChart.data.datasets[0].data = values;
    window.barChart.update();
  }
};
