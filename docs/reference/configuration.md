# Configuration Reference

Configuration and environment setup for this project.

## Environment Variables

Environment variables control application behavior at runtime.

### Development Setup

Create `.env.local` in project root:

```env
# Supabase Configuration
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_KEY=your_anon_public_key

# Application Configuration
ACTIVE_SEASON=2024-25
SITE_URL=http://localhost:3000

# Security (optional - required for form submissions)
TURNSTILE_SITE_KEY=your_turnstile_site_key

# Environment
NODE_ENV=development
```

### Production Setup

On your deployment platform (Vercel, Netlify, etc.):

```
SUPABASE_URL=https://your-production-project.supabase.co
SUPABASE_KEY=your_production_anon_key
ACTIVE_SEASON=2024-25
SITE_URL=https://yourdomain.com
TURNSTILE_SITE_KEY=your_production_turnstile_key
NODE_ENV=production
```

## Environment Variable Reference

### `SUPABASE_URL` (Required)

**Type:** URL
**Example:** `https://abcdefghijk.supabase.co`
**Purpose:** Supabase project endpoint

**Where to find:**
1. Log in to [supabase.com](https://supabase.com)
2. Select your project
3. Settings → API → Project URL

### `SUPABASE_KEY` (Required)

**Type:** String (API Key)
**Format:** Long alphanumeric string
**Purpose:** Public anon key for client-side queries

⚠️ **Important:** This is the PUBLIC/ANON key, not the service_role key.

**Where to find:**
1. Supabase dashboard → Settings → API
2. Copy "anon public" key
3. Never use service_role key in client code

### `ACTIVE_SEASON` (Required)

**Type:** String
**Format:** `YYYY-YY` (e.g., `2024-25`)
**Purpose:** Current fantasy football season

**Usage:**
```typescript
const config = useRuntimeConfig();
const season = config.public.ACTIVE_SEASON;
// Output: "2024-25"
```

**How to update:**
- Change `.env.local` for development
- Update deployment platform settings for production
- Affects which season's data loads

### `SITE_URL` (Optional but Recommended)

**Type:** URL
**Example:** `http://localhost:3000` (dev), `https://league.example.com` (prod)
**Purpose:** Application base URL for redirects, emails, etc.

**Used for:**
- Email links
- Authentication redirects
- Password reset links

**Format:**
- Development: `http://localhost:3000`
- Production: `https://yourdomain.com` (no trailing slash)

### `TURNSTILE_SITE_KEY` (Optional)

**Type:** String
**Purpose:** Cloudflare Turnstile bot protection

**Where to find:**
1. Log in to [Cloudflare Dashboard](https://dash.cloudflare.com/)
2. Turnstile → Sites
3. Copy Site Key

**Required if:**
- Form submissions enabled
- Bot protection needed

**Optional if:**
- Not using form submissions
- Testing without bot protection

### `NODE_ENV` (Optional)

**Type:** `development` | `production`
**Default:** Set by build command
**Purpose:** Indicates environment for optimization

Usually set automatically by build tools, but can be overridden.

## Runtime Configuration

Defined in `nuxt.config.ts`:

```typescript
export default defineNuxtConfig({
  runtimeConfig: {
    public: {
      SITE_URL: process.env.SITE_URL,
      ACTIVE_SEASON: process.env.ACTIVE_SEASON,
      nodeEnv: process.env.NODE_ENV,
      turnstile: {
        siteKey: process.env.TURNSTILE_SITE_KEY
      }
    }
  }
})
```

### Accessing Runtime Config

In Vue components and composables:

```typescript
const config = useRuntimeConfig();

// Access values
const season = config.public.ACTIVE_SEASON;
const siteUrl = config.public.SITE_URL;
const turnstileSiteKey = config.public.turnstile.siteKey;
```

**Note:** All configuration values are in `public` scope, making them available to client-side code. Never put secrets here.

## Nuxt Configuration

Main configuration in `nuxt.config.ts`:

### Build Mode
```typescript
ssr: false  // SPA mode (no server-side rendering)
```

### Import Aliases

In Nuxt 4, the `~/` alias automatically resolves to the `/app/` directory:

```typescript
// All imports reference the /app/ directory
import Button from '~/components/Button.vue'
import { useTeamBuilder } from '~/composables/useTeamBuilder'
import type { DraftedTeam } from '~/types/DraftedTeam'
```

**Nuxt 4 Convention:** All application code lives in `/app/` directory.

### PrimeVue Configuration

```typescript
modules: ['@primevue/nuxt-module'],
primevue: {
  options: {
    unstyled: false,  // Use included styles
    ripple: true,     // Ripple effect on components
  },
  components: {
    exclude: ['Form', 'FormField', 'Editor', 'Chart'],  // Don't auto-import these
  }
}
```

**Theme:** Aura preset with custom primary color palette

**Styling:** Tailwind CSS integration via `tailwindcss-primeui`

### Supabase Configuration

```typescript
supabase: {
  redirect: false  // Don't auto-redirect on auth state
}
```

This prevents automatic redirects during development/testing.

## Type Generation Configuration

When Supabase schema changes, regenerate types:

```bash
pnpm generate-types
```

This creates `app/types/database-generated.types.ts` with:
- Table types
- View types
- Real-time subscription types
- RPC function types

**Important:**
- Don't edit `database-generated.types.ts` (auto-generated)
- Put custom types in `app/types/database.types.ts`

See [Supabase Type Generation Gotcha](../guides/troubleshooting.md#supabase-type-generation-issues).

## TypeScript Configuration

Strict mode enabled in `tsconfig.json`:

```json
{
  "compilerOptions": {
    "strict": true,
    "noImplicitAny": true,
    "strictNullChecks": true,
    "noUnusedLocals": true,
    "noUnusedParameters": true,
    "noImplicitReturns": true
  }
}
```

**No `any` types allowed** - see `~/.claude/docs/typescript.md`

## Build Configuration

### Development Build

```bash
pnpm dev
```

- Fast rebuild
- Source maps enabled
- Minimal optimization

### Production Build

```bash
pnpm build
```

- Full optimization
- Minification
- Output: `.output/public/`

### Preview Production Build

```bash
pnpm preview
```

Starts local server with production build to test before deployment.

## Authentication Configuration

### Supabase Auth

```typescript
supabaseClient.auth.onAuthStateChange((event, session) => {
  // Handle auth state changes
});
```

**Session Management:**
- Sessions persist across page reloads
- Use `useSupabaseUser()` to check auth state
- Use `useSupabaseClient()` for authenticated API calls

**Configured with:**
- `redirect: false` - Manual redirect handling
- Database authentication (users table in Supabase)

## Database Configuration

### Type-Safe Queries

```typescript
import type { Database } from '~/types/database.types';

const supabase = useSupabaseClient<Database>();

const { data } = await supabase
  .from('players')
  .select('*')
  .eq('season', config.public.ACTIVE_SEASON);
```

### Real-Time Subscriptions

```typescript
const subscription = supabase
  .channel('public:fixtures')
  .on(
    'postgres_changes',
    {
      event: '*',
      schema: 'public',
      table: 'fixtures'
    },
    (payload) => {
      // Handle changes
    }
  )
  .subscribe();
```

## Tailwind CSS Configuration

### tailwind.config.ts

```typescript
module.exports = {
  content: [
    './app/components/**/*.{vue,js,ts}',
    './app/pages/**/*.vue',
    './app/layouts/**/*.vue'
  ],
  plugins: [
    require('tailwindcss-primeui')  // PrimeVue integration
  ]
}
```

### Usage

```vue
<button class="px-4 py-2 bg-blue-500 text-white rounded">
  Click Me
</button>
```

Tailwind utility classes combined with PrimeVue components.

## ESLint & Prettier Configuration

### Code Quality

Code is checked and formatted automatically:

```bash
pnpm lint        # Check style (ESLint)
pnpm lint:fix    # Auto-fix style issues

# Files checked:
# - *.ts, *.tsx
# - *.vue
# - *.js, *.jsx
```

### Formatting

Code is auto-formatted with Prettier on save (if IDE configured).

**Configuration:** `.eslintrc.cjs` and `.prettierrc`

## Vitest Configuration

### vitest.config.ts

```typescript
export default defineConfig({
  test: {
    environment: 'nuxt',
    globals: true
  }
})
```

**Key settings:**
- `environment: 'nuxt'` - Uses Nuxt test environment (not Happy DOM)
- `globals: true` - `describe`, `it` available without imports

### Test Commands

```bash
pnpm test                    # Run once
pnpm test:watch              # Watch mode
pnpm test:ui                 # Browser UI
pnpm test -- --coverage      # Coverage report
```

See [Testing Guide](../guides/testing.md) for full details.

## Development Server Options

### Custom Port

```bash
pnpm dev -- --port 3001
```

### Host Binding

```bash
pnpm dev -- --host
```

Default includes `--host` for network access (see package.json scripts).

## See Also

- [Getting Started Guide](../getting-started.md) - Environment setup
- [Troubleshooting Guide](../guides/troubleshooting.md) - Common config issues
- [Local Development Guide](../guides/local-development.md) - Daily workflow

---

**Last updated:** 2025-11-15
