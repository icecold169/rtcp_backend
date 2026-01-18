import { json, error } from "../core/response"
import { insertResult } from "../storage/results"

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

  if (
    !body.agentId ||
    !body.commandId ||
    typeof body.output !== "string"
  ) {
    return error("Invalid payload", 400)
  }

  await insertResult(env.RESULTS_DB, {
    id: crypto.randomUUID(),
    agentId: body.agentId,
    commandId: body.commandId,
    output: body.output,
    createdAt: new Date().toISOString()
  })

  return json({ ok: true })
}
