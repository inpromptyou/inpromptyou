import { getSql } from "./db";

export async function ensureSchema() {
  const sql = getSql();

  await sql`
    CREATE TABLE IF NOT EXISTS users (
      id SERIAL PRIMARY KEY,
      name VARCHAR(255) NOT NULL,
      email VARCHAR(255) UNIQUE NOT NULL,
      password_hash TEXT,
      google_id VARCHAR(255),
      avatar_url TEXT,
      role VARCHAR(50) DEFAULT 'employer',
      plan VARCHAR(50) DEFAULT 'free',
      prompt_score INTEGER,
      created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
      updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
    )
  `;

  await sql`
    CREATE TABLE IF NOT EXISTS tests (
      id SERIAL PRIMARY KEY,
      user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      title VARCHAR(500) NOT NULL,
      description TEXT,
      task_prompt TEXT NOT NULL,
      expected_outcomes TEXT,
      test_type VARCHAR(50) DEFAULT 'custom',
      difficulty VARCHAR(20) DEFAULT 'intermediate',
      time_limit_minutes INTEGER DEFAULT 15,
      max_attempts INTEGER DEFAULT 5,
      token_budget INTEGER DEFAULT 2000,
      model VARCHAR(100) DEFAULT 'gpt-4o',
      scoring_weights JSONB DEFAULT '{"accuracy": 40, "efficiency": 30, "speed": 30}',
      status VARCHAR(20) DEFAULT 'draft',
      candidates_count INTEGER DEFAULT 0,
      avg_score NUMERIC(5,2) DEFAULT 0,
      completion_rate NUMERIC(5,2) DEFAULT 0,
      created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
      updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
    )
  `;

  await sql`
    CREATE TABLE IF NOT EXISTS test_attempts (
      id SERIAL PRIMARY KEY,
      test_id INTEGER NOT NULL REFERENCES tests(id) ON DELETE CASCADE,
      candidate_name VARCHAR(255) NOT NULL,
      candidate_email VARCHAR(255) NOT NULL,
      status VARCHAR(20) DEFAULT 'in_progress',
      score NUMERIC(5,2),
      efficiency NUMERIC(5,2),
      speed NUMERIC(5,2),
      accuracy NUMERIC(5,2),
      tokens_used INTEGER DEFAULT 0,
      attempts_used INTEGER DEFAULT 0,
      time_spent_minutes INTEGER DEFAULT 0,
      started_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
      completed_at TIMESTAMP WITH TIME ZONE
    )
  `;

  await sql`
    CREATE TABLE IF NOT EXISTS test_submissions (
      id SERIAL PRIMARY KEY,
      attempt_id INTEGER NOT NULL REFERENCES test_attempts(id) ON DELETE CASCADE,
      prompt_text TEXT NOT NULL,
      response_text TEXT,
      tokens_used INTEGER DEFAULT 0,
      submitted_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
    )
  `;
}
