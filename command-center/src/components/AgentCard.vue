<script setup>
import { computed } from 'vue'
import { statusMeta } from '../state/officeStore.js'

const props = defineProps({ agent: { type: Object, required: true }, selected: Boolean })
const emit = defineEmits(['select'])
const meta = computed(() => statusMeta[props.agent.operational_state] || statusMeta.unknown)
const avatarKind = computed(() => {
  const key = props.agent.name.toLowerCase()
  if (key.includes('atlas')) return 'atlas'
  if (key.includes('lumen')) return 'lumen'
  if (key.includes('forge')) return 'forge'
  if (key.includes('cipher')) return 'cipher'
  if (key.includes('sage')) return 'sage'
  return 'codex'
})
</script>

<template>
  <button class="agent-room" :class="[`room-${meta.tone}`, { selected }]" :aria-pressed="selected" @click="emit('select', agent)">
    <span class="room-door" aria-hidden="true"></span>
    <span class="room-sign">{{ agent.name }}</span>
    <span class="pixel-avatar" :class="`avatar-${avatarKind}`" aria-hidden="true">
      <span class="avatar-head"></span><span class="avatar-body"></span><span class="avatar-tool"></span>
    </span>
    <span class="agent-room-copy">
      <span class="agent-role">{{ agent.role || 'Papel não observado' }}</span>
      <span class="status-line"><i :class="`status-dot status-${meta.tone}`"></i>{{ meta.label }}</span>
      <span class="agent-task">{{ agent.task?.title || 'Nenhuma tarefa observável' }}</span>
    </span>
  </button>
</template>
