window.map = null;
window.markersLayer = null;

window.initMap = async function initMap() {
  window.map = L.map("map", { zoomControl: true }).setView([14.25, 121.3], 11);

  L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
    maxZoom: 19,
    attribution: "&copy; OpenStreetMap contributors"
  }).addTo(window.map);

  window.markersLayer = L.layerGroup().addTo(window.map);

  // Approx boundary (replace with real GeoJSON later)
  const approxBoundary = {
    type: "Feature",
    properties: { name: "Laguna Lake (Approx.)" },
    geometry: {
      type: "Polygon",
      coordinates: [[
        [121.10, 14.33], [121.14, 14.22], [121.19, 14.12], [121.27, 14.06],
        [121.37, 14.08], [121.45, 14.16], [121.48, 14.26], [121.44, 14.37],
        [121.33, 14.44], [121.22, 14.45], [121.14, 14.41], [121.10, 14.33]
      ]]
    }
  };

  const boundaryLayer = L.geoJSON(approxBoundary, {
    style: { color: "#6aa6ff", weight: 2, fillOpacity: 0.08 }
  }).addTo(window.map);

  window.map.fitBounds(boundaryLayer.getBounds(), { padding: [10, 10] });

  // Add station markers
  window.STATIONS.forEach((st) => {
    const marker = L.circleMarker([st.lat, st.lng], {
      radius: 7,
      weight: 2,
      color: "#6aa6ff",
      fillColor: "#6aa6ff",
      fillOpacity: 0.35
    });

    marker.on("click", () => window.selectStation(st.id, true));
    marker.bindTooltip(st.name, { direction: "top", opacity: 0.9 });

    marker.addTo(window.markersLayer);
    st.__marker = marker;
  });
};
