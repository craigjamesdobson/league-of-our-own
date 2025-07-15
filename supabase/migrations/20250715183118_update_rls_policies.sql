drop policy "Enable all access for authenticated users" on "public"."drafted_teams";

alter table "public"."drafted_teams" alter column "total_team_value" set not null;

create policy "Enable insert for all users"
on "public"."drafted_players"
as permissive
for insert
to public
with check (true);


create policy "Enable select for all users"
on "public"."drafted_players"
as permissive
for select
to public
using (true);


create policy "Enable update for all users"
on "public"."drafted_players"
as permissive
for update
to public
using (true)
with check (true);


create policy "Enable all access for         
authenticated users"
on "public"."drafted_teams"
as permissive
for all
to authenticated
using (true)
with check (true);


create policy "Enable insert for all users"
on "public"."drafted_teams"
as permissive
for insert
to public
with check (true);


create policy "Enable update for all users"
on "public"."drafted_teams"
as permissive
for update
to public
using (true)
with check (true);



