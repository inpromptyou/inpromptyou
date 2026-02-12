import { NextResponse } from "next/server";
import { getSql } from "@/lib/db";
import { mockLeaderboard } from "@/lib/mockData";

export async function GET() {
  try {
    const sql = getSql();
    const rows = await sql`
      SELECT
        ta.candidate_name as name,
        MAX(COALESCE(ta.score, 0))::int as "promptScore",
        COUNT(*)::int as "testsCompleted",
        AVG(COALESCE(ta.efficiency, 0))::int as "avgEfficiency",
        AVG(COALESCE(ta.speed, 0))::int as "avgSpeed",
        AVG(COALESCE(ta.accuracy, 0))::int as "avgAccuracy",
        AVG(COALESCE(ta.tokens_used, 0))::int as "avgTokens",
        AVG(COALESCE(ta.attempts_used, 0))::numeric(3,1) as "avgAttempts"
      FROM test_attempts ta
      WHERE ta.status = 'completed'
      GROUP BY ta.candidate_name, ta.candidate_email
      ORDER BY "promptScore" DESC
      LIMIT 50
    `;

    if (rows.length === 0) {
      return NextResponse.json(mockLeaderboard);
    }

    const leaderboard = rows.map((r, i) => ({
      rank: i + 1,
      id: `lb-${i + 1}`,
      name: r.name,
      promptScore: r.promptScore,
      testsCompleted: r.testsCompleted,
      avgEfficiency: r.avgEfficiency,
      avgSpeed: r.avgSpeed,
      avgAccuracy: r.avgAccuracy,
      avgTokens: r.avgTokens,
      avgAttempts: Number(r.avgAttempts),
      badges: r.promptScore >= 80 ? ["Top 10%"] : r.promptScore >= 70 ? ["Top 25%"] : [],
    }));

    return NextResponse.json(leaderboard);
  } catch (e) {
    console.error("Leaderboard error:", e);
    return NextResponse.json(mockLeaderboard);
  }
}
