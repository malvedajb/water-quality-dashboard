import MapPanel from "./MapPanel";
import DashboardPanels from "./DashboardPanels";

export default function MainPanel() {
  return (
    <main className="main">
      <MapPanel />
      <DashboardPanels />
    </main>
  );
}
