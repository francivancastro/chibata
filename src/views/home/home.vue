<template>
  <section class="workspace-page home-page">
    <header class="page-heading">
      <div>
        <p class="page-eyebrow">{{ today }}</p>
        <h1>{{ greeting }}</h1>
      </div>
      <div class="home-actions">
        <v-btn v-if="can('funil')" variant="outlined" to="/funil">Funis</v-btn>
        <v-btn v-if="can('inbox')" color="primary" variant="flat" to="/inbox">
          Abrir inbox<PhArrowRight :size="16" aria-hidden="true" />
        </v-btn>
      </div>
    </header>

    <div v-if="isLocalPreview" class="home-preview" role="status">
      Prévia local: os números e listas aparecem quando a API estiver conectada.
    </div>

    <section class="home-stats" aria-label="Resumo da operação">
      <div v-for="stat in stats" :key="stat.label" class="home-stat">
        <span class="home-stat-label">{{ stat.label }}</span>
        <span class="home-stat-value mono">{{ stat.value }}</span>
        <RouterLink v-if="stat.to" :to="stat.to" class="home-stat-link">{{ stat.link }}</RouterLink>
      </div>
    </section>

    <div class="home-grid">
      <section v-if="can('inbox')" class="panel home-queue">
        <div class="panel-head">
          <h2>Conversas abertas</h2>
          <RouterLink to="/inbox">Ver fila completa</RouterLink>
        </div>
        <div v-if="queue.loading" class="state-block"><v-progress-circular indeterminate color="primary" size="28" /></div>
        <p v-else-if="queue.error" class="home-empty" role="alert">{{ queue.error }}</p>
        <p v-else-if="!queue.items.length" class="home-empty">Nenhuma conversa aberta agora.</p>
        <RouterLink v-for="c in queue.items" v-else :key="c.id" to="/inbox" class="queue-row">
          <span class="avatar" aria-hidden="true">{{ initials(contactName(c)) }}</span>
          <span class="queue-copy">
            <strong>{{ contactName(c) }}</strong>
            <span>{{ lastMessage(c) }}</span>
          </span>
          <span class="queue-time mono">{{ relative(c.data_atualizacao || c.updated_at) }}</span>
        </RouterLink>
      </section>

      <section v-if="can('bot')" class="panel">
        <div class="panel-head">
          <h2>Bots</h2>
          <RouterLink to="/bot">Gerenciar</RouterLink>
        </div>
        <div v-if="bots.loading" class="state-block"><v-progress-circular indeterminate color="primary" size="28" /></div>
        <p v-else-if="bots.error" class="home-empty" role="alert">{{ bots.error }}</p>
        <p v-else-if="!bots.items.length" class="home-empty">Nenhum bot conectado. <RouterLink to="/bot">Conectar o primeiro</RouterLink></p>
        <ul v-else class="bot-list">
          <li v-for="b in bots.items" :key="b.id">
            <span class="bot-name">{{ b.nome }}</span>
            <span :class="['status-dot', isActive(b.status) ? 'status-dot--ok' : 'status-dot--off']">{{ isActive(b.status) ? "Ativo" : "Pausado" }}</span>
          </li>
        </ul>
      </section>
    </div>

    <section class="home-shortcuts" aria-label="Atalhos">
      <RouterLink v-for="item in shortcuts" :key="item.to" :to="item.to" class="shortcut">
        <component :is="item.icon" :size="20" aria-hidden="true" />
        <span><strong>{{ item.title }}</strong><small>{{ item.description }}</small></span>
      </RouterLink>
    </section>
  </section>
</template>

<script setup>
import { computed, onMounted, reactive } from "vue";
import { useStore } from "vuex";
import {
  PhArrowRight,
  PhBracketsCurly,
  PhFunnel,
  PhRobot,
  PhShoppingBag,
  PhUserList,
  PhUsersThree,
} from "@phosphor-icons/vue";
import http, { errorMessage } from "@/plugins/axios";
import { listConversations } from "@/services/messaging";
import { isLocalPreviewEnabled } from "@/utils/local-preview";

