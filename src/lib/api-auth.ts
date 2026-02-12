import { getSql } from "./db";
import crypto from "crypto";

export interface ApiUser {
  userId: number;
  plan: string;
  keyId: number;
}

export async function authenticateApiKey(request: Request): Promise<ApiUser | null> {
  const authHeader = request.headers.get("authorization");
  if (!authHeader?.startsWith("Bearer ")) return null;

  const key = authHeader.substring(7);
  const keyHash = crypto.createHash("sha256").update(key).digest("hex");

  const sql = getSql();
  const rows = await sql`
    SELECT ak.id, ak.user_id, ak.plan, ak.rate_limit, ak.requests_today, u.plan as user_plan
    FROM api_keys ak
    JOIN users u ON ak.user_id = u.id
    WHERE ak.key_hash = ${keyHash} AND ak.is_active = true
  `;

  if (rows.length === 0) return null;

  const ak = rows[0];
  const userPlan = ak.user_plan as string;

  if (userPlan !== "pro" && userPlan !== "business") return null;

  // Rate limit check
  if (Number(ak.requests_today) >= Number(ak.rate_limit)) return null;

  // Increment request count
  await sql`UPDATE api_keys SET requests_today = requests_today + 1 WHERE id = ${ak.id}`;

  return { userId: Number(ak.user_id), plan: userPlan, keyId: Number(ak.id) };
}
