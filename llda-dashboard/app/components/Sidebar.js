import SnapshotControls from "./SnapshotControls";
import StationList from "./StationList";

export default function Sidebar() {
  return (
    <aside className="sidebar">
      <div className="side-top">
        <div className="search">
          <input
            id="searchInput"
            type="text"
            placeholder="Search station (e.g., Station 01, Bay, Victoria)..."
          />
        </div>

        <button className="station-toggle" id="stationToggle" type="button">
          Select Station
          <span className="chev"></span>
        </button>
      </div>

      <SnapshotControls />

      {/* Keep the SAME id/class so legacy JS still works */}
      <StationList />
    </aside>
  );
}
