import { auth } from "@/lib/auth";
import { getSql } from "@/lib/db";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const userId = (session.user as Record<string, unknown>).id;
    const userEmail = session.user.email;
    const sql = getSql();

    // Get overall stats - match by user_id OR email
    const [scoreRow] = await sql`
      SELECT COALESCE(AVG(score), 0)::int as avg_score, COUNT(*)::int as tests_completed
      FROM test_attempts
      WHERE (user_id = ${Number(userId)} OR candidate_email = ${userEmail}) AND status = 'completed'
    `;

    // Recent results
    const recentResults = await sql`
      SELECT t.title as "testName", ta.score, ta.completed_at as "completedAt"
      FROM test_attempts ta
      JOIN tests t ON ta.test_id = t.id
      WHERE (ta.user_id = ${Number(userId)} OR ta.candidate_email = ${userEmail}) AND ta.status = 'completed'
      ORDER BY ta.completed_at DESC
      LIMIT 10
    `;

    return NextResponse.json({
      promptScore: scoreRow.avg_score || 0,
      testsCompleted: scoreRow.tests_completed || 0,
      recentResults: recentResults.map(r => ({
        testName: r.testName,
        score: Number(r.score) || 0,
        completedAt: r.completedAt ? new Date(r.completedAt as string).toISOString().split("T")[0] : "",
      })),
    });
  } catch (e) {
    console.error("Candidate stats error:", e);
    return NextResponse.json({ promptScore: 0, testsCompleted: 0, recentResults: [] });
  }
}
