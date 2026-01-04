// app/api/stations/route.js
const db = require("../../../lib/db");

exports.GET = async function GET() {
  const rows = db
    .prepare(
      `SELECT id, name, lat, lng, municipality
       FROM stations
       ORDER BY id ASC`
    )
    .all();

  return Response.json(rows);
};
