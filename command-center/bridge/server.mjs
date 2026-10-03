import http from 'node:http'
import { randomUUID } from 'node:crypto'
import {
  buildAllowedArgs,
  createMeta,
  normalizeAgentState,
  parseMaestriList,
  runMaestri,
  validateChatPayload
} from './maestri-cli.mjs'

const HOST = '127.0.0.1'
const PORT = Number(process.env.COMMAND_CENTER_BRIDGE_PORT || 4312)
const rate = new Map()
const RATE_WINDOW_MS = 60_000
const RATE_LIMIT = 20

function json(res, status, body) {
  res.writeHead(status, { 'Content-Type': 'application/json; charset=utf-8', 'Cache-Control': 'no-store' })
  res.end(JSON.stringify(body))
}

function errorBody(code, message, retryable = false) {
  return { ok: false, ...createMeta(), code, message, retryable }
}

function allowedHost(req) {
  const host = req.headers.host || ''
  return host.startsWith('127.0.0.1:') || host.startsWith('localhost:') || host === '127.0.0.1' || host === 'localhost'
}

function withinRateLimit(address) {
  const now = Date.now()
  const history = (rate.get(address) || []).filter(time => now - time < RATE_WINDOW_MS)
  history.push(now)
  rate.set(address, history)
  return history.length <= RATE_LIMIT
}

async function readJson(req) {
  let body = ''
  for await (const chunk of req) {
    body += chunk
    if (body.length > 20_000) throw Object.assign(new Error('Payload excede o limite.'), { code: 'PAYLOAD_TOO_LARGE' })
  }
  try { return JSON.parse(body || '{}') } catch { throw Object.assign(new Error('JSON inválido.'), { code: 'INVALID_JSON' }) }
}

async function snapshot() {
  const result = await runMaestri(buildAllowedArgs('list'))
  if (result.code !== 0) throw Object.assign(new Error('A CLI Maestri não está disponível.'), { code: 'CLI_UNAVAILABLE', stderr: result.stderr })
  return parseMaestriList(result.stdout)
}

const server = http.createServer(async (req, res) => {
  if (!allowedHost(req)) return json(res, 403, errorBody('HOST_NOT_ALLOWED', 'A bridge aceita apenas loopback.'))
  if (!withinRateLimit(req.socket.remoteAddress || 'local')) return json(res, 429, errorBody('RATE_LIMITED', 'Muitas requisições locais; aguarde.', true))

  try {
    if (req.method === 'GET' && req.url === '/api/health') {
      let cliAvailable = false
      let lastSuccessAt = null
      try { await snapshot(); cliAvailable = true; lastSuccessAt = new Date().toISOString() } catch {}
      return json(res, 200, { ok: true, ...createMeta(), bridge_up: true, cli_available: cliAvailable, socket_accessible: true, last_success_at: lastSuccessAt })
    }

    if (req.method === 'GET' && req.url === '/api/agents') {
      const data = await snapshot()
      const now = Date.now()
      const agents = data.agents.map(agent => ({ ...agent, operational_state: normalizeAgentState(agent, now), evidence: { source: 'snapshot', observed_at: new Date().toISOString(), freshness: 'snapshot' } }))
      return json(res, 200, { ok: true, ...createMeta('maestri-cli'), inventory: { self: data.self, agents, portals: data.portals, notes: data.notes } })
    }

    if (req.method === 'GET' && req.url === '/api/activity') {
      const data = await snapshot()
      const observedAt = new Date().toISOString()
      const events = data.agents.map(agent => ({ event_id: `snapshot:${agent.name}`, type: 'agent.snapshot', agent: agent.name, source: 'snapshot', occurred_at: observedAt, observed_at: observedAt, status: 'observed', payload: { role: agent.role, connections: agent.connections } }))
      return json(res, 200, { ok: true, ...createMeta('snapshot'), events: events.slice(0, 20) })
    }

    if (req.method === 'POST' && req.url === '/api/chat') {
      if (req.headers['content-type'] !== 'application/json') return json(res, 415, errorBody('UNSUPPORTED_MEDIA_TYPE', 'Use Content-Type application/json.'))
      const validation = validateChatPayload(await readJson(req))
      if (!validation.ok) return json(res, 400, errorBody('INVALID_MESSAGE', validation.message))
      const result = await runMaestri(buildAllowedArgs('ask', 'Codex', validation.message))
      if (result.code !== 0) return json(res, 503, errorBody('CLI_ERROR', 'O Codex não respondeu pela CLI Maestri.', true))
      return json(res, 200, { ok: true, ...createMeta('maestri-cli'), message: { message_id: randomUUID(), role: 'assistant', content: result.stdout.trim(), observed_at: new Date().toISOString() } })
    }

    return json(res, 404, errorBody('NOT_FOUND', 'Rota não encontrada.'))
  } catch (error) {
    const code = error.code === 'ETIMEDOUT' ? 'CLI_TIMEOUT' : error.code || 'BRIDGE_ERROR'
    return json(res, code === 'PAYLOAD_TOO_LARGE' ? 413 : 503, errorBody(code, error.message, code === 'CLI_TIMEOUT' || code === 'CLI_UNAVAILABLE'))
  }
})

server.listen(PORT, HOST, () => console.log(`Command Center bridge listening on http://${HOST}:${PORT}`))
