/**
 * scoring.ts — The InpromptiFy Comprehensive Scoring Engine
 * 
 * Evaluates candidate performance across 5 dimensions:
 * 1. Prompt Quality — clarity, specificity, structure, constraints
 * 2. Efficiency — fewer attempts = better
 * 3. Speed — time taken vs time allowed
 * 4. Response Quality — how well the AI output matches expectations
 * 5. Iteration Intelligence — did they improve between attempts?
 * 
 * Produces a composite PromptScore™ (0-100) with letter grade and detailed feedback.
 */

import {
  type ScoringCriteria,
  type KeywordCriterion,
  type StructureCriterion,
  getCriteria,
} from "./scoring-criteria";

// ─── Types ───────────────────────────────────────────────────────────────────

export interface Message {
  role: "user" | "assistant";
  content: string;
}

export interface CustomCriterionDef {
  id?: string;
  name: string;
  description: string;
  type: "rubric" | "keyword" | "tone" | "length";
  weight: number;
  config: Record<string, unknown>;
}

export interface CustomCriterionResult {
  name: string;
  type: string;
  weight: number;
  score: number;
  maxScore: number;
  details: string;
}

export interface ScoringInput {
  testId: string;
  messages: Message[];
  attemptsUsed: number;
  tokensUsed: number;
  timeSpentSeconds: number;
  maxAttempts: number;
  tokenBudget: number;
  timeLimitMinutes: number;
  taskDescription?: string;
  expectedOutcome?: string;
  testType?: string;
  customCriteria?: CustomCriterionDef[];
}

export interface DimensionScore {
  /** Score 0-100 */
  score: number;
  /** Weight used in composite (0-1) */
  weight: number;
  /** Weighted contribution to composite */
  weightedScore: number;
  /** What went well */
  strengths: string[];
  /** What could improve */
  weaknesses: string[];
  /** Specific tips */
  suggestions: string[];
}

export type LetterGrade = "S" | "A" | "B" | "C" | "D" | "F";

export interface ScoringResult {
  /** Composite score 0-100 */
  promptScore: number;
  /** Letter grade */
  letterGrade: LetterGrade;
  /** Percentile rank (0-99) */
  percentile: number;
  /** Individual dimension scores */
  dimensions: {
    promptQuality: DimensionScore;
    efficiency: DimensionScore;
    speed: DimensionScore;
    responseQuality: DimensionScore;
    iterationIQ: DimensionScore;
  };
  /** Overall feedback */
  feedback: {
    summary: string;
    topStrengths: string[];
    topWeaknesses: string[];
    improvementPlan: string[];
  };
  /** Raw stats for display */
  stats: {
    attemptsUsed: number;
    tokensUsed: number;
    timeSpentSeconds: number;
    maxAttempts: number;
    tokenBudget: number;
    timeLimitMinutes: number;
    totalPrompts: number;
    avgPromptLength: number;
    totalResponseLength: number;
  };
  /** Custom criteria results (if custom criteria were used) */
  customCriteriaResults?: CustomCriterionResult[];
  /** Criteria used */
  criteriaUsed: string;
  /** Timestamp */
  evaluatedAt: string;
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

/** Clamp a value between min and max */
function clamp(value: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, value));
}

/** Count regex matches in text */
function countMatches(text: string, pattern: string): number {
  try {
    const regex = new RegExp(pattern, "gi");
    return (text.match(regex) || []).length;
  } catch {
    return text.toLowerCase().includes(pattern.toLowerCase()) ? 1 : 0;
  }
}

/** Detect structural elements in text */
function detectStructure(text: string, type: StructureCriterion["type"]): boolean {
  switch (type) {
    case "headers":
      return /^#{1,6}\s+.+|^\*\*.+\*\*\s*$/m.test(text);
    case "bullet_list":
      return /^[\s]*[-*•]\s+.+/m.test(text);
    case "numbered_list":
      return /^[\s]*\d+[.)]\s+.+/m.test(text);
    case "code_block":
      return /```[\s\S]*?```/.test(text);
    case "paragraphs":
      return text.split(/\n\n+/).filter(p => p.trim().length > 20).length >= 2;
    case "greeting":
      return /^(dear|hi|hello|hey|good\s+(morning|afternoon|evening))/im.test(text);
    case "signoff":
      return /(regards|sincerely|best|cheers|thanks|thank you)\s*[,.]?\s*$/im.test(text);
    case "subject_line":
      return /\*?\*?subject\s*:?\*?\*?\s*.+/i.test(text);
    default:
      return false;
  }
}

