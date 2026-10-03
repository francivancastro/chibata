<template>
  <div class="auth-layout">
    <aside class="auth-story">
      <div class="brand-wordmark"><span class="brand-symbol" aria-hidden="true">c</span>chibata</div>
      <div class="auth-story-copy">
        <h1>O bot vende.<br>Você entra quando importa.</h1>
        <p>Funis no Telegram que levam o cliente da primeira mensagem ao pagamento, e uma inbox para quando ele precisa de uma pessoa.</p>
      </div>
      <div class="auth-story-chat" aria-hidden="true">
        <span class="in">Quero o kit inverno M</span>
        <span class="out">Fechado! Já gerei seu pix.</span>
        <small>Etapa Pagamento</small>
      </div>
    </aside>
    <section class="auth-panel"><slot /></section>
  </div>
</template>
