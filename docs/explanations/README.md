# Explanations

Understanding-oriented documentation: patterns, decisions, and lessons learned from developing this project.

> **For general code principles and philosophy**, see `~/.claude/CLAUDE.md`

## Organization

Explanations are organized by type:

### Patterns
Effective patterns and architectural approaches discovered in this codebase:
- **[Composable Architecture](patterns/composable-architecture.md)** - How to structure business logic
- **[Security Patterns](patterns/security-implementation-patterns.md)** - Security implementation approaches
- **[Vue Reactivity Patterns](patterns/vue-reactivity-patterns.md)** - Vue 3 reactivity best practices

### Refactors
Case studies of major refactoring work:
- **[Weekly Stats Architectural Refactor](refactors/weekly-stats-architectural-refactor.md)** - Lessons from large-scale refactor

### Decisions
Architectural Decision Records (ADRs) for significant choices:
- **[Composable vs Component Logic](decisions/2025-01-08-composable-vs-component-logic.md)** - Why business logic lives in composables

## Using These Explanations

Explanations answer "WHY?" questions:
- "Why did we choose this approach?"
- "What alternatives did we consider?"
- "What did we learn from this decision?"

These are **project-specific learnings**. For general principles, see `~/.claude/CLAUDE.md`.

## How to Read These Docs

**If you're...**
- **New to the project** → Read [Patterns](patterns/) to understand approaches
- **Making architectural decisions** → Check [Decisions](decisions/) for precedent
- **Debugging a complex issue** → Read [Patterns](patterns/) for similar problems
- **Learning from this project** → Read [Refactors](refactors/) for case studies

## Contributing New Explanations

When you discover a pattern or make a decision:

1. **Document the context** - When/why this applies
2. **Explain the approach** - How you solved it
3. **Note alternatives** - What didn't work and why
4. **Capture learnings** - What you'd do differently next time

See [CONTRIBUTING.md](../CONTRIBUTING.md) for documentation standards.

---

**Last updated:** 2025-11-09