/** Get letter grade from score */
function getLetterGrade(score: number): LetterGrade {
  if (score >= 95) return "S";
  if (score >= 80) return "A";
  if (score >= 65) return "B";
  if (score >= 50) return "C";
  if (score >= 35) return "D";
  return "F";
}

/** Calculate percentile from score using a realistic distribution curve */
function calculatePercentile(score: number): number {
  // Sigmoid-based percentile mapping centered around score 60
  // This creates a bell-curve-like distribution
  const x = (score - 58) / 15; // center at 58, spread of 15
  const sigmoid = 1 / (1 + Math.exp(-x));
  const percentile = Math.round(sigmoid * 96 + 2); // range 2-98
  return clamp(percentile, 1, 99);
}

// ─── Dimension Scorers ───────────────────────────────────────────────────────

/**
 * Prompt Quality Score (0-100)
 * Evaluates: clarity, specificity, structure, constraints, formatting instructions
 */
function scorePromptQuality(
  userMessages: string[],
  criteria: ScoringCriteria
): DimensionScore {
  if (userMessages.length === 0) {
    return {
      score: 0, weight: criteria.weights.promptQuality, weightedScore: 0,
      strengths: [], weaknesses: ["No prompts submitted"], suggestions: ["Submit at least one prompt"],
    };
  }

  const strengths: string[] = [];
  const weaknesses: string[] = [];
  const suggestions: string[] = [];
  let points = 0;
  let maxPoints = 0;

  // --- Length analysis (max 20 points) ---
  maxPoints += 20;
  const allPromptText = userMessages.join(" ");
  const avgLength = allPromptText.length / userMessages.length;
  const [idealMin, idealMax] = criteria.idealPromptLengthRange;

  if (avgLength >= idealMin && avgLength <= idealMax) {
    points += 20;
    strengths.push("Prompt length is well-calibrated");
  } else if (avgLength >= criteria.minPromptLength) {
    points += 12;
    if (avgLength < idealMin) {
      suggestions.push("Try adding more detail and context to your prompts");
    } else {
      suggestions.push("Consider being more concise — focus on key instructions");
    }
  } else {
    points += 4;
    weaknesses.push("Prompts are too short to convey sufficient context");
    suggestions.push(`Aim for at least ${idealMin} characters with clear instructions`);
  }

  // --- Keyword matching (max 30 points) ---
  const promptKeywords = criteria.keywords.filter(k => k.target === "prompt" || k.target === "both");
  const keywordMaxPoints = Math.min(30, promptKeywords.reduce((sum, k) => sum + k.points, 0));
  maxPoints += 30;
  let keywordPoints = 0;
  const matchedKeywords: string[] = [];
  const missedKeywords: string[] = [];

  for (const kw of promptKeywords) {
    if (countMatches(allPromptText, kw.pattern) > 0) {
      keywordPoints += kw.points;
      matchedKeywords.push(kw.label);
    } else {
      missedKeywords.push(kw.label);
    }
  }

  const keywordScore = keywordMaxPoints > 0
    ? Math.round((keywordPoints / keywordMaxPoints) * 30)
    : 15;
  points += keywordScore;

  if (matchedKeywords.length > 0) {
    strengths.push(`Good specificity: ${matchedKeywords.slice(0, 3).join(", ")}`);
  }
  if (missedKeywords.length > 0 && missedKeywords.length <= 3) {
    suggestions.push(`Consider adding: ${missedKeywords.join(", ")}`);
  } else if (missedKeywords.length > 3) {
    suggestions.push(`Consider adding: ${missedKeywords.slice(0, 3).join(", ")}, and more`);
  }

  // --- Structure & formatting in prompts (max 20 points) ---
  maxPoints += 20;
  let structurePoints = 0;

  // Check if prompts use clear structure
  const hasNumberedInstructions = /\d+[.)]\s+/.test(allPromptText);
  const hasBulletPoints = /[-*•]\s+/.test(allPromptText);
  const hasSections = /\n\n/.test(allPromptText);
  const hasExplicitFormatting = /format|structure|organize|layout|section|heading/i.test(allPromptText);

  if (hasNumberedInstructions) { structurePoints += 6; strengths.push("Uses numbered instructions for clarity"); }
  if (hasBulletPoints) { structurePoints += 5; }
  if (hasSections) { structurePoints += 4; }
  if (hasExplicitFormatting) { structurePoints += 5; strengths.push("Includes formatting instructions"); }

  if (structurePoints === 0) {
    weaknesses.push("Prompts lack structured formatting");
    suggestions.push("Use numbered lists or bullet points to organize your instructions");
  }
  points += Math.min(20, structurePoints);

  // --- Constraint specification (max 15 points) ---
  maxPoints += 15;
  let constraintPoints = 0;
  const hasNegativeConstraints = /don't|do not|avoid|never|without|exclude/i.test(allPromptText);
  const hasPositiveConstraints = /must|should|ensure|require|include|always/i.test(allPromptText);
  const hasLengthConstraint = /\d+\s*words|word count|length|short|brief|concise|detailed/i.test(allPromptText);

  if (hasNegativeConstraints) { constraintPoints += 5; strengths.push("Sets clear boundaries (what to avoid)"); }
  if (hasPositiveConstraints) { constraintPoints += 5; }
  if (hasLengthConstraint) { constraintPoints += 5; }

  if (constraintPoints === 0) {
    suggestions.push("Add constraints to guide the AI (e.g., word limits, what to avoid)");
  }
  points += Math.min(15, constraintPoints);

  // --- Context & role setting (max 15 points) ---
  maxPoints += 15;
  let contextPoints = 0;
  const hasRoleSetting = /you are|act as|role|persona|imagine|pretend/i.test(allPromptText);
  const hasContextSetting = /context|background|situation|scenario/i.test(allPromptText);
  const hasAudienceAwareness = /audience|reader|recipient|target|who will/i.test(allPromptText);

  if (hasRoleSetting) { contextPoints += 5; strengths.push("Sets a clear role/persona for the AI"); }
  if (hasContextSetting) { contextPoints += 5; }
  if (hasAudienceAwareness) { contextPoints += 5; strengths.push("Demonstrates audience awareness"); }

  if (contextPoints === 0) {
    suggestions.push("Provide context about who the output is for and the situation");
  }
  points += Math.min(15, contextPoints);

  const score = clamp(Math.round((points / maxPoints) * 100), 5, 98);

  return {
    score,
    weight: criteria.weights.promptQuality,
    weightedScore: Math.round(score * criteria.weights.promptQuality),
    strengths: strengths.slice(0, 4),
    weaknesses: weaknesses.slice(0, 3),
    suggestions: suggestions.slice(0, 3),
  };
}

