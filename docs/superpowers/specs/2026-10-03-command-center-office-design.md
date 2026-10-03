# Command Center Office Design

## Objetivo

Criar um frontend separado para funcionar como escritório virtual do projeto Chibata. O usuário poderá conversar com o Codex, acompanhar os agentes conectados ao Maestri e visualizar atividade, tarefas e estado operacional sem misturar o código do escritório ao SaaS principal.

## Resultado esperado

- Um app independente em `command-center/`.
- Chat local com o Codex como orquestrador principal.
- Painel visual para Forge, Atlas, Lumen, Cipher e Sage.
- Visualização real de agentes e conexões obtida pela CLI do Maestri.
- Estados honestos para aguardando, trabalhando, concluído, bloqueado e indisponível.
- Execução apenas em `127.0.0.1` por padrão.
- Nenhuma API key, token ou credencial enviada ao navegador ou versionada.

## Escopo da primeira versão

### Incluído

1. Shell visual Command Center com navegação lateral e área de trabalho.
2. Chat do Codex com histórico local da sessão.
3. Lista de agentes com nome individual, papel, conexão e estado.
4. Feed de eventos com timestamps e origem.
5. Painel de tarefa atual e arquivos em atividade quando disponíveis.
6. Atualização periódica de estado através da bridge local.
7. Respostas de erro explícitas quando Maestri estiver indisponível.
8. Layout responsivo para desktop e janela estreita.

Cada sala observada deve expor, nesta ordem: identidade e origem; tarefa atual; status canônico; evidência com origem, `observed_at` e freshness; próxima ação e responsável; bloqueio/risco quando houver; e 3–5 eventos recentes deduplicados. Ausência de tarefa aparece como “Nenhuma tarefa observável” e ausência de ação como “Aguardando instrução”. O resumo do escritório só conta estados derivados do inventário atual e identifica agentes indisponíveis separadamente.

### Fora do escopo inicial

- Autenticação externa ou multiusuário.
- Persistência remota de conversas.
- Execução arbitrária de comandos do sistema pelo navegador.
- Controle de credenciais ou login do GitHub.
- Substituição da interface nativa do Maestri.
- Falsa atividade ou estados simulados quando a CLI não responder.

## Arquitetura

### Frontend

O diretório `command-center/` terá um app Vue 3 + Vite independente, com componentes focados:

- `App.vue`: composição do escritório.
- `src/components/OfficeSidebar.vue`: navegação e resumo do workspace.
- `src/components/AgentGrid.vue`: agentes e estados.
- `src/components/AgentCard.vue`: identidade, papel, conexão e atividade do agente.
- `src/components/OrchestratorChat.vue`: conversa com Codex.
- `src/components/ActivityFeed.vue`: eventos ordenados por tempo.
- `src/services/maestriBridge.js`: cliente HTTP da bridge local.
- `src/state/officeStore.js`: estado da sessão, agentes, eventos e mensagens.
- `src/styles/office.css`: tokens e layout Command Center.

### Bridge local

O diretório `command-center/bridge/` terá um pequeno processo Node sem dependências externas obrigatórias. Ele ficará responsável por:

- executar somente subcomandos Maestri permitidos;
- normalizar a saída de `maestri list`, `maestri ask` e `maestri check`;
- devolver JSON ao frontend;
- aplicar timeout e tratamento de processo indisponível;
- escutar em `127.0.0.1`.

Endpoints da primeira versão:

- `GET /api/agents` — inventário e conexões atuais;
- `GET /api/activity` — estado/feed observável;
- `POST /api/chat` — envia uma mensagem ao Codex usando `maestri ask "Codex"`;
- `GET /api/health` — informa somente disponibilidade da bridge e da CLI.

Todos os endpoints retornam JSON com `schema_version: 1`. Respostas de sucesso incluem `request_id`, `observed_at` em ISO-8601 e `source: "maestri-cli"`. Respostas de erro incluem `ok: false`, `request_id`, `code`, `message` e `retryable`; não incluem stdout bruto, ambiente ou credenciais.

`POST /api/chat` aceita apenas `Content-Type: application/json` com `{ "message": string }`, limita a mensagem a 8.000 caracteres e não aceita argumentos adicionais. Cada envio recebe `message_id` e `request_id`; o timeout é de 120 segundos e não há retry automático para evitar duplicação. O frontend mantém a mensagem pendente até resposta ou erro explícito.

