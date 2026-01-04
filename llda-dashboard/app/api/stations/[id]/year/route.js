const db = require("../../../../../lib/db");

function isQuarter(q) {
  return q === "Q1" || q === "Q2" || q === "Q3" || q === "Q4";
}

const PARAMS = [
  "do_mgL",
  "ph",
  "bod_mgL",
  "nitrate_mgL",
  "total_suspended_solids_mgL",
  "phospate_mgL",
];

export async function GET(request, ctx) {
  const params = await ctx.params;
  const id = params?.id;

  const { searchParams } = new URL(request.url);
  const year = Number(searchParams.get("year"));

  if (!id || !Number.isFinite(year)) {
    return Response.json(
      { error: "Missing/invalid id or year" },
      { status: 400 }
    );
  }

  // Pull only the params we care about for the year
  const rows = db
    .prepare(
      `
      SELECT quarter, parameter, value
      FROM measurements
      WHERE station_id = ?
        AND year = ?
        AND parameter IN (${PARAMS.map(() => "?").join(",")})
    `
    )
    .all(id, year, ...PARAMS);

  // Pivot into: quarters[Q1] = { do_mgL: 7.3, ph: 8.1, ... }
  const quarters = {};
  for (const r of rows) {
    const q = String(r.quarter || "").toUpperCase();
    if (!isQuarter(q)) continue;

    if (!quarters[q]) quarters[q] = {};
    quarters[q][r.parameter] = r.value;
  }

  // Ensure all keys exist (optional; keeps UI stable)
  for (const q of Object.keys(quarters)) {
    for (const p of PARAMS) {
      if (!(p in quarters[q])) quarters[q][p] = null;
    }
  }

  return Response.json({ station_id: id, year, quarters });
}
