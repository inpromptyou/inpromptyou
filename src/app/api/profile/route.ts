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
    const sql = getSql();

    const rows = await sql`
      SELECT id, name, email, avatar_url, bio, work_history, linkedin_url, skills_tags,
             role, account_type, plan, prompt_score, created_at
      FROM users WHERE id = ${Number(userId)}
    `;

    if (rows.length === 0) return NextResponse.json({ error: "Not found" }, { status: 404 });
    return NextResponse.json(rows[0]);
  } catch (e) {
    console.error("Get profile error:", e);
    return NextResponse.json({ error: "Failed to fetch profile" }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const userId = (session.user as Record<string, unknown>).id;
    const body = await request.json();
    const { avatarUrl, bio, workHistory, linkedinUrl, skillsTags, name } = body;

    const sql = getSql();
    const rows = await sql`
      UPDATE users SET
        avatar_url = COALESCE(${avatarUrl || null}, avatar_url),
        bio = COALESCE(${bio ?? null}, bio),
        work_history = COALESCE(${workHistory ?? null}, work_history),
        linkedin_url = COALESCE(${linkedinUrl ?? null}, linkedin_url),
        skills_tags = COALESCE(${skillsTags ?? null}, skills_tags),
        name = COALESCE(${name ?? null}, name),
        updated_at = NOW()
      WHERE id = ${Number(userId)}
      RETURNING id, name, email, avatar_url, bio, work_history, linkedin_url, skills_tags, role, plan, prompt_score
    `;

    if (rows.length === 0) return NextResponse.json({ error: "Not found" }, { status: 404 });
    return NextResponse.json(rows[0]);
  } catch (e) {
    console.error("Update profile error:", e);
    return NextResponse.json({ error: "Failed to update profile" }, { status: 500 });
  }
}
