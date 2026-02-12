import { auth } from "@/lib/auth";
import { getSql } from "@/lib/db";
import { NextResponse } from "next/server";

const ALL_COLUMNS = `id, user_id, title, description, task_prompt, expected_outcomes, test_type, difficulty,
             time_limit_minutes, max_attempts, token_budget, model, scoring_weights, custom_criteria, status,
             cover_image, visibility, listing_type, company_name, location, salary_range,
             candidates_count, avg_score, completion_rate, created_at, updated_at`;

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

    // Public access for active tests (guest mode)
    const publicRows = await sql`
      SELECT ${sql.unsafe(ALL_COLUMNS)}
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
      SELECT ${sql.unsafe(ALL_COLUMNS)}
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

// PATCH — update test fields
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

    // Build dynamic SET clause
    const updates: string[] = [];
    const vals: Record<string, unknown> = {};

    if (body.status !== undefined) updates.push("status");
    if (body.coverImage !== undefined) { body.cover_image = body.coverImage; updates.push("cover_image"); }
    if (body.visibility !== undefined) updates.push("visibility");
    if (body.listingType !== undefined) { body.listing_type = body.listingType; updates.push("listing_type"); }

    // Simple approach: handle status toggle (most common)
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

// DELETE
export async function DELETE(
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
      DELETE FROM tests WHERE id = ${testId} AND user_id = ${Number(userId)}
      RETURNING id
    `;

    if (rows.length === 0) {
      return NextResponse.json({ error: "Test not found" }, { status: 404 });
    }

    return NextResponse.json({ success: true });
  } catch (e) {
    console.error("Delete test error:", e);
    return NextResponse.json({ error: "Failed to delete test" }, { status: 500 });
  }
}
