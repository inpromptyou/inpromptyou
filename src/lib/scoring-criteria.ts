/**
 * scoring-criteria.ts — Configurable scoring criteria for InpromptiFy assessments.
 * 
 * Employers can customize these per test. Each test type has default criteria
 * that define what "good" looks like for prompts and responses.
 */

// ─── Types ───────────────────────────────────────────────────────────────────

/** A single keyword/phrase to look for in prompts or responses */
export interface KeywordCriterion {
  /** The keyword or regex pattern to match */
  pattern: string;
  /** Points awarded when found (can be negative for penalizing) */
  points: number;
  /** Where to look: prompt, response, or both */
  target: "prompt" | "response" | "both";
  /** Human-readable label for reporting */
  label: string;
}

/** Structure detection rules — checks for formatting patterns */
export interface StructureCriterion {
  /** What structural element to detect */
  type: "headers" | "bullet_list" | "numbered_list" | "code_block" | "paragraphs" | "greeting" | "signoff" | "subject_line";
  /** Points if present */
  points: number;
  /** Where to check */
  target: "prompt" | "response" | "both";
  /** Whether this is required (missing = penalty) or bonus */
  required: boolean;
  label: string;
}

/** Constraint adherence — did the candidate specify constraints and did the AI follow them? */
export interface ConstraintCriterion {
  /** Description of the constraint */
  description: string;
  /** Regex or keyword that indicates the constraint was specified in the prompt */
  promptIndicator: string;
  /** Regex or keyword that indicates the constraint was followed in the response */
  responseIndicator: string;
  /** Points for specifying + achieving the constraint */
  points: number;
}

/** Weight overrides for composite scoring dimensions */
export interface ScoringWeights {
  promptQuality: number;   // default 0.30
  efficiency: number;      // default 0.15
  speed: number;           // default 0.15
  responseQuality: number; // default 0.25
  iterationIQ: number;     // default 0.15
}

/** Complete scoring criteria for a test */
export interface ScoringCriteria {
  /** Test type identifier */
  testType: string;
  /** Human-readable name */
  name: string;
  /** Description of what this criteria set evaluates */
  description: string;
  /** Weight overrides (all must sum to 1.0) */
  weights: ScoringWeights;
  /** Keywords to match */
  keywords: KeywordCriterion[];
  /** Structure patterns to detect */
  structures: StructureCriterion[];
  /** Constraint adherence checks */
  constraints: ConstraintCriterion[];
  /** Minimum prompt length considered "good" */
  minPromptLength: number;
  /** Ideal prompt length range [min, max] */
  idealPromptLengthRange: [number, number];
  /** Maximum ideal attempts (fewer = better efficiency) */
  idealMaxAttempts: number;
}

// ─── Default Criteria Templates ──────────────────────────────────────────────

export const DEFAULT_WEIGHTS: ScoringWeights = {
  promptQuality: 0.30,
  efficiency: 0.15,
  speed: 0.15,
  responseQuality: 0.25,
  iterationIQ: 0.15,
};

export const EMAIL_WRITING_CRITERIA: ScoringCriteria = {
  testType: "email-writing",
  name: "Email Writing",
  description: "Criteria for evaluating email composition prompts",
  weights: { ...DEFAULT_WEIGHTS, promptQuality: 0.25, responseQuality: 0.30 },
  keywords: [
    { pattern: "subject line", points: 5, target: "prompt", label: "Requested subject line" },
    { pattern: "call[- ]to[- ]action|CTA", points: 5, target: "prompt", label: "Specified CTA" },
    { pattern: "tone|voice|style", points: 4, target: "prompt", label: "Defined tone/voice" },
    { pattern: "audience|target|recipient", points: 5, target: "prompt", label: "Identified audience" },
    { pattern: "goal|objective|purpose", points: 4, target: "prompt", label: "Stated goal" },
    { pattern: "preview text|preheader", points: 3, target: "prompt", label: "Requested preview text" },
    { pattern: "social proof|testimonial|case study", points: 3, target: "prompt", label: "Asked for social proof" },
    { pattern: "personali[sz]", points: 3, target: "prompt", label: "Requested personalization" },
    // Response quality keywords
    { pattern: "subject:", points: 4, target: "response", label: "Has subject line" },
    { pattern: "dear|hi |hello", points: 2, target: "response", label: "Has greeting" },
    { pattern: "regards|best|sincerely|cheers", points: 2, target: "response", label: "Has sign-off" },
    { pattern: "book|schedule|demo|call|click", points: 3, target: "response", label: "Contains CTA" },
  ],
  structures: [
    { type: "subject_line", points: 5, target: "response", required: true, label: "Email has subject line" },
    { type: "greeting", points: 3, target: "response", required: true, label: "Email has greeting" },
    { type: "signoff", points: 3, target: "response", required: true, label: "Email has sign-off" },
    { type: "bullet_list", points: 3, target: "response", required: false, label: "Uses bullet points for clarity" },
  ],
  constraints: [
    { description: "Professional tone", promptIndicator: "professional|formal|business", responseIndicator: "dear|regards|sincerely|best", points: 5 },
    { description: "Specific length", promptIndicator: "\\d+\\s*words|short|brief|concise|long|detailed", responseIndicator: ".", points: 3 },
  ],
  minPromptLength: 30,
  idealPromptLengthRange: [80, 400],
  idealMaxAttempts: 3,
};

