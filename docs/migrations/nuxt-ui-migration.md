# Nuxt UI Migration

**Status**: Planned
**Started**: 2026-06-30

## Overview

Replace PrimeVue with the latest Nuxt UI as the app's UI foundation. This migration also upgrades Tailwind CSS to v4, updates Nuxt-adjacent build/test tooling, replaces Vuelidate with Zod-powered Nuxt UI forms, and uses the work as a restrained visual refresh for the Premier League fantasy football experience.

This is an off-season migration, so the target is a full replacement rather than long-term coexistence.

## Goals

- Remove PrimeVue, `@primevue/nuxt-module`, PrimeVue themes, and `tailwindcss-primeui`.
- Add Nuxt UI and use its app provider, theme tokens, components, color mode, icon, toast, modal, and form patterns.
- Upgrade Tailwind CSS to v4.
- Upgrade Nuxt-adjacent packages and build/test tooling where they are part of the UI migration.
- Replace Vuelidate with Zod schemas and Nuxt UI `UForm` / `UFormField`.
- Add intentional light and dark mode support.
- Refresh the visual design without turning the migration into a redesign project.

## Non-Goals

- Do not upgrade unrelated app/service dependencies such as Supabase, Resend, Hotjar, or Turnstile unless compatibility requires it.
- Do not introduce a local generic UI wrapper library around Nuxt UI.
- Do not add screenshot automation or pixel-perfect visual regression tooling.
- Do not redesign the product navigation, information architecture, or league workflows.

## Design Brief

- **Tone**: clean fantasy-football operations dashboard, not a marketing site.
- **Density**: preserve scanability for standings, stats, fixtures, and admin views.
- **Color**: keep deep navy as the brand anchor, with one energetic accent for live/gameweek states.
- **Light mode**: crisp surface hierarchy, restrained borders, clear table rows.
- **Dark mode**: dark-neutral surfaces with navy/green accents, not pure black.
- **Typography**: keep Rubik for headings and Inter for body text; reduce all-caps where it hurts readability.
- **Motion**: minimal, mostly hover, focus, loading, and disclosure states.
- **Theming**: prefer Nuxt UI theme/app config before page-level one-off styling.

## Dependency Scope

### Add

- `@nuxt/ui`
- `zod`

### Remove

- `primevue`
- `@primevue/core`
- `@primevue/nuxt-module`
- `@primeuix/themes`
- `tailwindcss-primeui`
- `@vuelidate/core`
- `@vuelidate/validators`

### Reconcile

Nuxt UI includes or configures functionality currently handled separately by some modules. During implementation, reconcile and remove duplicates where appropriate:

- `@nuxt/icon`
- `@nuxtjs/color-mode`
- font loading configuration

### Upgrade

Upgrade Nuxt-facing framework/tooling packages as part of the same branch:

- `nuxt`
- `@nuxt/eslint`
- `@nuxt/test-utils`
- `@nuxt/devtools`
- `@pinia/nuxt`
- `vite`
- `vitest`
- `vue-tsc`
- related TypeScript/build tooling where needed

## Component Strategy

Use Nuxt UI directly for generic controls:

- buttons
- inputs
- selects
- checkboxes
- textareas
- cards
- badges
- alerts
- modals/drawers
- toasts
- skeleton/loading states

Keep or create local components where the component has product meaning:

- league table display
- player stat table
- fixture stat entry
- dashboard summary card
- player/team selectors
- empty/error state patterns

Avoid generic wrappers such as `AppButton` or `AppInput` unless there is a repeated app-specific behavior that Nuxt UI configuration cannot express cleanly.

## Table Policy

Use `UTable` by default for read-heavy/stat tables:

- league table
- weekly winners
- standings-style tables
- simple skeleton table replacements

Allow custom table or grid markup where it makes the football workflow clearer, especially fixture stat entry. Do not force TanStack column definitions into places where they obscure player search, row editing, or selection logic.

## Form And Validation Policy

Use Zod with Nuxt UI forms.

- New form state lives beside a local Zod schema.
- Use `UForm` and `UFormField` for validation display.
- Use `z.output<typeof schema>` for submit payload typing.
- Keep validation messages close to schemas.
- Put schemas inside components initially.
- Extract shared schemas only where reuse is immediate and obvious.

## Color Mode