/**
 * Efficiency Score (0-100)
 * Evaluates: attempts used vs max, token usage vs budget
 */
function scoreEfficiency(
  input: ScoringInput,
  criteria: ScoringCriteria
): DimensionScore {
  const strengths: string[] = [];
  const weaknesses: string[] = [];
  const suggestions: string[] = [];

  // --- Attempt efficiency (60% of this dimension) ---
  const attemptRatio = input.attemptsUsed / input.maxAttempts;
  let attemptScore: number;

  if (input.attemptsUsed === 0) {
    return {
      score: 0, weight: criteria.weights.efficiency, weightedScore: 0,
      strengths: [], weaknesses: ["No attempts made"], suggestions: ["Submit at least one prompt"],
    };
  }

  if (input.attemptsUsed === 1 && input.maxAttempts >= 3) {
    // One-shot: could be great or could mean they gave up
    attemptScore = 85;
    strengths.push("Achieved result in a single prompt — efficient");
  } else if (attemptRatio <= 0.33) {
    attemptScore = 92;
    strengths.push(`Used only ${input.attemptsUsed} of ${input.maxAttempts} attempts`);
  } else if (attemptRatio <= 0.5) {
    attemptScore = 78;
    strengths.push("Good attempt economy");
  } else if (attemptRatio <= 0.75) {
    attemptScore = 60;
    suggestions.push("Try to craft more complete initial prompts to reduce iterations");
  } else {
    attemptScore = 40;
    weaknesses.push(`Used ${input.attemptsUsed} of ${input.maxAttempts} attempts`);
    suggestions.push("Focus on upfront clarity — a detailed first prompt saves iterations");
  }

  // --- Token efficiency (40% of this dimension) ---
  const tokenRatio = input.tokensUsed / input.tokenBudget;
  let tokenScore: number;

  if (tokenRatio <= 0.3) {
    tokenScore = 95;
    strengths.push("Excellent token efficiency");
  } else if (tokenRatio <= 0.5) {
    tokenScore = 82;
  } else if (tokenRatio <= 0.7) {
    tokenScore = 65;
  } else if (tokenRatio <= 0.9) {
    tokenScore = 48;
    suggestions.push("Try to be more concise to use fewer tokens");
  } else {
    tokenScore = 30;
    weaknesses.push("Used nearly the entire token budget");
    suggestions.push("Shorter, more focused prompts help stay within budget");
  }

  const score = clamp(Math.round(attemptScore * 0.6 + tokenScore * 0.4), 5, 98);

  return {
    score,
    weight: criteria.weights.efficiency,
    weightedScore: Math.round(score * criteria.weights.efficiency),
    strengths: strengths.slice(0, 3),
    weaknesses: weaknesses.slice(0, 2),
    suggestions: suggestions.slice(0, 2),
  };
}

