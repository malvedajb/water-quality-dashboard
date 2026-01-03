export default function SnapshotControls() {
  return (
    <div className="snapshot-controls">
      <label>
        Year:
        <select id="yearSelect"></select>
      </label>

      <label>
        Quarter:
        <select id="quarterSelect" defaultValue="Q1">
          <option value="Q1">Q1</option>
          <option value="Q2">Q2</option>
          <option value="Q3">Q3</option>
          <option value="Q4">Q4</option>
        </select>
      </label>
    </div>
  );
}
