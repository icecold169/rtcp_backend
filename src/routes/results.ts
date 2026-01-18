import { requireAdmin } from "../core/auth"
import { json, error } from "../core/response"
import { readResults } from "../storage/readResults"

export async function getResults(
  request: Request,
  env: Env
): Promise<Response> {

  const authError = requireAdmin(request, env)
  if (authError) return authError

  if (request.method !== "GET") {
    return error("Method Not Allowed", 405)
  }

  const url = new URL(request.url)

  const agentId = url.searchParams.get("agentId") ?? undefined
  const cursor = url.searchParams.get("cursor") ?? undefined

  let limit = Number(url.searchParams.get("limit") ?? 20)
  if (!Number.isFinite(limit) || limit <= 0) limit = 20
  if (limit > 100) limit = 100

  const data = await readResults(env.RESULTS_DB, {
    agentId,
    cursor,
    limit
  })

  return json(data)
}
