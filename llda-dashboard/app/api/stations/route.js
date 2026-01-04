// app/api/stations/route.js
const db = require("../../../lib/db");

exports.GET = async function GET() {
  const rows = db
    .prepare(
      `SELECT id, code, name, municipality, lat, lng
       FROM stations
       ORDER BY id ASC`
    )
    .all();

  return Response.json(rows);
};
