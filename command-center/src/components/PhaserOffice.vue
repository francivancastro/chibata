<script setup>
import Phaser from 'phaser'
import { onBeforeUnmount, onMounted, ref, watch } from 'vue'

const props = defineProps({ agents: { type: Array, default: () => [] }, selected: Object })
const emit = defineEmits(['select'])
const gameHost = ref(null)
let game
let scene
let resizeObserver
let resizeHandler

const rooms = [
  { id: 'codex', x: 13, y: 3, w: 15, h: 8, label: 'NÚCLEO DO CODEX', tone: 0xfe6e00, prop: 'terminal' },
  { id: 'design', x: 30, y: 3, w: 10, h: 8, label: 'ATELIÊ DE DESIGN', tone: 0x9b72c6, prop: 'grid' },
  { id: 'product', x: 2, y: 14, w: 12, h: 7, label: 'OFICINA DE PRODUTO', tone: 0x3080ff, prop: 'board' },
  { id: 'software', x: 16, y: 14, w: 13, h: 7, label: 'SALA DE SOFTWARE', tone: 0x5c6d73, prop: 'bench' },
  { id: 'archive', x: 31, y: 14, w: 10, h: 7, label: 'ARQUIVO / ATIVIDADE', tone: 0x3d8a68, prop: 'shelf' }
]

function statusColor(agent) {
  return { working: 0xfe6e00, waiting: 0xb4aaa0, completed: 0x00c758, blocked: 0xfb2c36, offline: 0xfb2c36, unknown: 0xb4aaa0 }[agent?.operational_state] || 0xb4aaa0
}

function accentColor(index) { return [0xfe6e00, 0x3080ff, 0x9b72c6, 0x5c6d73, 0x3d8a68, 0x8f5d4b][index % 6] }
function stableKey(agent) { return `${agent?.name || 'unknown'}::${agent?.workspace || agent?.workspace_name || 'local'}` }
function agentLabel(agent) { return `${agent?.name || 'Agente'}, ${agent?.role || 'papel não observado'}, estado ${agent?.operational_state || 'desconhecido'}` }

function drawFurniture(sceneRef, room) {
  const g = sceneRef.add.graphics()
  const x = room.x * 32
  const y = room.y * 32
  if (room.prop === 'terminal') {
    g.fillStyle(0x262c32).fillRect(x + 104, y + 104, 260, 70).fillStyle(0x3f6270).fillRect(x + 122, y + 120, 70, 30).fillRect(x + 216, y + 120, 70, 30).fillStyle(0xfe6e00).fillCircle(x + 330, y + 138, 8)
  } else if (room.prop === 'grid') {
    g.fillStyle(0xe2d5e7).fillRect(x + 55, y + 92, 210, 86).lineStyle(3, 0x9b72c6).strokeRect(x + 55, y + 92, 210, 86).lineBetween(x + 120, y + 92, x + 120, y + 178).lineBetween(x + 190, y + 92, x + 190, y + 178)
  } else if (room.prop === 'board') {
    g.fillStyle(0xd7e5f5).fillRect(x + 44, y + 70, 210, 90).lineStyle(4, 0x3080ff).strokeRect(x + 44, y + 70, 210, 90).fillStyle(0x3080ff).fillCircle(x + 78, y + 105, 8).fillCircle(x + 124, y + 127, 8)
  } else if (room.prop === 'bench') {
    g.fillStyle(0x68777a).fillRect(x + 45, y + 78, 280, 44).fillStyle(0x20262a).fillRect(x + 70, y + 132, 68, 54).fillRect(x + 190, y + 132, 68, 54).fillStyle(0xedb200).fillRect(x + 146, y + 84, 28, 28)
  } else {
    g.fillStyle(0x365945).fillRect(x + 50, y + 64, 45, 155).fillRect(x + 116, y + 64, 45, 155).fillRect(x + 182, y + 64, 45, 155).fillStyle(0x9cc59a).fillRect(x + 58, y + 74, 29, 12).fillRect(x + 124, y + 74, 29, 12)
  }
}

class OfficeScene extends Phaser.Scene {
  constructor() { super({ key: 'OfficeScene' }); this.agentLayer = null; this.agentObjects = new Map(); this.reducedMotion = false; this.initialCameraFit = false }

  create() {
    this.cameras.main.setBackgroundColor('#9fbf8b')
    this.reducedMotion = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches || false
    this.drawWorld()
    this.createAmbientMotion()
    this.agentLayer = this.add.layer()
    this.updateAgents(props.agents)
    this.scale.on('resize', this.handleResize, this)
    this.input.on('wheel', (_pointer, _gameObjects, _dx, dy) => { this.cameras.main.zoom = Phaser.Math.Clamp(this.cameras.main.zoom - dy * 0.0006, 0.55, 1.25) })
    this.fitCamera(true)
  }

