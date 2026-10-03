<script setup>
const rooms = [
  { name: 'Codex', role: 'Orquestrador principal' },
  { name: 'Forge', role: 'Engenharia de software' },
  { name: 'Atlas', role: 'Engenharia de produto' },
  { name: 'Lumen', role: 'Engenharia de design' },
  { name: 'Cipher', role: 'Programação e review' },
  { name: 'Sage', role: 'Pesquisa e memória' }
]
</script>

<template>
  <main class="office-shell">
    <header class="office-header">
      <div>
        <p class="eyebrow">CHIBATA / COMMAND CENTER</p>
        <h1>Escritório virtual</h1>
      </div>
      <span class="connection-pill">Bridge aguardando</span>
    </header>
    <section class="office-placeholder" aria-labelledby="rooms-title">
      <div>
        <p class="eyebrow">MAPA DE OPERAÇÃO</p>
        <h2 id="rooms-title">As salas estão sendo preparadas</h2>
        <p>O mapa vai mostrar a tarefa, o estado e a evidência observável de cada agente.</p>
      </div>
      <ul class="room-list">
        <li v-for="room in rooms" :key="room.name">
          <strong>{{ room.name }}</strong>
          <span>{{ room.role }}</span>
        </li>
      </ul>
    </section>
  </main>
</template>
