import { getSql } from "@/lib/db";
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const listingType = searchParams.get("listing_type") || "all";
    const search = searchParams.get("q") || "";
    const sort = searchParams.get("sort") || "newest";
    const difficulty = searchParams.get("difficulty") || "";

    const sql = getSql();

    let orderBy = "t.created_at DESC";
    if (sort === "popular") orderBy = "t.candidates_count DESC";
    if (sort === "highest") orderBy = "t.avg_score DESC";

    // Build query with filters
    const rows = await sql`
      SELECT t.id, t.title, t.description, t.test_type, t.difficulty,
             t.time_limit_minutes, t.max_attempts, t.model, t.status,
             t.cover_image, t.visibility, t.listing_type,
             t.company_name, t.location, t.salary_range,
             t.candidates_count, t.avg_score, t.created_at,
             u.name as creator_name
      FROM tests t
      LEFT JOIN users u ON t.user_id = u.id
      WHERE t.status = 'active'
        AND t.visibility = 'public'
        AND (${listingType} = 'all' OR t.listing_type = ${listingType})
        AND (${difficulty} = '' OR t.difficulty = ${difficulty})
        AND (${search} = '' OR t.title ILIKE ${'%' + search + '%'} OR t.description ILIKE ${'%' + search + '%'})
      ORDER BY ${sql.unsafe(orderBy)}
      LIMIT 50
    `;

    return NextResponse.json(rows);
  } catch (e) {
    console.error("Public tests error:", e);
    return NextResponse.json([]);
  }
}
