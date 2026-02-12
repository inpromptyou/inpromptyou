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
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const sql = getSql();
    const tests = await sql`
      SELECT id, title, description, task_prompt, expected_outcomes, test_type, difficulty,
             time_limit_minutes, max_attempts, token_budget, model, scoring_weights, status,
             candidates_count, avg_score, completion_rate, created_at, updated_at
      FROM tests
      WHERE user_id = ${Number(userId)}
      ORDER BY created_at DESC
    `;

    return NextResponse.json(tests);
  } catch (e) {
    console.error("List tests error:", e);
    return NextResponse.json({ error: "Failed to fetch tests" }, { status: 500 });
  }
}
