# League of Our Own - Documentation

**Fantasy Football Application - Technical Documentation**

> **For development standards, TDD workflow, and code style**, see `~/.claude/CLAUDE.md`

---

## Quick Start

**New to this project?**
1. Read [Getting Started](getting-started.md) - Set up locally
2. Review [Architecture](reference/architecture.md) - Understand the system
3. Check [Local Development](guides/local-development.md) - Daily workflow

---

## Documentation by Purpose

### 📘 **Guides** - How-To Documentation
**Solve problems in this project**

- [Getting Started](getting-started.md) - Initial setup and first run
- [Local Development](guides/local-development.md) - Daily development workflow
- [Database Restore](guides/database-restore.md) - Restore from backup
- [Deployment](guides/deployment.md) - Production deployment
- [Testing](guides/testing.md) - Test structure and running tests
- [Troubleshooting](guides/troubleshooting.md) - Common issues and solutions

→ **Full guide index:** [Guides](guides/)

### 📕 **Reference** - Technical Specifications
**Facts about this project's architecture**

- [Architecture](reference/architecture.md) - System design and tech stack
- [Database Schema](reference/database.md) - Tables, views, and relationships
- [Configuration](reference/configuration.md) - Environment variables and setup
- [API Endpoints](reference/api/) - Server-side endpoints

→ **Full reference index:** [Reference](reference/)

### 📗 **Explanations** - Understanding & Decisions
**Why decisions were made and what we learned**

- [Patterns](explanations/patterns/) - Effective approaches in this codebase
- [Refactors](explanations/refactors/) - Case studies of major work
- [Decisions](explanations/decisions/) - Architectural decision records

→ **Full explanations index:** [Explanations](explanations/)

### 🔧 **Migrations** - Version Upgrades
**Time-bound procedures for major upgrades**

- [Nuxt 4 Migration](migrations/nuxt-4-migration.md) - Upgrade from Nuxt 3 to Nuxt 4

→ **Full migrations index:** [Migrations](migrations/)

### 📊 **Project Management** - Sprint Tracking
**Work history and current status**

- [Current Sprint](project-management/current-sprint.md) - Active work
- [Backlog](project-management/backlog.md) - Planned work
- [Completed Work](project-management/completed.md) - Historical records

→ **Full project management index:** [Project Management](project-management/)

---

## Finding What You Need

### 🚀 **For Planning or Starting Work**
1. Check [Current Sprint](project-management/current-sprint.md) - What's in progress?
2. Review [Backlog](project-management/backlog.md) - What's planned?
3. Read [Architecture](reference/architecture.md) - How should I structure this?

### 🔍 **For Understanding the System**
1. Start with [Architecture](reference/architecture.md) - Overall design
2. Review [Database Schema](reference/database.md) - Data structure
3. Check [Patterns](explanations/patterns/) - How things are done

### 🐛 **For Debugging Issues**
1. See [Troubleshooting](guides/troubleshooting.md) - Common problems
2. Check [Patterns](explanations/patterns/) - Similar problems solved before
3. Review [Completed Work](project-management/completed.md) - How similar bugs were fixed

### 🛠️ **For Implementation**
1. Read [Local Development](guides/local-development.md) - How to work locally
2. Check [Testing](guides/testing.md) - How to write tests
3. Review [Decisions](explanations/decisions/) - Why we chose this approach

### 🚢 **For Deployment**
1. Read [Deployment Guide](guides/deployment.md) - Step-by-step
2. Check [Configuration](reference/configuration.md) - Environment setup
3. See [Troubleshooting](guides/troubleshooting.md) - Deployment issues

---

## Project Overview

### **Technology Stack**
- **Framework:** Nuxt 4 (Vue 3, TypeScript)
- **Styling:** Tailwind CSS + PrimeVue
- **Backend:** Supabase (PostgreSQL)
- **Testing:** Vitest + Vue Test Utils
- **Deployment:** SPA mode (static hosting)

### **Development Approach**
- **TDD:** Test-driven development (RED-GREEN-REFACTOR)
- **Type Safety:** TypeScript strict mode, no `any` types
- **Code Quality:** Immutable data, pure functions, comprehensive testing
- **Documentation:** All decisions and learnings captured

### **Application Status**
- **Established:** 1989/1990 fantasy football league
- **Users:** Friends/family league (trusted, private)
- **Development:** Incremental improvements maintaining stability

---

## Contributing Documentation

New documentation? Follow these standards:

- **File naming:** Use kebab-case (`my-document.md`)
- **Date format:** ISO 8601 (`YYYY-MM-DD`)
- **Directory:** Place in guides/, reference/, or explanations/
- **References:** Link to `~/.claude/` instead of duplicating global principles

Full guidelines in [CONTRIBUTING.md](../CONTRIBUTING.md)

---

## Key Concepts

### **TDD (Test-Driven Development)**
All business logic is written following RED-GREEN-REFACTOR:
1. **RED** - Write failing test
2. **GREEN** - Write minimum code to pass
3. **REFACTOR** - Improve if beneficial

See `~/.claude/docs/workflow.md` for principles.

### **Type Safety**
- Strict TypeScript mode enabled
- No `any` types
- Type-first development
- Generated types from Supabase schema

See `~/.claude/docs/typescript.md` for guidelines.

### **Composables**
Business logic extracted to reusable composables for:
- Testability
- Reusability
- Separation of concerns

See [Composable Architecture](explanations/patterns/composable-architecture.md).

---

## Recent Work

### ✅ **Completed (2025)**
- Full documentation restructure (Divio-inspired)
- Nuxt 4 migration (complete)
- Type system automation
- TDD infrastructure setup
- Security integration (Cloudflare Turnstile)

### 🔄 **In Progress**
- Performance optimization
- Advanced filtering
- Enhanced reporting

See [Project Management](project-management/) for full history.

---

## Getting Help

### **Documentation**
- Can't find what you need? Check [Guides](guides/) → [Troubleshooting](guides/troubleshooting.md)
- Want to understand why? Check [Explanations](explanations/)
- Need technical details? Check [Reference](reference/)

### **Development Standards**
- See `~/.claude/CLAUDE.md` for:
  - Code style and conventions
  - Testing philosophy
  - TypeScript guidelines
  - TDD workflow

### **External Resources**
- [Nuxt Documentation](https://nuxt.com)
- [Vue 3 Documentation](https://vuejs.org)
- [Supabase Documentation](https://supabase.com/docs)
- [Tailwind CSS](https://tailwindcss.com)

---

**Last updated:** 2025-11-09

*This documentation supports systematic improvement of a working application. Navigate by purpose using the sections above.*
