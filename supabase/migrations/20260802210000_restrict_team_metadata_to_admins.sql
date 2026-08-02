-- Authenticated users are the application's administrators. Submission history
-- remains readable by them through the existing authenticated table grant, but
-- must not be exposed to anonymous visitors once league data is public.

revoke select (created_at, updated_at, edited_count)
on table public.drafted_teams
from public, anon;
