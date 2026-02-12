import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { getSql } from "@/lib/db";
import { dashboardStats } from "@/lib/mockData";

export async function GET() {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const userId = (session.user as Record<string, unknown>).id;

    const sql = getSql();

    const [testsRow] = await sql`SELECT COUNT(*)::int as count FROM tests WHERE user_id = ${userId}`;
    const [candidatesRow] = await sql`
      SELECT COUNT(*)::int as count FROM test_attempts ta
      JOIN tests t ON ta.test_id = t.id
      WHERE t.user_id = ${userId} AND ta.status = 'completed'
    `;
    const [avgRow] = await sql`
      SELECT COALESCE(AVG(ta.score), 0)::int as avg_score FROM test_attempts ta
      JOIN tests t ON ta.test_id = t.id
      WHERE t.user_id = ${userId} AND ta.status = 'completed'
    `;
    const [tokensRow] = await sql`
      SELECT COALESCE(SUM(ta.tokens_used), 0)::int as total_tokens FROM test_attempts ta
      JOIN tests t ON ta.test_id = t.id
      WHERE t.user_id = ${userId}
    `;

    return NextResponse.json({
      testsCreated: testsRow.count || 0,
      candidatesTested: candidatesRow.count || 0,
      avgPromptScore: avgRow.avg_score || 0,
      totalTokensUsed: tokensRow.total_tokens || 0,
    });
  } catch (e) {
    console.error("Dashboard stats error:", e);
    // Fallback to mock data
    return NextResponse.json(dashboardStats);
  }
}
