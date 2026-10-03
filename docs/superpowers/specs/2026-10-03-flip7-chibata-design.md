# Chibata — especificação de redesign integral Flip7

## Objetivo

Aplicar integralmente ao SaaS Chibata a linguagem visual do arquivo
`flip7-card-game-DESIGN.md`, convertendo o sistema de jogo retro-playful para
um produto web profissional sem alterar comportamento, rotas, autenticação,
Vuex, contratos da API ou integrações existentes.

O resultado deve parecer um produto único: teal como base, dourado para ações
de destaque, coral para estados de atenção, superfícies creme/brancas, formas
táteis, sombras coloridas e feedback visual expressivo.

## Variante dark aprovada

O produto usa a mesma identidade Flip7 sobre superfícies teal profundas:

- canvas `#081D20`, surface `#102D30`, subtle `#0D2529` e raised `#17383B`;
- texto creme `#FFF8E7` e texto secundário `#A7C9C3`;
- teal, dourado, coral e sky permanecem como acentos e estados;
- cards e inputs deixam de ser brancos, mantendo contraste e hierarquia;
- glows coloridos continuam ativos, com sombras neutras apenas para elevação;
- `color-scheme: dark` fica ativo no tema global.

## Escopo

### Incluído

- tokens globais de cor, tipografia, espaçamento, raios, elevação e motion;
- App shell, navegação, AppBar, Drawer e estados de menu;
- login e registro;
- Home;
- Inbox;
- Bot;
- Funil e editor de fluxo;
- Produto, Pessoas, Projetos, Usuários, Grupos, Acessos, Parâmetros,
  Configuração e Logs;
- componentes CRUD, tabelas, dialogs, inputs, alertas e notificações;
- estados loading, vazio, erro, sucesso, foco, hover, active e reduced-motion;
- responsividade desktop e mobile, com verificação em 390px.

### Fora do escopo

- alteração de endpoints, payloads, autenticação ou permissões;
- migração de Vuetify para outra biblioteca;
- instalação de dependências novas;
- substituição do gateway 9Router, Claude, Hermes ou OpenDesign;
- alteração de banco, servidor PHP ou dados reais;
- commit, push ou publicação automática.

## Direção visual

### Tokens

Os valores do design em `rpx` serão convertidos para CSS web. A escala base
será de 8px, mantendo uma regra consistente de raios: controles pill para
ações principais, 16px para inputs e 24px para cards e painéis.

Paleta principal:

- teal `#2BA8A2`, claro `#3CC4BD`, escuro `#1E8C86`;
- dourado `#FFD23F`, claro `#FFE47A`, escuro `#E6B800`;
- coral `#EF6C4A`, claro `#FF8A6A`, escuro `#D45233`;
- creme `#FFF8E7`, base `#EFF8F7`, superfície `#FFFFFF`;
- sky `#5DADE2`, success `#27AE60`, error `#E74C3C`.

Os tokens ficarão centralizados em `src/assets/styles/command-center.css` ou
em um arquivo global complementar somente se isso reduzir duplicação sem
alterar o mecanismo de importação atual.

### Componentes

- App shell com fundo teal claro, navegação com estados ativos dourados e
  controles pill;
- cards com barra lateral de estado, raio 24px e sombra teal/coral/dourada;
- botões principais dourados com feedback active e contraste AA;
- alertas e estados críticos corais, sem depender apenas de cor;
- títulos de seção com ícone visual e divisores tracejados com moderação;
- dialogs e formulários com labels acima dos campos, foco visível e mensagens
  de erro abaixo do controle;
- tabelas com adaptação mobile explícita, sem overflow invisível;
- emojis somente como complemento visual, nunca como único significado.

### Motion

Serão usadas transições curtas e táteis, normalmente até 300ms, com animações
de destaque para sucesso e estados especiais. `prefers-reduced-motion` deverá
desativar pulso, confete, bounce e transições não essenciais.

## Arquitetura de implementação

1. Auditar imports e seletores globais atuais.
2. Criar os tokens Flip7 e a base de componentes sem remover contratos.
3. Migrar shell, AppBar e Drawer.
4. Migrar Home, Inbox, Bot e Funil.
5. Migrar autenticação e telas CRUD.
6. Revisar estados e acessibilidade.
7. Validar desktop, 390px, build e rotas.

Cada fase deve manter o sistema executável. Não haverá reescrita integral de
views quando uma camada de estilo ou componente compartilhado resolver o caso.

## Arquivos prováveis

- `src/assets/styles/command-center.css`;
- `src/main.js` e arquivos globais de plugin apenas se necessário para tema;
- `src/components/AppBar.vue`, `src/components/Drawer.vue` e componentes CRUD;
- views em `src/views/` priorizadas por shell, Home, Inbox, Bot e Funil;
- `src/components/flow/` e `src/views/funil/` para o editor visual;
- documentação de validação em `docs/`.

Antes de editar cada arquivo, o conteúdo e seus imports serão verificados.

## Preservação funcional

- manter `src/router/`, guards e redirecionamentos;
- manter `src/store/`, ações, mutations e getters;
- manter `src/plugins/axios.js`, base URL e token;
- não substituir chamadas API por fixtures ou mocks;
- manter loading, empty, error e unknown states honestos;
- não expor tokens, chaves ou credenciais nos logs ou no código.

## Critérios de aceitação

- `npm run build` concluído sem erro;
- `git diff --check` sem erro;
- rotas principais retornam e renderizam: `/`, `/inbox`, `/bot`, `/funil`,
  `/produto`, `/configuracao` e `/log`;
- preview web aberto em desktop e 390px sem overflow horizontal;
- foco de teclado visível em navegação, botões, links, inputs e dialogs;
- estados de loading, vazio, erro e sucesso continuam visíveis e compreensíveis;
- reduced-motion remove animações não essenciais;
- nenhum contrato de API, autenticação, store ou roteamento foi alterado;
- revisão visual confirma o sistema Flip7 aplicado de forma consistente em todo
  o SaaS, sem retorno acidental ao Dark Modular.

## Riscos e mitigação

- CSS global grande e duplicado: migrar tokens primeiro e revisar diff por
  fase;
- Vuetify sobrescrevendo tokens: testar componentes reais antes de criar
  exceções;
- telas administrativas ficando lúdicas demais: usar a mesma paleta e forma,
  reduzindo motion e decoração onde a densidade de dados exige foco;
- mobile quebrado por tabelas e drawers: validar cada tela em 390px;
- falsa sensação de integração: validar API real e preservar estados honestos.

## Sequência de agentes

- Codex: coordena, implementa, integra e valida;
- Claude Code: revisão técnica e implementação pontual em modo manual;
- Hermes: auditoria, matriz de rotas, memória e validação independente;
- OpenDesign: revisão visual baseada no design de referência, sem editar o
  repositório sem autorização explícita.
