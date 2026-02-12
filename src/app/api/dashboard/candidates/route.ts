import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { getSql } from "@/lib/db";

export async function GET() {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const userId = (session.user as Record<string, unknown>).id;

    const sql = getSql();
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
        ta.test_id as "testId",
        t.title as "testName",
        ta.completed_at as "completedAt"
      FROM test_attempts ta
      JOIN tests t ON ta.test_id = t.id
      WHERE t.user_id = ${userId} AND ta.status = 'completed'
      ORDER BY ta.completed_at DESC
      LIMIT 100
    `;

    // Calculate percentile per candidate
    const candidates = rows.map((r, _i, arr) => {
      const betterCount = arr.filter((o) => Number(o.promptScore) < Number(r.promptScore)).length;
      return {
        ...r,
        completedAt: r.completedAt ? new Date(r.completedAt as string).toISOString().split("T")[0] : "",
        percentile: arr.length > 1 ? Math.round((betterCount / (arr.length - 1)) * 100) : 50,
      };
    });

    return NextResponse.json(candidates);
  } catch (e) {
    console.error("Dashboard candidates error:", e);
    return NextResponse.json([]);
  }
}
