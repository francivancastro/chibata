<script setup>
import { nextTick, ref } from 'vue'

defineProps({ messages: { type: Array, default: () => [] }, sending: Boolean })
const emit = defineEmits(['send'])
const draft = ref('')
const composer = ref(null)
function submit() { if (!draft.value.trim()) return; emit('send', draft.value); draft.value = ''; nextTick(() => composer.value?.focus()) }
</script>

<template>
  <section class="chat-panel" aria-labelledby="chat-title">
    <div class="section-heading"><div><p class="eyebrow">NÚCLEO DO CODEX</p><h3 id="chat-title">Fale com o orquestrador</h3></div><span class="codex-badge">CODEX / GPT</span></div>
    <div class="chat-log" aria-live="polite">
      <div v-if="!messages.length" class="chat-empty"><span class="chat-orb">⌁</span><strong>O escritório está pronto.</strong><p>Envie uma orientação para o Codex coordenar o próximo movimento.</p></div>
      <article v-for="message in messages" :key="message.id" class="chat-message" :class="`message-${message.role}`"><span class="message-role">{{ message.role === 'user' ? 'VOCÊ' : message.role === 'error' ? 'BRIDGE' : 'CODEX' }}</span><p>{{ message.content }}</p></article>
    </div>
    <form class="chat-composer" @submit.prevent="submit"><label for="codex-message">Próxima instrução</label><div><textarea id="codex-message" ref="composer" v-model="draft" rows="2" maxlength="8000" placeholder="Ex.: analise o estado do projeto e distribua a próxima tarefa"></textarea><button type="submit" :disabled="sending || !draft.trim()">{{ sending ? 'Enviando…' : 'Enviar' }}</button></div></form>
  </section>
</template>
