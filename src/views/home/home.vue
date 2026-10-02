<template>
  <v-container class="workspace-page home-page">
    <header class="page-heading">
      <div>
        <h1>Seu workspace, conectado.</h1>
        <p class="page-description">Organize o atendimento, gerencie seus registros e construa novas possibilidades para sua equipe.</p>
      </div>
      <v-chip variant="tonal" color="primary"><PhSquaresFour :size="16" weight="regular" aria-hidden="true" />Visão geral</v-chip>
    </header>

    <section v-if="primaryShortcut" class="home-command-surface">
      <div class="home-command-primary">
        <span class="home-command-mark" aria-hidden="true">
          <PhChatCenteredText :size="26" weight="regular" />
        </span>
        <div class="home-command-copy">
          <span class="home-module-label">Entrada central</span>
          <h2>Comece pelo atendimento.</h2>
          <p>Abra a fila de conversas e conduza cada contato com contexto, foco e continuidade.</p>
          <RouterLink :to="primaryShortcut.to" class="home-command-action">
            Abrir {{ primaryShortcut.title }}
            <PhArrowUpRight :size="17" weight="regular" aria-hidden="true" />
          </RouterLink>
        </div>
      </div>

      <div class="home-command-rail" aria-label="Próximas áreas">
        <RouterLink v-for="item in secondaryShortcuts" :key="item.to" :to="item.to" class="home-rail-link">
          <span class="home-rail-icon" aria-hidden="true">
            <component :is="item.icon" :size="19" weight="regular" />
          </span>
          <span class="home-rail-copy">
            <strong>{{ item.title }}</strong>
            <small>{{ item.description }}</small>
          </span>
          <PhArrowUpRight class="home-rail-arrow" :size="16" weight="regular" aria-hidden="true" />
        </RouterLink>
      </div>
    </section>

    <section v-if="remainingShortcuts.length" class="home-tools">
      <div class="home-section-heading">
        <div>
          <h2>Ferramentas de trabalho</h2>
        </div>
        <span>{{ remainingShortcuts.length }} áreas disponíveis</span>
      </div>
      <div class="home-tool-list">
        <RouterLink v-for="item in remainingShortcuts" :key="item.to" :to="item.to" class="home-tool-row">
          <span class="home-tool-icon" aria-hidden="true">
            <component :is="item.icon" :size="20" weight="regular" />
          </span>
          <span class="home-tool-copy">
            <strong>{{ item.title }}</strong>
            <small>{{ item.description }}</small>
          </span>
          <span class="home-tool-link">
            Abrir
            <PhArrowUpRight :size="16" weight="regular" aria-hidden="true" />
          </span>
        </RouterLink>
      </div>
    </section>

    <v-card v-if="!available.length" class="empty-panel" variant="outlined">
      <PhKey :size="36" weight="regular" color="var(--cc-accent)" aria-hidden="true" />
      <h2>Seu acesso está sendo preparado</h2>
      <p>As áreas disponíveis aparecem aqui conforme as permissões da sua conta.</p>
    </v-card>
  </v-container>
</template>

<script setup>
import { computed } from "vue";
import { useStore } from "vuex";
import {
  PhArrowUpRight,
  PhBracketsCurly,
  PhChatCenteredText,
  PhFunnel,
  PhKey,
  PhRobot,
  PhSquaresFour,
  PhShoppingBag,
  PhTrayArrowDown,
  PhUserList,
  PhUsersThree,
} from "@phosphor-icons/vue";

const store = useStore();
const shortcuts = [
  { to: "/inbox", service: "inbox", title: "Caixa de entrada", description: "Converse com seus contatos e acompanhe os atendimentos.", icon: PhTrayArrowDown },
  { to: "/bot", service: "bot", title: "Bots de atendimento", description: "Configure respostas e organize suas automações.", icon: PhRobot },
  { to: "/funil", service: "funil", title: "Funis e fluxos", description: "Conecte as etapas de cada jornada de atendimento.", icon: PhFunnel },
  { to: "/produto", service: "produto", title: "Catálogo de produtos", description: "Mantenha as informações das suas ofertas organizadas.", icon: PhShoppingBag },
  { to: "/usuario", service: "usuario", title: "Sua equipe", description: "Consulte e gerencie os usuários da operação.", icon: PhUserList },
  { to: "/grupo", service: "grupo", title: "Grupos de acesso", description: "Organize as permissões para cada grupo de trabalho.", icon: PhUsersThree },
  { to: "/parametro", service: "parametro", title: "Parâmetros", description: "Ajuste as definições que orientam a operação.", icon: PhBracketsCurly },
];
const available = computed(() => shortcuts.filter((item) => store.getters["auth/getServices"].includes(item.service)));
const primaryShortcut = computed(() => available.value[0]);
const secondaryShortcuts = computed(() => available.value.slice(1, 3));
const remainingShortcuts = computed(() => available.value.slice(3));
</script>

