import { NextRequest, NextResponse } from "next/server";

/**
 * POST /api/tests/ai-suggest
 * Takes a description of what to test and returns a structured suggestion
 * for test configuration using Claude Haiku (or falls back to heuristic).
 */
export async function POST(request: NextRequest) {
  try {
    const { description } = await request.json();

    if (!description?.trim()) {
      return NextResponse.json(
        { error: "Description is required" },
        { status: 400 }
      );
    }

    const desc = description.trim().toLowerCase();

    // Try Claude API if available
    const anthropicKey = process.env.ANTHROPIC_API_KEY;
    if (anthropicKey) {
      try {
        const res = await fetch("https://api.anthropic.com/v1/messages", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "x-api-key": anthropicKey,
            "anthropic-version": "2023-06-01",
          },
          body: JSON.stringify({
            model: "claude-3-5-haiku-20241022",
            max_tokens: 1024,
            messages: [
              {
                role: "user",
                content: `You are helping an employer create an AI prompting skills test. Based on their description, generate a structured test configuration. Return ONLY valid JSON, no markdown.

Description: "${description.trim()}"

Return this exact JSON structure:
{
  "title": "short test title",
  "taskPrompt": "detailed task prompt that candidates will see (2-4 paragraphs, specific and clear)",
  "expectedOutcomes": "what a successful response looks like (bullet points as text)",
  "timeLimitMinutes": number between 5 and 60,
  "maxAttempts": number between 1 and 10,
  "difficulty": "beginner" | "intermediate" | "advanced" | "expert",
  "scoringWeights": { "accuracy": number, "efficiency": number, "speed": number },
  "customCriteria": [
    { "name": "criterion name", "description": "what to look for", "type": "rubric" | "keyword" | "tone" | "length", "weight": number 0-100, "config": {} }
  ],
  "suggestedModel": "gpt-4o" | "claude" | "gemini",
  "tags": ["tag1", "tag2"]
}

Make scoringWeights sum to 100. Make customCriteria have 3-6 items with weights summing to 100. For keyword type, config should have {"mustInclude": [...], "mustNotInclude": [...]}. For tone type, config should have {"tone": "professional"|"casual"|"technical"|"creative"}. For length type, config should have {"minWords": N, "maxWords": N}.`,
              },
            ],
          }),
        });

        if (res.ok) {
          const data = await res.json();
          const text = data.content?.[0]?.text || "";
          try {
            const suggestion = JSON.parse(text);
            return NextResponse.json({ suggestion, source: "ai" });
          } catch {
            // Fall through to heuristic
          }
        }
      } catch {
        // Fall through to heuristic
      }
    }

    // Heuristic fallback - generate suggestion based on keywords
    const suggestion = generateHeuristicSuggestion(desc, description.trim());
    return NextResponse.json({ suggestion, source: "heuristic" });
  } catch {
    return NextResponse.json(
      { error: "Failed to generate suggestion" },
      { status: 500 }
    );
  }
}

