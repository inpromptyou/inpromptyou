import { getSql } from "@/lib/db";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    const sql = getSql();
    const rows = await sql`
      SELECT j.id, j.title, j.company, j.description, j.location, j.salary_range,
             j.required_score, j.test_id, j.is_active, j.created_at,
             t.title as test_title
      FROM jobs j
      LEFT JOIN tests t ON j.test_id = t.id
      WHERE j.is_active = true
      ORDER BY j.created_at DESC
    `;
    return NextResponse.json(rows);
  } catch (e) {
    console.error("List jobs error:", e);
    return NextResponse.json([]);
  }
}
