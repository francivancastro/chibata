# Chibata — especificação Command Center

## Objetivo

Substituir a camada visual Flip7 do SaaS Chibata pelo sistema `command-center-DESIGN.md`, mantendo a experiência funcional existente. A direção é um workspace claro, quente e operacional, envolvido por um shell escuro translúcido com blur e laranja concentrado em ação, foco, telemetria e estado.

## Sistema visual

- Canvas `#FCFAF7`, superfícies `#F3F4F6`, `#EDEBE9` e `#FFFFFF`.
- Texto principal `#423D38`, texto secundário `#797067`.
- Laranja primário `#FE6E00`, forte `#FF6B00`, quente `#FFB74D` e foco `#F97015`.
- Shell preto em 70% de opacidade, texto branco e borda branca em 10%.
- Success `#00C758`, warning `#EDB200`, danger `#FB2C36`, info `#3080FF`.
- System sans para todo o produto e monospace apenas para logs/telemetria.
- Base de espaçamento 4px; controle 8px, card 12px, pill 9999px.

## Arquitetura de aplicação

1. Substituir tokens Flip7 por tokens Command Center no CSS global já importado.
2. Reestilizar AppBar e Drawer como shell frosted preto, mantendo o módulo drawer.
3. Reestilizar Home, Inbox, Bot, Funil e CRUDs como workspace claro e compacto.
4. Aplicar badges semânticos, tabelas operacionais, inputs e dialogs.
5. Manter autenticação com painel laranja e card claro.
6. Validar desktop, 390px, foco, reduced-motion, rotas e build.

## Preservação

- Não alterar rotas, guards, autenticação, Vuex, API, Vue Flow ou dados reais.
- Não instalar dependências.
- Não substituir chamadas API por fixtures.
- Não commitar, publicar ou fazer push automaticamente.

## Critérios

- `npm run build` com exit 0.
- `git diff --check` limpo.
- Rotas principais HTTP 200.
- Shell escuro e workspace claro visíveis no Preview Web.
- Laranja usado como sinal dominante sem colorir todos os cards.
- Mobile 390px sem overflow horizontal.
- Foco visível e reduced-motion respeitado.

Fonte: https://designmd.ai/frknaykc/command-center
