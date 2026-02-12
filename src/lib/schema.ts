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
      bio TEXT,
      work_history TEXT,
      linkedin_url VARCHAR(500),
      skills_tags TEXT,
      role VARCHAR(50) DEFAULT 'employer',
      account_type VARCHAR(50) DEFAULT 'employer',
      plan VARCHAR(50) DEFAULT 'free',
      prompt_score INTEGER,
      created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
      updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
    )
  `;

  // Add new profile columns if they don't exist (safe for existing DBs)
  await sql`DO $$ BEGIN
    ALTER TABLE users ADD COLUMN IF NOT EXISTS bio TEXT;
    ALTER TABLE users ADD COLUMN IF NOT EXISTS work_history TEXT;
    ALTER TABLE users ADD COLUMN IF NOT EXISTS linkedin_url VARCHAR(500);
    ALTER TABLE users ADD COLUMN IF NOT EXISTS skills_tags TEXT;
    ALTER TABLE users ADD COLUMN IF NOT EXISTS account_type VARCHAR(50) DEFAULT 'employer';
  EXCEPTION WHEN OTHERS THEN NULL;
  END $$`;

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
      custom_criteria JSONB,
      status VARCHAR(20) DEFAULT 'draft',
      cover_image TEXT,
      visibility VARCHAR(20) DEFAULT 'private',
      listing_type VARCHAR(20) DEFAULT 'test',
      company_name VARCHAR(255),
      location VARCHAR(255),
      salary_range VARCHAR(100),
      candidates_count INTEGER DEFAULT 0,
      avg_score NUMERIC(5,2) DEFAULT 0,
      completion_rate NUMERIC(5,2) DEFAULT 0,
      created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
      updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
    )
  `;

  // Add new columns if they don't exist (safe for existing DBs)
  await sql`DO $$ BEGIN
    ALTER TABLE tests ADD COLUMN IF NOT EXISTS custom_criteria JSONB;
    ALTER TABLE tests ADD COLUMN IF NOT EXISTS cover_image TEXT;
    ALTER TABLE tests ADD COLUMN IF NOT EXISTS visibility VARCHAR(20) DEFAULT 'private';
    ALTER TABLE tests ADD COLUMN IF NOT EXISTS listing_type VARCHAR(20) DEFAULT 'test';
    ALTER TABLE tests ADD COLUMN IF NOT EXISTS company_name VARCHAR(255);
    ALTER TABLE tests ADD COLUMN IF NOT EXISTS location VARCHAR(255);
    ALTER TABLE tests ADD COLUMN IF NOT EXISTS salary_range VARCHAR(100);
  EXCEPTION WHEN OTHERS THEN NULL;
  END $$`;

  await sql`
    CREATE TABLE IF NOT EXISTS test_attempts (
      id SERIAL PRIMARY KEY,
      test_id INTEGER NOT NULL REFERENCES tests(id) ON DELETE CASCADE,
      user_id INTEGER REFERENCES users(id) ON DELETE SET NULL,
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

  // Add user_id column to test_attempts if missing
  await sql`DO $$ BEGIN
    ALTER TABLE test_attempts ADD COLUMN IF NOT EXISTS user_id INTEGER REFERENCES users(id) ON DELETE SET NULL;
  EXCEPTION WHEN OTHERS THEN NULL;
  END $$`;

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

  await sql`
    CREATE TABLE IF NOT EXISTS jobs (
      id SERIAL PRIMARY KEY,
      creator_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      title VARCHAR(500) NOT NULL,
      company VARCHAR(255) NOT NULL,
      description TEXT,
      location VARCHAR(255),
      salary_range VARCHAR(100),
      required_score INTEGER DEFAULT 0,
      test_id INTEGER REFERENCES tests(id) ON DELETE SET NULL,
      is_active BOOLEAN DEFAULT true,
      created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
    )
  `;

  await sql`
    CREATE TABLE IF NOT EXISTS api_keys (
      id SERIAL PRIMARY KEY,
      user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      key_hash TEXT NOT NULL,
      key_prefix VARCHAR(20) NOT NULL,
      name VARCHAR(255) DEFAULT 'Default',
      plan VARCHAR(50) DEFAULT 'free',
      rate_limit INTEGER DEFAULT 100,
      requests_today INTEGER DEFAULT 0,
      is_active BOOLEAN DEFAULT true,
      created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
    )
  `;
}
