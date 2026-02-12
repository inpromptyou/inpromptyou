import { getSql } from "@/lib/db";
import { NextRequest, NextResponse } from "next/server";
// Lock: track if init has already been run this deployment
let hasInitialized = false;

export async function POST(req: NextRequest) {
  try {
    // Gate 1: Require ADMIN_SECRET header or query param
    const secret = req.headers.get("x-admin-secret") || req.nextUrl.searchParams.get("secret");
    if (!process.env.ADMIN_SECRET || secret !== process.env.ADMIN_SECRET) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Gate 2: One-time-use per deployment
    if (hasInitialized) {
      return NextResponse.json({ error: "Database already initialized this deployment. Restart the server to re-enable." }, { status: 429 });
    }

    const sql = getSql();

    // Users table
    await sql`
      CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,
        name VARCHAR(100) NOT NULL,
        email VARCHAR(255) NOT NULL UNIQUE,
        password_hash VARCHAR(255),
        google_id VARCHAR(255),
        avatar_url TEXT,
        role VARCHAR(20) DEFAULT 'user',
        plan VARCHAR(20) DEFAULT 'free',
        prompt_score INTEGER,
        tests_created INTEGER DEFAULT 0,
        tests_taken INTEGER DEFAULT 0,
        created_at TIMESTAMP DEFAULT NOW(),
        updated_at TIMESTAMP DEFAULT NOW()
      )
    `;

    // Tests table
    await sql`
      CREATE TABLE IF NOT EXISTS tests (
        id SERIAL PRIMARY KEY,
        slug VARCHAR(50) NOT NULL UNIQUE,
        creator_id INTEGER NOT NULL REFERENCES users(id),
        name VARCHAR(200) NOT NULL,
        description TEXT,
        model VARCHAR(50) DEFAULT 'gpt-4o',
        task_description TEXT NOT NULL,
        expected_outcome TEXT,
        max_attempts INTEGER DEFAULT 5,
        time_limit_minutes INTEGER DEFAULT 15,
        token_budget INTEGER DEFAULT 2000,
        is_public BOOLEAN DEFAULT false,
        is_active BOOLEAN DEFAULT true,
        total_attempts INTEGER DEFAULT 0,
        avg_score NUMERIC(5,2),
        created_at TIMESTAMP DEFAULT NOW(),
        updated_at TIMESTAMP DEFAULT NOW()
      )
    `;

    // Test results / submissions
    await sql`
      CREATE TABLE IF NOT EXISTS test_results (
        id SERIAL PRIMARY KEY,
        test_id INTEGER NOT NULL REFERENCES tests(id),
        user_id INTEGER REFERENCES users(id),
        candidate_name VARCHAR(100),
        candidate_email VARCHAR(255),
        prompt_score INTEGER NOT NULL DEFAULT 0,
        efficiency_score INTEGER DEFAULT 0,
        speed_score INTEGER DEFAULT 0,
        accuracy_score INTEGER DEFAULT 0,
        attempt_score INTEGER DEFAULT 0,
        tokens_used INTEGER DEFAULT 0,
        attempts_used INTEGER DEFAULT 0,
        time_spent_seconds INTEGER DEFAULT 0,
        status VARCHAR(20) DEFAULT 'in_progress',
        started_at TIMESTAMP DEFAULT NOW(),
        completed_at TIMESTAMP
      )
    `;

    // Chat messages within a test session
    await sql`
      CREATE TABLE IF NOT EXISTS test_messages (
        id SERIAL PRIMARY KEY,
        result_id INTEGER NOT NULL REFERENCES test_results(id),
        role VARCHAR(20) NOT NULL,
        content TEXT NOT NULL,
        tokens_used INTEGER DEFAULT 0,
        created_at TIMESTAMP DEFAULT NOW()
      )
    `;

    hasInitialized = true;

    return NextResponse.json({ ok: true, message: "All tables created" });
  } catch (e: unknown) {
    console.error("DB init error:", e);
    return NextResponse.json({ error: "Failed to initialize DB" }, { status: 500 });
  }
}
