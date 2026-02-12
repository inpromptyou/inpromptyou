import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { getSql } from "@/lib/db";

export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    const userId = (session.user as Record<string, unknown>).id;
    const sql = getSql();

    // Verify test belongs to user
    const tests = await sql`SELECT id FROM tests WHERE id = ${id} AND user_id = ${userId}`;
    if (tests.length === 0) {
      return NextResponse.json({ error: "Test not found" }, { status: 404 });
    }

    const rows = await sql`
      SELECT
        ta.id,
        ta.candidate_name as name,
        ta.candidate_email as email,
        COALESCE(ta.score, 0)::int as "promptScore",
        COALESCE(ta.efficiency, 0)::int as efficiency,
        COALESCE(ta.speed, 0)::int as speed,
        COALESCE(ta.accuracy, 0)::int as accuracy,
        ta.attempts_used as "attemptsUsed",
        ta.tokens_used as "tokensUsed",
        ta.time_spent_minutes as "timeSpentMinutes",
        ta.completed_at as "completedAt",
        ta.status
      FROM test_attempts ta
      WHERE ta.test_id = ${id}
      ORDER BY ta.score DESC NULLS LAST
    `;

    return NextResponse.json(rows);
  } catch (e) {
    console.error("Test candidates error:", e);
    return NextResponse.json({ error: "Failed to load candidates" }, { status: 500 });
  }
}
