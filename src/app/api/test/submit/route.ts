import { NextRequest, NextResponse } from "next/server";

interface AnthropicMessage {
  role: "user" | "assistant";
  content: string;
}

interface AnthropicResponse {
  content: Array<{ type: string; text: string }>;
  usage: {
    input_tokens: number;
    output_tokens: number;
  };
  model: string;
}

// Model configuration
const MODELS = {
  "claude-haiku": {
    id: "claude-3-5-haiku-latest",
    name: "Claude Haiku",
    costPer1kInput: 0.00025,
    costPer1kOutput: 0.00125,
  },
  "claude-sonnet": {
    id: "claude-sonnet-4-20250514",
    name: "Claude Sonnet",
    costPer1kInput: 0.003,
    costPer1kOutput: 0.015,
  },
} as const;

type ModelKey = keyof typeof MODELS;

async function callClaude(
  prompt: string,
  taskDescription: string,
  model: ModelKey = "claude-haiku",
  conversationHistory: AnthropicMessage[] = []
): Promise<{ response: string; inputTokens: number; outputTokens: number; modelUsed: string }> {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    throw new Error("ANTHROPIC_API_KEY not configured");
  }

  const modelConfig = MODELS[model] || MODELS["claude-haiku"];

  const systemPrompt = `You are an AI assistant being used in a prompting skill assessment platform called InpromptiFy. The candidate has been given the following task:

---
${taskDescription}
---

Respond naturally and helpfully to their prompts. Your response quality will be used to evaluate how well the candidate prompted you. Be thorough but concise. Do not mention that this is a test or assessment.`;

  const messages: AnthropicMessage[] = [
    ...conversationHistory,
    { role: "user", content: prompt },
  ];

  const res = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-api-key": apiKey,
      "anthropic-version": "2023-06-01",
    },
    body: JSON.stringify({
      model: modelConfig.id,
      max_tokens: 1500,
      system: systemPrompt,
      messages,
    }),
  });

  if (!res.ok) {
    const error = await res.text();
    console.error("Anthropic API error:", error);
    throw new Error(`Anthropic API error: ${res.status}`);
  }

  const data: AnthropicResponse = await res.json();

  return {
    response: data.content[0]?.text || "No response generated.",
    inputTokens: data.usage.input_tokens,
    outputTokens: data.usage.output_tokens,
    modelUsed: modelConfig.name,
  };
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { prompt, testId, taskDescription, attemptNumber, model, conversationHistory } = body;

    if (!prompt || typeof prompt !== "string" || !prompt.trim()) {
      return NextResponse.json({ error: "Prompt is required" }, { status: 400 });
    }

    if (!testId) {
      return NextResponse.json({ error: "Test ID is required" }, { status: 400 });
    }

    // Determine model — default to haiku (cheapest)
    const selectedModel: ModelKey = (model && model in MODELS) ? model as ModelKey : "claude-haiku";

    const result = await callClaude(
      prompt,
      taskDescription || "Complete the given task as effectively as possible.",
      selectedModel,
      conversationHistory || []
    );

    return NextResponse.json({
      response: result.response,
      tokensUsed: {
        prompt: result.inputTokens,
        completion: result.outputTokens,
        total: result.inputTokens + result.outputTokens,
      },
      model: result.modelUsed,
      attemptNumber: attemptNumber || 1,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error("Submit error:", error);

    // Fallback to mock if API fails
    const mockResponse = "I apologize, but the AI service is temporarily unavailable. Please try again in a moment.";
    return NextResponse.json({
      response: mockResponse,
      tokensUsed: { prompt: 0, completion: 0, total: 0 },
      model: "fallback",
      error: "AI service temporarily unavailable",
      timestamp: new Date().toISOString(),
    }, { status: 200 });
  }
}