- Default to the user's system preference.
- Add a manual light/dark/system control in the sidebar.
- Persist the user's choice through Nuxt UI/color-mode.
- Replace hard-coded `bg-white`, `text-slate-*`, and `border-gray-*` classes with token-aware or paired light/dark classes as components are converted.

## Migration Phases

### Phase 1: Base Setup

- [x] Create migration branch.
- [x] Install Nuxt UI, Zod, Tailwind CSS v4, and upgraded Nuxt-adjacent tooling.
- [x] Keep PrimeVue and Vuelidate runtime/module configuration temporarily so unconverted components remain verifiable.
- [x] Add Nuxt UI module configuration.
- [x] Wrap the app with `UApp`.
- [x] Add Nuxt UI theme tokens alongside the temporary PrimeVue theme setup.
- [x] Reconcile duplicate icon/color-mode/font module setup.
- [x] Update global CSS for Tailwind v4.
- [x] Run `pnpm lint`, `pnpm typecheck`, `pnpm test`, and `pnpm build`.

### Phase 2: Hard Surface Validation

- [x] Convert one representative read-heavy table: `app/components/Table/Data.vue`.
- [x] Convert the fixture stats entry experience: `app/components/Fixture/StatsInput.vue`.
- [x] Decide whether fixture stat entry uses `UTable` or custom markup. Use custom Nuxt UI-powered table markup for this row-editing workflow.
- [x] Convert one dialog-heavy flow: `app/components/Drafted/DraftedPlayerEditDialog.vue`.
- [x] Convert the validation in that flow to Zod.
- [x] Add or update focused behavior tests for changed validation/table interactions.
- [x] Run lint, typecheck, tests, and build.

### Phase 3: Forms And Admin Flows

- [x] Convert login to Nuxt UI form components and Zod validation.
- [x] Convert team builder form to Nuxt UI form components and Zod validation.
- [x] Convert account/admin settings forms.
- [x] Convert transfer management forms.
- [x] Replace PrimeVue toasts/messages with Nuxt UI toast/alert patterns.
- [x] Add or update focused tests for validation behavior.

### Phase 4: General Component Sweep

- [x] Convert remaining buttons, selects, inputs, checkboxes, cards, dialogs, messages, skeletons, and date/number inputs.
- [x] Convert dashboard cards and stat summaries to the refreshed design language.
- [x] Convert filters and player/team selector patterns.
- [x] Remove all PrimeVue imports and component usage.
- [x] Remove PrimeVue module configuration, dependencies, and lockfile references.
- [x] Remove Vuelidate dependencies and lockfile references once all forms use Zod.

### Phase 5: Light/Dark Polish

- [x] Add sidebar color mode control.
- [x] Review every route for hard-coded light-only styling.
- [x] Tune Nuxt UI theme tokens for both modes.
- [x] Verify focus, hover, loading, empty, success, warning, and error states in both modes.

Phase 5 scope note: dashboard, fixture, drafted-team, modal, skeleton, error, season-finale, and players-list surfaces now have paired light/dark treatments. The `/players` route now uses a `UTable`-first player browser with table-owned name, team, price, position, and availability filters.

### Phase 6: Final Verification

- [ ] `pnpm lint`
- [ ] `pnpm typecheck`
- [ ] `pnpm test`
- [ ] `pnpm build`
- [ ] Manual QA checklist complete.
- [ ] Update docs that mention PrimeVue or Tailwind v3.

## Manual QA Checklist

Check desktop and mobile in light and dark mode:

- [ ] `/`
- [ ] `/table`
- [ ] `/players`
- [ ] `/teams`
- [ ] `/fixtures`
- [ ] one fixture detail route, if local data allows
- [ ] `/team-builder`
- [ ] `/rules`
- [ ] `/account/login`
- [ ] `/account`, if authenticated/admin state is available locally

For each route:

- [ ] layout does not overlap or clip
- [ ] navigation remains usable
- [ ] table data is readable and scannable
- [ ] forms show helpful validation errors
- [ ] loading, empty, success, warning, and error states are legible
- [ ] color contrast is acceptable in both modes
- [ ] mobile spacing and touch targets feel usable

## Completion Criteria

The migration is done when PrimeVue and Vuelidate are removed, Nuxt UI and Zod are the active UI/form foundation, light/dark mode works intentionally, all automated checks pass, and the manual QA checklist has been completed.
