window.STATIONS = [];

window.loadStations = async function loadStations() {
  console.log("Loading stations.json...");

  const res = await fetch("./assets/stations.json");

  if (!res.ok) {
    throw new Error("Failed to load stations.json (status " + res.status + ")");
  }

  const data = await res.json();
  window.STATIONS = Array.isArray(data.stations) ? data.stations : [];

  console.log("Stations loaded:", window.STATIONS.length);
};
