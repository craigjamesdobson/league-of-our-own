create table public.player_previous_season_statistics (
    player_id integer primary key,
    season_name text,
    minutes integer not null default 0,
    goals integer not null default 0,
    assists integer not null default 0,
    clean_sheets integer not null default 0,
    red_cards integer not null default 0,
    points integer not null default 0,
    synced_at timestamp with time zone not null default now()
);

comment on table public.player_previous_season_statistics is
  'One-time FPL snapshot of the most recent completed season for each current player.';

alter table public.player_previous_season_statistics enable row level security;

grant select on table public.player_previous_season_statistics to anon;
grant select on table public.player_previous_season_statistics to authenticated;
grant all on table public.player_previous_season_statistics to service_role;

create policy "Allow all users to read previous-season player statistics"
on public.player_previous_season_statistics
as permissive
for select
to public
using (true);
