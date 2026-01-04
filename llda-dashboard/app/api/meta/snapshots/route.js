const db = require("../../../../lib/db");

export async function GET() {
  const years = db
    .prepare(`SELECT DISTINCT year FROM measurements ORDER BY year ASC`)
    .all()
    .map((r) => String(r.year));

  const quarters = db
    .prepare(
      `SELECT DISTINCT quarter FROM measurements
       ORDER BY CASE quarter
         WHEN 'Q1' THEN 1
         WHEN 'Q2' THEN 2
         WHEN 'Q3' THEN 3
         WHEN 'Q4' THEN 4
         ELSE 99 END`
    )
    .all()
    .map((r) => r.quarter);

  return Response.json({ years, quarters });
}
