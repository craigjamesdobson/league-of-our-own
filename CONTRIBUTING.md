# Contributing to Documentation

Standards and guidelines for documentation contributions.

## When to Update Documentation

Update documentation when you:

- ✅ Complete any development task
- ✅ Discover a new pattern or gotcha
- ✅ Make an architectural decision
- ✅ Add a new feature or component
- ✅ Fix a complex bug
- ✅ Update dependencies or tools

**Timing:** Update documentation as part of the PR or task, not later.

## Documentation Standards

### File Naming

Use **kebab-case** for all files:

```
✅ CORRECT:
- getting-started.md
- local-development.md
- composable-architecture.md
- nuxt-4-migration.md

❌ WRONG:
- GettingStarted.md
- Local_Development.md
- composableArchitecture.md
```

### Date Format

Use **ISO 8601 format** consistently: `YYYY-MM-DD`

```markdown
**Last updated:** 2025-11-09

✅ CORRECT
❌ WRONG: Last updated: Nov 9, 2025
❌ WRONG: Last updated: 2025-07-25 (future date)
```

Update the date whenever you edit a file.

### Directory Structure

Documentation is organized by **purpose**, not alphabetically:

```
docs/
├── guides/                 # How-to documentation
├── reference/             # Technical specifications
├── explanations/          # Understanding and decisions
├── migrations/            # Version upgrades
└── project-management/    # Sprint tracking
```

Place new docs in the appropriate directory.

### References to Global Documentation

Always reference global `~/.claude/CLAUDE.md` instead of duplicating:

```markdown
❌ DON'T duplicate:
> For TDD workflow, you should:
> 1. Write a failing test
> 2. Write minimum code
> 3. Refactor
> (500 lines of duplication)

✅ DO reference:
> **For TDD principles**, see `~/.claude/docs/workflow.md`

Then add PROJECT-SPECIFIC content:
## Testing in This Project
- Run with: `pnpm test:watch`
- Tests are in: `app/tests/`
```

### Status Indicators

Use consistent symbols:

- **✅** Complete / Implemented
- **🔄** In Progress
- **📋** Planned / Pending
- **❌** Blocked / Not Working
- **⚠️** Warning / Important

Example:
```markdown
✅ Feature: Authentication - Completed 2025-11-01
🔄 Enhancement: Performance optimization - In progress
📋 Bug: Date parsing issue - Planned
```

## Document Structure Template

New documents should follow this structure:

```markdown
# Document Title

One-line description of what this document covers.

> **For related global principles**, see `~/.claude/CLAUDE.md` or specific global doc

## Overview

What is this about? When would you read this?

## Key Concepts

Core ideas explained (if applicable).

## How To / Details

Step-by-step instructions or detailed information.

### Subsection

Organize into logical subsections.

## Examples

Real code examples from THIS project.

## See Also

Links to related documentation:
- [Related Guide](guides/example.md)
- [Related Reference](reference/example.md)
- `~/.claude/docs/example.md` - Global principle

---

**Last updated:** YYYY-MM-DD
```

## Specific Guidelines by Document Type

### Guides (How-To)

**Purpose:** Solve a problem in THIS project

**Structure:**
1. Problem statement
2. Prerequisites
3. Step-by-step instructions
4. Verification/confirmation
5. Troubleshooting (if applicable)

**Example:**
```markdown
# Database Restore

Restore database from backup.

> **For Supabase documentation**, see supabase.com/docs

## Before You Start

- Backup current database
- Have S3 credentials
- Check disk space (> 5GB)

## Step 1: Download Backup
...

## Step 2: Restore Data
...

## Verify Restoration
...

## Troubleshooting

### Restore Fails with "Permission Denied"
...
```

### Reference (Technical Specs)

**Purpose:** Document facts about THIS project

**Structure:**
1. What is this?
2. Key properties/specifications
3. Configuration details
4. Examples

**Example:**
```markdown
# Configuration Reference

Configuration and environment setup for this project.

## Environment Variables

### ACTIVE_SEASON

**Type:** String
**Format:** YYYY-YY
**Example:** 2024-25
**Purpose:** Current fantasy season

...
```

### Explanations (Understanding)

**Purpose:** Explain WHY decisions were made

**Structure:**
1. Context - When/why this applies
2. The approach - What we chose
3. Alternatives - What we considered
4. Trade-offs - What we gain/lose
5. Learnings - What we'd do differently

**Example:**
```markdown
# Composable vs Component Logic

**Context:** How to organize business logic in Vue components

**Approach Chosen:** Extract business logic to composables

**Alternatives Considered:**
- Keep logic in component
- Use Vuex/Pinia stores

**Trade-offs:**
- ✅ Testable
- ✅ Reusable
- ❌ More files
- ❌ Harder to follow data flow

**Learnings:**
- Composables made testing easier
- ...
```