`GET /api/agents` separa `inventory` (o que apareceu no `maestri list`) de `operational_state`. Nomes, workspaces, agentes locais e conexões parciais vêm da saída observada e não são hardcoded. O estado segue esta semântica: `working` somente quando há processo/resposta observável recente; `waiting` quando o agente está conectado mas sem trabalho observável; `offline` quando a CLI ou conexão não está disponível; `unknown` quando o inventário existe mas não há sinal suficiente. Sinais expiram após um TTL documentado e `unknown` nunca vira `working` por animação.

`GET /api/activity` retorna eventos com `event_id`, `type`, `agent`, `source`, `occurred_at`, `observed_at`, `status` e payload seguro. O servidor limita a janela, ordena por `observed_at` e deduplica por `event_id`. Snapshots sem evento próprio são marcados como `source: "snapshot"` e nunca são apresentados como atividade histórica.

`GET /api/health` separa `bridge_up`, `cli_available`, `socket_accessible` e `last_success_at`; HTTP 200 não significa que a CLI esteja disponível.

O bridge não aceitará nome de comando arbitrário, caminho arbitrário ou segredo vindo do browser. O frontend nunca receberá tokens do ambiente.

## Fluxo de dados

1. O navegador solicita o inventário à bridge.
2. A bridge executa `maestri list` e normaliza a topologia.
3. O usuário escreve no chat.
4. A bridge envia somente o texto da mensagem ao Codex por `maestri ask`.
5. A resposta retorna ao chat e entra no feed como evento real.
6. O frontend atualiza agentes por polling controlado e mostra indisponibilidade quando não houver resposta.

## Direção visual

- A área principal será um mapa de escritório virtual com salas distintas para Codex, Forge, Atlas, Lumen, Cipher e Sage.
- Cada agente terá um mini avatar pixel-art original, composto em CSS/HTML e sem copiar personagens, sprites ou nomes protegidos. O avatar terá cor, silhueta e acessório próprios para comunicar a função.
- Cada sala mostrará placa com nome e papel, avatar, estado observável, tarefa atual, última atividade e ação disponível. O mapa continuará legível como painel operacional mesmo sem animação.
- Fundo de workspace claro e quente, com contraste alto para texto.
- Shell escuro translúcido, bordas discretas e efeito de vidro com fallback sólido.
- Laranja Command Center como único destaque de ação.
- Tipografia sans-serif compacta para operação e mono apenas para metadados técnicos.
- Cards usados para hierarquia real: Codex em destaque, agentes em grade e feed em coluna.
- Sem métricas inventadas, sem barras de progresso falsas e sem dashboard genérico.
- Estados de loading, empty, error e offline visíveis e legíveis.
- Foco por teclado, alvos de toque adequados e contraste WCAG AA.

## Segurança e limites

- A bridge escuta somente em loopback.
- A bridge rejeita hosts diferentes de `127.0.0.1` e `::1` e valida o método e o content type.
- Nenhuma credencial será lida pelo frontend.
- Mensagens do usuário são tratadas como dados e não como comandos shell.
- A bridge aplica limite de tamanho e rate limit local no chat.
- Nenhum endpoint destrutivo será criado na primeira versão.
- A aplicação não fará push, merge, instalação ou login automaticamente.
- Falhas da CLI serão exibidas como indisponibilidade real.

## Verificação e critérios de aceite

- `npm run build` do app independente passa.
- A bridge responde `/api/health` em loopback.
- O inventário exibido corresponde ao `maestri list` atual.
- Uma mensagem enviada pelo chat chega ao Codex sem expor credenciais.
- Uma mensagem chega como um único argumento, mesmo contendo aspas, newline ou caracteres de shell.
- A resposta do Codex aparece no histórico da sessão.
- O app diferencia agente trabalhando, aguardando, desconhecido e indisponível com base em sinais observáveis.
- A bridge distingue erro de CLI, timeout, host inválido e payload inválido sem travar o polling.
- A tela continua utilizável em desktop e viewport estreita.
- O mapa mantém cada agente identificável em 390px, com salas empilhadas ou trilho horizontal acessível e sem depender apenas do avatar para comunicar estado.
- Qualquer sala permite identificar tarefa, status, evidência/freshness e próxima ação sem abrir um terminal.
- Reload e polling preservam ordem e deduplicação do feed dentro da janela definida.
- O SaaS existente permanece sem alterações funcionais.

## Decisões e suposições

- A conversa inicial será com o Codex através da CLI local do Maestri; integração direta com uma API de modelo fica fora da primeira versão.
- O escritório será criado como pasta independente no mesmo repositório para facilitar execução e publicação, mas terá package/build próprios.
- O status de atividade será baseado somente em sinais observáveis da CLI e do processo local; não será inferido a partir de animações.
