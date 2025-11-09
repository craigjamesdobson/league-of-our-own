# CLAUDE.md

Project-specific guidance for **League of Our Own** - a Nuxt fantasy football web application.

> **For general development practices** (TDD, TypeScript guidelines, code style, testing philosophy), see `~/.claude/CLAUDE.md` and the linked documentation.

## Quick Reference

**Key Commands**:
- Development: `pnpm dev` (runs with --host flag for network access)
- Testing: `pnpm test` (run once), `pnpm test:watch` (watch mode), `pnpm test:ui` (visual interface)
- Type Generation: `pnpm generate-types` (generates Supabase types)
- Linting: `pnpm lint` (check) or `pnpm lint:fix` (auto-fix)
- Build: `pnpm build`
- Type checking: `pnpm typecheck`

**Project Structure**: All application code is in `/app/` directory (Nuxt 4 pattern)

---

## Technology Stack

### Core Framework
- **Nuxt 4**: SPA mode (SSR disabled), file-based routing, TypeScript throughout
- **Vue 3**: Composition API with TypeScript
- **Pinia**: State management with stores in `/app/stores/`

### UI & Styling
- **PrimeVue**: UI component library with custom Aura theme preset (theme: 'none')
- **Tailwind CSS**: Utility-first styling with PrimeVue integration
- **tailwindcss-primeui**: PrimeVue-Tailwind integration plugin

### Backend & Data
- **Supabase**: PostgreSQL database, authentication, real-time features
- **Nitro**: Server endpoints for email via Resend (location: `/server/api/`)
- **Type Generation**: Automated TypeScript types from Supabase schema

### Testing
- **Vitest**: Test framework with Nuxt environment
- **Vue Test Utils**: Component testing utilities
- **@nuxt/test-utils**: Nuxt-specific test utilities

---

## Project Structure

All application code lives in `/app/` (Nuxt 4 convention):

```
app/
├── components/      # Feature-organized Vue components
│   ├── Common/      # Shared components
│   ├── Dashboard/   # Dashboard-specific
│   ├── Drafted/     # Drafted team management
│   ├── Fixture/     # Match fixtures display
│   ├── Player.vue, PlayerModal.vue
│   ├── Skeleton/    # Loading skeletons
│   ├── Table/       # League table
│   ├── TeamBuilder/ # Team builder interface
│   └── Filters.vue, FiltersDialog.vue
├── composables/     # Reusable composition functions
│   └── (filters, weekly statistics, etc.)
├── stores/          # Pinia stores
│   ├── account.ts
│   ├── draftedTeams.ts
│   ├── fixtures.ts
│   ├── players.ts
│   └── table.ts
├── pages/           # File-based routing
├── middleware/      # Route middleware (auth.ts)
├── types/           # TypeScript type definitions
├── tests/           # Vitest test suites
├── logic/           # Business logic modules
├── layouts/         # Layout components
├── assets/          # Styles, images, static assets
│   ├── styles/
│   ├── svg/
│   └── styles/primevue/  # Custom PrimeVue theme
└── utils/           # Utility functions

server/
├── api/             # Nitro API endpoints (email)
└── utils/           # Server-side utilities
```

---

## Architecture Patterns

### Data Layer - Supabase Integration

**Type Generation**:
```bash
pnpm generate-types              # Generate from remote Supabase project
```

**Type System**:
- `app/types/database-generated.types.ts` - Auto-generated from Supabase schema (never edit manually)
- `app/types/database.types.ts` - Manual overrides and extensions for views like `players_view`
- Domain-specific types in `app/types/` (Dashboard.ts, DraftedTeam.ts, Player.ts, etc.)

**Type-Safe Queries**:
```typescript
import type { Database } from '~/types/database.types';

const supabase = useSupabaseClient<Database>();

const { data } = await supabase
  .from('players_view')
  .select('*')
  .eq('season', activeSeason);
```

### State Management - Pinia Stores

Stores in `/app/stores/`:
- **account.ts** - User account and authentication state
- **draftedTeams.ts** - User's drafted teams
- **fixtures.ts** - Match fixtures and results
- **players.ts** - Available players data
- **table.ts** - League table standings

### Component Organization

Components in `/app/components/` organized by feature domain.

**Modal Pattern**: Use centralized `Modal.vue` with content injection rather than creating individual modal components.

### Routing & Authentication

- **File-based routing**: Pages in `/app/pages/`
- **Auth middleware**: `/app/middleware/auth.ts` protects authenticated routes
- **Supabase auth**: Configured with `redirect: false` in nuxt.config.ts

---

## Testing Configuration & Patterns

### Test Environment

**Framework**: Vitest with **Nuxt environment** (not Happy DOM)

Configuration in `vitest.config.ts` uses `environment: 'nuxt'` via `@nuxt/test-utils` for proper Nuxt feature support.

### Test Organization

