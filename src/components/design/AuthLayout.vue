<template>
  <div class="auth-layout">
    <aside class="auth-story">
      <div class="brand-wordmark"><span class="brand-symbol"><PhChatCenteredText :size="23" weight="regular" aria-hidden="true" /></span>chibata<span class="text-medium-emphasis font-weight-regular">crm</span></div>
      <div class="auth-story-copy">
        <h1>Boas conversas.<br>Novas possibilidades.</h1>
        <p class="page-description">Conecte pessoas, organize atendimentos e dê mais espaço para o que faz sua empresa crescer.</p>
      </div>
      <div class="auth-story-footer"><span><PhChatCenteredText :size="16" weight="regular" aria-hidden="true" />Atendimento</span><span><PhGitBranch :size="16" weight="regular" aria-hidden="true" />Automação</span><span><PhUsersThree :size="16" weight="regular" aria-hidden="true" />Relacionamento</span></div>
    </aside>
    <section class="auth-panel"><slot /></section>
  </div>
</template>

<script setup>
import { PhChatCenteredText, PhGitBranch, PhUsersThree } from "@phosphor-icons/vue";
</script>
