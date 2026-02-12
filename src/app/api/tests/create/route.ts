import { auth } from "@/lib/auth";
import { getSql } from "@/lib/db";
import { ensureSchema } from "@/lib/schema";
import { NextResponse } from "next/server";

const VALID_TEST_TYPES = ["email", "code", "data", "creative", "custom"];
const VALID_DIFFICULTIES = ["beginner", "intermediate", "advanced", "expert"];

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
    const {
      title, description, taskPrompt, expectedOutcomes,
      testType, difficulty, timeLimitMinutes, maxAttempts,
      tokenBudget, model, scoringWeights, status,
    } = body;

    // Validation
    const errors: string[] = [];
    if (!title?.trim()) errors.push("Title is required");
    if (!taskPrompt?.trim()) errors.push("Task prompt is required");
    if (title && title.length > 500) errors.push("Title must be under 500 characters");
    if (testType && !VALID_TEST_TYPES.includes(testType)) errors.push("Invalid test type");
    if (difficulty && !VALID_DIFFICULTIES.includes(difficulty)) errors.push("Invalid difficulty");
    if (timeLimitMinutes != null && (timeLimitMinutes < 1 || timeLimitMinutes > 120)) errors.push("Time limit must be 1-120 minutes");
    if (maxAttempts != null && (maxAttempts < 1 || maxAttempts > 20)) errors.push("Max attempts must be 1-20");
    if (tokenBudget != null && (tokenBudget < 100 || tokenBudget > 50000)) errors.push("Token budget must be 100-50000");

    if (errors.length > 0) {
      return NextResponse.json({ error: errors.join(". ") }, { status: 400 });
    }

    // Ensure tables exist
    await ensureSchema();

    const sql = getSql();
    const rows = await sql`
      INSERT INTO tests (user_id, title, description, task_prompt, expected_outcomes, test_type, difficulty,
                         time_limit_minutes, max_attempts, token_budget, model, scoring_weights, status)
      VALUES (${Number(userId)}, ${title.trim()}, ${description?.trim() || ""}, ${taskPrompt.trim()},
              ${expectedOutcomes?.trim() || ""}, ${testType || "custom"}, ${difficulty || "intermediate"},
              ${timeLimitMinutes || 15}, ${maxAttempts || 5}, ${tokenBudget || 2000}, ${model || "gpt-4o"},
              ${JSON.stringify(scoringWeights || { accuracy: 40, efficiency: 30, speed: 30 })},
              ${status || "draft"})
      RETURNING id, title, description, task_prompt, expected_outcomes, test_type, difficulty,
                time_limit_minutes, max_attempts, token_budget, model, scoring_weights, status, created_at
    `;

    return NextResponse.json(rows[0], { status: 201 });
  } catch (e) {
    console.error("Create test error:", e);
    return NextResponse.json({ error: "Failed to create test" }, { status: 500 });
  }
}
