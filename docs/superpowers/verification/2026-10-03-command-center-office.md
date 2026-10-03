# Command Center Office — Verification

## Runtime

- Frontend: `http://127.0.0.1:4174/`
- Bridge: `http://127.0.0.1:4312/`
- Bridge bind: `127.0.0.1`
- Portal Maestri: `Command Center Office`

## Automated checks

- `npm run test:bridge` — 5 tests passed.
- `node --test src/state/officeStore.test.mjs` — 2 tests passed.
- `npm run build` inside `command-center/` — passed.
- `npm run build` at repository root — passed; existing Vite chunk-size warning remains.
- Phaser office scene — bundled successfully; the expected Phaser vendor chunk is larger than 500 kB and should be code-split in a later performance pass.

## Real bridge smoke

- `/api/health` — `bridge_up=true`, `cli_available=true`, `socket_accessible=true`.
- `/api/agents` — returned the observed Maestri inventory: Codex/self, Principal, Cipher, Sage, Forge, Atlas and Lumen, plus connected portals and notes.
- `/api/activity` — returns snapshot events explicitly marked `source: snapshot`.
- `/api/chat` — input validation and loopback request work. The current Maestri CLI rejects `maestri ask "Codex"` because Codex is the current terminal and cannot self-target; the bridge returns `SELF_TARGET_UNAVAILABLE` instead of fabricating an answer.

## Browser smoke

- Desktop portal at `1440x892`: map, seven observed rooms, inspector, status legend and top-level controls rendered.
- Narrow portal at `390x844`: `document.documentElement.clientWidth=375`, `scrollWidth=375`, composer present, seven rooms rendered without horizontal overflow.
- Visual refinement: desktop map now uses an original top-down Phaser composition with connected paths, room zones, terrain decoration, props and pixel-style avatars; mobile keeps the same spatial scene in a bounded canvas without horizontal overflow.
- Gather-inspired refinement: `public/assets/command-center-village.png` is an original raster terrain asset; agent names, states and actions remain HTML/accessibility content above the map.
- Phaser interaction: room/agent selection is emitted back to Vue for the inspector; wheel zoom is bounded and reduced-motion remains respected by the surrounding UI.
- Viewport pass: desktop `1440x900` reports `scrollWidth=1440`, `scrollHeight=900`, map `904x469`, inspector `264px` and chat composer fully inside its `224px` panel. Mobile `390x844` reports `scrollWidth=390`, `scrollHeight=844`; the internal modes `Mapa`, `Sala` and `Chat` keep the document fixed while panels own their content.
- Avatar pass: Phaser agents now have a grounded shadow, role accent/accessory, offline desaturation and a short working-only tool motion; inspector avatars share the same floor-shadow language.
- Chat pass: the thread header exposes `Codex ↔ selected agent`, bridge confirmation and message timestamps/status context; mobile chat keeps its composer available inside the viewport.
- Chat composer accepted a controlled message; the actual bridge limitation appeared in the chat as an explicit error.

## Known limitation

The office can observe Maestri and safely submit a chat request, but the current CLI has no self-addressable Codex target. Enabling a real Codex reply requires a future Maestri bridge/API path or an explicitly connected external orchestrator target. No simulated success is shown.

## Agent review

- Atlas supplied the operational room contract used by the implementation.
- Lumen supplied the visual direction for rooms, original CSS pixel avatars, palette, accessibility and responsive behavior.
- Cipher review was attempted but the Claude process returned `Connection refused`; no review result is claimed.
