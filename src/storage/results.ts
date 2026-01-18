export async function insertResult(
  db: D1Database,
  data: {
    id: string
    agentId: string
    commandId: string
    output: string
    createdAt: string
  }
): Promise<void> {
  await db
    .prepare(
      `INSERT INTO command_results
       (id, agent_id, command_id, output, created_at)
       VALUES (?, ?, ?, ?, ?)`
    )
    .bind(
      data.id,
      data.agentId,
      data.commandId,
      data.output,
      data.createdAt
    )
    .run()
}
