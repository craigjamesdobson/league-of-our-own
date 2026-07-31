# Local Development

Daily development workflow and commands for this project.

> **For TDD principles and code style**, see `~/.claude/CLAUDE.md`
> **For general development guidelines**, see `~/.claude/docs/workflow.md`

## Development Server

Start the development server:

```bash
pnpm dev
```

The application runs at **http://localhost:3000** with `--host` flag for network access.

## Local Database Resets

Local resets never load a default SQL fixture. Choose one of the explicit
workflows instead.

### Empty database

```bash
pnpm db:reset:clean
```

This rebuilds the local database from migrations and creates no application or
Auth data.

### FPL-backed development database

```bash
pnpm db:reset:fpl
```

This rebuilds the local database, fetches the current official FPL clubs,
players and fixtures, then creates four dummy fantasy teams with valid squads,
weekly standings and lightweight transfer history. Fixtures start with blank
scores so the population and verification workflow remains testable.

Choose a different dummy-team count from 1 to 12 with:

```bash
pnpm db:reset:fpl --teams 8
```

The FPL reset creates two confirmed local-only users:

| Purpose | Email | Password |
| --- | --- | --- |
| Populate fixture data | `admin1@local.test` | `LocalAdmin1!2026` |
| Verify fixture data | `admin2@local.test` | `LocalAdmin2!2026` |

The seeder reads its connection details from `supabase status` and refuses any
Supabase API or database URL that is not a loopback address. It cannot seed a
linked staging or production project.

### Hot Reload Behavior

- **Vue components**: Instant HMR (hot module replacement)
- **Composables**: May require page refresh if you change reactive state structure
- **Stores (Pinia)**: Preserves state across HMR
- **Server endpoints**: Auto-restart on file changes

## Development Workflow

### 1. Create Feature Branch

```bash
git checkout -b feature/description-of-work
```

Use conventional branch names:
- `feature/team-builder-enhancement`
- `fix/type-error-in-drafting`
- `refactor/extract-shared-logic`

### 2. Make Changes (TDD)

**Follow TDD (see `~/.claude/docs/workflow.md`):**

1. **RED** - Write failing test
2. **GREEN** - Write minimum code to pass
3. **REFACTOR** - Improve if beneficial

```bash
# Watch tests while developing
pnpm test:watch
```

### 3. Quality Checks

Before committing, verify everything passes:

```bash
# Type checking
pnpm typecheck

# Code style
pnpm lint
pnpm lint:fix          # Auto-fix issues

# Tests
pnpm test

# Build (ensure production build works)
pnpm build
```

### 4. Commit

Use conventional commits:

```bash
git commit -m "feat: add team budget validation"
git commit -m "fix: correct weekly stats calculation"
git commit -m "refactor: extract filtering logic to composable"
```

### 5. Push and Create PR

```bash
git push origin feature/description-of-work
```

Then create a pull request on GitHub.

## Type Generation

When Supabase schema changes:

```bash
pnpm generate-types
```

This updates `app/types/database-generated.types.ts` with new types.

**Important:** Never edit `database-generated.types.ts` manually. For custom types and overrides, use `app/types/database.types.ts`.

See [Configuration Reference](../reference/configuration.md) for details.

## Useful Commands

```bash
# Development
pnpm dev                    # Start dev server
pnpm build                  # Production build
pnpm preview                # Preview production build

# Testing
pnpm test                   # Run all tests once
pnpm test:watch             # Watch mode (recommended while developing)
pnpm test:ui                # Vitest UI (visual interface)
pnpm test app/tests/team-builder/  # Run specific directory

# Code Quality
pnpm typecheck              # TypeScript strict mode check
pnpm lint                   # Check code style (ESLint)
pnpm lint:fix               # Auto-fix linting issues

# Types
pnpm generate-types         # Regenerate Supabase types from remote schema

# Info
pnpm list                   # List installed dependencies
pnpm why [package-name]     # Why package is installed
pnpm info [package-name]    # Package information
```

## IDE Setup (VS Code)

Recommended extensions:

- **Vue - Official** (Evan You) - Vue 3 support
- **Prettier** - Code formatting
- **ESLint** - Linting feedback
- **TypeScript Vue Plugin** - Vue + TypeScript
- **Vitest** - Test inline execution

### Recommended Settings

Add to `.vscode/settings.json`:

```json
{
  "editor.defaultFormatter": "esbenp.prettier-vscode",
  "editor.formatOnSave": true,
  "[typescript]": {
    "editor.defaultFormatter": "esbenp.prettier-vscode"
  },
  "[vue]": {
    "editor.defaultFormatter": "esbenp.prettier-vscode"
  }
}
```

## Debugging

### Browser DevTools

The Vue DevTools extension works with Vue 3:

- [Vue DevTools Browser Extension](https://devtools.vuejs.org/)

### Console Logging

```typescript
// In components
console.log('Debug info:', myVariable);

// In composables
console.log('State:', state.value);
```

### TypeScript Issues

If you see unexpected type errors:

1. Restart TypeScript server: `Cmd/Ctrl + Shift + P` → "TypeScript: Restart TS server"
2. Regenerate types: `pnpm generate-types`
3. Check `tsconfig.json` is correct

## Troubleshooting Development

### Types Not Updating

```bash
# Regenerate from Supabase
pnpm generate-types

# Restart TypeScript server in IDE
# Cmd/Ctrl + Shift + P → "TypeScript: Restart TS server"
```

### Import Errors with `~/` Alias

If you see `Cannot find module '~/...'`:

1. Check the file exists
2. Verify correct path (TypeScript is case-sensitive)
3. Restart TypeScript server

### Module Not Found Errors

```bash
# Reinstall dependencies
rm -rf node_modules
pnpm install
pnpm dev
```

### Hot Reload Not Working

1. Check no TypeScript errors
2. Try page refresh (F5)
3. Restart dev server: `pnpm dev`

## Performance Considerations

### Development Mode

Development mode prioritizes speed over optimization:
- Source maps enabled
- Minimal optimization
- Fast rebuilds

This means performance will differ from production. For performance testing, use `pnpm build && pnpm preview`.

### Test Performance

If tests are slow:

```bash
# Run tests in parallel (default)
pnpm test

# Run tests serially (slower but better for isolated debugging)
pnpm test -- --no-coverage
```

## Git Workflow

### Before Creating PR

1. Ensure branch is up-to-date: `git pull origin main`
2. Run all checks: `pnpm typecheck && pnpm lint && pnpm test`
3. Commit with meaningful messages

### Sync with Main

```bash
git fetch origin
git rebase origin/main
# Or merge if rebase causes issues:
git merge origin/main
```

### Undo Changes

```bash
# Undo uncommitted changes
git checkout -- app/

# Undo last commit (keep changes)
git reset --soft HEAD~1

# Undo last commit (discard changes)
git reset --hard HEAD~1
```

---

**Last updated:** 2026-07-25