export const CODE_GENERATION_CRITERIA: ScoringCriteria = {
  testType: "code-generation",
  name: "Code Generation / Debugging",
  description: "Criteria for code-related prompting tasks",
  weights: { ...DEFAULT_WEIGHTS, promptQuality: 0.30, responseQuality: 0.30, iterationIQ: 0.10 },
  keywords: [
    { pattern: "language|python|javascript|typescript|java|rust|go", points: 5, target: "prompt", label: "Specified language" },
    { pattern: "error|bug|issue|exception|traceback", points: 4, target: "prompt", label: "Described the problem" },
    { pattern: "test|unit test|spec|assert", points: 4, target: "prompt", label: "Mentioned testing" },
    { pattern: "edge case|boundary|null|empty|zero", points: 4, target: "prompt", label: "Considered edge cases" },
    { pattern: "performance|optimi[sz]|O\\(|complexity", points: 3, target: "prompt", label: "Performance awareness" },
    { pattern: "explain|why|how|reason", points: 3, target: "prompt", label: "Asked for explanation" },
    // Response quality
    { pattern: "```", points: 5, target: "response", label: "Contains code block" },
    { pattern: "def |function |class |const |let |var ", points: 3, target: "response", label: "Has code definitions" },
    { pattern: "import |require\\(|from ", points: 2, target: "response", label: "Has imports" },
  ],
  structures: [
    { type: "code_block", points: 8, target: "response", required: true, label: "Contains formatted code" },
    { type: "paragraphs", points: 3, target: "response", required: false, label: "Has explanation text" },
    { type: "numbered_list", points: 3, target: "response", required: false, label: "Step-by-step explanation" },
  ],
  constraints: [
    { description: "Specific language requested", promptIndicator: "python|javascript|typescript|java|rust|go|c\\+\\+", responseIndicator: "```(?:python|javascript|typescript|java|rust|go|cpp)", points: 5 },
    { description: "Error handling", promptIndicator: "error handl|try|catch|except|handle", responseIndicator: "try|catch|except|error", points: 4 },
  ],
  minPromptLength: 40,
  idealPromptLengthRange: [60, 500],
  idealMaxAttempts: 2,
};

export const DATA_ANALYSIS_CRITERIA: ScoringCriteria = {
  testType: "data-analysis",
  name: "Data Analysis",
  description: "Criteria for data analysis and pipeline design prompts",
  weights: { ...DEFAULT_WEIGHTS, promptQuality: 0.35, responseQuality: 0.25 },
  keywords: [
    { pattern: "schema|structure|table|column|field", points: 5, target: "prompt", label: "Defined data structure" },
    { pattern: "source|input|ingest|extract", points: 4, target: "prompt", label: "Specified data sources" },
    { pattern: "transform|clean|normalize|deduplicate", points: 4, target: "prompt", label: "Transformation requirements" },
    { pattern: "output|destination|load|warehouse", points: 4, target: "prompt", label: "Output specification" },
    { pattern: "error|retry|fail|monitor|alert|log", points: 5, target: "prompt", label: "Error handling/monitoring" },
    { pattern: "scale|volume|throughput|batch|stream", points: 3, target: "prompt", label: "Scale considerations" },
    // Response quality
    { pattern: "ETL|pipeline|workflow|DAG", points: 4, target: "response", label: "Uses pipeline terminology" },
    { pattern: "SQL|query|SELECT|JOIN", points: 3, target: "response", label: "Contains SQL/queries" },
  ],
  structures: [
    { type: "headers", points: 5, target: "response", required: true, label: "Well-organized sections" },
    { type: "bullet_list", points: 3, target: "response", required: false, label: "Itemized details" },
    { type: "code_block", points: 4, target: "response", required: false, label: "Code/config examples" },
    { type: "numbered_list", points: 4, target: "response", required: false, label: "Step-by-step process" },
  ],
  constraints: [
    { description: "Technology choices specified", promptIndicator: "technology|tool|platform|framework|use", responseIndicator: "\\b(?:Airflow|Spark|Snowflake|dbt|Kafka|S3|Postgres|BigQuery)\\b", points: 5 },
  ],
  minPromptLength: 50,
  idealPromptLengthRange: [100, 600],
  idealMaxAttempts: 4,
};

