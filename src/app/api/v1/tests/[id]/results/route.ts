import { authenticateApiKey } from "@/lib/api-auth";
import { getSql } from "@/lib/db";
import { NextResponse } from "next/server";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const apiUser = await authenticateApiKey(request);
  if (!apiUser) {
    return NextResponse.json({ error: "Unauthorized. Upgrade to Pro to use the API." }, { status: 403 });
  }

  try {
    const { id } = await params;
    const testId = Number(id);
    const sql = getSql();

    // Verify ownership
    const [test] = await sql`SELECT id FROM tests WHERE id = ${testId} AND user_id = ${apiUser.userId}`;
    if (!test) return NextResponse.json({ error: "Test not found" }, { status: 404 });

    const results = await sql`
      SELECT ta.id, ta.candidate_name, ta.candidate_email, ta.score, ta.efficiency,
             ta.speed, ta.accuracy, ta.attempts_used, ta.tokens_used, ta.time_spent_minutes,
             ta.status, ta.completed_at
      FROM test_attempts ta
      WHERE ta.test_id = ${testId}
      ORDER BY ta.completed_at DESC
    `;

    return NextResponse.json({ testId, results });
  } catch (e) {
    console.error("API v1 get results error:", e);
    return NextResponse.json({ error: "Failed to fetch results" }, { status: 500 });
  }
}
