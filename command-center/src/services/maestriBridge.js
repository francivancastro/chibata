async function request(path, options = {}) {
  const response = await fetch(path, { headers: { Accept: 'application/json', ...options.headers }, ...options })
  const body = await response.json().catch(() => ({ ok: false, code: 'INVALID_RESPONSE', message: 'Resposta inválida da bridge.' }))
  if (!response.ok || body.ok === false) throw new Error(body.message || 'Bridge indisponível.')
  return body
}

export const maestriBridge = {
  health: () => request('/api/health'),
  agents: () => request('/api/agents'),
  activity: () => request('/api/activity'),
  chat: message => request('/api/chat', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ message })
  })
}
