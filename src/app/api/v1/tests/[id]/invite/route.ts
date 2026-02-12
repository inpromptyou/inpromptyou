import { authenticateApiKey } from "@/lib/api-auth";
import { getSql } from "@/lib/db";
import { NextResponse } from "next/server";

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const apiUser = await authenticateApiKey(request);
  if (!apiUser) {
    return NextResponse.json({ error: "Unauthorized. Upgrade to Pro to use the API." }, { status: 403 });
  }

  try {
    const { id } = await params;
    const testId = Number(id);
    const body = await request.json();
    const { email, name } = body;

    if (!email) return NextResponse.json({ error: "email is required" }, { status: 400 });

    const sql = getSql();

    // Verify ownership
    const [test] = await sql`SELECT id, title FROM tests WHERE id = ${testId} AND user_id = ${apiUser.userId}`;
    if (!test) return NextResponse.json({ error: "Test not found" }, { status: 404 });

    // In a real app, send email here. For now, return the test link.
    const testUrl = `/test/${testId}`;

    return NextResponse.json({
      success: true,
      message: `Invitation would be sent to ${email}`,
      testUrl,
      testTitle: test.title,
      candidateName: name || email,
    });
  } catch (e) {
    console.error("API v1 invite error:", e);
    return NextResponse.json({ error: "Failed to send invitation" }, { status: 500 });
  }
}
