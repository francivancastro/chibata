<script setup>
import Phaser from 'phaser'
import { onBeforeUnmount, onMounted, ref, watch } from 'vue'

const props = defineProps({ agents: { type: Array, default: () => [] }, selected: Object })
const emit = defineEmits(['select'])
const gameHost = ref(null)
let game
let scene

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
  constructor() { super({ key: 'OfficeScene' }); this.agentLayer = null; this.agentObjects = new Map() }

  create() {
    this.cameras.main.setBackgroundColor('#9fbf8b')
    this.drawWorld()
    this.agentLayer = this.add.layer()
    this.renderAgents(props.agents)
    this.scale.on('resize', () => this.fitCamera())
    this.input.on('wheel', (_pointer, _gameObjects, _dx, dy) => { this.cameras.main.zoom = Phaser.Math.Clamp(this.cameras.main.zoom - dy * 0.0006, 0.55, 1.25) })
    this.fitCamera()
  }

  drawWorld() {
    const g = this.add.graphics()
    const worldW = 43 * 32
    const worldH = 23 * 32
    g.fillStyle(0x9fbd8d).fillRect(0, 0, worldW, worldH)
    for (let x = 0; x < worldW; x += 32) for (let y = 0; y < worldH; y += 32) g.lineStyle(1, 0x8dae7e, .22).strokeRect(x, y, 32, 32)
    g.fillStyle(0xd6c6ae).fillRect(0, 11 * 32, worldW, 3 * 32).fillRect(14 * 32, 0, 3 * 32, worldH)
    rooms.forEach(room => {
      const x = room.x * 32; const y = room.y * 32; const w = room.w * 32; const h = room.h * 32
      g.fillStyle(0xe9e3da).fillRect(x, y, w, h).lineStyle(5, 0x4c4844).strokeRect(x, y, w, h).lineStyle(2, 0xffffff, .7).strokeRect(x + 8, y + 8, w - 16, h - 16)
      g.fillStyle(room.tone).fillRect(x + 14, y + 14, Math.min(w - 28, 180), 8)
      drawFurniture(this, room)
    })
    g.fillStyle(0x4d8159).fillCircle(90, 70, 32).fillCircle(118, 64, 28).fillCircle(105, 94, 26).fillStyle(0x866b4f).fillRect(101, 91, 9, 28)
    g.fillStyle(0x72b8c0).fillEllipse(1210, 630, 170, 100).lineStyle(4, 0x4d858c).strokeEllipse(1210, 630, 170, 100)
    this.cameras.main.setBounds(0, 0, worldW, worldH)
  }

  fitCamera() {
    const width = this.scale.width || 900
    const height = this.scale.height || 560
    this.cameras.main.centerOn((43 * 32) / 2, (23 * 32) / 2)
    this.cameras.main.setZoom(Math.min(width / (43 * 32), height / (23 * 32)) * .98)
  }

  renderAgents(agents) {
    if (!this.agentLayer) return
    this.agentLayer.removeAll(true)
    const positions = [{ x: 21, y: 8 }, { x: 34, y: 8 }, { x: 7, y: 18 }, { x: 22, y: 18 }, { x: 35, y: 18 }, { x: 18, y: 10 }, { x: 28, y: 18 }, { x: 12, y: 6 }]
    agents.forEach((agent, index) => {
      const point = positions[index % positions.length]
      const x = point.x * 32; const y = point.y * 32
      const color = statusColor(agent)
      const avatar = this.add.container(x, y)
      const body = this.add.graphics().fillStyle(0x423d38).fillRect(-12, 2, 24, 26).fillStyle(index % 2 ? 0x3080ff : 0xfe6e00).fillRect(-8, 5, 16, 20).fillStyle(0xffc9a5).fillRect(-7, -13, 14, 14).fillStyle(0x423d38).fillRect(-10, -14, 20, 5).fillStyle(0xffd579).fillRect(13, 8, 7, 7)
      const badge = this.add.graphics().fillStyle(0x1d2224, .95).fillRoundedRect(-58, -48, 116, 27, 4).lineStyle(2, color).strokeRoundedRect(-58, -48, 116, 27, 4)
      const label = this.add.text(-50, -43, agent.name, { color: '#ffffff', fontFamily: 'monospace', fontSize: '11px', fontStyle: 'bold' })
      const status = this.add.text(-50, -28, agent.operational_state || 'unknown', { color: '#e9e3da', fontFamily: 'monospace', fontSize: '8px' })
      avatar.add([body, badge, label, status]).setSize(116, 78).setInteractive({ useHandCursor: true })
      avatar.on('pointerdown', () => emit('select', agent))
      this.agentLayer.add(avatar)
      this.agentObjects.set(agent.name, avatar)
    })
  }
}

onMounted(() => {
  game = new Phaser.Game({ type: Phaser.AUTO, parent: gameHost.value, width: 1280, height: 680, pixelArt: true, antialias: false, backgroundColor: '#9fbf8d', scene: OfficeScene, scale: { mode: Phaser.Scale.RESIZE, autoCenter: Phaser.Scale.CENTER_BOTH } })
  scene = game.scene.getScene('OfficeScene')
})
watch(() => props.agents, agents => scene?.renderAgents(agents), { deep: true })
onBeforeUnmount(() => { game?.destroy(true); game = null; scene = null })
</script>

<template>
  <div ref="gameHost" class="phaser-office" aria-label="Mapa interativo do escritório virtual"></div>
</template>
