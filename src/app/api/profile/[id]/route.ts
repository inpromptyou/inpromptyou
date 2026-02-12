import { NextRequest, NextResponse } from "next/server";
import { getSql } from "@/lib/db";

export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const sql = getSql();

    // Try to find user
    const users = await sql`SELECT id, name, avatar_url, created_at FROM users WHERE id = ${id}`;
    
    if (users.length === 0) {
      // Fallback: try to find by leaderboard position (for links from leaderboard page)
      return NextResponse.json({ error: "Profile not found" }, { status: 404 });
    }

    const user = users[0];

    // Get test history
    const history = await sql`
      SELECT
        t.title as name,
        COALESCE(ta.score, 0)::int as score,
        ta.tokens_used as tokens,
        ta.attempts_used as attempts,
        ta.completed_at as date
      FROM test_attempts ta
      JOIN tests t ON ta.test_id = t.id
      WHERE ta.candidate_email = (SELECT email FROM users WHERE id = ${id})
        AND ta.status = 'completed'
      ORDER BY ta.completed_at DESC
      LIMIT 20
    `;

    // Aggregate stats
    const [stats] = await sql`
      SELECT
        COUNT(*)::int as tests,
        COALESCE(AVG(ta.score), 0)::int as avg_score,
        COALESCE(AVG(ta.tokens_used), 0)::int as avg_tokens,
        COALESCE(AVG(ta.attempts_used), 0)::numeric(3,1) as avg_attempts
      FROM test_attempts ta
      WHERE ta.candidate_email = (SELECT email FROM users WHERE id = ${id})
        AND ta.status = 'completed'
    `;

    return NextResponse.json({
      name: user.name,
      score: stats.avg_score || 0,
      tests: stats.tests || 0,
      joinedDate: new Date(user.created_at as string).toLocaleDateString("en-US", { month: "long", year: "numeric" }),
      avgTokens: stats.avg_tokens || 0,
      avgAttempts: Number(stats.avg_attempts) || 0,
      badges: (stats.avg_score || 0) >= 80 ? ["Top 10%"] : [],
      testHistory: history.map((h) => ({
        name: h.name,
        score: h.score,
        date: h.date ? new Date(h.date as string).toISOString().split("T")[0] : "",
        tokens: h.tokens || 0,
        attempts: h.attempts || 0,
      })),
      categoryScores: [],
    });
  } catch (e) {
    console.error("Profile error:", e);
    return NextResponse.json({ error: "Failed to load profile" }, { status: 500 });
  }
}
