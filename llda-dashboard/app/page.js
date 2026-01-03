import Header from "./components/Header";
import Sidebar from "./components/Sidebar";
import MainPanel from "./components/MainPanel";

export default function HomePage() {
  return (
    <>
      <Header />
      <div className="layout">
        <Sidebar />
        <MainPanel />
      </div>
    </>
  );
}
