# Testing Guide

Testing in this project follows TDD (Test-Driven Development).

> **For TDD principles and workflow**, see `~/.claude/docs/workflow.md`
> **For testing patterns and factories**, see `~/.claude/docs/testing.md`
> **For TypeScript best practices in tests**, see `~/.claude/docs/typescript.md`

## Running Tests

### Commands

```bash
pnpm test                           # Run all tests once
pnpm test:watch                     # Watch mode (recommended while developing)
pnpm test:ui                        # Visual test UI (browser interface)
pnpm test app/tests/team-builder/   # Run specific directory
pnpm test -- --coverage             # Generate coverage report
```

## Test Structure in This Project

Tests are organized by feature:

```
app/tests/
├── setup.ts                    # Test utilities and helpers
├── factories/                  # Centralized test data
│   ├── index.ts                # Exports all factories
│   ├── teams.ts                # DraftedTeam factories
│   └── players.ts              # Player factories
├── team-builder/               # Feature tests
│   └── composables/            # Team builder composable tests
├── weekly-statistics/          # Feature tests
│   └── composables/            # Weekly stats composable tests
├── homepage-dashboard/         # Feature tests
│   └── composables/            # Dashboard composable tests
└── transfers/                  # Transfer functionality tests
```

**Pattern:** Tests are colocated with features, not in separate test files.

## Testing Composables in Nuxt

Composables must be tested within proper Vue context using the `withSetup` helper:

```typescript
import { withSetup } from '~/tests/setup';
import { useMyComposable } from '~/composables/useMyComposable';

describe('useMyComposable', () => {
  it('should update reactive value', () => {
    const [result, app] = withSetup(() => useMyComposable());

    // Test the composable
    expect(result.value.name).toBe('initial');

    // Update reactive state
    result.value.update('updated');
    expect(result.value.name).toBe('updated');

    // Always cleanup
    app.unmount();
  });
});
```

**Key points:**
- `withSetup()` wraps composable in proper Vue context
- Returns `[composable, app]` tuple
- Always call `app.unmount()` for cleanup

## Test Data Factories

All test data is created using centralized factories:

```typescript
import {
  createMockTeam,
  createMockPlayer
} from '~/tests/factories';

// Create with defaults
const team = createMockTeam();

// Override specific properties
const expensiveTeam = createMockTeam({
  budget: 50,  // Only partial overrides needed
  allowTransfers: true
});

const midfielderTen = createMockPlayer({
  position: 'MID',
  cost: 10
});
```

**Why factories?**
- Reusable across tests
- Change test data structure once, update everywhere
- Type-safe with `Partial<T>` overrides
- Centralized in `/app/tests/factories/`

## Project-Specific Test Gotchas

### watchEffect Not Triggering in Tests

**Issue:** `watchEffect` callbacks don't automatically re-execute when dependencies change in test environment.

**Solution:**

```typescript
import { withSetup, triggerWatchEffects } from '~/tests/setup';

const [result, app] = withSetup(() => useMyComposable());

// Update reactive dependency
result.dependency.value = newValue;

// Manually trigger watchers to re-execute
triggerWatchEffects();

// Now assertions on watched values work correctly
expect(result.computed.value).toBe(expected);

app.unmount();
```

This is a **Vitest + Nuxt environment quirk**. Always trigger manually when testing watchers.

### Supabase Type Generation

If you add new database columns, types won't update in tests until you:

```bash
pnpm generate-types
```

Then restart your test watcher.

### Test Data Validation

Factories should validate against real schemas:

```typescript
import { ProjectSchema, type Project } from '~/types/database.types';

const getMockProject = (overrides?: Partial<Project>): Project => {
  const data = {
    id: 'proj_123',
    name: 'Test Project',
    ...overrides
  };

  // Validate against real schema - catches test data bugs immediately
  return ProjectSchema.parse(data);
};
```

## Writing Tests in This Project

### Focus on Behavior, Not Implementation

