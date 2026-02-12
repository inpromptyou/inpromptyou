import { getSql } from "@/lib/db";
import { ensureSchema } from "@/lib/schema";
import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";

export async function POST(request: Request) {
  try {
    const { name, email, password, accountType, linkGuestEmail } = await request.json();

    if (!name || !email || !password) {
      return NextResponse.json({ error: "Name, email, and password are required" }, { status: 400 });
    }

    if (password.length < 8) {
      return NextResponse.json({ error: "Password must be at least 8 characters" }, { status: 400 });
    }

    await ensureSchema();
    const sql = getSql();

    // Check existing
    const existing = await sql`SELECT id FROM users WHERE email = ${email}`;
    if (existing.length > 0) {
      return NextResponse.json({ error: "An account with this email already exists" }, { status: 409 });
    }

    const passwordHash = await bcrypt.hash(password, 12);
    const role = accountType === "candidate" ? "candidate" : "employer";

    const rows = await sql`
      INSERT INTO users (name, email, password_hash, role, account_type)
      VALUES (${name}, ${email}, ${passwordHash}, ${role}, ${accountType || "employer"})
      RETURNING id, name, email, role, plan
    `;

    const newUserId = rows[0].id;

    // Link guest results if requested
    if (linkGuestEmail) {
      await sql`
        UPDATE test_attempts SET user_id = ${newUserId}
        WHERE candidate_email = ${linkGuestEmail} AND user_id IS NULL
      `;
    }

    return NextResponse.json(rows[0], { status: 201 });
  } catch (e: unknown) {
    console.error("Signup error:", e);
    return NextResponse.json({ error: "Failed to create account" }, { status: 500 });
  }
}
