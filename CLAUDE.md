# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Development Commands

- **Development server**: `pnpm dev` (runs with --host flag for network access)
- **Build**: `pnpm build`
- **Lint**: `pnpm lint` (check) or `pnpm lint:fix` (auto-fix)
- **Type checking**: `pnpm typecheck`
- **Testing**: `pnpm test` (run once), `pnpm test:watch` (watch mode), `pnpm test:ui` (visual interface)
- **Generate Supabase types**: `pnpm generate-types`

Always run lint and typecheck after making changes to ensure code quality.

## Architecture Overview

This is a Nuxt 3 fantasy football web application with the following key architectural components:

### Frontend Stack
- **Nuxt 3**: SSR disabled (SPA mode), TypeScript throughout
- **PrimeVue**: UI component library with custom theme (theme: 'none')
- **Tailwind CSS**: Utility-first styling with custom PrimeVue integration
- **Pinia**: State management with stores in `/stores/`

### Backend Integration
- **Supabase**: Backend-as-a-service for database, auth, and real-time features
- **Nitro server endpoints**: Located in `/server/api/` for email functionality via Resend

### Key Architectural Patterns

**Data Layer**:
- Supabase client integration via `@nuxtjs/supabase` module
- Type-safe database operations using generated types from `/types/database-generated.types.ts`
- Custom type overrides in `/types/database.types.ts` (especially for `players_view`)

**State Management**:
- Pinia stores for: account, draftedTeams, fixtures, players, table
- Composables in `/composables/` for reusable logic (filters, weekly statistics)

**Component Structure**:
- `/components/` organized by feature areas (Drafted/, Fixture/, Skeleton/, etc.)
- Modal components use a centralized Modal.vue with content injection
- Player/team data rendering with consistent patterns across components

**Routing & Auth**:
- File-based routing in `/pages/`
- Auth middleware in `/middleware/auth.ts`
- Supabase auth integration with redirect disabled

### Notable Implementation Details

- Database types are generated via Supabase CLI and extended locally
- Image assets organized in both `/assets/svg/` and `/public/` directories
- Custom PrimeVue theme implementation via CSS files in `/assets/styles/primevue/`
- Team builder functionality with email integration for admin notifications

## Test-Driven Development (TDD) Guidelines

### Testing Infrastructure

This project uses Vitest for behavior-driven testing with the following setup:

**Test Environment**:
- **Framework**: Vitest with Happy DOM environment
- **Location**: Tests in `/tests/` directory with feature-based organization
- **Mocking**: Global Supabase mocking and Nuxt composable mocks in `/tests/setup.ts`

**Global Mocks Configuration**:
```typescript
// Supabase client is globally mocked for controlled test responses
// Nuxt composables (useSupabaseClient, useRoute, useRouter) are mocked
// Vue reactivity (ref, computed, watchEffect, readonly) is mocked for test environment
```

### TDD Patterns Established

**Test Data Factories** (Located in `/tests/team-builder/fixtures/`):
- Use `Partial<T>` overrides for flexible test data creation
- Return complete objects with realistic defaults following real project schemas
- Compose factories for complex scenarios (e.g., `createMockTeamWithPlayers`)

**Behavior-Driven Testing Approach**:
- Test through public APIs only - composables as black boxes
- Focus on business behavior, not implementation details
- Use real project types, never redefine schemas in tests
- Organize tests by business behavior, not code structure

**Vue Composable Testing Patterns**:
```typescript
// Pattern for testing reactive composables:
1. Arrange: Set up test data using factories
2. Act: Update composable state via public interface
3. Trigger: Call triggerWatchEffects() to simulate reactivity
4. Assert: Verify expected business behavior
```

**Critical Discovery - watchEffect Handling**:
In the test environment, `watchEffect` doesn't automatically re-execute when dependencies change. Use the helper function `triggerWatchEffects()` to manually trigger updates after changing reactive dependencies.

### Test Organization Structure

```
tests/
├── setup.ts                    # Global mocks and test configuration
├── team-builder/
│   ├── composables/
│   │   └── useTeamBuilder.test.ts  # Behavior tests for business logic
│   └── fixtures/
│       ├── index.ts             # Central exports
│       ├── teams.ts             # DraftedTeam factory functions
│       └── players.ts           # DraftedTeamPlayer factory functions
```

### Successful TDD Implementation

**Phase 3 Achievement**: Established comprehensive TDD foundation for team builder with:
- ✅ 10 behavior-driven tests covering budget calculations
- ✅ Test data factories using real project schemas  
- ✅ Working Vitest configuration with proper mocking
- ✅ Documented patterns for future TDD development

**Test Coverage Areas**:
- Budget allocation logic (90 vs 85 based on transfer allowance)
- Team value calculation from selected players
- Over-budget detection and validation
- Remaining budget calculations

### TDD Best Practices for This Project

1. **Always Test Behavior**: Focus on what the composable should do, not how it does it
2. **Use Real Schemas**: Import types from `/types/`, never redefine in tests
3. **Manual Reactivity**: Call `triggerWatchEffects()` after updating reactive dependencies
4. **Factory Pattern**: Use consistent factory functions with partial overrides
5. **Single Responsibility**: One composable instance per test, fresh beforeEach

### Running Tests

```bash
pnpm test                        # Run all tests
pnpm test:watch                  # Watch mode for development
pnpm test tests/team-builder/    # Run specific test directory
```