# Chibata Dark Modular Command Center

**Date:** 2026-10-01
**Mode:** Architectural frontend redesign over the existing SaaS
**Scope:** Visual system, shared shell, page composition, interaction polish, and responsive presentation

## Intent

Chibata should feel like a distinctive professional operations product instead of a generic admin dashboard. The redesign is frontend-only and follows the supplied dark modular SaaS reference. It preserves the current information architecture, route names, API behavior, Vuex state, forms, permissions, local preview flow, and honest loading, empty, and error states.

Success means that a user can recognize Chibata from its navy canvas, emerald actions, typography, spacing, navigation rhythm, and modular page compositions before reading the logo. The interface should feel precise, dense, modern, and operational without becoming noisy or difficult to scan.

## Audit findings

The current frontend already has a working foundation, Phosphor icons, responsive route coverage, and explicit unavailable states. The remaining generic feeling comes from the visual grammar rather than missing functionality:

- The shared stylesheet contains successive visual layers from earlier directions, which makes the final system harder to reason about and leaves obsolete rules in the cascade.
- The same rounded-card pattern repeats across several pages, so each area lacks a distinct job and rhythm.
- The Inbox is structurally correct but visually close to a conventional admin three-pane layout.
- Page headings, operational context, primary actions, and data states do not have enough typographic separation.
- The shell has consistent icons but still reads as a default navigation scaffold instead of a Chibata workspace.
- The current browser preview correctly exposes API unavailability, but those states can be composed with more confidence and hierarchy.

## Chosen direction

### Dark Modular Command Center

Use a dark product-system language: deep navy canvas, slightly raised blue-black panels, cool hairlines, bright emerald actions, and clean sans-serif type. The app should feel like a complete component system with varied module sizes rather than a collection of generic dashboard cards.

Design dials:

- **Visual variance:** 7/10. Use varied module sizes and page-specific compositions while keeping controls predictable.
- **Motion intensity:** 3/10. Use fast, quiet feedback for press, hover, focus, and state changes.
- **Information density:** 6/10. Keep daily operational work efficient through compact modules, clear grouping, and strong hierarchy.
- **Asset dependence:** 1/10. Use the existing product UI and real states; do not fabricate dashboards, avatars, conversations, or metrics.
- **Brand character:** 8/10. Let navy, emerald, typography, spacing, and material contrast carry the identity.

## Visual system

### Color

The palette is intentionally small and semantic, based on the supplied dark modular reference:

- Canvas navy: `#111827`
- Surface navy: `#172033`
- Raised surface: `#1D2940`
- Input surface: `#151F33`
- Border: `#2A3A56`
- Strong border: `#3A4E70`
- Primary text: `#F1F5F9`
- Secondary text: `#91A4C0`
- Faint text: `#64748B`
- Emerald accent: `#00D084`
- Strong emerald: `#00E596`
- Emerald ink: `#06251C`
- Success: `#00D084`
- Warning: `#F0B35B`
- Danger: `#F08A82`

Use emerald for primary actions, selected states, progress, and positive status. Use navy surfaces for grouping and hierarchy. Use semantic colors only for actual status. Avoid gradients, glow effects, decorative grids, excessive pills, and colored side borders on panels.

### Typography

- Display and body: `"Nimbus Sans", "Segoe UI Variable", "Segoe UI", sans-serif`.
- Headings use clear weight contrast and tight but readable tracking.
- Body copy stays between 13px and 16px depending on context.
- Labels and table metadata use cool muted text, compact uppercase, or small sans-serif text only where it improves scanning.
- No serif editorial treatment, oversized all-caps labels, or repeated eyebrow text above every heading.

### Shape, spacing, and depth

- Base spacing unit: 4px.
- Desktop page padding: 42px with fluid side gutters.
- Narrow-screen page padding: 16px.
- Controls: 8px radius.
- Main panels: 10px radius.
- Pills reserved for preview, filters, and compact status.
- Elevation comes from surface contrast, cool borders, and restrained shadows, not stacked cards.
- A component earns a panel only when the boundary communicates grouping, focus, or interaction.

### Iconography and controls

