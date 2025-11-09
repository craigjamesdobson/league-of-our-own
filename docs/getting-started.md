# Getting Started

Welcome to League of Our Own! This guide walks you through setting up the project locally.

> **For TDD workflow and code standards**, see `~/.claude/CLAUDE.md`

## Prerequisites

Before you begin, ensure you have:

- **Node.js** 20 or higher
- **pnpm** 8 or higher (see [pnpm documentation](https://pnpm.io/installation))
- **Git** for version control
- **Supabase account** (free tier available at [supabase.com](https://supabase.com))

## 1. Clone the Repository

```bash
git clone <repository-url>
cd league-of-our-own
```

## 2. Install Dependencies

```bash
pnpm install
```

This installs all dependencies listed in `package.json` and creates a `pnpm-lock.yaml` file.

## 3. Set Up Environment Variables

Copy the example environment file and configure it:

```bash
cp .env.example .env.local
```

**Required environment variables:**

```env
# Supabase Configuration
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_KEY=your_anon_key

# Application Configuration
ACTIVE_SEASON=2024-25
SITE_URL=http://localhost:3000

# Security (optional for local development)
TURNSTILE_SITE_KEY=your_turnstile_site_key
```

**Where to find Supabase credentials:**
1. Log in to [supabase.com](https://supabase.com)
2. Select your project
3. Go to Settings > API
4. Copy `Project URL` and `anon public key`

## 4. Generate Supabase Types

Generate TypeScript types from your Supabase schema:

```bash
pnpm generate-types
```

This creates `app/types/database-generated.types.ts` with type definitions for your database.

## 5. Start the Development Server

```bash
pnpm dev
```

The application starts at **http://localhost:3000**

You should see:
- No TypeScript errors
- Page loads without errors
- You can navigate to the login page

## 6. Verify Setup

Run the test suite to ensure everything is working:

```bash
pnpm test
```

All tests should pass. If any fail, check:
- Environment variables are set correctly
- Supabase is accessible
- All dependencies installed (`pnpm install`)

## Next Steps

### For Development
- Read [Local Development Guide](guides/local-development.md) - Daily workflow and commands
- Check [Testing Guide](guides/testing.md) - Writing and running tests
- Review [Architecture Overview](reference/architecture.md) - How the application is structured

### For Deployment
- See [Deployment Guide](guides/deployment.md) - Production deployment steps

### Troubleshooting
- See [Troubleshooting Guide](guides/troubleshooting.md) - Common issues and solutions

## Project Structure

Quick overview of where things are:

```
app/                       # Application source code (Nuxt 4 convention)
├── components/            # Vue components organized by feature
├── composables/           # Reusable Vue composition functions
├── stores/                # Pinia state management
├── pages/                 # File-based routing
├── types/                 # TypeScript type definitions
├── tests/                 # Test files
├── utils/                 # Utility functions
└── assets/                # Styles, SVGs, images

server/                     # Backend (Nitro)
├── api/                   # Server endpoints

docs/                      # Documentation (you are here)

package.json               # Dependencies and scripts
nuxt.config.ts             # Nuxt configuration
vitest.config.ts           # Testing configuration
```

## Useful Commands

```bash
# Development
pnpm dev                    # Start dev server
pnpm build                  # Production build
pnpm preview                # Preview production build

# Testing
pnpm test                   # Run tests once
pnpm test:watch             # Watch mode
pnpm test:ui                # Visual test interface

# Code Quality
pnpm typecheck              # TypeScript validation
pnpm lint                   # Check code style
pnpm lint:fix               # Auto-fix linting issues

# Types
pnpm generate-types         # Regenerate Supabase types
```

## Getting Help

- **Architecture questions?** See [Architecture Reference](reference/architecture.md)
- **Database schema?** See [Database Reference](reference/database.md)
- **Common errors?** See [Troubleshooting](guides/troubleshooting.md)
- **Development principles?** See `~/.claude/CLAUDE.md`

---

**Last updated:** 2025-11-09
