const db = require("../../../../../lib/db");

export async function GET(request, ctx) {
  const { id } = await ctx.params;

  const { searchParams } = new URL(request.url);
  const yearStr = searchParams.get("year");
  const quarter = searchParams.get("quarter");

  const year = Number(yearStr);

  if (!id || !Number.isFinite(year) || !quarter) {
    return Response.json(
      {
        error: "Missing/invalid id, year, or quarter",
        debug: { id, yearStr, quarter },
      },
      { status: 400 }
    );
  }

  const rows = db
    .prepare(
      `SELECT parameter, value
       FROM measurements
       WHERE station_id = ?
         AND year = ?
         AND quarter = ?`
    )
    .all(id, year, quarter);

  const snapshot = {};
  for (const r of rows) snapshot[r.parameter] = r.value;

  return Response.json({ station_id: id, year, quarter, snapshot });
}