  drawWorld() {
    const g = this.add.graphics()
    const worldW = 43 * 32
    const worldH = 23 * 32
    g.fillStyle(0xe8e4de).fillRect(0, 0, worldW, worldH)
    for (let x = 0; x < worldW; x += 64) for (let y = 0; y < worldH; y += 64) g.fillStyle((x / 64 + y / 64) % 2 ? 0xe3dfd8 : 0xebe8e2).fillRect(x, y, 64, 64)
    g.fillStyle(0xd1cbc3).fillRect(0, 11 * 32, worldW, 3 * 32).fillRect(14 * 32, 0, 3 * 32, worldH)
    g.fillStyle(0xc5beb5).fillRect(0, 12 * 32, worldW, 3).fillRect(15 * 32, 0, 3, worldH)
    rooms.forEach(room => {
      const x = room.x * 32; const y = room.y * 32; const w = room.w * 32; const h = room.h * 32
      g.fillStyle(0x8e867d, .18).fillRect(x + 10, y + h + 8, w, 10)
      g.fillStyle(0xf8f6f2).fillRect(x, y, w, h).lineStyle(6, 0x514b45).strokeRect(x, y, w, h).lineStyle(2, 0xffffff, .85).strokeRect(x + 8, y + 8, w - 16, h - 16)
      g.fillStyle(room.tone, .9).fillRect(x + 14, y + 14, Math.min(w - 28, 180), 7)
      g.fillStyle(0xd9d3cb).fillRect(x + 18, y + 32, w - 36, 2)
      drawFurniture(this, room)
    })
    g.fillStyle(0x6e8e72).fillCircle(90, 70, 32).fillCircle(118, 64, 28).fillCircle(105, 94, 26).fillStyle(0x806750).fillRect(101, 91, 9, 28)
    g.fillStyle(0x9fc5c5).fillEllipse(1210, 630, 170, 100).lineStyle(4, 0x668b8d).strokeEllipse(1210, 630, 170, 100)
    this.cameras.main.setBounds(0, 0, worldW, worldH)
  }

  createAmbientMotion() {
    if (this.reducedMotion) return
    const glints = [0, 1, 2].map(index => this.add.rectangle(1160 + index * 38, 620 + (index % 2) * 18, 4, 2, 0xffffff, .45))
    this.tweens.add({ targets: glints, alpha: .08, duration: 1200, yoyo: true, repeat: -1, delay: 220, ease: 'Sine.InOut' })
  }

  handleResize() { this.fitCamera(false) }

  fitCamera(initial = false) {
    const width = this.scale.width || 900
    const height = this.scale.height || 560
    this.cameras.main.centerOn((43 * 32) / 2, (23 * 32) / 2)
    if (initial || !this.initialCameraFit) this.cameras.main.setZoom(Math.min(width / (43 * 32), height / (23 * 32)) * .98)
    this.initialCameraFit = true
  }

  createAgentObject(agent, index) {
    const point = [{ x: 21, y: 8 }, { x: 34, y: 8 }, { x: 7, y: 18 }, { x: 22, y: 18 }, { x: 35, y: 18 }, { x: 18, y: 10 }, { x: 28, y: 18 }, { x: 12, y: 6 }][index % 8]
    const avatar = this.add.container(point.x * 32, point.y * 32)
    const color = statusColor(agent)
    const shadow = this.add.graphics().fillStyle(0x423d38, .24).fillEllipse(0, 26, 34, 9)
    const body = this.add.graphics().fillStyle(0x423d38).fillRect(-12, 2, 24, 26).fillStyle(accentColor(index)).fillRect(-8, 5, 16, 20).fillStyle(0xffc9a5).fillRect(-7, -13, 14, 14).fillStyle(0x423d38).fillRect(-10, -14, 20, 5).fillStyle(0xffd579).fillRect(13, 8, 7, 7)
    const accessory = this.add.graphics().fillStyle(color).fillRect(-18, 10, 5, 12).fillStyle(0xffffff, .45).fillRect(-18, 10, 2, 12)
    const badge = this.add.graphics().fillStyle(0x292a2b, .94).fillRoundedRect(-46, -42, 92, 20, 3).lineStyle(1, color).strokeRoundedRect(-46, -42, 92, 20, 3)
    const label = this.add.text(-39, -38, agent.name.slice(0, 13), { color: '#ffffff', fontFamily: 'monospace', fontSize: '9px', fontStyle: 'bold' })
    const status = this.add.text(-39, -24, agent.operational_state || 'unknown', { color: '#e9e3da', fontFamily: 'monospace', fontSize: '7px' })
    avatar.add([shadow, body, accessory, badge, label, status]).setSize(116, 78).setInteractive({ useHandCursor: true })
    avatar.on('pointerdown', () => emit('select', agent))
    avatar.setData('agent', agent)
    avatar.setData('stableKey', stableKey(agent))
    avatar.setData('body', body)
    avatar.setData('accessory', accessory)
    avatar.setData('status', agent.operational_state)
    this.agentLayer.add(avatar)
    return avatar
  }

