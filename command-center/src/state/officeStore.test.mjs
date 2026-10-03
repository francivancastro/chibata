import test from 'node:test'
import assert from 'node:assert/strict'
import { applyInventory, appendActivity, createInitialState } from './officeStore.js'

test('applyInventory keeps observed agents and derives counts without hardcoding', () => {
  const state = createInitialState()
  const next = applyInventory(state, {
    inventory: {
      self: { name: 'Codex', maestro: true },
      agents: [
        { name: 'Forge', role: 'Engenharia', operational_state: 'unknown' },
        { name: 'Atlas', role: 'Produto', operational_state: 'waiting' }
      ]
    },
    observed_at: '2026-10-03T13:20:00.000Z'
  })

  assert.deepEqual(next.agents.map(agent => agent.name), ['Forge', 'Atlas'])
  assert.equal(next.summary.observed, 2)
  assert.equal(next.summary.waiting, 1)
  assert.equal(next.summary.unknown, 1)
})

test('appendActivity deduplicates events and keeps newest first', () => {
  const state = createInitialState()
  const event = { event_id: 'snapshot:Forge', agent: 'Forge', observed_at: '2026-10-03T13:20:00.000Z' }
  const next = appendActivity(appendActivity(state, [event]), [{ ...event }, { event_id: 'snapshot:Atlas', agent: 'Atlas', observed_at: '2026-10-03T13:21:00.000Z' }])

  assert.deepEqual(next.activity.map(item => item.event_id), ['snapshot:Atlas', 'snapshot:Forge'])
})
