<script setup>
import Phaser from 'phaser'
import { drawOffice, officeSize, workstations } from '../scene/drawOffice.js'
import { onBeforeUnmount, onMounted, ref, watch } from 'vue'

const props = defineProps({ agents: { type: Array, default: () => [] }, selected: Object })
const emit = defineEmits(['select'])
const gameHost = ref(null)
let game
let scene
let resizeObserver
let resizeHandler

function statusColor(agent) {
  return { working: 0xfe6e00, waiting: 0xb4aaa0, completed: 0x00c758, blocked: 0xfb2c36, offline: 0xfb2c36, unknown: 0xb4aaa0 }[agent?.operational_state] || 0xb4aaa0
}

function accentColor(index) { return [0xfe6e00, 0x3080ff, 0x9b72c6, 0x5c6d73, 0x3d8a68, 0x8f5d4b][index % 6] }
function stableKey(agent) { return `${agent?.name || 'unknown'}::${agent?.workspace || agent?.workspace_name || 'local'}` }
function agentLabel(agent) { return `${agent?.name || 'Agente'}, ${agent?.role || 'papel não observado'}, estado ${agent?.operational_state || 'desconhecido'}` }

class OfficeScene extends Phaser.Scene {
  constructor() { super({ key: 'OfficeScene' }); this.agentLayer = null; this.agentObjects = new Map(); this.reducedMotion = false; this.initialCameraFit = false }

  create() {
    this.cameras.main.setBackgroundColor('#e8ece5')
    this.reducedMotion = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches || false
    this.drawWorld()
    this.agentLayer = this.add.layer()
    this.updateAgents(props.agents)
    this.scale.on('resize', this.handleResize, this)
    this.input.on('wheel', (_pointer, _gameObjects, _dx, dy) => { this.cameras.main.zoom = Phaser.Math.Clamp(this.cameras.main.zoom - dy * 0.0006, 0.55, 1.25) })
    this.fitCamera(true)
  }

  drawWorld() {
    drawOffice(this)
  }

  handleResize() { this.fitCamera(false) }

  fitCamera(initial = false) {
    const width = this.scale.width || 900
    const height = this.scale.height || 560
    this.cameras.main.centerOn(officeSize.width / 2, officeSize.height / 2)
    this.cameras.main.setZoom(Math.min(width / officeSize.width, height / officeSize.height) * .98)
    this.initialCameraFit = true
  }

  createAgentObject(agent, index) {
    const point = workstations[index % workstations.length]
    const avatar = this.add.container(point.x, point.y)
    const color = statusColor(agent)
    const shadow = this.add.graphics().fillStyle(0x34493b, .18).fillEllipse(0, 29, 42, 13)
    const body = this.add.graphics().fillStyle(0x35433c).fillRoundedRect(-11, 16, 9, 16, 3).fillRoundedRect(3, 16, 9, 16, 3).fillStyle(accentColor(index)).fillRoundedRect(-15, -2, 30, 25, 7).fillStyle(0xf0c5a3).fillRoundedRect(-11, -23, 22, 23, 7).fillStyle(0x49463e).fillRoundedRect(-13, -27, 26, 11, 5).fillStyle(0x35433c).fillRect(-6, -13, 3, 3).fillRect(5, -13, 3, 3)
    const accessory = this.add.graphics().fillStyle(color).fillRect(-18, 10, 5, 12).fillStyle(0xffffff, .45).fillRect(-18, 10, 2, 12)
    const badge = this.add.graphics().fillStyle(0x292a2b, .94).fillRoundedRect(-57, -63, 114, 27, 7).lineStyle(1, color).strokeRoundedRect(-57, -63, 114, 27, 7)
    const label = this.add.text(-47, -57, agent.name.slice(0, 13), { color: '#ffffff', fontFamily: 'system-ui', fontSize: '12px', fontStyle: 'bold' })
    const status = this.add.text(-47, 40, agent.operational_state || 'unknown', { color: '#52605b', fontFamily: 'system-ui', fontSize: '10px' })
    avatar.add([shadow, body, accessory, badge, label, status]).setSize(116, 78).setInteractive({ useHandCursor: true })
    avatar.on('pointerdown', () => emit('select', avatar.getData('agent')))
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
    this.updateSelection(props.selected)
  }
}

onMounted(() => {
  game = new Phaser.Game({ type: Phaser.AUTO, preserveDrawingBuffer: true, parent: gameHost.value, width: 1280, height: 680, pixelArt: false, antialias: true, backgroundColor: '#e8ece5', scene: OfficeScene, scale: { mode: Phaser.Scale.RESIZE, autoCenter: Phaser.Scale.CENTER_BOTH } })
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
