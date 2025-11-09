# Troubleshooting

Common issues and solutions for this project.

## Development Issues

### TypeScript Errors After Setup

**Problem:** TypeScript errors appear after `pnpm install` or environment changes.

**Solution:**
1. Regenerate types from Supabase:
   ```bash
   pnpm generate-types
   ```

2. Restart TypeScript server in IDE:
   - VS Code: `Cmd/Ctrl + Shift + P` → Type "TypeScript: Restart TS Server"

3. Check `tsconfig.json` extends Nuxt config properly

4. Clear type cache:
   ```bash
   rm -rf node_modules/.vite
   pnpm dev
   ```

### Import Errors with `~/` Alias

**Problem:** `Cannot find module '~/composables/...'`

**Solution:**
1. Verify file exists at the path (check case sensitivity)
2. Verify path starts from `/app/` (not `/src/`)
3. Ensure `nuxt.config.ts` has alias configured
4. Restart TypeScript server

### Module Not Found Errors

**Problem:** `Error: Cannot find module 'package-name'`

**Solution:**
```bash
# Reinstall dependencies
rm -rf node_modules pnpm-lock.yaml
pnpm install
pnpm dev
```

### Supabase Type Generation Issues

**Problem:** `pnpm generate-types` fails or types are outdated.

**Cause:** Generated types are overwritten on each generation. Manual overrides go in wrong file.

**Solution:**
- **Never edit** `app/types/database-generated.types.ts`
- **Always edit** `app/types/database.types.ts` for custom types and overrides
- After schema changes, regenerate: `pnpm generate-types`

**Example:**
```typescript
// ❌ app/types/database-generated.types.ts (AUTO-GENERATED - DON'T EDIT)
// Will be overwritten on pnpm generate-types

// ✅ app/types/database.types.ts (SAFE - YOUR OVERRIDES)
import type { Database as GeneratedDatabase } from './database-generated.types';

// Custom type for a view
type PlayersView = GeneratedDatabase['public']['Views']['players_view']['Row'];

export type Database = GeneratedDatabase & {
  // Your custom types
};
```

## Testing Issues

### watchEffect Not Triggering in Tests

**Problem:** Assertions on values watched by `watchEffect` fail.

**Cause:** Nuxt test environment doesn't auto-trigger watchers when reactive values change.

**Solution:**
```typescript
import { withSetup, triggerWatchEffects } from '~/tests/setup';

describe('MyComposable', () => {
  it('should watch value changes', () => {
    const [result, app] = withSetup(() => useMyComposable());

    // Update reactive value
    result.dependency.value = newValue;

    // REQUIRED: Manually trigger watchers
    triggerWatchEffects();

    // Now assertions work
    expect(result.computed.value).toBe(expected);

    app.unmount();
  });
});
```

This is a **Vitest + Nuxt environment** behavior. Always manually trigger after state changes in tests.

### Tests Failing After Database Changes

**Problem:** Tests fail after schema changes, even with correct mocks.

**Solution:**
1. Regenerate types: `pnpm generate-types`
2. Update test factories to match new schema
3. Validate factory output: `SomeSchema.parse(factoryOutput)`
4. Restart test watcher: `pnpm test:watch`

### Test Factories Producing Invalid Data

**Problem:** Tests pass but crash in development.

**Solution:** Validate test factory output against real schemas:

```typescript
import { TeamSchema, type DraftedTeam } from '~/types';

const createMockTeam = (overrides?: Partial<DraftedTeam>): DraftedTeam => {
  const data = {
    id: 'team_123',
    name: 'Test Team',
    budget: 85,
    ...overrides
  };

  // Catches data errors immediately
  return TeamSchema.parse(data);
};
```

### Tests Timing Out

**Problem:** `Timeout: test did not complete within 5000ms`

**Solution:**
1. Increase timeout for slow tests:
   ```typescript
   it('slow operation', () => {
     // test
   }, 10000);  // 10 second timeout
   ```

2. Check for infinite loops in test code
3. Mock slow operations (API calls)

### Port Already in Use

**Problem:** `Port 3000 is already in use` (from `pnpm dev` or `pnpm test:ui`)

**Solution:**
```bash
# Option 1: Kill the process
lsof -i :3000  # Find process
kill -9 <PID>  # Kill it

# Option 2: Use different port
pnpm dev -- --port 3001
```

## Build Issues

### Build Fails

**Problem:** `pnpm build` exits with errors.

**Solution:**

1. **Check TypeScript errors:**
   ```bash
   pnpm typecheck
   ```

2. **Check for import errors:**
   ```bash
   pnpm lint
   ```

3. **Clear build cache:**
   ```bash
   rm -rf .nuxt dist
   pnpm build
   ```

