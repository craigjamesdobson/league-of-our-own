-- Keep the public application usable while preventing anonymous reads of
-- submitted fantasy teams and their scoring data before the league is revealed.
-- Authenticated users are the application's admin users and retain access.

drop policy if exists "Enable read access for all users" on public.drafted_teams;
drop policy if exists "Enable read access for all users" on public.drafted_players;
drop policy if exists "Enable read access for all users" on public.drafted_transfers;
drop policy if exists "Enable read access for all users" on public.weekly_statistics;
drop policy if exists "All access for authenticated" on public.weekly_statistics;

create policy "Public drafted teams are readable after reveal"
on public.drafted_teams
for select
to public
using (
  exists (
    select 1
    from public.settings
    where setting_key = 'league_data_public'
      and setting_value = 'true'
  )
);

create policy "Authenticated users can read drafted teams"
on public.drafted_teams
for select
to authenticated
using (true);

create policy "Public drafted players are readable after reveal"
on public.drafted_players
for select
to public
using (
  exists (
    select 1
    from public.settings
    where setting_key = 'league_data_public'
      and setting_value = 'true'
  )
);

create policy "Authenticated users can read drafted players"
on public.drafted_players
for select
to authenticated
using (true);

create policy "Public drafted transfers are readable after reveal"
on public.drafted_transfers
for select
to public
using (
  exists (
    select 1
    from public.settings
    where setting_key = 'league_data_public'
      and setting_value = 'true'
  )
);

create policy "Authenticated users can read drafted transfers"
on public.drafted_transfers
for select
to authenticated
using (true);

create policy "Public weekly statistics are readable after reveal"
on public.weekly_statistics
for select
to public
using (
  exists (
    select 1
    from public.settings
    where setting_key = 'league_data_public'
      and setting_value = 'true'
  )
);

create policy "Authenticated users can read weekly statistics"
on public.weekly_statistics
for select
to authenticated
using (true);
