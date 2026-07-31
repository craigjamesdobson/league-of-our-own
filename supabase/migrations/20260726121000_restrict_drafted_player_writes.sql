drop policy if exists "Enable all access to auth users"
on public.drafted_players;

create policy "Enable all access for authenticated users"
on public.drafted_players
for all
to authenticated
using (true)
with check (true);
