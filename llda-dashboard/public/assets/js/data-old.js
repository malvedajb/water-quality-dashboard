// --------------------------------
// This file is whre the json is loaded.
//--------------------------------
window.STATIONS = [];

window.loadStations = async function loadStations() {
  console.log("Loading stations.json...");

  const res = await fetch("/assets/data/stations.json", { cache: "no-store" });

  if (!res.ok) {
    console.error("Failed to load stations.json (status " + res.status + ")");
    window.STATIONS = [];
    return [];
  }

  const json = await res.json();

  const stations = Array.isArray(json) ? json : json.stations || [];

  window.STATIONS = stations;

  console.log("Stations loaded:", window.STATIONS.length);
  return stations;
};
