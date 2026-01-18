const WINDOW_SECONDS = 60
const MAX_REQUESTS = 30

interface RateState {
  count: number
  reset: number
}

export async function rateLimit(
  kv: KVNamespace,
  key: string
): Promise<boolean> {
  const now = Math.floor(Date.now() / 1000)
  const storageKey = `rate:${key}`

  const raw = await kv.get(storageKey)
  let state: RateState

  if (!raw) {
    state = { count: 1, reset: now + WINDOW_SECONDS }
  } else {
    try {
      state = JSON.parse(raw) as RateState
    } catch {
      // corrupted data → self-heal
      state = { count: 1, reset: now + WINDOW_SECONDS }
    }
  }

  if (now > state.reset) {
    state = { count: 1, reset: now + WINDOW_SECONDS }
  } else {
    state.count += 1
  }

  await kv.put(storageKey, JSON.stringify(state), {
    expirationTtl: WINDOW_SECONDS
  })

  return state.count <= MAX_REQUESTS
}