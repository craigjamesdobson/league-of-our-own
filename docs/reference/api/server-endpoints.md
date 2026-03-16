# Server API Endpoints

Reference documentation for this project's Nitro server endpoints.

**Location:** `/server/api/`

## Email Endpoints

### Send Email

**Endpoint:** `POST /api/send-email`

**Purpose:** Send transactional emails via Resend

**Request Body:**

```typescript
{
  to: string;              // Recipient email address
  subject: string;         // Email subject
  body: string;           // Email body (plain text or HTML)
}
```

**Example Request:**

```typescript
const response = await $fetch('/api/send-email', {
  method: 'POST',
  body: {
    to: 'user@example.com',
    subject: 'Team Updated',
    body: '<h1>Your team has been updated</h1><p>New changes applied.</p>'
  }
});
```

**Response:**

Success (200):
```typescript
{
  success: true;
  messageId: string;  // Unique message identifier from Resend
}
```

Error (400):
```typescript
{
  success: false;
  error: string;  // Error description
}
```

**Error Cases:**

- `400 Bad Request` - Missing required fields (to, subject, body)
- `500 Internal Server Error` - Resend service error

**Email Sending:**

Configured to use **Resend** for email delivery:
- Server-side only (no client secrets exposed)
- Async sending (returns immediately)
- Production domain configured in Resend settings

**Configuration:**

Resend API key configured in deployment environment (not in code).

See [Configuration Reference](../configuration.md) for environment setup.

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

**Last updated:** 2025-11-09
