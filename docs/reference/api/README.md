# API Reference

Server-side endpoints and integrations for this application.

## Available APIs

### Server Endpoints
- **[Server Endpoints](server-endpoints.md)** - Nitro API routes (email, etc.)

## Supabase Integration

Database queries use type-safe Supabase client:

```typescript
import type { Database } from '~/types/database.types';

const supabase = useSupabaseClient<Database>();

const { data } = await supabase
  .from('players')
  .select('*');
```

See [Database Reference](../database.md) for schema.

## Third-Party APIs

- **Supabase** - Database, authentication, real-time
- **Resend** - Email service (via server endpoints)
- **Cloudflare Turnstile** - Bot protection (form submissions)

## See Also

- [Server Endpoints](server-endpoints.md) - Detailed API documentation
- [Configuration Reference](../configuration.md) - API keys and secrets
- [Database Reference](../database.md) - Database queries

---

**Last updated:** 2025-11-09