4. **Verify all dependencies:**
   ```bash
   pnpm install
   pnpm build
   ```

### Build Size Too Large

**Problem:** `.output/public/` is larger than expected.

**Solution:**
1. Check for unused dependencies
2. Ensure minification is enabled (production build)
3. Check for large imports in code

## Performance Issues

### Dev Server Is Slow

**Problem:** Dev server takes >5 seconds to start or HMR is slow.

**Solution:**
1. Check for TypeScript errors (slow to compile)
2. Reduce watched files:
   ```bash
   pnpm dev -- --force  # Force restart
   ```

3. Check for large components or computations
4. Monitor CPU usage (may indicate compilation bottleneck)

### Tests Are Slow

**Problem:** `pnpm test:watch` takes long to run all tests.

**Solution:**
1. Run specific test file:
   ```bash
   pnpm test app/tests/specific-feature/
   ```

2. Use `.only` to run single test
3. Check for slow operations in tests (mocks should be instant)
4. Monitor test output for slow tests

## Deployment Issues

### Build Succeeds Locally but Fails on Platform

**Problem:** `pnpm build` works on your machine but fails on Vercel/Netlify/etc.

**Solution:**
1. Check Node version matches platform
2. Verify all environment variables are set on platform
3. Check build logs for specific errors
4. Try exact platform commands locally

### Application Loads but Shows Errors

**Problem:** Site loads but shows console errors.

**Solution:**
1. Open browser DevTools (F12)
2. Check Console tab for errors
3. Check Network tab for failed requests
4. Verify environment variables in `useRuntimeConfig()`

### Supabase Connection Fails in Production

**Problem:** Application works locally but can't connect to Supabase in production.

**Solution:**
1. Verify `SUPABASE_URL` is correct production URL
2. Verify `SUPABASE_KEY` is production anon key
3. Check if CORS is allowing your domain
4. Verify Row Level Security (RLS) policies allow the operation
5. Check Supabase project status/quotas

### Blank Page or 404 Errors

**Problem:** Site shows blank page or 404 after deployment.

**Solution:**
1. Check build output deployed correctly (`.output/public/`)
2. Verify base path in `nuxt.config.ts` if deploying to subdirectory
3. Configure SPA routing (serve `index.html` for all routes)
4. Check web server logs for errors

## Database Issues

### Database Restore Failed

See [Database Restore Guide](database-restore.md) for detailed troubleshooting.

### Row Level Security (RLS) Blocking Queries

**Problem:** Get 403 Forbidden errors from Supabase queries.

**Cause:** RLS policies don't allow authenticated user.

**Solution:**
1. Check RLS policies in Supabase dashboard
2. Verify user is authenticated: `useSupabaseUser()`
3. Check policy conditions match actual data
4. Temporarily disable RLS to verify (then re-enable with correct policy)

## Environment Issues

### Wrong Environment Variables Loading

**Problem:** Using development keys/URLs in production (or vice versa).

**Solution:**
1. Verify `.env.local` for local development
2. For deployment, use platform's environment variable settings
3. Never commit `.env` files with secrets
4. Test with `useRuntimeConfig()`:
   ```typescript
   const config = useRuntimeConfig();
   console.log('Supabase URL:', config.public.SUPABASE_URL);  // Verify correct URL
   ```

## Browser/Client Issues

### Hot Reload Not Working

**Problem:** Changes don't reflect in browser immediately.

**Solution:**
1. Verify dev server is running
2. Check browser console for errors
3. Try page refresh (F5)
4. Restart dev server

### Local Storage Issues

**Problem:** Application state persists unexpectedly or doesn't persist.

**Cause:** Browser storage, localStorage, or session storage issues.

**Solution:**
1. Clear browser cache: `Ctrl + Shift + Delete`
2. Check browser console for storage errors
3. Verify localStorage/sessionStorage usage in code

## Getting More Help

If you can't find your issue:

1. **Check the full documentation:**
   - [Architecture Reference](../reference/architecture.md)
   - [Configuration Reference](../reference/configuration.md)
   - [Testing Guide](testing.md)

2. **Review similar issues:**
   - Search GitHub issues
   - Check completed work in [project history](../project-management/completed.md)

3. **Check project learnings:**
   - [Explanations and Patterns](../explanations/)
   - [Nuxt 4 Migration Details](../migrations/nuxt-4-migration.md)

4. **General resources:**
   - `~/.claude/CLAUDE.md` - Development standards
   - [Nuxt Documentation](https://nuxt.com)
   - [Vue Documentation](https://vuejs.org)
   - [Supabase Documentation](https://supabase.com/docs)

---

**Last updated:** 2025-11-09
