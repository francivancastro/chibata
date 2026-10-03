import test from 'node:test'
import assert from 'node:assert/strict'
import {
  buildAllowedArgs,
  parseMaestriList,
  normalizeAgentState,
  validateChatPayload
} from './maestri-cli.mjs'

test('buildAllowedArgs keeps chat text as one argument', () => {
  const message = 'revisar; echo segredo\ncom aspas "seguras"'
  assert.deepEqual(buildAllowedArgs('ask', 'Codex', message), ['ask', 'Codex', message])
})

test('buildAllowedArgs rejects arbitrary commands', () => {
  assert.throws(() => buildAllowedArgs('exec', 'rm -rf /'), /operação não permitida/i)
})

test('parseMaestriList preserves observed agents and connections', () => {
  const result = parseMaestriList([
    'You:',
    '  - name: "Codex", maestro: true',
    'Connected agents:',
    '  - name: "Forge", role: "Engenharia de Software"',
    '    ⎿ agent: "Atlas"',
    'Connected portals:',
    '  - name: "OpenDesign Studio" - url: http://127.0.0.1:7456'
  ].join('\n'))

  assert.equal(result.agents[0].name, 'Forge')
  assert.deepEqual(result.agents[0].connections, ['Atlas'])
  assert.equal(result.portals[0].name, 'OpenDesign Studio')
})

test('normalizeAgentState does not infer work from stale signals', () => {
  const now = Date.parse('2026-10-03T12:00:00.000Z')
  assert.equal(normalizeAgentState({ connected: true, lastSeen: '2026-10-03T11:59:30.000Z' }, now), 'waiting')
  assert.equal(normalizeAgentState({ connected: true, lastSeen: '2026-10-03T11:50:00.000Z' }, now), 'unknown')
  assert.equal(normalizeAgentState({ connected: false }, now), 'offline')
})

test('validateChatPayload rejects non-json shape and oversized messages', () => {
  assert.deepEqual(validateChatPayload({ message: 'ok' }), { ok: true, message: 'ok' })
  assert.match(validateChatPayload({ message: ' ' }).message, /vazia/i)
  assert.match(validateChatPayload({ message: 'x'.repeat(8001) }).message, /8.000/i)
  assert.match(validateChatPayload({ prompt: 'nope' }).message, /message/i)
})
