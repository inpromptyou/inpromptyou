import { auth } from "@/lib/auth";
import { getSql } from "@/lib/db";
import { NextResponse } from "next/server";

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    const userId = (session.user as Record<string, unknown>).id;
    const { id } = await params;

    const sql = getSql();
    await sql`
      UPDATE api_keys SET is_active = false
      WHERE id = ${Number(id)} AND user_id = ${Number(userId)}
    `;

    return NextResponse.json({ success: true });
  } catch (e) {
    console.error("Delete API key error:", e);
    return NextResponse.json({ error: "Failed to revoke key" }, { status: 500 });
  }
}
