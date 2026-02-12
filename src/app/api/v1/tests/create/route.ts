import { authenticateApiKey } from "@/lib/api-auth";
import { getSql } from "@/lib/db";
import { ensureSchema } from "@/lib/schema";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  const apiUser = await authenticateApiKey(request);
  if (!apiUser) {
    return NextResponse.json({ error: "Unauthorized. Upgrade to Pro to use the API." }, { status: 403 });
  }

  try {
    const body = await request.json();
    const { title, taskPrompt, description, testType, difficulty, timeLimitMinutes, maxAttempts, tokenBudget, model, status } = body;

    if (!title?.trim() || !taskPrompt?.trim()) {
      return NextResponse.json({ error: "title and taskPrompt are required" }, { status: 400 });
    }

    await ensureSchema();
    const sql = getSql();

    const rows = await sql`
      INSERT INTO tests (user_id, title, description, task_prompt, test_type, difficulty,
                         time_limit_minutes, max_attempts, token_budget, model, status)
      VALUES (${apiUser.userId}, ${title.trim()}, ${description?.trim() || ""}, ${taskPrompt.trim()},
              ${testType || "custom"}, ${difficulty || "intermediate"},
              ${timeLimitMinutes || 15}, ${maxAttempts || 5}, ${tokenBudget || 2000},
              ${model || "gpt-4o"}, ${status || "draft"})
      RETURNING id, title, status, created_at
    `;

    return NextResponse.json(rows[0], { status: 201 });
  } catch (e) {
    console.error("API v1 create test error:", e);
    return NextResponse.json({ error: "Failed to create test" }, { status: 500 });
  }
}
