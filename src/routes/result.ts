import { json, error } from "../core/response"
import { Env } from "../types/env"

export async function submitResult(
  request: Request,
  env: Env
): Promise<Response> {

  if (request.method !== "POST") {
    return error("Method Not Allowed", 405)
  }

  let body: {
    agentId?: string
    commandId?: string
    output?: string
  }

  try {
    body = await request.json()
  } catch {
    return error("Invalid JSON", 400)
  }

  if (!body.agentId || !body.commandId || typeof body.output !== "string") {
    return error("Invalid payload", 400)
  }

  await env.RESULTS_DB.prepare(`
    INSERT INTO command_results (agent_id, command_id, output)
    VALUES (?, ?, ?)
  `).bind(
    body.agentId,
    body.commandId,
    body.output
  ).run()

  return json({ ok: true })
}