function generateHeuristicSuggestion(descLower: string, descOriginal: string) {
  // Detect category from description
  let category = "general";
  if (/email|newsletter|outreach|cold email|marketing email/i.test(descLower)) category = "email";
  else if (/code|debug|programming|function|api|software|developer/i.test(descLower)) category = "code";
  else if (/data|analy|sql|etl|pipeline|dashboard|report/i.test(descLower)) category = "data";
  else if (/creative|story|blog|article|copy|content|writing/i.test(descLower)) category = "creative";
  else if (/legal|contract|compliance|regulation|law/i.test(descLower)) category = "legal";
  else if (/customer|support|ticket|helpdesk|service/i.test(descLower)) category = "support";
  else if (/translat|locali/i.test(descLower)) category = "translation";
  else if (/research|summar|literature|review/i.test(descLower)) category = "research";
  else if (/medical|clinical|patient|health|diagnos/i.test(descLower)) category = "medical";
  else if (/technical|documentation|manual|spec/i.test(descLower)) category = "technical";

  const templates: Record<string, {
    title: string;
    taskPrompt: string;
    expectedOutcomes: string;
    timeLimitMinutes: number;
    maxAttempts: number;
    difficulty: string;
    scoringWeights: { accuracy: number; efficiency: number; speed: number };
    customCriteria: Array<{ name: string; description: string; type: string; weight: number; config: Record<string, unknown> }>;
    suggestedModel: string;
  }> = {
    email: {
      title: "Email Writing Assessment",
      taskPrompt: `Write a professional email based on the following scenario:\n\n${descOriginal}\n\nYour prompt to the AI should specify the tone, target audience, key message, call-to-action, and any formatting requirements. The goal is to get the AI to produce a polished, ready-to-send email.`,
      expectedOutcomes: "• Professional tone appropriate to the context\n• Clear subject line\n• Compelling call-to-action\n• Proper email structure (greeting, body, sign-off)\n• Audience-appropriate language",
      timeLimitMinutes: 15,
      maxAttempts: 5,
      difficulty: "intermediate",
      scoringWeights: { accuracy: 45, efficiency: 30, speed: 25 },
      customCriteria: [
        { name: "Subject Line", description: "Email includes a clear, compelling subject line", type: "rubric", weight: 20, config: {} },
        { name: "Call-to-Action", description: "Contains a specific call-to-action", type: "keyword", weight: 20, config: { mustInclude: ["call-to-action", "CTA", "click", "schedule", "reply"] } },
        { name: "Professional Tone", description: "Maintains professional tone throughout", type: "tone", weight: 25, config: { tone: "professional" } },
        { name: "Appropriate Length", description: "Email is concise but complete (100-300 words)", type: "length", weight: 15, config: { minWords: 100, maxWords: 300 } },
        { name: "Personalization", description: "Includes personalized elements for the audience", type: "rubric", weight: 20, config: {} },
      ],
      suggestedModel: "gpt-4o",
    },
    code: {
      title: "Code Generation Assessment",
      taskPrompt: `Complete the following coding task using AI assistance:\n\n${descOriginal}\n\nYour prompts should specify the programming language, expected inputs/outputs, edge cases to handle, error handling requirements, and any performance constraints.`,
      expectedOutcomes: "• Working, correct code\n• Proper error handling\n• Clean code structure\n• Edge cases addressed\n• Explanatory comments where needed",
      timeLimitMinutes: 20,
      maxAttempts: 5,
      difficulty: "intermediate",
      scoringWeights: { accuracy: 50, efficiency: 25, speed: 25 },
      customCriteria: [
        { name: "Code Correctness", description: "Generated code solves the problem correctly", type: "rubric", weight: 30, config: {} },
        { name: "Error Handling", description: "Code includes proper error/edge case handling", type: "keyword", weight: 20, config: { mustInclude: ["try", "catch", "error", "exception", "if"] } },
        { name: "Code Quality", description: "Clean, readable, well-structured code", type: "rubric", weight: 25, config: {} },
        { name: "Technical Tone", description: "Prompts use precise technical language", type: "tone", weight: 10, config: { tone: "technical" } },
        { name: "Documentation", description: "Includes comments or documentation", type: "rubric", weight: 15, config: {} },
      ],
      suggestedModel: "gpt-4o",
    },
    legal: {
      title: "Legal Document Drafting Assessment",
      taskPrompt: `Draft a legal document based on the following requirements:\n\n${descOriginal}\n\nYour prompts should specify the document type, jurisdiction, parties involved, key terms and conditions, and any specific clauses required. Demonstrate precision and attention to legal language.`,
      expectedOutcomes: "• Appropriate legal terminology\n• Correct document structure\n• All required clauses present\n• Clear, unambiguous language\n• Proper legal formatting",
      timeLimitMinutes: 25,
      maxAttempts: 5,
      difficulty: "advanced",
      scoringWeights: { accuracy: 50, efficiency: 25, speed: 25 },
      customCriteria: [
        { name: "Legal Accuracy", description: "Uses correct legal terminology and concepts", type: "rubric", weight: 30, config: {} },
        { name: "Document Structure", description: "Follows proper legal document format", type: "rubric", weight: 20, config: {} },
        { name: "Completeness", description: "All required sections and clauses present", type: "rubric", weight: 20, config: {} },
        { name: "Professional Tone", description: "Formal, precise legal language", type: "tone", weight: 15, config: { tone: "professional" } },
        { name: "Clarity", description: "Language is unambiguous and clearly defined", type: "rubric", weight: 15, config: {} },
      ],
      suggestedModel: "claude",
    },
    support: {
      title: "Customer Support Response Assessment",
      taskPrompt: `Craft customer support responses for the following scenario:\n\n${descOriginal}\n\nYour prompts should specify the customer's issue, the company context, available solutions, tone guidelines, and escalation paths. The goal is a helpful, empathetic response that resolves the issue.`,
      expectedOutcomes: "• Empathetic acknowledgment of the issue\n• Clear solution or next steps\n• Professional yet warm tone\n• Proper escalation if needed\n• Follow-up action items",
      timeLimitMinutes: 12,
      maxAttempts: 5,
      difficulty: "intermediate",
      scoringWeights: { accuracy: 40, efficiency: 35, speed: 25 },
      customCriteria: [
        { name: "Empathy", description: "Acknowledges customer's frustration or concern", type: "rubric", weight: 25, config: {} },
        { name: "Solution Provided", description: "Offers a clear resolution or next steps", type: "rubric", weight: 30, config: {} },
        { name: "Professional Tone", description: "Warm but professional tone", type: "tone", weight: 20, config: { tone: "professional" } },
        { name: "Conciseness", description: "Response is focused and not overly long (50-200 words)", type: "length", weight: 10, config: { minWords: 50, maxWords: 200 } },
        { name: "Follow-up", description: "Includes follow-up action or check-in", type: "rubric", weight: 15, config: {} },
      ],
      suggestedModel: "gpt-4o",
    },
    data: {
      title: "Data Analysis Assessment",
      taskPrompt: `Complete the following data analysis task:\n\n${descOriginal}\n\nYour prompts should specify the data structure, analysis goals, expected output format, tools/languages to use, and any visualization requirements.`,
      expectedOutcomes: "• Correct analysis approach\n• Proper data handling\n• Clear output format\n• Insights and conclusions\n• Reproducible methodology",
      timeLimitMinutes: 20,
      maxAttempts: 5,
      difficulty: "intermediate",
      scoringWeights: { accuracy: 45, efficiency: 30, speed: 25 },
      customCriteria: [
        { name: "Analysis Approach", description: "Uses appropriate analytical methods", type: "rubric", weight: 30, config: {} },
        { name: "Data Handling", description: "Properly specifies data cleaning and transformation", type: "rubric", weight: 20, config: {} },
        { name: "Technical Language", description: "Uses correct data analysis terminology", type: "tone", weight: 15, config: { tone: "technical" } },
        { name: "Output Quality", description: "Results are clear and actionable", type: "rubric", weight: 20, config: {} },
        { name: "Methodology", description: "Approach is reproducible and well-documented", type: "rubric", weight: 15, config: {} },
      ],
      suggestedModel: "gpt-4o",
    },
    creative: {
      title: "Creative Writing Assessment",
      taskPrompt: `Complete the following creative writing task:\n\n${descOriginal}\n\nYour prompts should specify the tone, style, target audience, length, format, and any creative constraints. Show your ability to guide AI to produce compelling content.`,
      expectedOutcomes: "• Engaging, well-crafted content\n• Appropriate tone and style\n• Target audience considered\n• Creative yet purposeful\n• Proper formatting",
      timeLimitMinutes: 15,
      maxAttempts: 5,
      difficulty: "intermediate",
      scoringWeights: { accuracy: 40, efficiency: 30, speed: 30 },
      customCriteria: [
        { name: "Creativity", description: "Output is original and engaging", type: "rubric", weight: 30, config: {} },
        { name: "Tone Adherence", description: "Matches the requested tone and style", type: "tone", weight: 25, config: { tone: "creative" } },
        { name: "Audience Fit", description: "Content is appropriate for target audience", type: "rubric", weight: 20, config: {} },
        { name: "Structure", description: "Well-organized with clear flow", type: "rubric", weight: 15, config: {} },
        { name: "Word Count", description: "Meets length requirements", type: "length", weight: 10, config: { minWords: 200, maxWords: 800 } },
      ],
      suggestedModel: "gpt-4o",
    },
    translation: {
      title: "Translation & Localization Assessment",
      taskPrompt: `Complete the following translation/localization task:\n\n${descOriginal}\n\nYour prompts should specify source and target languages, cultural context, formality level, domain-specific terminology, and any localization requirements beyond literal translation.`,
      expectedOutcomes: "• Accurate translation\n• Culturally appropriate\n• Consistent terminology\n• Natural-sounding in target language\n• Preserves original meaning and intent",
      timeLimitMinutes: 15,
      maxAttempts: 5,
      difficulty: "intermediate",
      scoringWeights: { accuracy: 50, efficiency: 25, speed: 25 },
      customCriteria: [
        { name: "Translation Accuracy", description: "Meaning preserved correctly", type: "rubric", weight: 35, config: {} },
        { name: "Cultural Adaptation", description: "Culturally appropriate in target language", type: "rubric", weight: 25, config: {} },
        { name: "Natural Flow", description: "Reads naturally in the target language", type: "rubric", weight: 20, config: {} },
        { name: "Terminology", description: "Uses correct domain-specific terms", type: "rubric", weight: 20, config: {} },
      ],
      suggestedModel: "claude",
    },
    research: {
      title: "Research Summary Assessment",
      taskPrompt: `Complete the following research summarization task:\n\n${descOriginal}\n\nYour prompts should specify the research topic, depth required, target audience, citation requirements, and desired format (executive summary, literature review, etc).`,
      expectedOutcomes: "• Accurate summary of key findings\n• Proper structure and organization\n• Critical analysis present\n• Appropriate depth for audience\n• Source acknowledgment",
      timeLimitMinutes: 20,
      maxAttempts: 5,
      difficulty: "intermediate",
      scoringWeights: { accuracy: 45, efficiency: 30, speed: 25 },
      customCriteria: [
        { name: "Accuracy", description: "Key findings correctly identified and summarized", type: "rubric", weight: 30, config: {} },
        { name: "Structure", description: "Well-organized with clear sections", type: "rubric", weight: 20, config: {} },
        { name: "Critical Analysis", description: "Goes beyond summary to provide insight", type: "rubric", weight: 25, config: {} },
        { name: "Academic Tone", description: "Uses appropriate scholarly language", type: "tone", weight: 15, config: { tone: "professional" } },
        { name: "Conciseness", description: "Appropriate length for the format", type: "length", weight: 10, config: { minWords: 200, maxWords: 600 } },
      ],
      suggestedModel: "claude",
    },
    medical: {
      title: "Medical Documentation Assessment",
      taskPrompt: `Complete the following medical documentation task:\n\n${descOriginal}\n\nYour prompts should specify the document type, clinical context, patient information requirements, terminology standards, and compliance requirements (HIPAA, etc).`,
      expectedOutcomes: "• Accurate medical terminology\n• Proper documentation format\n• Complete clinical information\n• Clear and concise language\n• Compliance with standards",
      timeLimitMinutes: 20,
      maxAttempts: 5,
      difficulty: "advanced",
      scoringWeights: { accuracy: 50, efficiency: 25, speed: 25 },
      customCriteria: [
        { name: "Medical Accuracy", description: "Correct medical terminology and concepts", type: "rubric", weight: 30, config: {} },
        { name: "Documentation Format", description: "Follows proper medical documentation standards", type: "rubric", weight: 25, config: {} },
        { name: "Completeness", description: "All required clinical information present", type: "rubric", weight: 20, config: {} },
        { name: "Professional Tone", description: "Formal clinical language", type: "tone", weight: 15, config: { tone: "professional" } },
        { name: "Privacy Compliance", description: "Appropriate handling of sensitive information", type: "rubric", weight: 10, config: {} },
      ],
      suggestedModel: "claude",
    },
    technical: {
      title: "Technical Writing Assessment",
      taskPrompt: `Complete the following technical documentation task:\n\n${descOriginal}\n\nYour prompts should specify the document type, technical level of the audience, specific topics to cover, formatting requirements, and any standards to follow.`,
      expectedOutcomes: "• Clear technical explanations\n• Appropriate detail level for audience\n• Proper structure and formatting\n• Accurate technical content\n• Useful examples where relevant",
      timeLimitMinutes: 20,
      maxAttempts: 5,
      difficulty: "intermediate",
      scoringWeights: { accuracy: 45, efficiency: 30, speed: 25 },
      customCriteria: [
        { name: "Technical Accuracy", description: "Content is technically correct", type: "rubric", weight: 30, config: {} },
        { name: "Clarity", description: "Complex concepts explained clearly", type: "rubric", weight: 25, config: {} },
        { name: "Structure", description: "Well-organized with headers and sections", type: "rubric", weight: 20, config: {} },
        { name: "Technical Tone", description: "Precise technical language", type: "tone", weight: 15, config: { tone: "technical" } },
        { name: "Examples", description: "Includes relevant examples or illustrations", type: "rubric", weight: 10, config: {} },
      ],
      suggestedModel: "gpt-4o",
    },
    general: {
      title: "AI Prompting Assessment",
      taskPrompt: `Complete the following task using AI assistance:\n\n${descOriginal}\n\nDemonstrate your ability to craft clear, specific prompts that produce high-quality results. Consider specifying the format, tone, constraints, and expected output.`,
      expectedOutcomes: "• Clear and specific prompt crafting\n• High-quality AI output\n• Appropriate use of constraints\n• Good iteration strategy\n• Efficient use of attempts",
      timeLimitMinutes: 15,
      maxAttempts: 5,
      difficulty: "intermediate",
      scoringWeights: { accuracy: 40, efficiency: 30, speed: 30 },
      customCriteria: [
        { name: "Prompt Clarity", description: "Prompts are clear and specific", type: "rubric", weight: 30, config: {} },
        { name: "Output Quality", description: "AI response meets the task requirements", type: "rubric", weight: 30, config: {} },
        { name: "Constraint Usage", description: "Effective use of constraints and formatting", type: "rubric", weight: 20, config: {} },
        { name: "Iteration Strategy", description: "Refinements improve output quality", type: "rubric", weight: 20, config: {} },
      ],
      suggestedModel: "gpt-4o",
    },
  };

  return templates[category] || templates.general;
}
