# Server API Endpoints

Reference documentation for this project's Nitro server endpoints.

**Location:** `/server/api/`

## Team submission emails

`POST /api/team-submission` owns all transactional email delivery for team registration. The server derives the recipient, subject, HTML, and private edit link from the validated saved team.

New submissions return a `created` outcome and whether both confirmation deliveries succeeded. Updates return `updated` without sending another email. If a new submission uses an email already registered in the Active Season, no duplicate is created and no email is sent; the endpoint returns `existing-team` without exposing the key to the browser, and the entrant is directed to contact the league administrator.

The Resend API key and sender identity are configured server-side. `SITE_URL` must be configured so edit links use the canonical application origin. See [Configuration Reference](../configuration.md).

## Transfer request emails

The public `/manage-team` page provides the email address, subject, gameweek, copyable template and budget reminder without requiring a team link. `/manage-team/email` remains an equivalent email destination. The league reviews and applies these emails through its existing manual process; the website does not send the email or create a pending request when the template is copied.

The more complex online workflow is retained but disabled by default through `settings.online_transfer_requests_enabled = false`. Its public recovery route redirects to the email page, private team links do not load private-team logic, and the admin review panel is hidden. All online workflow API endpoints reject requests while disabled, and the database independently blocks saving, approving, rejecting and cancelling online requests, including calls from old cached admin pages. Existing manual transfer entry, team registration and manual gameweek changes remain available. Missing flag data is treated as disabled during rollout.

The online workflow must remain disabled until its deadline, stale-form, rollover and overdue-request issues have been resolved. The following endpoint descriptions document the retained implementation when explicitly enabled.

Public pages, the private team response and online submissions use the same `getTransferTargetGameweek` helper. Requests target the configured current gameweek plus one, through Gameweek 38. Once Gameweek 38 is active there is no target week, and the public notice says requests are closed. If settings are unavailable, the notice avoids inventing a week. The copied manual-email template includes the target gameweek when one is available.

The email template includes the team name, manager name and email, and player ID, name, club and price for each outgoing and incoming player. Managers check their revised squad budget before sending. Direct emails do not call the transfer request endpoint or create a pending request in the website; the league administrator reviews and applies them manually.

`POST /api/transfer-request` accepts a transfer request for manual review through a private team management key. It validates the requester and two transfer slots, checks the existing Cloudflare Turnstile challenge, rejects the honeypot field, and applies an in-memory limit of five requests per IP within 15 minutes. Valid requests are saved in `transfer_requests` and `transfer_request_items`, with the target gameweek inferred server-side as the next gameweek. A second pending request for the same team is rejected atomically, but returns the same generic submission error so pending-request status is not exposed publicly. Requests can be updated by submitting the existing pending request ID with the same team key while the target gameweek is still ahead of the current gameweek.

`GET /api/team-management/:key` returns the private read-only team details, current squad, live transfer history, and that team's pending transfer request when the online workflow is enabled. The existing team-builder edit link redirects to this page after team registration closes only when the workflow is enabled. With it disabled, the existing registration-closed behavior is preserved.

`POST /api/team-management-link` accepts an email address and a Turnstile challenge, then sends the private management link for every eligible transfer team registered to that address. The response is deliberately generic whether or not a team matches, preventing email enumeration. Requests are limited by both IP address and email address.

The form sends player IDs alongside their displayed names. The database function verifies the selected team, outgoing players, incoming players, season availability, squad uniqueness, positions, budget, and transfer allowance. Teams can use at most two transfers before 1 January and four across the season; unused first-half transfers carry over after January. Each request contains at most two transfers. The endpoint still does not modify the live team. Resend sends a notification to `transfers@leagueofourown.co.uk` and a receipt to the requester. Email delivery failures do not discard a saved request, and the response reports whether both deliveries succeeded.

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

The transfer request endpoint has a lightweight in-memory limit for each running server instance. If traffic grows or the application runs across many stateless instances, add platform-level distributed rate limiting as a second layer.

## See Also

- [Configuration Reference](../configuration.md) - Environment variables
- [Deployment Guide](../../guides/deployment.md) - Production setup
- [Supabase Documentation](https://supabase.com/docs) - Database access
- [Nitro Documentation](https://nitro.unjs.io/) - Server framework

---

**Last updated:** 2026-10-07
