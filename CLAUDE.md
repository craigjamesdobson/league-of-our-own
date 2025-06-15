# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Development Commands

- **Development server**: `pnpm dev` (runs with --host flag for network access)
- **Build**: `pnpm build`
- **Lint**: `pnpm lint` (check) or `pnpm lint:fix` (auto-fix)
- **Type checking**: `pnpm typecheck`
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