export const CREATIVE_WRITING_CRITERIA: ScoringCriteria = {
  testType: "creative-writing",
  name: "Creative Writing",
  description: "Criteria for creative and content writing prompts",
  weights: { ...DEFAULT_WEIGHTS, promptQuality: 0.25, responseQuality: 0.35, iterationIQ: 0.10 },
  keywords: [
    { pattern: "tone|mood|style|voice|persona", points: 5, target: "prompt", label: "Defined tone/style" },
    { pattern: "audience|reader|demographic|who", points: 4, target: "prompt", label: "Identified audience" },
    { pattern: "word count|length|\\d+ words|short|long", points: 3, target: "prompt", label: "Specified length" },
    { pattern: "format|structure|heading|section|paragraph", points: 3, target: "prompt", label: "Format requirements" },
    { pattern: "example|reference|similar to|inspired by", points: 3, target: "prompt", label: "Provided examples/references" },
    { pattern: "avoid|don't|do not|never|without", points: 3, target: "prompt", label: "Set negative constraints" },
    { pattern: "brand|company|product|name", points: 3, target: "prompt", label: "Brand context provided" },
  ],
  structures: [
    { type: "paragraphs", points: 4, target: "response", required: true, label: "Well-formed paragraphs" },
    { type: "headers", points: 3, target: "response", required: false, label: "Organized with headers" },
  ],
  constraints: [
    { description: "Tone adherence", promptIndicator: "formal|casual|friendly|professional|witty|humorous", responseIndicator: ".", points: 4 },
  ],
  minPromptLength: 30,
  idealPromptLengthRange: [60, 350],
  idealMaxAttempts: 3,
};

/** Default/generic criteria when no specific test type matches */
export const GENERIC_CRITERIA: ScoringCriteria = {
  testType: "generic",
  name: "General Assessment",
  description: "Default criteria for any prompt engineering task",
  weights: DEFAULT_WEIGHTS,
  keywords: [
    { pattern: "specific|include|ensure|must|should", points: 3, target: "prompt", label: "Uses directive language" },
    { pattern: "format|structure|organize|layout", points: 3, target: "prompt", label: "Formatting instructions" },
    { pattern: "audience|target|reader|user", points: 3, target: "prompt", label: "Audience awareness" },
    { pattern: "goal|objective|purpose|outcome", points: 3, target: "prompt", label: "Goal-oriented" },
    { pattern: "example|e\\.g\\.|such as|like", points: 2, target: "prompt", label: "Provides examples" },
    { pattern: "constraint|limit|avoid|don't|without", points: 3, target: "prompt", label: "Sets constraints" },
    { pattern: "tone|voice|style", points: 3, target: "prompt", label: "Style guidance" },
    { pattern: "context|background|scenario", points: 2, target: "prompt", label: "Provides context" },
  ],
  structures: [
    { type: "paragraphs", points: 3, target: "response", required: true, label: "Structured response" },
    { type: "headers", points: 3, target: "response", required: false, label: "Organized sections" },
    { type: "bullet_list", points: 2, target: "response", required: false, label: "Uses lists" },
  ],
  constraints: [],
  minPromptLength: 30,
  idealPromptLengthRange: [60, 400],
  idealMaxAttempts: 3,
};

// ─── Criteria Registry ───────────────────────────────────────────────────────

const CRITERIA_MAP: Record<string, ScoringCriteria> = {
  "email-writing": EMAIL_WRITING_CRITERIA,
  "code-generation": CODE_GENERATION_CRITERIA,
  "data-analysis": DATA_ANALYSIS_CRITERIA,
  "creative-writing": CREATIVE_WRITING_CRITERIA,
  "generic": GENERIC_CRITERIA,
};

/**
 * Get scoring criteria for a test. Attempts to auto-detect test type from
 * the task description if no explicit testType is provided.
 */
export function getCriteria(testType?: string, taskDescription?: string): ScoringCriteria {
  // If explicit type provided and exists, use it
  if (testType && CRITERIA_MAP[testType]) {
    return CRITERIA_MAP[testType];
  }

  // Auto-detect from task description
  if (taskDescription) {
    const lower = taskDescription.toLowerCase();
    if (lower.includes("email") || lower.includes("marketing") || lower.includes("newsletter")) {
      return EMAIL_WRITING_CRITERIA;
    }
    if (lower.includes("code") || lower.includes("debug") || lower.includes("function") || lower.includes("bug") || lower.includes("python") || lower.includes("javascript")) {
      return CODE_GENERATION_CRITERIA;
    }
    if (lower.includes("data") || lower.includes("etl") || lower.includes("pipeline") || lower.includes("analysis") || lower.includes("sql")) {
      return DATA_ANALYSIS_CRITERIA;
    }
    if (lower.includes("creative") || lower.includes("story") || lower.includes("blog") || lower.includes("article") || lower.includes("copy")) {
      return CREATIVE_WRITING_CRITERIA;
    }
  }

  return GENERIC_CRITERIA;
}

/** Get all available criteria templates */
export function getAllCriteriaTemplates(): ScoringCriteria[] {
  return Object.values(CRITERIA_MAP);
}