## Code Examples

### Formatting

Use proper syntax highlighting:

```typescript
// TypeScript code
const myFunction = () => {
  // code
};
```

```bash
# Bash commands
pnpm install
pnpm dev
```

```vue
<!-- Vue code -->
<template>
  <button @click="count++">Count: {{ count }}</button>
</template>

<script setup lang="ts">
import { ref } from 'vue';
const count = ref(0);
</script>
```

### Real Project Examples

Always use actual examples from THIS project:

```typescript
// ✅ GOOD - From actual codebase
import { useTeamBuilder } from '~/composables/useTeamBuilder';

// ❌ BAD - Generic/made-up example
import { useMyComposable } from '~/composables/useMyComposable';
```

Show actual file paths from this codebase:

```typescript
// ✅ GOOD
app/components/Common/Button.vue
app/tests/factories/teams.ts
~/types/database.types.ts

// ❌ BAD
src/components/Button.vue
test/factories/teams.ts
types/database.ts
```

## Internal Links

Use relative paths in links:

```markdown
✅ CORRECT:
- See [Local Development](guides/local-development.md)
- Check [Architecture](reference/architecture.md)
- From [Troubleshooting](guides/troubleshooting.md#database-issues)

❌ WRONG:
- See /docs/guides/local-development.md
- Check http://example.com/docs/architecture
```

### Linking to Global Docs

Reference global docs with path notation (can't click but clear):

```markdown
**For TDD workflow**, see `~/.claude/docs/workflow.md`
**For testing patterns**, see `~/.claude/docs/testing.md`
**For code style**, see `~/.claude/docs/code-style.md`
```

## Naming Conventions

### Document Names

Be descriptive:

```
✅ GOOD:
- local-development.md (What? Local development)
- composable-architecture.md (What? Composable architecture)
- nuxt-4-migration.md (What? Nuxt 4 migration)

❌ BAD:
- dev.md (Vague)
- arch.md (Abbreviation)
- upgrade.md (Too generic)
```

### Section Headings

Use clear, descriptive headings:

```markdown
✅ GOOD:
## Testing Composables in Nuxt
## watchEffect Not Triggering in Tests
## Build Fails with TypeScript Errors

❌ BAD:
## Details
## Issues
## Advanced Topics
```

## Review Process

### Self-Review Checklist

Before committing documentation:

- [ ] Date is current (`YYYY-MM-DD`)
- [ ] No spelling or grammar errors
- [ ] All internal links work
- [ ] Code examples are from THIS project
- [ ] References to global docs instead of duplicating
- [ ] No references to outdated tools/versions
- [ ] Consistent with other documentation
- [ ] No huge walls of text (break into sections)
- [ ] Examples are complete/runnable

### What NOT to Document

❌ Don't document:
- Generic software principles (→ belongs in `~/.claude/`)
- Third-party tool details (→ link to official docs)
- Historical decisions no longer relevant (→ archive or delete)
- Implementation details that change frequently (→ keep in code)

## Common Mistakes to Avoid

### ❌ Duplicating Global Documentation

```markdown
WRONG:
## TDD Workflow
1. Write failing test
2. Write minimum code
3. Refactor
(500 lines duplicating ~/.claude/docs/workflow.md)

CORRECT:
> **For TDD principles**, see `~/.claude/docs/workflow.md`

## Testing in This Project
- Run: `pnpm test:watch`
- Tests location: `app/tests/`
```

### ❌ Using Wrong Directory

```
WRONG:
- docs/testing-patterns.md (This is project-specific, belongs in explanations/)
- docs/how-to-build.md (This is a guide, belongs in guides/)

CORRECT:
- docs/explanations/patterns/testing-patterns.md
- docs/guides/build-guide.md
```

### ❌ Outdated Information

```markdown
WRONG:
**Last updated:** 2025-07-25 (Future date!)
Nuxt 3.17.6 (Project is on Nuxt 4!)
TypeScript configuration uses...

CORRECT:
**Last updated:** 2025-11-09 (Today's date)
Nuxt 4 with `/app/` directory structure
TypeScript strict mode with...
```

### ❌ No Project-Specific Context

```markdown
WRONG:
Follow TDD:
1. Write test
2. Write code
3. Refactor

CORRECT:
## Testing in This Project
For TDD principles, see `~/.claude/docs/workflow.md`

In THIS project:
- Run `pnpm test:watch` for watch mode
- Tests are in `app/tests/`
- Use `withSetup()` helper for composables
```

## Questions?

If unsure:
- Check similar documents for style
- Reference [Documentation Standard Examples](#documentation-standards)
- Ask in PR review

---

**Last updated:** 2025-11-09
