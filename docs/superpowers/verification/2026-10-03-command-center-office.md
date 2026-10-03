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

## Real bridge smoke

- `/api/health` — `bridge_up=true`, `cli_available=true`, `socket_accessible=true`.
- `/api/agents` — returned the observed Maestri inventory: Codex/self, Principal, Cipher, Sage, Forge, Atlas and Lumen, plus connected portals and notes.
- `/api/activity` — returns snapshot events explicitly marked `source: snapshot`.
- `/api/chat` — input validation and loopback request work. The current Maestri CLI rejects `maestri ask "Codex"` because Codex is the current terminal and cannot self-target; the bridge returns `SELF_TARGET_UNAVAILABLE` instead of fabricating an answer.

## Browser smoke

- Desktop portal at `1440x892`: map, seven observed rooms, inspector, status legend and top-level controls rendered.
- Narrow portal at `390x844`: `document.documentElement.clientWidth=375`, `scrollWidth=375`, composer present, seven rooms rendered without horizontal overflow.
- Visual refinement: desktop map now uses an original top-down office-village composition with connected paths, room zones, terrain decoration and CSS pixel avatars; mobile switches to a readable stacked room layout.
- Chat composer accepted a controlled message; the actual bridge limitation appeared in the chat as an explicit error.

## Known limitation

The office can observe Maestri and safely submit a chat request, but the current CLI has no self-addressable Codex target. Enabling a real Codex reply requires a future Maestri bridge/API path or an explicitly connected external orchestrator target. No simulated success is shown.

## Agent review

- Atlas supplied the operational room contract used by the implementation.
- Lumen supplied the visual direction for rooms, original CSS pixel avatars, palette, accessibility and responsive behavior.
- Cipher review was attempted but the Claude process returned `Connection refused`; no review result is claimed.
