    import { requireAdmin } from "../core/auth"
import { json } from "../core/response"
import { listVictims } from "../storage/victims"

export async function getVictims(
  request: Request,
  env: Env
): Promise<Response> {

  const auth = requireAdmin(request, env)
  if (auth) return auth

  const victims = await listVictims(env.C2_STORAGE)

  return json(victims, 200, {
    "Cache-Control": "private, max-age=5"
  })
}
