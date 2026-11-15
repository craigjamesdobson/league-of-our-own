-- Saving a fixture result replaces its score and its player statistics in one
-- transaction. The admin page used to do this in separate requests, so a failed
-- insert could leave a fixture with its old statistics already deleted.
--
-- The function runs with the caller's own privileges. Authenticated users are
-- the application's administrators and already hold the table access it needs.

create function public.save_fixture_result(
  p_fixture_id bigint,
  p_home_team_score integer,
  p_away_team_score integer,
  p_player_statistics jsonb
)
returns void
language plpgsql
security invoker
set search_path = ''
as $$
begin
  if auth.uid() is null then
    raise exception 'Administrator authentication is required';
  end if;

  if p_player_statistics is null or jsonb_typeof(p_player_statistics) <> 'array' then
    raise exception 'Player statistics must be a list';
  end if;

  update public.fixtures
  set
    home_team_score = p_home_team_score,
    away_team_score = p_away_team_score,
    populated_by = auth.uid(),
    populated_at = now()
  where id = p_fixture_id;

  if not found then
    raise exception 'Fixture not found';
  end if;

  delete from public.player_statistics
  where fixture_id = p_fixture_id;

  insert into public.player_statistics (
    player_id, fixture_id, goals, assists, clean_sheet, red_card, points, author
  )
  select
    statistic.player_id,
    p_fixture_id,
    statistic.goals,
    statistic.assists,
    statistic.clean_sheet,
    statistic.red_card,
    statistic.points,
    auth.uid()
  from jsonb_to_recordset(p_player_statistics) as statistic(
    player_id integer,
    goals integer,
    assists integer,
    clean_sheet boolean,
    red_card boolean,
    points integer
  );
end;
$$;

revoke all on function public.save_fixture_result(bigint, integer, integer, jsonb)
from public, anon, authenticated;
grant execute on function public.save_fixture_result(bigint, integer, integer, jsonb)
to authenticated;
