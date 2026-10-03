# Chibata

Frontend do sistema Chibata, construído com Vue 3, Vite e Vuetify.

## Desenvolvimento

```bash
npm install
npm run dev
```

O preview local pode ser aberto em `http://localhost:5173/?preview=1`. Esse
modo permite validar navegação e estados visuais sem fingir dados da API: as
telas deixam explícito quando estão desconectadas do backend.

## Validação

```bash
npm run build
npm run preview
```

Não há runner de testes ou lint configurado atualmente. Até que sejam
adicionados, o build e a verificação manual das rotas são as validações
obrigatórias.

## API

O frontend mantém como padrão o backend local em
`http://localhost/php-seed`. Para outro ambiente, defina
`VITE_API_BASE_URL` no `.env.local` sem versionar credenciais:

```bash
VITE_API_BASE_URL=http://localhost/php-seed
```

O contrato de autenticação atual usa o token salvo pelo frontend e o endpoint
`/refreshAccessToken`; qualquer mudança no backend deve ser validada junto com
o fluxo de login, refresh e logout.

## Organização

- `src/views/` — telas e módulos de domínio
- `src/components/` — componentes reutilizáveis
- `src/composables/` — lógica compartilhada, incluindo Inbox
- `src/services/` e `src/plugins/` — integrações e cliente HTTP
- `src/store/` — estado Vuex
- `docs/` — especificações e planos de implementação

O Codex permanece responsável pela revisão e validação final. Claude Code,
OpenDesign, Hermes e 9Router são integrações auxiliares e só devem ser
considerados disponíveis quando seus testes de conexão forem confirmados.