```typescript
// ❌ BAD - Tests implementation
it('should call validateTeam function', () => {
  const spy = jest.spyOn(validator, 'validateTeam');
  createTeam(mockTeam);
  expect(spy).toHaveBeenCalled();
});

// ✅ GOOD - Tests behavior
it('should reject team with negative budget', () => {
  const invalidTeam = createMockTeam({ budget: -50 });
  const result = validateTeamData(invalidTeam);
  expect(result.success).toBe(false);
  expect(result.error.message).toContain('budget');
});
```

### Test Through Public API

```typescript
// ✅ GOOD - Tests through public interface
describe('Team Builder', () => {
  it('should allow adding valid players to team', () => {
    const [builder, app] = withSetup(() => useTeamBuilder());
    const player = createMockPlayer({ cost: 10 });

    builder.addPlayer(player);

    expect(builder.team.players).toContain(player);
    expect(builder.remainingBudget.value).toBe(75);  // 85 - 10

    app.unmount();
  });
});
```

### Use Factory Functions, Not beforeEach

```typescript
// ❌ BAD - Shared mutable state
let team: DraftedTeam;
beforeEach(() => {
  team = { id: '1', budget: 85 };  // Shared state!
});

// ✅ GOOD - Isolated, immutable
it('should process valid team', () => {
  const team = createMockTeam({ budget: 85 });
  const result = processTeam(team);
  expect(result.success).toBe(true);
});

it('should reject invalid team', () => {
  const team = createMockTeam({ budget: -50 });
  const result = processTeam(team);
  expect(result.success).toBe(false);
});
```

## Test Coverage

Aim for **100% behavior coverage** through business logic:

- Every code path is exercised
- Happy path and error cases tested
- Edge cases covered
- Refactoring is safe (tests catch breakage)

**Coverage-focused approach:**
- Tests document business behavior
- Coverage gaps reveal missing behavior documentation
- Don't create tests just for coverage - write tests that prevent bugs

## Debugging Tests

### Run Single Test File

```bash
pnpm test app/tests/team-builder/composables/useTeamBuilder.test.ts
```

### Run Single Test

```bash
# Use `.only` in test file
it.only('specific test', () => {
  // Only this test runs
});
```

### Debug in Browser

```bash
# Run tests with UI (can step through)
pnpm test:ui
```

### Console Logging in Tests

```typescript
describe('TeamBuilder', () => {
  it('should update team', () => {
    const [builder, app] = withSetup(() => useTeamBuilder());

    console.log('Initial team:', builder.team.value);
    builder.addPlayer(createMockPlayer());
    console.log('After add:', builder.team.value);

    expect(builder.team.players.length).toBe(1);
    app.unmount();
  });
});
```

Run with:
```bash
pnpm test:ui
# View console output in browser
```

## Common Test Failures & Solutions

### Import Errors with `~/`

**Error:** `Cannot find module '~/...'`

**Solution:**
1. Verify file exists at path
2. Check case sensitivity (Unix is case-sensitive)
3. Restart test watcher

### `withSetup` Not Found

**Error:** `Cannot find module '~/tests/setup'`

**Solution:**
- Ensure `app/tests/setup.ts` exists
- Import from correct path: `import { withSetup } from '~/tests/setup'`

### Tests Not Running

**Solution:**
1. Check vitest is installed: `pnpm list vitest`
2. Verify `vitest.config.ts` exists
3. Run: `pnpm test` (not `npm test`)

### Timeout Errors

**Solution:**
- Increase timeout for slow operations:
```typescript
it('slow operation', async () => {
  // test code
}, 10000);  // 10 second timeout
```

## Best Practices

1. **One concept per test** - Clear what's being tested
2. **Meaningful test names** - Describe the behavior being tested
3. **Isolated tests** - No dependencies between tests
4. **Fast tests** - Mock slow operations (API calls, etc.)
5. **Type-safe** - Full TypeScript types in tests
6. **No `any` types** - Tests should be as strict as production code

## See Also

- [Local Development Guide](local-development.md) - Running `pnpm test:watch`
- [Troubleshooting Guide](troubleshooting.md) - Common issues
- `~/.claude/docs/testing.md` - Testing principles and patterns
- `~/.claude/docs/workflow.md` - TDD workflow (RED-GREEN-REFACTOR)

---

**Last updated:** 2025-11-09
