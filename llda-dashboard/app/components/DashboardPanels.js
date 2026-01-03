import StationSummaryPanel from "./StationSummaryPanel";
import ParameterChartPanel from "./ParameterChartPanel";

export default function DashboardPanels() {
  return (
    <section className="dashboard">
      <StationSummaryPanel />
      <ParameterChartPanel />
    </section>
  );
}
