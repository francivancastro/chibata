# Repository Guidelines

## Project Structure & Module Organization

This repository is a Vue 3 application built with Vite. Application bootstrap and routing live in `src/main.js` and `src/router/`. Reusable UI is in `src/components/`, page-level screens are in `src/views/`, and domain CRUD modules are in `src/crud/`. Shared state is managed in `src/store/`; API and other integrations belong in `src/services/` and `src/plugins/`. Put reusable business logic in `src/composables/` or `src/utils/`. Static files belong in `public/`; bundled images and styles belong in `src/assets/`. Project notes and implementation plans are under `docs/`.

## Build, Test, and Development Commands

Install dependencies with `npm install`. Use these scripts from the repository root:

- `npm run dev` — start the Vite development server with hot reload.
- `npm run build` — create the production bundle in `dist/`.
- `npm run preview` — serve the built bundle locally for smoke testing.

There is currently no test runner or lint/format script configured in `package.json`. For changes affecting UI or routing, run the development server and manually verify the affected route and its loading, empty, error, and interaction states; always run `npm run build` before submitting.

## Coding Style & Naming Conventions

Follow the existing Vue 3 `<script setup>` style and use two-space indentation. Use single quotes in JavaScript, keep semicolons omitted, and retain the existing import alias `@` for `src`. Name Vue components in PascalCase (`CrudDialog.vue`), views and domain folders in lowercase (`src/views/inbox/`), composables with a `use` prefix (`useInbox.js`), and store modules by domain. Prefer small, focused components and keep API access out of presentational components.

## Testing Guidelines

No automated test framework is present yet. Until one is added, use `npm run build` as the required regression check and document manual browser checks in the pull request, including the route tested and any API-dependent behavior.

## Commit & Pull Request Guidelines

Use short, imperative Conventional Commit-style messages, matching history such as `feat(frontend): redesign SaaS command center` (for example, `fix(inbox): handle empty conversations`). Keep commits focused. Pull requests should explain the behavior change, list validation commands, link the relevant issue or plan when available, and include screenshots or a short recording for visual changes. Do not commit secrets, local environment files, generated `dist/`, or `node_modules/`.

## Security & Configuration Tips

Keep credentials and environment-specific values out of source control; use local `.env` files when configuration requires them. Review Axios/API changes for authentication, tenant boundaries, and error handling before merging.

## Multi-Agent Orchestration

Codex is the principal orchestrator for this project. It receives and interprets requests, analyzes the repository, decides whether to work directly or delegate, decomposes complex work, selects specialists, supplies context, evaluates their results, integrates approved changes, runs available validation, and reviews the final outcome.

Delegate only when a specialist provides a real advantage; direct execution is preferred for simpler tasks. Planned specialists are:

- **Claude Code** — programming, architecture analysis, code review, technical second opinions, and complex bug investigation.
- **OpenDesign** — UI/UX, design systems, wireframes, prototyping, visual analysis, and avoiding generic AI-generated interfaces.
- **Hermes** — research, investigation, planning, memory/context recovery, documentation, and auxiliary tasks.
- **9Router** — gateway access to configured auxiliary model providers such as OpenRouter, NVIDIA, Ollama, and Gemini.

Codex remains accountable for the final result. Never claim an agent was consulted unless it actually ran, and never simulate agent responses. Record which agent performed each delegated task, define the files it may modify before delegating code changes, avoid simultaneous edits to the same files, and review all delegated changes before accepting them. Run available builds, tests, and validations after integration; Codex resolves conflicts using the requirements, existing code, and test results.

Claude Code, OpenDesign, Hermes, and 9Router are currently planned agents only. Treat them as unavailable until their integrations are configured and tested. Preserve project security throughout orchestration: never expose API keys or tokens in logs, commits, or unnecessary prompts.
