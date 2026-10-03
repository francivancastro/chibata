# Agency Agents — proveniência

O Command Center usa o repositório [Agency Agents](https://github.com/msitarzewski/agency-agents) como catálogo de papéis e capacidades, não como runtime de execução.

- Fonte: `https://github.com/msitarzewski/agency-agents`
- Commit fixado: `d3f71c4bb8922d3eea7576237a870dd59b3cdd52`
- Licença: MIT; o aviso de copyright deve ser preservado para cópias substanciais.
- Escopo integrado: snapshot build-time de 267 agentes e 18 divisões; somente `name`, `description`, `color`, `emoji`, `vibe` e serviços reduzidos a `name`/`tier`/`host`.
- Não integrado: scripts de instalação, conversores, runtimes, comandos, credenciais ou execução de agentes do repositório externo.

## Regeneração controlada

O catálogo é gerado por `command-center/scripts/generate-agent-catalog.mjs` e versionado em `command-center/src/data/agencyCatalog.json`.

```bash
cd command-center
AGENCY_AGENTS_SOURCE=/caminho/para/agency-agents npm run catalog:generate
npm run catalog:validate
```

O gerador aceita apenas a taxonomia aprovada, rejeita symlinks nas divisões, lê o frontmatter e nunca exporta o corpo Markdown. A aplicação importa o JSON estático; não existe endpoint que aceite caminho de arquivo. A associação com o Maestri é apenas por nome único para enriquecimento visual, sem substituir `name`, `workspace`, estado operacional ou evidência.

A identidade, disponibilidade, estado, tarefa e evidência continuam vindo da bridge Maestri. Um perfil Agency Agents não cria agente conectado nem transforma presença em atividade.
