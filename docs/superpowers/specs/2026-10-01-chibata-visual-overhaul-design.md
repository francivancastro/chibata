# Chibata visual overhaul design

**Date:** 2026-10-01
**Mode:** Redesign over existing information architecture
**Scope:** Authenticated SaaS shell, home, Inbox, auth screens, CRUD views, flow editor, and responsive states

## Design read

This is a B2B operations workspace for teams that manage conversations, automation, catalog data, access groups, and audit records. The new language should feel calm, precise, and trustworthy at laptop distance, with enough warmth to avoid looking like a generic developer dashboard.

The redesign preserves every existing route, API contract, form field name, local preview flow, and data state. It changes the visual system and shared composition rather than replacing the application architecture.

## Direction and dials

- **Aesthetic:** editorial operations workspace, built on a dark graphite canvas with quiet sea-glass accent details.
- **Design variance:** 5/10. Use restrained asymmetry in the home and Inbox while keeping data screens predictable.
- **Motion intensity:** 3/10. Use short transform and opacity transitions for feedback and hierarchy only.
- **Information density:** 6/10. Keep the app efficient for daily work without turning it into a cockpit.
- **Asset dependence:** 1/10. This product is a data workspace; real product UI and clear states matter more than decorative imagery.
- **Brand fidelity:** 7/10. Preserve the Chibata wordmark and recognizable dark workspace, but replace the current lavender-heavy treatment.

## Design system

### Color

Use one product accent and reserve semantic colors for actual states.

- Canvas: `#111315`
- Surface: `#181B1E`
- Raised surface: `#202428`
- Soft surface: `#15181A`
- Hairline: `#2D3337`
- Primary text: `#F1F0EB`
- Secondary text: `#A8AEAF`
- Muted text: `#747D80`
- Accent sea-glass: `#A7D8CB`
- Accent strong: `#C1F0E4`
- Accent ink: `#12201D`
- Success: `#9FD5B1`
- Warning: `#E2C18A`
- Danger: `#E8A5A0`

No gradients, glow effects, or decorative status dots. Depth comes from contrast, hairlines, inset highlights, and restrained tinted shadows.

### Typography

Use a characterful system stack without adding a font dependency:

```css
font-family: "Avenir Next", "Segoe UI Variable", "Segoe UI", system-ui, sans-serif;
```

Headings use tighter tracking and medium or semibold weights. Body text stays between 13px and 15px in product surfaces. Numeric data uses tabular figures.

### Shape and spacing

- Base spacing unit: 4px.
- Page padding: 28px desktop, 16px narrow screens.
- Shell controls: 10px radius.
- Cards and main panels: 16px radius.
- Pills are reserved for filters, status, and the local preview marker.
- Buttons use 10px radius, not oversized capsules.

### Iconography

Use one outline icon family with a consistent 1.75px visual weight. The navigation migrates to Phosphor Vue icons. Existing MDI icons remain only where Vuetify field internals require them, and decorative icon noise is reduced.

## Surface composition

### Workspace shell

- Sidebar width remains compact at 232px desktop and collapses on mobile.
- Active navigation uses a slim accent rail, low-contrast surface tint, and one consistent icon treatment.
- Topbar keeps the route title and preview indicator; remove redundant workspace prose from the primary reading line.
- Account footer is quiet and functional, with the local preview marker clearly visible only in development.

### Home

Replace the current equal-card emphasis with a two-column command surface: one large next-action panel and a compact stack of operational shortcuts. Keep the quick-access routes, but use a flatter list-plus-action treatment so the page feels like a workspace rather than a template dashboard.

### Inbox

Keep the existing three-pane behavior and API requests. Improve the visual hierarchy with a clear header, compact filter rail, conversation list rows, and a calm empty/error state. No fake conversation data is introduced. Offline states remain explicit.

### CRUD screens

Keep `CrudPage`, `CrudTable`, and dialog behavior. Improve the hierarchy of page heading, search, action controls, table headers, row hover, loading skeleton, empty state, and retry state through shared tokens. The data flow and field configuration remain unchanged.

### Auth

Keep the split layout, but make the story panel quieter, reduce decorative copy, use the same typography and control rhythm as the workspace, and keep the registration contract as name, email, username, password, and password confirmation.

### Flow editor

Keep the canvas and node interactions. Use the same surface, border, control, and accent tokens so the editor feels like the same product instead of a separate theme.

## Motion and accessibility

- Use 160-220ms custom ease-out transitions for hover, focus, active, and drawer state.
- Animate only `transform` and `opacity`.
- Gate hover motion behind fine-pointer media queries.
- Respect `prefers-reduced-motion` by removing movement and keeping state/color feedback.
- Preserve the skip link and visible focus ring.
- Keep touch targets at least 44px for navigation and primary actions.

## Protected contracts

- Do not rename or remove any route.
- Do not change API base URLs or request payload keys.
- Do not introduce real credentials or fake records.
- Keep local preview development-only and clearly labeled.
- Do not change the Chibata wordmark.

## Acceptance criteria

1. All current routes open in the local preview without authentication.
2. Login and registration validations remain functional.
3. Inbox, CRUD, configuration, and flow editor preserve their existing behavior and error states.
4. Sidebar and topbar use one consistent icon family and active-state treatment.
5. The visual system is coherent at desktop and 390px mobile width.
6. `npm run build` succeeds and `git diff --check` is clean.
7. No new console errors are introduced by the redesign.