  syncAgentMotion(avatar, agent) {
    const previous = avatar.getData('status')
    const state = agent.operational_state || 'unknown'
    const body = avatar.getData('body')
    const accessory = avatar.getData('accessory')
    ;[avatar, body, accessory].forEach(target => this.tweens.killTweensOf(target))
    avatar.setAlpha(state === 'offline' ? .48 : 1)
    avatar.setData('status', state)
    if (this.reducedMotion) return
    if (state === 'working') this.tweens.add({ targets: [body, accessory], y: -2, duration: 180, yoyo: true, repeat: -1, ease: 'Stepped' })
    if (previous && previous !== state && state === 'completed') this.tweens.add({ targets: avatar, y: '-=2', duration: 130, yoyo: true, ease: 'Cubic.Out' })
    if (previous && previous !== state && state === 'blocked') this.tweens.add({ targets: avatar, x: '+=2', duration: 90, yoyo: true, repeat: 1, ease: 'Stepped' })
  }

  updateSelection(selected) {
    const selectedKey = stableKey(selected)
    this.agentObjects.forEach((avatar, key) => {
      const active = key === selectedKey
      avatar.setScale(active ? 1.04 : 1)
      avatar.setData('selected', active)
    })
  }

  updateAgents(agents) {
    if (!this.agentLayer) return
    const next = new Map()
    agents.forEach((agent, index) => {
      const key = stableKey(agent)
      const avatar = this.agentObjects.get(key) || this.createAgentObject(agent, index)
      avatar.setData('agent', agent)
      this.syncAgentMotion(avatar, agent)
      next.set(key, avatar)
    })
    this.agentObjects.forEach((avatar, key) => { if (!next.has(key)) { this.tweens.killTweensOf(avatar); avatar.destroy(true) } })
    this.agentObjects = next
  }
}

onMounted(() => {
  game = new Phaser.Game({ type: Phaser.AUTO, parent: gameHost.value, width: 1280, height: 680, pixelArt: true, antialias: false, backgroundColor: '#9fbf8d', scene: OfficeScene, scale: { mode: Phaser.Scale.RESIZE, autoCenter: Phaser.Scale.CENTER_BOTH } })
  scene = game.scene.getScene('OfficeScene')
  resizeObserver = new ResizeObserver(entries => {
    const entry = entries[0]
    if (!entry || !game) return
    const width = Math.max(1, Math.floor(entry.contentRect.width))
    const height = Math.max(1, Math.floor(entry.contentRect.height))
    if (game.scale.width !== width || game.scale.height !== height) game.scale.resize(width, height)
  })
  resizeObserver.observe(gameHost.value)
  resizeHandler = () => {
    const rect = gameHost.value?.getBoundingClientRect()
    if (rect && game) game.scale.resize(Math.max(1, Math.floor(rect.width)), Math.max(1, Math.floor(rect.height)))
  }
  window.addEventListener('resize', resizeHandler, { passive: true })
  resizeHandler()
})
watch(() => props.agents, agents => scene?.updateAgents(agents), { deep: true, flush: 'post' })
watch(() => props.selected, selected => scene?.updateSelection(selected), { deep: true })
onBeforeUnmount(() => { resizeObserver?.disconnect(); if (resizeHandler) window.removeEventListener('resize', resizeHandler); scene?.scale?.off('resize', scene.handleResize, scene); scene?.agentObjects?.forEach(avatar => scene.tweens.killTweensOf(avatar)); game?.destroy(true); game = null; scene = null })
</script>

<template>
  <div class="phaser-office-wrap">
    <div ref="gameHost" class="phaser-office" aria-label="Mapa interativo do escritório virtual"></div>
    <div class="phaser-accessibility-layer" aria-label="Agentes observados">
      <button v-for="agent in agents" :key="stableKey(agent)" type="button" class="phaser-agent-button" :aria-label="agentLabel(agent)" :aria-pressed="stableKey(selected) === stableKey(agent)" @click="emit('select', agent)">{{ agent.name }} · {{ agent.operational_state || 'desconhecido' }}</button>
    </div>
  </div>
</template>
