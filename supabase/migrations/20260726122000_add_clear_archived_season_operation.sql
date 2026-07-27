create or replace function public.clear_archived_season_operational_data(
  source_season_key text
)
returns table (
  drafted_team_count integer,
  drafted_player_count integer,
  transfer_count integer,
  weekly_statistic_count integer,
  player_statistic_count integer,
  fixture_count integer,
  player_count integer,
  club_count integer
)
language plpgsql
security definer
set search_path = ''
as $$
declare
  archived_season_id bigint;
  archived_team_count integer;
  archived_player_count integer;
  archived_transfer_count integer;
begin
  if source_season_key is null
    or source_season_key !~ '^[0-9]{2}-[0-9]{2}$'
  then
    raise exception 'Season key must use the YY-YY format';
  end if;

  perform pg_catalog.pg_advisory_xact_lock(
    pg_catalog.hashtextextended(source_season_key, 0)
  );

  lock table
    public.drafted_transfers,
    public.drafted_players,
    public.weekly_statistics,
    public.drafted_teams,
    public.player_statistics,
    public.fixtures,
    public.players,
    public.teams
  in access exclusive mode;

  select s.id
  into archived_season_id
  from public.seasons s
  where s.season_key = source_season_key
    and s.archived_at is not null;

  if archived_season_id is null then
    raise exception 'Season % must be archived before operational data is cleared',
      source_season_key;
  end if;

  if exists (
    select 1
    from public.drafted_teams dt
    where dt.active_season is distinct from source_season_key
  ) then
    raise exception 'Operational data contains fantasy teams outside Season %',
      source_season_key;
  end if;

  select count(*)::integer
  into drafted_team_count
  from public.drafted_teams dt
  where dt.active_season = source_season_key;

  if drafted_team_count = 0 then
    raise exception 'Season % has no operational fantasy teams to clear',
      source_season_key;
  end if;

  select count(*)::integer
  into drafted_player_count
  from public.drafted_players dp
  join public.drafted_teams dt
    on dt.drafted_team_id = dp.drafted_team
  where dt.active_season = source_season_key;

  select count(*)::integer
  into transfer_count
  from public.drafted_transfers transfer_record
  join public.drafted_players dp
    on dp.drafted_player_id = transfer_record.drafted_player
  join public.drafted_teams dt
    on dt.drafted_team_id = dp.drafted_team
  where dt.active_season = source_season_key;

  select count(*)::integer
  into archived_team_count
  from public.season_results sr
  where sr.season_id = archived_season_id;

  select count(*)::integer
  into archived_player_count
  from public.season_result_players srp
  join public.season_results sr
    on sr.id = srp.season_result_id
  where sr.season_id = archived_season_id;

  select count(*)::integer
  into archived_transfer_count
  from public.season_result_transfers srt
  join public.season_results sr
    on sr.id = srt.season_result_id
  where sr.season_id = archived_season_id;

  if archived_team_count <> drafted_team_count
    or archived_player_count <> drafted_player_count
    or archived_transfer_count <> transfer_count
  then
    raise exception 'Season % archive no longer matches its operational data',
      source_season_key;
  end if;

  select count(*)::integer into weekly_statistic_count
  from public.weekly_statistics;

  select count(*)::integer into player_statistic_count
  from public.player_statistics;

  select count(*)::integer into fixture_count
  from public.fixtures;

  select count(*)::integer into player_count
  from public.players;

  select count(*)::integer into club_count
  from public.teams;

  delete from public.drafted_transfers;
  delete from public.drafted_players;
  delete from public.weekly_statistics;
  delete from public.drafted_teams;
  delete from public.player_statistics;
  delete from public.fixtures;
  delete from public.players;
  delete from public.teams;

  return next;
end;
$$;

comment on function public.clear_archived_season_operational_data(text) is
  'Owner-only explicit operation that clears active fantasy and FPL reference data after verifying an immutable Season archive.';

revoke all on function public.clear_archived_season_operational_data(text)
from public, anon, authenticated, service_role;
