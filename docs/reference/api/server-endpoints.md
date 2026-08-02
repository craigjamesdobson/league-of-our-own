# Server API Endpoints

Reference documentation for this project's Nitro server endpoints.

**Location:** `/server/api/`

## Team submission emails

`POST /api/team-submission` owns all transactional email delivery for team registration. The server derives the recipient, subject, HTML, and private edit link from the validated saved team. There is deliberately no public general-purpose email endpoint.

New submissions return a `created` outcome and whether both confirmation deliveries succeeded. Updates return `updated` without sending another email. If a new submission uses an email already registered in the Active Season, no duplicate is created and no email is sent; the endpoint returns `existing-team` without exposing the key to the browser, and the entrant is directed to contact the league administrator.

The Resend API key and sender identity are configured server-side. `SITE_URL` must be configured so edit links use the canonical application origin. See [Configuration Reference](../configuration.md).

## Creating New Endpoints

To add new server endpoints:

1. Create file in `/server/api/` with `.ts` extension
2. Export default async function
3. Use Nitro utilities for request/response

**Example:**

```typescript
// /server/api/example.ts
export default defineEventHandler(async (event) => {
  // Handle GET/POST/etc.
  const body = await readBody(event);

  return {
    success: true,
    data: body
  };
});
```

**Call from client:**

```typescript
const result = await $fetch('/api/example', {
  method: 'POST',
  body: { /* data */ }
});
```

## Authentication

Server endpoints have access to authenticated user context:

```typescript
export default defineEventHandler(async (event) => {
  // Check if user is authenticated
  const user = await requireAuth(event);

  // Now use user.id, user.email, etc.
  return { userId: user.id };
});
```

## Database Access

From server endpoints, use Supabase server client (has full admin access):

```typescript
import { createClient } from '@supabase/supabase-js';

export default defineEventHandler(async (event) => {
  const supabase = createClient(
    process.env.SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );

  // Perform admin operations
  const { data } = await supabase.from('users').select('*');

  return data;
});
```

**Note:** Service role key is private (server-side only).

## Error Handling

Return HTTP error codes:

```typescript
export default defineEventHandler(async (event) => {
  if (!isValidInput) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Invalid input'
    });
  }

  return { success: true };
});
```

## Rate Limiting

Server endpoints don't have built-in rate limiting configured. For production:

- Implement rate limiting middleware
- Use platform-specific (Vercel, Netlify) rate limiting
- Consider Resend rate limits for email endpoints

## See Also

- [Configuration Reference](../configuration.md) - Environment variables
- [Deployment Guide](../../guides/deployment.md) - Production setup
- [Supabase Documentation](https://supabase.com/docs) - Database access
- [Nitro Documentation](https://nitro.unjs.io/) - Server framework

---

**Last updated:** 2026-08-01
