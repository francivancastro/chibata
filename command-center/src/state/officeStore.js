import { reactive } from 'vue'

export const statusMeta = {
  working: { label: 'Trabalhando', tone: 'orange', icon: '↗' },
  waiting: { label: 'Aguardando', tone: 'muted', icon: '·' },
  completed: { label: 'Concluído', tone: 'success', icon: '✓' },
  blocked: { label: 'Bloqueado', tone: 'danger', icon: '!' },
  offline: { label: 'Indisponível', tone: 'danger', icon: '×' },
  unknown: { label: 'Desconhecido', tone: 'muted', icon: '?' }
}

export function createInitialState() {
  return {
    self: null,
    agents: [],
    activity: [],
    messages: [],
    health: null,
    loading: true,
    sending: false,
    error: '',
    lastUpdated: null,
    summary: { observed: 0, waiting: 0, working: 0, completed: 0, blocked: 0, offline: 0, unknown: 0 }
  }
}

function summarize(agents) {
  const summary = { observed: agents.length, waiting: 0, working: 0, completed: 0, blocked: 0, offline: 0, unknown: 0 }
  agents.forEach(agent => { summary[agent.operational_state] = (summary[agent.operational_state] || 0) + 1 })
  return summary
}

export function applyInventory(state, payload) {
  const agents = payload.inventory?.agents || []
  return {
    ...state,
    self: payload.inventory?.self || null,
    agents,
    summary: summarize(agents),
    lastUpdated: payload.observed_at || new Date().toISOString(),
    error: ''
  }
}

export function appendActivity(state, events = []) {
  const byId = new Map([...state.activity, ...events].map(event => [event.event_id, event]))
  const activity = [...byId.values()].sort((a, b) => Date.parse(b.occurred_at || b.observed_at || 0) - Date.parse(a.occurred_at || a.observed_at || 0)).slice(0, 30)
  return { ...state, activity }
}

export function createOfficeStore(client) {
  const state = reactive(createInitialState())

  async function refresh() {
    state.loading = state.agents.length === 0
    try {
      const [health, agents, activity] = await Promise.all([client.health(), client.agents(), client.activity()])
      Object.assign(state, applyInventory(state, agents))
      Object.assign(state, appendActivity(state, activity.events))
      state.health = health
    } catch (error) {
      state.error = error.message
      state.health = { bridge_up: false, cli_available: false, socket_accessible: false }
    } finally {
      state.loading = false
    }
  }

  async function sendMessage(content) {
    const text = content.trim()
    if (!text || state.sending) return
    state.messages.push({ id: `user-${Date.now()}`, role: 'user', content: text, observed_at: new Date().toISOString() })
    state.sending = true
    state.error = ''
    try {
      const result = await client.chat(text)
      state.messages.push({ id: result.message.message_id, role: 'assistant', content: result.message.content, observed_at: result.message.observed_at })
    } catch (error) {
      state.messages.push({ id: `error-${Date.now()}`, role: 'error', content: error.message, observed_at: new Date().toISOString() })
      state.error = error.message
    } finally {
      state.sending = false
    }
  }

  return { state, refresh, sendMessage }
}
