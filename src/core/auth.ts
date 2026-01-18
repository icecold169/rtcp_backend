export function requireAdmin(
  request: Request,
  env: Env
): Response | null {
  const token = request.headers.get("Authorization")

  if (!token || token !== `Bearer ${env.ADMIN_TOKEN}`) {
    return new Response("Unauthorized", { status: 401 })
  }

  return null
}
