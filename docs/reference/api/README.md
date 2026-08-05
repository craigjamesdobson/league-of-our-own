# API Reference

Server-side endpoints and integrations for this application.

## Available APIs

### Server Endpoints
- **[Server Endpoints](server-endpoints.md)** - Nitro API routes (email, etc.)

### Fantasy Premier League API

`bootstrap-static/` supplies the current player catalogue and live-season
fields. It does not provide the completed previous-season totals once the new
season begins. For those totals, use
`element-summary/{player_id}/`; its `history_past` array contains each player's
per-season summary, including points, minutes, goals, assists, clean sheets,
and red cards.

The application stores this data in the `player_previous_season_statistics`
table. Populate it once per season with the protected
`POST /api/sync-player-previous-season-stats` endpoint; the normal player sync
does not overwrite it. The upstream FPL API is public but does not have an
official reference site; the [Postman endpoint
reference](https://www.postman.com/fplassist/fpl-assist/request/fyydugb/element-summary)
and [FPL data reference](https://james-leslie.github.io/fplstat/data-reference/)
are useful community documentation.

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

**Last updated:** 2026-08-05
