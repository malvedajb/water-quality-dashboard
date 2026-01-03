export default function StationSummaryPanel() {
  return (
    <div className="panel">
      <h3>
        Station Summary
        <span id="selectedStationLabel">No station selected</span>
      </h3>

      <div className="cards" id="paramCards"></div>
    </div>
  );
}