const store = useStore();
const isLocalPreview = isLocalPreviewEnabled();

const can = (service) => store.getters["auth/can"](service);

const userName = computed(() => {
  const user = store.state.auth.user;
  return (user?.usuario?.nome || user?.nome || "").split(" ")[0];
});

const today = new Intl.DateTimeFormat("pt-BR", { weekday: "long", day: "numeric", month: "long" }).format(new Date());
const greeting = computed(() => {
  const hour = new Date().getHours();
  const part = hour < 12 ? "Bom dia" : hour < 18 ? "Boa tarde" : "Boa noite";
  return userName.value ? `${part}, ${userName.value}.` : `${part}.`;
});

const queue = reactive({ loading: false, error: "", items: [], total: null });
const bots = reactive({ loading: false, error: "", items: [], total: null });
const funis = reactive({ total: null });

const stats = computed(() => [
  can("inbox") && { label: "Conversas abertas", value: queue.total ?? "—", to: "/inbox", link: "Abrir inbox" },
  can("bot") && { label: "Bots", value: bots.total ?? "—", to: "/bot", link: "Ver bots" },
  can("funil") && { label: "Funis", value: funis.total ?? "—", to: "/funil", link: "Ver funis" },
].filter(Boolean));

const allShortcuts = [
  { to: "/funil", service: "funil", title: "Funis", description: "Etapas de cada jornada", icon: PhFunnel },
  { to: "/bot", service: "bot", title: "Bots", description: "Contas do Telegram", icon: PhRobot },
  { to: "/produto", service: "produto", title: "Produtos", description: "Catálogo dos funis", icon: PhShoppingBag },
  { to: "/usuario", service: "usuario", title: "Usuários", description: "Quem acessa o workspace", icon: PhUserList },
  { to: "/grupo", service: "grupo", title: "Grupos de acesso", description: "Permissões por grupo", icon: PhUsersThree },
  { to: "/parametro", service: "parametro", title: "Parâmetros", description: "Valores do sistema", icon: PhBracketsCurly },
];
const shortcuts = computed(() => allShortcuts.filter((s) => can(s.service)));

function contactName(c) {
  return c?.contact?.nome || c?.contact?.name || (c?.contact_id ? `Contato #${c.contact_id}` : "Contato");
}
function lastMessage(c) {
  const m = c?.last_message || c?.lastMessage;
  if (!m) return "Sem prévia da última mensagem";
  return typeof m === "string" ? m : m.content || "Mensagem";
}
function initials(name) {
  return name.split(/\s+/).filter(Boolean).slice(0, 2).map((p) => p[0].toUpperCase()).join("");
}
function isActive(status) {
  return status === 1 || status === "1" || status === true;
}
function relative(value) {
  if (!value) return "";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";
  const minutes = Math.round((Date.now() - date.getTime()) / 60000);
  if (minutes < 1) return "agora";
  if (minutes < 60) return `${minutes} min`;
  if (minutes < 1440) return `${Math.round(minutes / 60)} h`;
  return new Intl.DateTimeFormat("pt-BR", { day: "2-digit", month: "2-digit" }).format(date);
}

async function loadQueue() {
  queue.loading = true;
  try {
    const { data } = await listConversations({ status: "open", pageSize: 5, currentPage: 1 });
    const body = data?.data ?? {};
    queue.items = Array.isArray(body) ? body : body.list || [];
    queue.total = Number(body.total ?? queue.items.length);
  } catch (err) {
    queue.error = errorMessage(err, "Não foi possível carregar a fila.");
  } finally {
    queue.loading = false;
  }
}

