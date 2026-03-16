# Nuxt 4 Migration

**Status**: ✅ Completed
**Branch**: `upgrade/nuxt-4-migration`
**Started**: 2025-11-09
**Completed**: 2025-11-15

## Overview

Migration from Nuxt 3 (v3.17.6) to Nuxt 4 (v4.1.2), including directory structure updates, breaking changes, and compatibility considerations.

## Key Changes

### Directory Structure

The most significant change in Nuxt 4 is the new `/app/` directory convention for all application code:

**Before (Nuxt 3):**
```
league-of-our-own/
├── assets/
├── components/
├── composables/
├── pages/
├── stores/
├── types/
└── utils/
```

**After (Nuxt 4):**
```
league-of-our-own/
├── app/                   # All application code
│   ├── assets/
│   ├── components/
│   ├── composables/
│   ├── layouts/
│   ├── middleware/
│   ├── pages/
│   ├── stores/
│   ├── tests/
│   ├── types/
│   └── utils/
├── server/                # Server endpoints (unchanged)
└── supabase/              # Database config (unchanged)
```

### Import Path Updates

With the `/app/` directory structure, all internal imports now use the `~/` alias:

```typescript
// All imports reference the /app/ directory
import type { DraftedTeam } from '~/types/DraftedTeam';
import { useTeamBuilder } from '~/composables/useTeamBuilder';
import { createMockTeam } from '~/tests/factories';
```

The `~/` alias automatically resolves to `/app/` in Nuxt 4.

### Breaking Changes Encountered

#### 1. Test Environment Configuration

**Issue**: Vitest configuration needed updates for Nuxt 4 compatibility.

**Resolution**: Updated `vitest.config.ts` to use `environment: 'nuxt'` via `@nuxt/test-utils`.

#### 2. Auto-Import Behavior

**Issue**: Some auto-imports behaved differently in Nuxt 4.

**Resolution**: Explicitly verified all auto-imported components and composables. No changes required, but awareness needed.

#### 3. File-Based Routing

**Issue**: Route paths unchanged but now in `/app/pages/` instead of `/pages/`.

**Resolution**: Simple directory move - routing behavior unchanged.

### Dependencies Updated

All dependencies verified compatible with Nuxt 4:
- ✅ PrimeVue (v4.2.5) - Compatible
- ✅ Pinia (v2.3.0) - Compatible
- ✅ Supabase (v2.47.10) - Compatible
- ✅ Tailwind CSS (v3.4.17) - Compatible
- ✅ Vitest (latest) - Compatible with Nuxt environment
- ✅ @nuxt/test-utils - Updated for Nuxt 4

### Migration Checklist

- [x] Update nuxt.config.ts for Nuxt 4 compatibility
- [x] Move application code to `/app/` directory
- [x] Verify all dependencies compatible with Nuxt 4
- [x] Update import paths to use `~/` alias
- [x] Update test configuration for Nuxt environment
- [x] Test all features in new structure
- [x] Update documentation and examples
- [x] Verify TypeScript strict mode compliance
- [x] Run full test suite
- [x] Update CLAUDE.md with Nuxt 4 patterns

## Progress Log

### 2025-11-09: Migration Started
- Created migration branch
- Reviewed Nuxt 4 documentation
- Planned directory restructure

### 2025-11-10 - 2025-11-14: Implementation
- Moved all application code to `/app/` directory
- Updated nuxt.config.ts configuration
- Verified all imports using `~/` alias
- Updated test configuration
- Tested all features

### 2025-11-15: Migration Completed
- All tests passing
- All features verified working
- Documentation updated
- Branch ready for merge

## Lessons Learned

### What Went Well
- ✅ **Smooth Migration**: Nuxt 4 migration was relatively straightforward
- ✅ **Directory Structure**: The `/app/` convention provides better organization
- ✅ **Auto-Imports**: Continued to work seamlessly after directory move
- ✅ **TypeScript**: No type-related issues encountered

### Challenges
- ⚠️ **Test Environment**: Required explicit configuration for Nuxt environment in Vitest
- ⚠️ **Documentation Updates**: Multiple docs needed updates to reflect new structure

### Recommendations
1. **Future Migrations**: Always create migration-specific branch
2. **Testing**: Verify test environment configuration early in migration
3. **Documentation**: Update all docs immediately after structural changes
4. **Import Paths**: Use `~/` alias consistently for future-proofing

## Related Documentation

- [Architecture Reference](../reference/architecture.md) - Updated with Nuxt 4 structure
- [Testing Guide](../guides/testing.md) - Nuxt environment configuration
- [CLAUDE.md](../../CLAUDE.md) - Project-specific Nuxt 4 patterns

---

See [Migrations README](README.md) for context on this documentation type.
