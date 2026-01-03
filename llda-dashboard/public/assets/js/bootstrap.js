(function () {
  // Load scripts one-by-one in guaranteed order
  function loadScript(src) {
    return new Promise((resolve, reject) => {
      const s = document.createElement("script");
      s.src = src;
      s.defer = true;
      s.onload = resolve;
      s.onerror = () => reject(new Error("Failed to load " + src));
      document.body.appendChild(s);
    });
  }

  async function boot() {
    // Helpful debug
    console.log("bootstrap starting...");

    // 1) External libs first
    await loadScript("https://unpkg.com/leaflet@1.9.4/dist/leaflet.js");
    await loadScript(
      "https://cdn.jsdelivr.net/npm/chart.js@4.4.1/dist/chart.umd.min.js"
    );

    console.log("libs loaded:", {
      Leaflet: !!window.L,
      Chart: !!window.Chart,
    });

    // Your app scripts in the exact order you had
    await loadScript("/assets/js/config.js");
    await loadScript("/assets/js/status.js");
    await loadScript("/assets/js/data.js");
    await loadScript("/assets/js/ui.js");
    await loadScript("/assets/js/map.js");
    await loadScript("/assets/js/charts.js");
    await loadScript("/assets/js/main.js");

    console.log("app scripts loaded (main.js executed)");
  }

  // Run after DOM is ready (safe for #map, #stationList, etc.)
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", boot);
  } else {
    boot();
  }
})();