async function loadBots() {
  bots.loading = true;
  try {
    const { data } = await http.post("/bot/list", { pageSize: 6, currentPage: 1 });
    bots.items = data?.data?.list || [];
    bots.total = Number(data?.data?.total ?? bots.items.length);
  } catch (err) {
    bots.error = errorMessage(err, "Não foi possível carregar os bots.");
  } finally {
    bots.loading = false;
  }
}

async function loadFunis() {
  try {
    const { data } = await http.post("/funil/list", { pageSize: 1, currentPage: 1 });
    funis.total = Number(data?.data?.total ?? (data?.data?.list || []).length);
  } catch {
    funis.total = null;
  }
}

onMounted(() => {
  if (isLocalPreview) return;
  if (can("inbox")) loadQueue();
  if (can("bot")) loadBots();
  if (can("funil")) loadFunis();
});
</script>

<style scoped>
.home-actions { display: flex; flex-wrap: wrap; gap: 10px; }
.home-preview { margin-bottom: 20px; padding: 12px 16px; border-radius: var(--ch-radius); background: var(--ch-warn-soft); color: var(--ch-warn-ink); font-size: 14px; }

.home-stats { display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 1px; margin-bottom: 20px; overflow: hidden; border: 1px solid var(--ch-line); border-radius: var(--ch-radius-lg); background: var(--ch-line); }
.home-stat { display: flex; flex-direction: column; gap: 6px; padding: 18px 22px; background: var(--ch-surface); }
.home-stat-label { font-size: 13px; color: var(--ch-muted); }
.home-stat-value { font-size: 34px; font-weight: 500; letter-spacing: -.02em; line-height: 1.1; color: var(--ch-ink); }
.home-stat-link { font-size: 13px; font-weight: 500; }

.home-grid { display: grid; grid-template-columns: minmax(0, 2fr) minmax(0, 1fr); gap: 20px; margin-bottom: 20px; }
.home-empty { margin: 0; padding: 20px; font-size: 14px; color: var(--ch-muted); }
.queue-row { display: flex; align-items: center; gap: 14px; padding: 14px 20px; border-top: 1px solid var(--ch-line-soft); color: var(--ch-ink) !important; text-decoration: none; }
.queue-row:first-of-type { border-top: 0; }
.queue-row:hover { background: #F7F9FF; }
.avatar { width: 36px; height: 36px; flex-shrink: 0; display: inline-flex; align-items: center; justify-content: center; border-radius: 999px; background: var(--ch-accent-soft); color: var(--ch-accent); font-size: 13px; font-weight: 600; }
.queue-copy { flex: 1; min-width: 0; display: flex; flex-direction: column; }
.queue-copy strong { font-size: 14px; font-weight: 600; }
.queue-copy span { font-size: 13px; color: var(--ch-muted); white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
.queue-time { font-size: 12px; color: var(--ch-muted); }

.bot-list { list-style: none; margin: 0; padding: 4px 20px 12px; }
.bot-list li { display: flex; align-items: center; justify-content: space-between; gap: 12px; padding: 12px 0; border-top: 1px solid var(--ch-line-soft); }
.bot-list li:first-child { border-top: 0; }
.bot-name { font-size: 14px; }

.home-shortcuts { display: grid; grid-template-columns: repeat(auto-fit, minmax(220px, 1fr)); gap: 12px; }
.shortcut { display: flex; align-items: center; gap: 12px; min-height: 64px; padding: 12px 16px; border: 1px solid var(--ch-line); border-radius: var(--ch-radius-lg); background: var(--ch-surface); color: var(--ch-ink) !important; text-decoration: none; }
.shortcut svg { color: var(--ch-accent); flex-shrink: 0; }
.shortcut span { display: flex; flex-direction: column; }
.shortcut strong { font-size: 14px; font-weight: 600; }
.shortcut small { font-size: 12px; color: var(--ch-muted); }
.shortcut:hover { border-color: var(--ch-accent-line); }

@media (max-width: 900px) {
  .home-grid { grid-template-columns: 1fr; }
}
</style>
