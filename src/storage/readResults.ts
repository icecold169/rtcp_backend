export async function readResults(
  db: D1Database,
  opts: {
    agentId?: string
    limit: number
    cursor?: string
  }
) {
  const params: any[] = []
  let where = "1 = 1"

  if (opts.agentId) {
    where += " AND agent_id = ?"
    params.push(opts.agentId)
  }

  if (opts.cursor) {
    where += " AND created_at < ?"
    params.push(opts.cursor)
  }

  const stmt = `
    SELECT
      id,
      agent_id as agentId,
      command_id as commandId,
      output,
      created_at as createdAt
    FROM command_results
    WHERE ${where}
    ORDER BY created_at DESC
    LIMIT ?
  `

  params.push(opts.limit + 1)

  const { results } = await db
    .prepare(stmt)
    .bind(...params)
    .all()

  let nextCursor: string | null = null
  let items = results

  if (results.length > opts.limit) {
    const last = results[opts.limit - 1]
    nextCursor = last.createdAt
    items = results.slice(0, opts.limit)
  }

  return { items, nextCursor }
}
