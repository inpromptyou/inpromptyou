import { NextRequest, NextResponse } from "next/server";
import { scoreSubmission, type ScoringInput } from "@/lib/scoring";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    if (!body.testId || !body.messages || body.messages.length === 0) {
      return NextResponse.json(
        { error: "Test ID and messages are required" },
        { status: 400 }
      );
    }

    // Simulate evaluation latency (scoring would be instant, but
    // in production an LLM-as-judge call would take time)
    await new Promise((resolve) => setTimeout(resolve, 800 + Math.random() * 1200));

    const input: ScoringInput = {
      testId: body.testId,
      messages: body.messages,
      attemptsUsed: body.attemptsUsed ?? 0,
      tokensUsed: body.tokensUsed ?? 0,
      timeSpentSeconds: body.timeSpentSeconds ?? 0,
      maxAttempts: body.maxAttempts ?? 5,
      tokenBudget: body.tokenBudget ?? 2000,
      timeLimitMinutes: body.timeLimitMinutes ?? 15,
      taskDescription: body.taskDescription,
      expectedOutcome: body.expectedOutcome,
      testType: body.testType,
      customCriteria: body.customCriteria,
    };

    const result = scoreSubmission(input);

    return NextResponse.json({
      ...result,
      testId: body.testId,
    });
  } catch {
    return NextResponse.json({ error: "Failed to evaluate submission" }, { status: 500 });
  }
}
