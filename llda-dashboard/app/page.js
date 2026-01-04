import Header from "./components/Header";
import Sidebar from "./components/Sidebar";
import MainPanel from "./components/MainPanel";
import { DashboardProvider } from "./_state/DashboardStore";

export default function HomePage() {
  return (
    <DashboardProvider>
      <Header />
      <div className="layout">
        <Sidebar />
        <MainPanel />
      </div>
    </DashboardProvider>
  );
}