<style scoped>
.home-page { padding-bottom: 48px; }
.home-command-surface { display: grid; grid-template-columns: minmax(0, 1.35fr) minmax(280px, .65fr); gap: 1px; overflow: hidden; margin: 8px 0 38px; border: 1px solid var(--cc-border); border-radius: 20px; background: var(--cc-border); }
.home-command-primary, .home-command-rail { background: var(--cc-surface); }
.home-command-primary { display: flex; align-items: flex-start; gap: 20px; padding: clamp(26px, 4vw, 48px); }
.home-command-mark { display: grid; place-items: center; flex: 0 0 auto; width: 52px; height: 52px; border: 1px solid color-mix(in srgb, var(--cc-accent) 42%, var(--cc-border)); border-radius: 15px; color: var(--cc-accent); background: color-mix(in srgb, var(--cc-accent) 9%, var(--cc-surface)); }
.home-command-copy { max-width: 620px; }
.home-command-copy h2 { margin: 10px 0 12px; color: var(--cc-text); font-size: clamp(25px, 3vw, 38px); line-height: 1.08; letter-spacing: -.035em; }
.home-command-copy p { max-width: 510px; margin: 0; color: var(--cc-muted); font-size: 14px; line-height: 1.65; }
.home-command-action { display: inline-flex; align-items: center; gap: 9px; margin-top: 26px; padding: 11px 15px; border: 1px solid var(--cc-accent); border-radius: 10px; color: var(--cc-on-accent); background: var(--cc-accent); font-size: 13px; font-weight: 700; text-decoration: none; transition: transform .18s var(--cc-ease), background .18s var(--cc-ease); }
.home-command-action:hover { background: var(--cc-accent-strong); transform: translateY(-1px); }
.home-command-rail { display: flex; flex-direction: column; justify-content: center; padding: 18px; background: var(--cc-subtle); }
.home-rail-link { display: grid; grid-template-columns: 38px minmax(0, 1fr) 18px; align-items: center; gap: 12px; min-height: 86px; padding: 14px; border-bottom: 1px solid var(--cc-border); color: var(--cc-text); text-decoration: none; transition: background .18s var(--cc-ease), border-color .18s var(--cc-ease); }
.home-rail-link:last-child { border-bottom: 0; }
.home-rail-link:hover { border-color: var(--cc-accent); background: var(--cc-raised); }
.home-rail-icon, .home-tool-icon { display: grid; place-items: center; color: var(--cc-accent); }
.home-rail-icon { width: 38px; height: 38px; border: 1px solid var(--cc-border-strong); border-radius: 11px; background: var(--cc-raised); }
.home-rail-copy, .home-tool-copy { display: flex; min-width: 0; flex-direction: column; gap: 4px; }
.home-rail-copy strong, .home-tool-copy strong { overflow: hidden; color: var(--cc-text); font-size: 13px; font-weight: 650; text-overflow: ellipsis; white-space: nowrap; }
.home-rail-copy small, .home-tool-copy small { overflow: hidden; color: var(--cc-muted); font-size: 11px; line-height: 1.45; text-overflow: ellipsis; white-space: nowrap; }
.home-rail-arrow, .home-tool-link { color: var(--cc-faint); }
.home-section-heading { display: flex; align-items: flex-end; justify-content: space-between; gap: 18px; margin-bottom: 16px; }
.home-section-heading h2 { margin: 4px 0 0; color: var(--cc-text); font-size: 19px; letter-spacing: -.02em; }
.home-section-heading > span { color: var(--cc-muted); font-size: 12px; }
.home-tool-list { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 1px; overflow: hidden; border: 1px solid var(--cc-border); border-radius: 16px; background: var(--cc-border); }
.home-tool-row { display: grid; grid-template-columns: 38px minmax(0, 1fr) auto; align-items: center; gap: 13px; min-width: 0; min-height: 78px; padding: 14px 16px; background: var(--cc-surface); color: var(--cc-text); text-decoration: none; transition: background .18s var(--cc-ease); }
.home-tool-row:hover { background: var(--cc-subtle); }
.home-tool-icon { width: 38px; height: 38px; border: 1px solid var(--cc-border); border-radius: 11px; background: var(--cc-raised); }
.home-tool-link { display: inline-flex; align-items: center; gap: 5px; font-size: 11px; font-weight: 650; white-space: nowrap; }
.empty-panel { display: grid; place-items: center; gap: 10px; padding: 52px 24px; text-align: center; }
.empty-panel h2 { margin: 0; color: var(--cc-text); font-size: 18px; }
.empty-panel p { max-width: 420px; margin: 0; color: var(--cc-muted); font-size: 13px; }
@media (max-width: 900px) { .home-command-surface { grid-template-columns: 1fr; } .home-command-rail { padding: 10px 18px 18px; } .home-rail-link { min-height: 70px; } }
@media (max-width: 640px) { .home-page { padding-inline: 14px; } .page-heading { align-items: flex-start; flex-direction: column; } .home-command-primary { padding: 24px 20px; } .home-command-mark { display: none; } .home-command-copy h2 { font-size: 27px; } .home-tool-list { grid-template-columns: 1fr; } .home-section-heading { align-items: flex-start; flex-direction: column; gap: 5px; } }
@media (prefers-reduced-motion: reduce) { .home-command-action, .home-rail-link, .home-tool-row { transition: none; } }
</style>
