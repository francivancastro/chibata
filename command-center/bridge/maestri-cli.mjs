import { spawn } from 'node:child_process'
import { randomUUID } from 'node:crypto'

const MAX_MESSAGE_LENGTH = 8000
const SIGNAL_TTL_MS = 2 * 60 * 1000

export function buildAllowedArgs(operation, name, message) {
  if (operation === 'list' && name === undefined) return ['list']
  if (operation === 'ask' && name && typeof message === 'string') return ['ask', name, message]
  if (operation === 'check' && name) return ['check', name]
  throw new Error('Operação não permitida')
}

export function validateChatPayload(payload) {
  if (!payload || typeof payload !== 'object' || typeof payload.message !== 'string') {
    return { ok: false, message: 'O campo message é obrigatório.' }
  }
  const message = payload.message.trim()
  if (!message) return { ok: false, message: 'A mensagem não pode ser vazia.' }
  if (message.length > MAX_MESSAGE_LENGTH) {
    return { ok: false, message: 'A mensagem deve ter no máximo 8.000 caracteres.' }
  }
  return { ok: true, message }
}

export function runMaestri(args, { timeoutMs = 120000, cli = process.env.MAESTRI_CLI || 'maestri' } = {}) {
  if (!Array.isArray(args) || !['list', 'ask', 'check'].includes(args[0])) {
    return Promise.reject(new Error('Operação Maestri não permitida'))
  }

  return new Promise((resolve, reject) => {
    const child = spawn(cli, args, { shell: false, env: process.env })
    let stdout = ''
    let stderr = ''
    const timer = setTimeout(() => {
      child.kill('SIGTERM')
      reject(Object.assign(new Error('Tempo limite da CLI Maestri excedido.'), { code: 'ETIMEDOUT' }))
    }, timeoutMs)

    child.stdout.on('data', chunk => { stdout += chunk })
    child.stderr.on('data', chunk => { stderr += chunk })
    child.on('error', error => {
      clearTimeout(timer)
      reject(error)
    })
    child.on('close', code => {
      clearTimeout(timer)
      resolve({ stdout, stderr, code: code ?? 1 })
    })
  })
}

function valueFromLine(line, key) {
  const match = line.match(new RegExp(`${key}: "([^"]*)"`))
  return match?.[1] || ''
}

export function parseMaestriList(output) {
  const lines = String(output || '').split(/\r?\n/)
  const result = { self: null, agents: [], portals: [], notes: [] }
  let section = ''
  let currentAgent = null

  for (const rawLine of lines) {
    const line = rawLine.trim()
    if (line === 'You:') { section = 'self'; currentAgent = null; continue }
    if (line === 'Connected agents:') { section = 'agents'; currentAgent = null; continue }
    if (line === 'Connected portals (use `maestri portal check`):' || line === 'Connected portals:') { section = 'portals'; currentAgent = null; continue }
    if (line === 'Connected notes (use `maestri note read/write/edit`):') { section = 'notes'; currentAgent = null; continue }
    if (!line || line.startsWith('⎿')) {
      if (section === 'agents' && currentAgent && line.includes('agent:')) {
        const connectedName = valueFromLine(line, 'agent')
        if (connectedName) currentAgent.connections.push(connectedName)
      }
      continue
    }

    if (section === 'self' && line.startsWith('- name:')) {
      result.self = { name: valueFromLine(line, 'name'), maestro: line.includes('maestro: true') }
      continue
    }
    if (section === 'agents' && line.startsWith('- name:')) {
      currentAgent = {
        name: valueFromLine(line, 'name'),
        role: valueFromLine(line, 'role'),
        workspace: line.includes('@') ? line.split('@').at(-1).trim() : '',
        connections: [],
        connected: true
      }
      result.agents.push(currentAgent)
      continue
    }
    if (section === 'portals' && line.startsWith('- name:')) {
      result.portals.push({ name: valueFromLine(line, 'name'), url: line.split(' - url: ').at(-1) || '' })
      continue
    }
    if (section === 'notes' && line.startsWith('- name:')) {
      result.notes.push({ name: valueFromLine(line, 'name') })
    }
  }
  return result
}

export function normalizeAgentState(agent, now = Date.now()) {
  if (!agent?.connected) return 'offline'
  if (!agent.lastSeen) return 'unknown'
  const freshness = now - Date.parse(agent.lastSeen)
  if (Number.isNaN(freshness) || freshness > SIGNAL_TTL_MS) return 'unknown'
  if (agent.workingSignal) return 'working'
  return 'waiting'
}

export function createMeta(source = 'maestri-cli') {
  const observedAt = new Date().toISOString()
  return { schema_version: 1, request_id: randomUUID(), observed_at: observedAt, source }
}

export { MAX_MESSAGE_LENGTH, SIGNAL_TTL_MS }
