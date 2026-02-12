import { auth } from "@/lib/auth";
import { getSql } from "@/lib/db";
import { ensureSchema } from "@/lib/schema";
import { NextResponse } from "next/server";
import crypto from "crypto";

export async function GET() {
  try {
    const session = await auth();
    if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    const userId = (session.user as Record<string, unknown>).id;
    const sql = getSql();

    const rows = await sql`
      SELECT id, key_prefix, name, plan, rate_limit, requests_today, is_active, created_at
      FROM api_keys WHERE user_id = ${Number(userId)} AND is_active = true
      ORDER BY created_at DESC
    `;
    return NextResponse.json(rows);
  } catch (e) {
    console.error("List API keys error:", e);
    return NextResponse.json([]);
  }
}

export async function POST(request: Request) {
  try {
    const session = await auth();
    if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    const user = session.user as Record<string, unknown>;
    const userId = user.id;
    const plan = (user.plan as string) || "free";

    if (plan !== "pro" && plan !== "business") {
      return NextResponse.json({ error: "Upgrade to Pro to use the API" }, { status: 403 });
    }

    await ensureSchema();
    const sql = getSql();
    const body = await request.json();

    const rawKey = `sk-inp-${crypto.randomBytes(24).toString("hex")}`;
    const keyHash = crypto.createHash("sha256").update(rawKey).digest("hex");
    const keyPrefix = rawKey.substring(0, 12);
    const rateLimit = plan === "business" ? 1000 : 100;

    const rows = await sql`
      INSERT INTO api_keys (user_id, key_hash, key_prefix, name, plan, rate_limit)
      VALUES (${Number(userId)}, ${keyHash}, ${keyPrefix}, ${body.name || "Default"}, ${plan}, ${rateLimit})
      RETURNING id, key_prefix, name, plan, rate_limit, requests_today, is_active, created_at
    `;

    return NextResponse.json({ key: rawKey, apiKey: rows[0] }, { status: 201 });
  } catch (e) {
    console.error("Create API key error:", e);
    return NextResponse.json({ error: "Failed to create API key" }, { status: 500 });
  }
}