/**
 * Speed Score (0-100)
 * Evaluates: time taken vs time allowed
 */
function scoreSpeed(
  input: ScoringInput,
  criteria: ScoringCriteria
): DimensionScore {
  const strengths: string[] = [];
  const weaknesses: string[] = [];
  const suggestions: string[] = [];

  const timeLimitSeconds = input.timeLimitMinutes * 60;
  const timeRatio = input.timeSpentSeconds / timeLimitSeconds;

  let score: number;

  if (input.timeSpentSeconds <= 0) {
    return {
      score: 0, weight: criteria.weights.speed, weightedScore: 0,
      strengths: [], weaknesses: ["No time recorded"], suggestions: [],
    };
  }

  // Very fast might mean rushed (penalty), but generally fast is good
  if (timeRatio <= 0.15) {
    score = 75; // Suspiciously fast — might have rushed
    strengths.push("Completed very quickly");
    suggestions.push("Make sure you're not rushing — take time to review AI output");
  } else if (timeRatio <= 0.35) {
    score = 95;
    strengths.push("Excellent speed — completed well within time limit");
  } else if (timeRatio <= 0.55) {
    score = 85;
    strengths.push("Good pace — finished with time to spare");
  } else if (timeRatio <= 0.75) {
    score = 70;
  } else if (timeRatio <= 0.9) {
    score = 55;
    suggestions.push("Try to work more efficiently to leave buffer time");
  } else {
    score = 35;
    weaknesses.push("Used almost all available time");
    suggestions.push("Practice prompt crafting to improve speed");
  }

  const minutesUsed = Math.round(input.timeSpentSeconds / 60);
  const minutesLeft = input.timeLimitMinutes - minutesUsed;
  if (minutesLeft > 0) {
    strengths.push(`Finished with ~${minutesLeft} min to spare`);
  }

  return {
    score: clamp(score, 5, 98),
    weight: criteria.weights.speed,
    weightedScore: Math.round(clamp(score, 5, 98) * criteria.weights.speed),
    strengths: strengths.slice(0, 2),
    weaknesses: weaknesses.slice(0, 2),
    suggestions: suggestions.slice(0, 2),
  };
}

/**
 * Response Quality Score (0-100)
 * Evaluates: how well the AI response matches expected outcomes/criteria
 */
