export interface Command {
  id: string
  agentId: string
  command: string
}

export async function getCommand(
  kv: KVNamespace,
  agentId: string
): Promise<Command | null> {
  const raw = await kv.get(`cmd:${agentId}`)
  if (!raw) return null
  
  try {
    return JSON.parse(raw)
  } catch {
    return null
  }
}

export async function deleteCommand(
  kv: KVNamespace,
  agentId: string
): Promise<void> {
  await kv.delete(`cmd:${agentId}`)
}