import { auth } from "@/lib/auth";
import { getSql } from "@/lib/db";
import { ensureSchema } from "@/lib/schema";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userId = (session.user as Record<string, unknown>).id;
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { title, company, description, location, salaryRange, requiredScore, testId } = body;

    if (!title?.trim() || !company?.trim()) {
      return NextResponse.json({ error: "Title and company are required" }, { status: 400 });
    }

    await ensureSchema();
    const sql = getSql();

    const rows = await sql`
      INSERT INTO jobs (creator_id, title, company, description, location, salary_range, required_score, test_id)
      VALUES (${Number(userId)}, ${title.trim()}, ${company.trim()}, ${description?.trim() || ""},
              ${location?.trim() || ""}, ${salaryRange?.trim() || ""}, ${requiredScore || 0}, ${testId ? Number(testId) : null})
      RETURNING *
    `;

    return NextResponse.json(rows[0], { status: 201 });
  } catch (e) {
    console.error("Create job error:", e);
    return NextResponse.json({ error: "Failed to create job" }, { status: 500 });
  }
}