function scoreResponseQuality(
  assistantMessages: string[],
  input: ScoringInput,
  criteria: ScoringCriteria
): DimensionScore {
  const strengths: string[] = [];
  const weaknesses: string[] = [];
  const suggestions: string[] = [];

  if (assistantMessages.length === 0) {
    return {
      score: 0, weight: criteria.weights.responseQuality, weightedScore: 0,
      strengths: [], weaknesses: ["No AI responses received"], suggestions: ["Submit prompts to receive AI responses"],
    };
  }

  let points = 0;
  let maxPoints = 0;

  // Use the best (last) response for primary scoring
  const bestResponse = assistantMessages[assistantMessages.length - 1];
  const allResponseText = assistantMessages.join("\n\n");

  // --- Response substance (max 25 points) ---
  maxPoints += 25;
  if (bestResponse.length > 1000) {
    points += 25;
    strengths.push("Generated a comprehensive, detailed response");
  } else if (bestResponse.length > 500) {
    points += 20;
    strengths.push("Response has good detail");
  } else if (bestResponse.length > 200) {
    points += 12;
  } else {
    points += 5;
    weaknesses.push("Response is quite brief — may lack depth");
    suggestions.push("Prompt for more detail and specific examples");
  }

  // --- Response keyword matching (max 30 points) ---
  const responseKeywords = criteria.keywords.filter(k => k.target === "response" || k.target === "both");
  const responseKeywordMax = Math.min(30, responseKeywords.reduce((sum, k) => sum + k.points, 0));
  maxPoints += 30;
  let rkPoints = 0;
  const matchedRK: string[] = [];

  for (const kw of responseKeywords) {
    if (countMatches(bestResponse, kw.pattern) > 0) {
      rkPoints += kw.points;
      matchedRK.push(kw.label);
    }
  }

  const rkScore = responseKeywordMax > 0
    ? Math.round((rkPoints / responseKeywordMax) * 30)
    : 15;
  points += rkScore;

  if (matchedRK.length >= 3) {
    strengths.push("Response hits key quality indicators");
  }

  // --- Structure detection (max 25 points) ---
  maxPoints += 25;
  let structPoints = 0;

  for (const struct of criteria.structures) {
    if (struct.target === "prompt") continue; // already scored in prompt quality
    const found = detectStructure(bestResponse, struct.type);
    if (found) {
      structPoints += struct.points;
    } else if (struct.required) {
      weaknesses.push(`Response missing expected: ${struct.label}`);
      suggestions.push(`Your prompt should request: ${struct.label.toLowerCase()}`);
    }
  }
  points += Math.min(25, structPoints);

  // --- Constraint adherence (max 20 points) ---
  maxPoints += 20;
  let constraintPoints = 0;

  for (const constraint of criteria.constraints) {
    const userText = input.messages.filter(m => m.role === "user").map(m => m.content).join(" ");
    const promptMatched = countMatches(userText, constraint.promptIndicator) > 0;
    const responseMatched = countMatches(bestResponse, constraint.responseIndicator) > 0;

    if (promptMatched && responseMatched) {
      constraintPoints += constraint.points;
      strengths.push(`Constraint met: ${constraint.description}`);
    } else if (promptMatched && !responseMatched) {
      suggestions.push(`You asked for "${constraint.description}" but the response didn't fully deliver — try rephrasing`);
    }
  }
  points += Math.min(20, constraintPoints);

  // --- Expected outcome matching (bonus, max 10 points) ---
  if (input.expectedOutcome) {
    maxPoints += 10;
    const outcomeKeywords = input.expectedOutcome
      .toLowerCase()
      .split(/\s+/)
      .filter(w => w.length > 4);
    const matchCount = outcomeKeywords.filter(w =>
      bestResponse.toLowerCase().includes(w)
    ).length;
    const matchRatio = outcomeKeywords.length > 0 ? matchCount / outcomeKeywords.length : 0;
    points += Math.round(matchRatio * 10);

    if (matchRatio > 0.5) {
      strengths.push("Response aligns well with expected outcome");
    } else if (matchRatio < 0.2) {
      suggestions.push("Review the expected outcome and align your prompts more closely");
    }
  }

  const score = clamp(Math.round((points / maxPoints) * 100), 5, 98);

  return {
    score,
    weight: criteria.weights.responseQuality,
    weightedScore: Math.round(score * criteria.weights.responseQuality),
    strengths: strengths.slice(0, 4),
    weaknesses: weaknesses.slice(0, 3),
    suggestions: suggestions.slice(0, 3),
  };
}

/**
 * Iteration Intelligence Score (0-100)
 * Evaluates: did the candidate improve between attempts?
 * Did they learn from AI responses and refine their approach?
 */
