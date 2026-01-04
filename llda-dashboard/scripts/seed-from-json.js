// scripts/seed-from-json.js
const fs = require("fs");
const path = require("path");
const db = require("../lib/db");

const seedPath = path.join(process.cwd(), "data", "stations.seed.json");
const raw = fs.readFileSync(seedPath, "utf8");
const parsed = JSON.parse(raw);

if (!parsed.stations || !Array.isArray(parsed.stations)) {
  console.error("❌ JSON must have { stations: [...] }");
  process.exit(1);
}

// Upsert stations
const upsertStation = db.prepare(`
  INSERT INTO stations (id, code, name, municipality, lat, lng)
  VALUES (@id, @code, @name, @municipality, @lat, @lng)
  ON CONFLICT(id) DO UPDATE SET
    code=excluded.code,
    name=excluded.name,
    municipality=excluded.municipality,
    lat=excluded.lat,
    lng=excluded.lng
`);

// Upsert measurements (flattened)
const upsertMeasurement = db.prepare(`
  INSERT INTO measurements (station_id, year, quarter, parameter, value)
  VALUES (@station_id, @year, @quarter, @parameter, @value)
  ON CONFLICT(station_id, year, quarter, parameter) DO UPDATE SET
    value=excluded.value
`);

function isQuarter(q) {
  return q === "Q1" || q === "Q2" || q === "Q3" || q === "Q4";
}

const tx = db.transaction(() => {
  let stationCount = 0;
  let measurementCount = 0;

  for (const st of parsed.stations) {
    // Stations table
    upsertStation.run({
      id: st.id,
      code: st.code ?? null,
      name: st.name,
      municipality: st.municipality ?? null,
      lat: st.lat,
      lng: st.lng
    });
    stationCount++;

    // Measurements table (flatten nested year -> quarter -> params)
    const data = st.data || {};
    for (const [yearStr, yearObj] of Object.entries(data)) {
      const year = Number(yearStr);
      if (!Number.isFinite(year)) continue;

      for (const [quarter, qObj] of Object.entries(yearObj || {})) {
        if (!isQuarter(quarter)) continue;

        for (const [param, value] of Object.entries(qObj || {})) {
          // store numeric values; ignore null/undefined
          const v =
            value === null || value === undefined ? null : Number(value);

          upsertMeasurement.run({
            station_id: st.id,
            year,
            quarter,
            parameter: param,
            value: Number.isFinite(v) ? v : null
          });
          measurementCount++;
        }
      }
    }
  }

  return { stationCount, measurementCount };
});

const result = tx();
console.log(
  `✅ Seed complete: ${result.stationCount} stations, ${result.measurementCount} measurements`
);

// quick sanity: count rows
const s = db.prepare("SELECT COUNT(*) as n FROM stations").get().n;
const m = db.prepare("SELECT COUNT(*) as n FROM measurements").get().n;
console.log(`DB now has: ${s} stations, ${m} measurements`);
