import { Victim } from "../types/victim"

const PREFIX = "victim:"

export async function listVictims(
  kv: KVNamespace
): Promise<Victim[]> {
  const list = await kv.list({ prefix: PREFIX })
  const victims: Victim[] = []

  for (const key of list.keys) {
    const raw = await kv.get(key.name)
    if (!raw) continue

    try {
      victims.push(JSON.parse(raw))
    } catch {
      // corrupted entry ignored
    }
  }

  return victims
}

export async function getVictim(
  kv: KVNamespace,
  id: string
): Promise<Victim | null> {
  const raw = await kv.get(`${PREFIX}${id}`)
  if (!raw) return null

  try {
    return JSON.parse(raw)
  } catch {
    return null
  }
}

export async function upsertVictim(
  kv: KVNamespace,
  victim: Victim
): Promise<void> {
  await kv.put(`${PREFIX}${victim.id}`, JSON.stringify(victim))
}