function scoreIterationIQ(
  messages: Message[],
  criteria: ScoringCriteria
): DimensionScore {
  const strengths: string[] = [];
  const weaknesses: string[] = [];
  const suggestions: string[] = [];

  const userMessages = messages.filter(m => m.role === "user").map(m => m.content);
  const assistantMessages = messages.filter(m => m.role === "assistant").map(m => m.content);

  // Single attempt — can't measure iteration
  if (userMessages.length <= 1) {
    const score = userMessages.length === 1 ? 60 : 0; // Neutral for single attempt
    return {
      score,
      weight: criteria.weights.iterationIQ,
      weightedScore: Math.round(score * criteria.weights.iterationIQ),
      strengths: userMessages.length === 1 ? ["Completed in a single attempt (no iteration needed)"] : [],
      weaknesses: userMessages.length === 0 ? ["No prompts submitted"] : [],
      suggestions: userMessages.length === 1 ? ["If the result isn't perfect, don't hesitate to iterate"] : ["Submit at least one prompt"],
    };
  }

  let points = 0;
  let maxPoints = 0;

  // --- Prompt evolution: did prompts get more specific? (max 30 points) ---
  maxPoints += 30;
  const promptLengths = userMessages.map(p => p.length);
  const firstPromptLength = promptLengths[0];
  const laterPromptAvg = promptLengths.slice(1).reduce((a, b) => a + b, 0) / (promptLengths.length - 1);

  // Later prompts being different from the first suggests adaptation
  const lengthChanged = Math.abs(laterPromptAvg - firstPromptLength) > 20;
  if (lengthChanged) {
    points += 15;
    strengths.push("Adapted prompt length between iterations");
  }

  // Check if later prompts reference AI output (quotes, "you said", "instead of", etc.)
  const referencesOutput = userMessages.slice(1).some(p =>
    /you (said|mentioned|wrote|gave|provided|generated)|instead of|rather than|change|modify|update|revise|adjust|refine|improve|better/i.test(p)
  );
  if (referencesOutput) {
    points += 15;
    strengths.push("Refined prompts based on AI output — shows learning");
  } else {
    points += 5;
    suggestions.push("Reference the AI's previous response when iterating (e.g., 'change X to Y')");
  }

  // --- New keywords introduced (max 25 points) ---
  maxPoints += 25;
  if (userMessages.length >= 2) {
    const firstWords = new Set(userMessages[0].toLowerCase().split(/\s+/).filter(w => w.length > 3));
    const newWordsInLater = userMessages.slice(1).flatMap(p =>
      p.toLowerCase().split(/\s+/).filter(w => w.length > 3 && !firstWords.has(w))
    );
    const newWordRatio = newWordsInLater.length / Math.max(1, firstWords.size);

    if (newWordRatio > 0.5) {
      points += 25;
      strengths.push("Introduced significant new vocabulary/concepts in later prompts");
    } else if (newWordRatio > 0.2) {
      points += 15;
    } else {
      points += 5;
      weaknesses.push("Later prompts didn't add much new direction");
      suggestions.push("Each iteration should introduce new requirements or refine existing ones");
    }
  }

  // --- Quality trajectory: did responses get better? (max 25 points) ---
  maxPoints += 25;
  if (assistantMessages.length >= 2) {
    const responseLengths = assistantMessages.map(r => r.length);
    const firstLen = responseLengths[0];
    const lastLen = responseLengths[responseLengths.length - 1];

    // Generally, longer/more detailed responses indicate better prompting
    if (lastLen >= firstLen * 0.9) {
      points += 15;
    }

    // Check if later responses contain more structure
    const firstHasStructure = detectStructure(assistantMessages[0], "bullet_list") ||
      detectStructure(assistantMessages[0], "headers");
    const lastHasStructure = detectStructure(assistantMessages[assistantMessages.length - 1], "bullet_list") ||
      detectStructure(assistantMessages[assistantMessages.length - 1], "headers");

    if (!firstHasStructure && lastHasStructure) {
      points += 10;
      strengths.push("Successfully guided AI to produce more structured output");
    } else if (lastHasStructure) {
      points += 5;
    }
  }

  // --- Didn't repeat the same prompt (max 20 points) ---
  maxPoints += 20;
  const uniquePrompts = new Set(userMessages.map(p => p.trim().toLowerCase()));
  if (uniquePrompts.size === userMessages.length) {
    points += 20;
    strengths.push("Every prompt was unique — no copy-paste repetition");
  } else {
    points += 5;
    weaknesses.push("Some prompts were nearly identical — wasted attempts");
    suggestions.push("Each attempt should meaningfully differ from the last");
  }

  const score = clamp(Math.round((points / maxPoints) * 100), 5, 98);

  return {
    score,
    weight: criteria.weights.iterationIQ,
    weightedScore: Math.round(score * criteria.weights.iterationIQ),
    strengths: strengths.slice(0, 3),
    weaknesses: weaknesses.slice(0, 2),
    suggestions: suggestions.slice(0, 3),
  };
}

// ─── Custom Criteria Scoring ─────────────────────────────────────────────────

/**
 * Score a response against custom criteria defined by the employer.
 * Returns individual criterion results and a composite score.
 */