```
app/tests/
├── setup.ts                    # Test utilities (withSetup helper)
├── factories/                  # Centralized test data factories
│   ├── index.ts                # Central exports
│   ├── teams.ts                # DraftedTeam factory functions
│   └── players.ts              # DraftedTeamPlayer factory functions
├── team-builder/
│   └── composables/            # Team builder composable tests
├── weekly-statistics/
│   └── composables/            # Weekly statistics composable tests
├── homepage-dashboard/
│   └── composables/            # Homepage dashboard composable tests
└── transfers/                  # Transfer functionality tests
```

### Testing Vue Composables

Use the `withSetup` helper from `app/tests/setup.ts` for testing composables within proper Vue context:

```typescript
import { withSetup } from '~/tests/setup';

describe('useMyComposable', () => {
  it('should test reactive behavior', () => {
    const [result, app] = withSetup(() => useMyComposable());

    // Test composable behavior with real Vue reactivity
    expect(result.someValue.value).toBe(expected);

    // Always cleanup
    app.unmount();
  });
});
```

### Test Data Factories

All test factories centralized in `/app/tests/factories/`:

```typescript
import { createMockTeam, createMockPlayer } from '~/tests/factories';

// Factories use Partial<T> overrides for flexibility
const team = createMockTeam({
  budget: 85,
  allowTransfers: true
});

const player = createMockPlayer({
  cost: 7.5,
  position: 'MID'
});
```

**Key Principles**:
- Import real types from `/app/types/` - never redefine schemas in tests
- Use centralized factories for consistency
- Compose factories for complex scenarios

### Running Tests

```bash
pnpm test                        # Run all tests once
pnpm test:watch                  # Watch mode for development
pnpm test:ui                     # Visual test UI
pnpm test app/tests/team-builder/ # Run specific test directory
```

---

## PrimeVue Configuration

**Custom Theme**: Uses Aura preset with custom primary color palette defined in `nuxt.config.ts`

**Component Auto-Import**: PrimeVue components auto-imported EXCEPT:
- Form, FormField (using custom form components)
- Editor (not needed)
- Chart (not needed)

**Styling**:
- Base PrimeVue theme via `@primeuix/themes`
- Tailwind integration via `tailwindcss-primeui`
- Custom styles in `/app/assets/styles/primevue/`
- Global styles in `/app/assets/styles/base.css`

---

## Environment Configuration

**Runtime Config** (defined in `nuxt.config.ts`):

```typescript
runtimeConfig: {
  public: {
    SITE_URL: process.env.SITE_URL,           // Application base URL
    ACTIVE_SEASON: process.env.ACTIVE_SEASON, // Current football season (e.g., "2024-25")
    nodeEnv: process.env.NODE_ENV,
    turnstile: {
      siteKey: process.env.TURNSTILE_SITE_KEY // Cloudflare Turnstile (bot protection)
    }
  }
}
```

**Usage**:
```typescript
const config = useRuntimeConfig();
const activeSeason = config.public.ACTIVE_SEASON;
```

---

## Path Import Pattern

Always use the `~/` alias for imports from `/app/`:

```typescript
import type { DraftedTeam } from '~/types/DraftedTeam';
import { useTeamBuilder } from '~/composables/useTeamBuilder';
import { createMockTeam } from '~/tests/factories';
```

---

## Known Issues & Gotchas

### Supabase Type Generation

**Issue**: Generated types are overwritten on each generation.

**Solution**:
- Never edit `app/types/database-generated.types.ts` directly
- Put custom types and overrides in `app/types/database.types.ts`
- Particularly important for views like `players_view` which need manual type refinement

### Testing watchEffect in Composables

**Issue**: In test environment, `watchEffect` may not automatically re-execute when dependencies change.

**Solution**: Use `triggerWatchEffects()` helper after updating reactive dependencies:

```typescript
const [result, app] = withSetup(() => useMyComposable());

// Update reactive dependency
result.dependency.value = newValue;

// Manually trigger watch effects
triggerWatchEffects();

// Now assertions on watchers will work correctly
expect(result.computedValue.value).toBe(expected);
```

---

## GitHub Workflow

This project uses GitHub Issues for all work tracking.

### Issue Templates

Templates in `.github/ISSUE_TEMPLATE/`:
- **bug-report.yml**: Bugs and unexpected behavior
- **feature-request.yml**: New features and enhancements
- **maintenance.yml**: Technical debt, dependencies, refactoring

### Label System

- **Type**: `bug`, `enhancement`, `maintenance`
- **Technical**: `dependencies`, `typescript`, `testing`

### Workflow Pattern

```
Idea → GitHub Issue → Branch → PR → Merge → Close Issue
```

**Key Practices**:
- All work tracked via issues for audit trail
- Link PRs with closing keywords (`Fixes #32`, `Closes #33`)
- Use appropriate template for issue type

**Creating Issues**:
```bash
gh issue create --title "[Type]: Description" --label "labels"
gh issue list
gh issue view 32
```

**Example Classifications**:
- **Bug**: Weekly statistics showing incorrect values
- **Enhancement**: Add weekly summary dashboard to homepage
- **Maintenance**: Update Supabase CLI to latest version

---

## Code Quality

Always run these after making changes:

```bash
pnpm lint      # Check for linting issues
pnpm typecheck # TypeScript strict mode validation
pnpm test      # Run test suite
```
