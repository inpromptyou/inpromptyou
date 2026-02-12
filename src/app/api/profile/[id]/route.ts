import { getSql } from "@/lib/db";
import { NextResponse } from "next/server";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const userId = Number(id);
    if (isNaN(userId)) return NextResponse.json({ error: "Invalid ID" }, { status: 400 });

    const sql = getSql();
    const rows = await sql`
      SELECT id, name, email, avatar_url, bio, work_history, linkedin_url, skills_tags,
             role, prompt_score, created_at
      FROM users WHERE id = ${userId}
    `;

    if (rows.length === 0) return NextResponse.json({ error: "Not found" }, { status: 404 });

    const user = rows[0];

    // Get test history
    const testHistory = await sql`
      SELECT t.title as "testName", ta.score, ta.completed_at as "completedAt"
      FROM test_attempts ta
      JOIN tests t ON ta.test_id = t.id
      WHERE (ta.user_id = ${userId} OR ta.candidate_email = ${user.email}) AND ta.status = 'completed'
      ORDER BY ta.completed_at DESC
      LIMIT 10
    `;

    return NextResponse.json({
      ...user,
      testHistory: testHistory.map(r => ({
        testName: r.testName,
        score: Number(r.score) || 0,
        completedAt: r.completedAt ? new Date(r.completedAt as string).toISOString().split("T")[0] : "",
      })),
    });
  } catch (e) {
    console.error("Get profile error:", e);
    return NextResponse.json({ error: "Failed to fetch profile" }, { status: 500 });
  }
}
