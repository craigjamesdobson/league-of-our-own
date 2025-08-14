drop policy "Enable insert for all users" on "public"."drafted_players";

drop policy "Enable select for all users" on "public"."drafted_players";

drop policy "Enable update for all users" on "public"."drafted_players";

drop policy "Enable all access for         
authenticated users" on "public"."drafted_teams";

drop policy "Enable insert for all users" on "public"."drafted_teams";

drop policy "Enable update for all users" on "public"."drafted_teams";

create policy "Enable all access to auth users"
on "public"."drafted_players"
as permissive
for all
to public
using (true)
with check (true);


create policy "Enable all access for authenticated users"
on "public"."drafted_teams"
as permissive
for all
to authenticated
using (true)
with check (true);



