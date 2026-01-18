export interface Command {
  id: string
  agentId: string
  command: string
  createdAt: string
  status: "queued"
}

export async function getCommand(
  kv: KVNamespace,
  agentId: string
): Promise<Command | null> {
  const raw = await kv.get(`command:${agentId}`)
  return raw ? JSON.parse(raw) : null
}

export async function createCommand(
  kv: KVNamespace,
  cmd: Command
): Promise<void> {
  await kv.put(
    `command:${cmd.agentId}`,
    JSON.stringify(cmd)
  )
}

export async function deleteCommand(
  kv: KVNamespace,
  agentId: string
): Promise<void> {
  await kv.delete(`command:${agentId}`)
}