function scoreCustomCriteria(
  assistantMessages: string[],
  customCriteria: CustomCriterionDef[]
): { results: CustomCriterionResult[]; compositeScore: number } {
  if (!customCriteria || customCriteria.length === 0) {
    return { results: [], compositeScore: -1 };
  }

  const bestResponse = assistantMessages.length > 0
    ? assistantMessages[assistantMessages.length - 1]
    : "";

  const results: CustomCriterionResult[] = [];
  let totalWeightedScore = 0;
  let totalWeight = 0;

  for (const criterion of customCriteria) {
    let score = 0;
    const maxScore = 100;
    let details = "";

    switch (criterion.type) {
      case "keyword": {
        const mustInclude = (criterion.config.mustInclude as string[]) || [];
        const mustNotInclude = (criterion.config.mustNotInclude as string[]) || [];
        const responseLower = bestResponse.toLowerCase();

        let found = 0;
        let total = mustInclude.length + mustNotInclude.length;
        if (total === 0) { score = 50; details = "No keywords configured"; break; }

        const foundKeywords: string[] = [];
        const missingKeywords: string[] = [];
        for (const kw of mustInclude) {
          if (responseLower.includes(kw.toLowerCase())) {
            found++;
            foundKeywords.push(kw);
          } else {
            missingKeywords.push(kw);
          }
        }

        const badKeywords: string[] = [];
        for (const kw of mustNotInclude) {
          if (!responseLower.includes(kw.toLowerCase())) {
            found++;
          } else {
            badKeywords.push(kw);
          }
        }

        score = Math.round((found / total) * 100);
        const parts: string[] = [];
        if (foundKeywords.length > 0) parts.push(`Found: ${foundKeywords.join(", ")}`);
        if (missingKeywords.length > 0) parts.push(`Missing: ${missingKeywords.join(", ")}`);
        if (badKeywords.length > 0) parts.push(`Should not include: ${badKeywords.join(", ")}`);
        details = parts.join(". ") || "Checked";
        break;
      }

      case "tone": {
        const expectedTone = (criterion.config.tone as string) || "professional";
        const responseLower = bestResponse.toLowerCase();

        const toneIndicators: Record<string, string[]> = {
          professional: ["dear", "regards", "sincerely", "please", "thank you", "appreciate", "would", "kindly"],
          casual: ["hey", "cool", "awesome", "gonna", "wanna", "btw", "!", "lol"],
          technical: ["function", "implementation", "algorithm", "parameter", "interface", "module", "architecture"],
          creative: ["imagine", "picture", "journey", "vibrant", "spark", "transform", "discover", "breathe"],
        };

        const indicators = toneIndicators[expectedTone] || toneIndicators.professional;
        const matches = indicators.filter((w) => responseLower.includes(w)).length;
        score = clamp(Math.round((matches / Math.max(3, indicators.length * 0.4)) * 100), 10, 100);
        details = `Tone: ${expectedTone} (${matches}/${indicators.length} indicators found)`;
        break;
      }

      case "length": {
        const minWords = (criterion.config.minWords as number) || 0;
        const maxWords = (criterion.config.maxWords as number) || Infinity;
        const wordCount = bestResponse.split(/\s+/).filter(Boolean).length;

        if (wordCount >= minWords && wordCount <= maxWords) {
          score = 100;
          details = `${wordCount} words (within ${minWords}-${maxWords} range)`;
        } else if (wordCount < minWords) {
          score = clamp(Math.round((wordCount / minWords) * 100), 10, 80);
          details = `${wordCount} words (below minimum of ${minWords})`;
        } else {
          const overBy = wordCount - maxWords;
          score = clamp(100 - Math.round((overBy / maxWords) * 50), 20, 80);
          details = `${wordCount} words (exceeds maximum of ${maxWords})`;
        }
        break;
      }

      case "rubric":
      default: {
        // For rubric items, do keyword-matching on the description
        // to see if the response addresses what the rubric is looking for
        const rubricKeywords = criterion.description
          .toLowerCase()
          .split(/\s+/)
          .filter((w) => w.length > 4);
        const responseLower = bestResponse.toLowerCase();

        if (rubricKeywords.length === 0) {
          score = 50;
          details = "Generic rubric — no specific keywords to match";
        } else {
          const matched = rubricKeywords.filter((w) => responseLower.includes(w)).length;
          const matchRatio = matched / rubricKeywords.length;
          score = clamp(Math.round(matchRatio * 100 + 20), 15, 95);
          details = `${matched}/${rubricKeywords.length} rubric keywords found in response`;
        }
        break;
      }
    }

    results.push({
      name: criterion.name,
      type: criterion.type,
      weight: criterion.weight,
      score: clamp(score, 0, maxScore),
      maxScore,
      details,
    });

    totalWeightedScore += score * criterion.weight;
    totalWeight += criterion.weight;
  }

  const compositeScore = totalWeight > 0
    ? clamp(Math.round(totalWeightedScore / totalWeight), 0, 100)
    : -1;

  return { results, compositeScore };
}

// ─── Feedback Generation ─────────────────────────────────────────────────────

