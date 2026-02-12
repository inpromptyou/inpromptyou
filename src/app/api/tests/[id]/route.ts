import { auth } from "@/lib/auth";
import { getSql } from "@/lib/db";
import { NextResponse } from "next/server";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userId = (session.user as Record<string, unknown>).id;
    const { id } = await params;
    const testId = Number(id);

    if (isNaN(testId)) {
      return NextResponse.json({ error: "Invalid test ID" }, { status: 400 });
    }

    const sql = getSql();
    const rows = await sql`
      SELECT id, user_id, title, description, task_prompt, expected_outcomes, test_type, difficulty,
             time_limit_minutes, max_attempts, token_budget, model, scoring_weights, status,
             candidates_count, avg_score, completion_rate, created_at, updated_at
      FROM tests
      WHERE id = ${testId} AND user_id = ${Number(userId)}
    `;

    if (rows.length === 0) {
      return NextResponse.json({ error: "Test not found" }, { status: 404 });
    }

    return NextResponse.json(rows[0]);
  } catch (e) {
    console.error("Get test error:", e);
    return NextResponse.json({ error: "Failed to fetch test" }, { status: 500 });
  }
}