- Phosphor Vue is the primary icon family with consistent regular and duotone weights.
- MDI remains only where Vuetify internals require it.
- Buttons must have clear label contrast, 44px minimum touch targets where practical, visible focus, and a subtle 0.97 press scale.
- Hover transforms run only for fine pointers.
- Transitions specify properties directly and stay below 300ms.

## Composition by product area

### Workspace shell

Keep the existing route structure and responsive drawer behavior. Refine the shell so the navigation feels like a designed product surface:

- Deep navy topbar with clear route context and compact preview state.
- Dark side rail with a strong wordmark, quiet workspace context, and emerald active treatment.
- Account footer remains functional and visually subordinate.
- Navigation labels and route links remain unchanged.

### Home

Keep the existing quick-access destinations, but make the page read as a modular command surface:

- One dominant next-action composition.
- A compact operational shortcut rail or list.
- A varied module grid instead of a grid of equal promotional cards.
- No invented statistics or activity feed.

### Inbox

Preserve the three-pane behavior and all API requests. Improve the information hierarchy:

- Header establishes queue context and refresh action.
- Filter rail reads as a compact dark tool surface, not a card stack.
- Conversation list has clear count, state, and empty/error messaging.
- Preview panel has a calm starting state, dark contrast, and enough visual weight to feel intentional.
- Real API failure remains visible with retry; no fabricated conversations.

### CRUD and configuration

Preserve `CrudPage`, `CrudTable`, dialog behavior, field definitions, payloads, and permission checks. Use a shared page rhythm:

- Title and description form the first reading block.
- Primary action is emerald with dark readable text and is visually unambiguous.
- Search and filters sit in a quiet control row.
- Summary and table use one surface grammar.
- Loading, empty, error, retry, and pagination states are distinct without adding decoration.

### Funil and flow editor

Keep node interactions, canvas behavior, and editor routes. Bring the editor into the same product language through surface tokens, navy panels, emerald controls and selection, restrained canvas texture, and clear unavailable states.

### Authentication

Keep the existing login and registration contracts, including the approved registration fields. Use the split layout as a branded entry experience:

- Navy story panel with high-contrast text.
- Raised navy form panel with generous type hierarchy.
- Controls match the workspace rhythm.
- Password visibility, validation, focus, and error states remain functional and accessible.

## Implementation boundaries

The implementation may change:

- CSS tokens, typography, spacing, shadows, radii, and responsive rules.
- Shared shell presentation.
- Page-level markup only when needed to express the approved composition.
- Phosphor icon selection and visual states.
- Frontend-only visual assets and styling.

The implementation must not change:

- API endpoints, request methods, payload keys, or response handling.
- Vuex modules, authentication semantics, permissions, or route guards.
- Route names, URL paths, navigation labels, or form field names.
- Local preview safety boundary.
- Backend, migrations, database, secrets, or deployment configuration.
- Real data behavior by replacing unavailable states with fixtures.

## Delivery sequence

1. Consolidate the visual token layer and remove obsolete competing rules.
2. Refine the shared shell and interaction primitives.
3. Recompose Home and Inbox as the two highest-visibility surfaces.
4. Apply the shared rhythm to CRUD, configuration, logs, auth, and flow editor.
5. Run visual critique and accessibility checks at desktop and 390px mobile width.
6. Run route smoke, build, diff check, and browser console verification.

## Acceptance criteria

1. All existing frontend routes continue to render in local preview.
2. No API, Vuex, router, permission, or form contract changes are introduced.
3. Home, Inbox, CRUD, configuration, auth, logs, and flow editor share the Dark Modular Command Center language while retaining distinct composition jobs.
4. The app no longer relies on repeated equal-card scaffolds as the primary visual structure.
5. Primary actions, focus states, errors, loading states, empty states, and retry actions remain legible and accessible.
6. Desktop and 390px mobile layouts have no unintended horizontal overflow.
7. `npm run build` succeeds, `git diff --check` is clean, and browser console logs contain no new errors.
8. Reduced-motion users receive equivalent state feedback without unnecessary movement.

## Out of scope

- Backend or API repair.
- New product features.
- New routes or navigation concepts.
- Real analytics, conversation fixtures, or fabricated operational metrics.
- Brand name, logo, or wordmark replacement.