function generateFeedback(
  dimensions: ScoringResult["dimensions"],
  letterGrade: LetterGrade,
  score: number
): ScoringResult["feedback"] {
  // Collect all strengths and weaknesses
  const allStrengths = Object.values(dimensions).flatMap(d => d.strengths);
  const allWeaknesses = Object.values(dimensions).flatMap(d => d.weaknesses);
  const allSuggestions = Object.values(dimensions).flatMap(d => d.suggestions);

  // Sort dimensions by score to find best/worst
  const ranked = Object.entries(dimensions)
    .map(([key, dim]) => ({ key, ...dim }))
    .sort((a, b) => b.score - a.score);

  const best = ranked[0];
  const worst = ranked[ranked.length - 1];

  // Generate summary
  const summaryMap: Record<LetterGrade, string> = {
    S: "Outstanding performance! Your prompting skills are in the top tier. You demonstrated mastery across all dimensions.",
    A: "Excellent work! You showed strong prompting ability with clear, specific, and effective prompts.",
    B: "Good performance. Your prompts were competent and produced quality results, with room for refinement.",
    C: "Satisfactory effort. You completed the task but there's significant room to improve your prompting technique.",
    D: "Below average. Your prompts lacked specificity and structure. Review the suggestions below to improve.",
    F: "Needs significant improvement. Focus on the fundamentals: clarity, specificity, and structured instructions.",
  };

  const dimensionLabels: Record<string, string> = {
    promptQuality: "Prompt Quality",
    efficiency: "Efficiency",
    speed: "Speed",
    responseQuality: "Response Quality",
    iterationIQ: "Iteration Intelligence",
  };

  const improvementPlan: string[] = [];
  if (worst.score < 60) {
    improvementPlan.push(`Focus on improving your ${dimensionLabels[worst.key]} (scored ${worst.score}/100)`);
  }
  improvementPlan.push(...allSuggestions.slice(0, 3));

  return {
    summary: summaryMap[letterGrade],
    topStrengths: allStrengths.slice(0, 4),
    topWeaknesses: allWeaknesses.slice(0, 3),
    improvementPlan: improvementPlan.slice(0, 4),
  };
}

// ─── Main Scoring Function ───────────────────────────────────────────────────

/**
 * Score a candidate's test submission across all dimensions.
 * This is the main entry point for the scoring engine.
 */
export function scoreSubmission(input: ScoringInput): ScoringResult {
  const criteria = getCriteria(input.testType, input.taskDescription);

  const userMessages = input.messages.filter(m => m.role === "user").map(m => m.content);
  const assistantMessages = input.messages.filter(m => m.role === "assistant").map(m => m.content);

  // Score each dimension
  const promptQuality = scorePromptQuality(userMessages, criteria);
  const efficiency = scoreEfficiency(input, criteria);
  const speed = scoreSpeed(input, criteria);
  const responseQuality = scoreResponseQuality(assistantMessages, input, criteria);
  const iterationIQ = scoreIterationIQ(input.messages, criteria);

  const dimensions = { promptQuality, efficiency, speed, responseQuality, iterationIQ };

  // Score custom criteria if provided
  const customCriteriaResult = input.customCriteria && input.customCriteria.length > 0
    ? scoreCustomCriteria(assistantMessages, input.customCriteria)
    : { results: [], compositeScore: -1 };

  // Calculate composite PromptScore™
  // If custom criteria exist, blend them into the score (50% standard dimensions, 50% custom)
  let baseScore = Math.round(
    promptQuality.weightedScore +
    efficiency.weightedScore +
    speed.weightedScore +
    responseQuality.weightedScore +
    iterationIQ.weightedScore
  );

  let promptScore: number;
  if (customCriteriaResult.compositeScore >= 0) {
    promptScore = clamp(Math.round(baseScore * 0.5 + customCriteriaResult.compositeScore * 0.5), 0, 100);
  } else {
    promptScore = clamp(baseScore, 0, 100);
  }

  const letterGrade = getLetterGrade(promptScore);
  const percentile = calculatePercentile(promptScore);
  const feedback = generateFeedback(dimensions, letterGrade, promptScore);

  // Stats
  const totalPrompts = userMessages.length;
  const avgPromptLength = totalPrompts > 0
    ? Math.round(userMessages.join("").length / totalPrompts)
    : 0;
  const totalResponseLength = assistantMessages.join("").length;

  return {
    promptScore,
    letterGrade,
    percentile,
    dimensions,
    feedback,
    stats: {
      attemptsUsed: input.attemptsUsed,
      tokensUsed: input.tokensUsed,
      timeSpentSeconds: input.timeSpentSeconds,
      maxAttempts: input.maxAttempts,
      tokenBudget: input.tokenBudget,
      timeLimitMinutes: input.timeLimitMinutes,
      totalPrompts,
      avgPromptLength,
      totalResponseLength,
    },
    customCriteriaResults: customCriteriaResult.results.length > 0 ? customCriteriaResult.results : undefined,
    criteriaUsed: input.customCriteria && input.customCriteria.length > 0 ? "Custom Criteria" : criteria.name,
    evaluatedAt: new Date().toISOString(),
  };
}
