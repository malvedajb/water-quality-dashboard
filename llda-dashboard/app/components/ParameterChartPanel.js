export default function ParameterChartPanel() {
  return (
    <div className="panel">
      <h3>
        Parameter Chart
        <span>DO, pH, BOD, COD, Turbidity, Temp</span>
      </h3>

      <label style={{ display: "none", alignItems: "center", gap: ".5rem" }}>
        <input type="checkbox" id="trendToggle" defaultChecked />
        Show trend (by quarter)
      </label>

      <div id="chartWrap">
        <canvas id="barChart" height="160"></canvas>
      </div>
    </div>
  );
}
