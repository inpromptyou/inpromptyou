import { auth } from "@/lib/auth";
import { getSql } from "@/lib/db";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ percentage: 100 });
    }
    const userId = (session.user as Record<string, unknown>).id;
    const sql = getSql();

    const rows = await sql`
      SELECT name, email, avatar_url, bio, work_history, linkedin_url, skills_tags
      FROM users WHERE id = ${Number(userId)}
    `;

    if (rows.length === 0) return NextResponse.json({ percentage: 0 });

    const u = rows[0];
    const fields = [
      { filled: !!u.name, weight: 20 },
      { filled: !!u.email, weight: 20 },
      { filled: !!u.avatar_url, weight: 15 },
      { filled: !!u.bio, weight: 15 },
      { filled: !!u.work_history, weight: 15 },
      { filled: !!u.linkedin_url, weight: 10 },
      { filled: !!u.skills_tags, weight: 5 },
    ];

    const percentage = fields.reduce((sum, f) => sum + (f.filled ? f.weight : 0), 0);
    return NextResponse.json({ percentage });
  } catch {
    return NextResponse.json({ percentage: 100 });
  }
}
