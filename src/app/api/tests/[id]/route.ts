import { auth } from "@/lib/auth";
import { getSql } from "@/lib/db";
import { NextResponse } from "next/server";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const testId = Number(id);

    if (isNaN(testId)) {
      return NextResponse.json({ error: "Invalid test ID" }, { status: 400 });
    }

    const sql = getSql();

    // First try: public access for active tests (guest mode)
    const publicRows = await sql`
      SELECT id, user_id, title, description, task_prompt, expected_outcomes, test_type, difficulty,
             time_limit_minutes, max_attempts, token_budget, model, scoring_weights, status,
             candidates_count, avg_score, completion_rate, created_at, updated_at
      FROM tests
      WHERE id = ${testId} AND status = 'active'
    `;

    if (publicRows.length > 0) {
      return NextResponse.json(publicRows[0]);
    }

    // If not active, require auth and ownership
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: "Test not found" }, { status: 404 });
    }

    const userId = (session.user as Record<string, unknown>).id;
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

// PATCH — toggle publish/unpublish
export async function PATCH(
  request: Request,
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
    const body = await request.json();

    if (isNaN(testId)) {
      return NextResponse.json({ error: "Invalid test ID" }, { status: 400 });
    }

    const sql = getSql();

    if (body.status) {
      const rows = await sql`
        UPDATE tests SET status = ${body.status}, updated_at = NOW()
        WHERE id = ${testId} AND user_id = ${Number(userId)}
        RETURNING id, status
      `;

      if (rows.length === 0) {
        return NextResponse.json({ error: "Test not found" }, { status: 404 });
      }

      return NextResponse.json(rows[0]);
    }

    return NextResponse.json({ error: "No update provided" }, { status: 400 });
  } catch (e) {
    console.error("Update test error:", e);
    return NextResponse.json({ error: "Failed to update test" }, { status: 500 });
  }
}
