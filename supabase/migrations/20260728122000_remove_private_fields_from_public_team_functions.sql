-- Public league views never need contact details or edit credentials.
-- The keyed edit endpoint is the only public path that may return those fields.

create or replace function public.get_drafted_teams_by_season(active_season_param text)
returns json
language plpgsql
as $function$
declare
  result json;
begin
  select json_agg(row_to_json(row)) into result
  from (
    select
      dt.drafted_team_id,
      dt.team_name,
      dt.team_owner,
      dt.allowed_transfers,
      json_agg(
        json_build_object(
          'drafted_player_id', dp.drafted_player_id,
          'drafted_team', dp.drafted_team,
          'data', pv.*,
          'transfers', coalesce(
            (
              select json_agg(
                json_build_object(
                  'drafted_transfer_id', dtf.drafted_transfer_id,
                  'transfer_week', dtf.transfer_week,
                  'active_transfer_expiry', dtf.active_transfer_expiry,
                  'data', transfer_player.*
                )
                order by dtf.transfer_week
              )
              from public.drafted_transfers dtf
              join public.players_view transfer_player on dtf.player_id = transfer_player.player_id
              where dp.drafted_player_id = dtf.drafted_player
            ),
            '[]'::json
          )
        )
        order by pv.position, pv.player_id
      ) as players
    from public.drafted_teams dt
    join public.drafted_players dp on dt.drafted_team_id = dp.drafted_team
    join public.players_view pv on dp.drafted_player = pv.player_id
    where dt.active_season = active_season_param
    group by dt.drafted_team_id, dt.team_name, dt.team_owner, dt.allowed_transfers
    order by lower(dt.team_name)
  ) row;

  return result;
end;
$function$;

drop function if exists public.get_drafted_teams_with_player_points_by_gameweek(integer, text);

create function public.get_drafted_teams_with_player_points_by_gameweek(
  game_week_param integer,
  active_season_param text
)
returns table(
  drafted_team_id integer,
  team_name text,
  team_email text,
  team_owner text,
  allowed_transfers boolean,
  weekly_stats json,
  players json
)
language plpgsql
as $function$
begin
  return query
  with filtered_player_statistics as (
    select
      ps.player_id,
      sum(ps.points) as points,
      sum(ps.goals) as week_goals,
      sum(ps.assists) as week_assists,
      sum(case when ps.red_card then 1 else 0 end) as week_redcards,
      sum(case when ps.clean_sheet then 1 else 0 end) as week_cleansheets
    from public.player_statistics ps
    join public.fixtures f on ps.fixture_id = f.id and f.game_week = game_week_param
    group by ps.player_id
  )
  select
    dt.drafted_team_id,
    dt.team_name,
    null::text as team_email,
    dt.team_owner,
    dt.allowed_transfers,
    json_build_object(
      'points', 0,
      'goals', 0,
      'assists', 0,
      'red_cards', 0,
      'clean_sheets', 0
    ) as weekly_stats,
    json_agg(
      json_build_object(
        'drafted_player_id', dp.drafted_player_id,
        'drafted_team', dp.drafted_team,
        'data', pv.*,
        'points', coalesce(fps.points, 0),
        'week_goals', coalesce(fps.week_goals, 0),
        'week_assists', coalesce(fps.week_assists, 0),
        'week_redcards', coalesce(fps.week_redcards, 0),
        'week_cleansheets', coalesce(fps.week_cleansheets, 0),
        'transfers', coalesce(
          (
            select json_agg(
              json_build_object(
                'drafted_transfer_id', dtf.drafted_transfer_id,
                'transfer_week', dtf.transfer_week,
                'active_transfer_expiry', dtf.active_transfer_expiry,
                'points', coalesce(tps.points, 0),
                'week_goals', coalesce(tps.week_goals, 0),
                'week_assists', coalesce(tps.week_assists, 0),
                'week_redcards', coalesce(tps.week_redcards, 0),
                'week_cleansheets', coalesce(tps.week_cleansheets, 0),
                'data', tpv.*
              )
              order by dtf.transfer_week
            )
            from public.drafted_transfers dtf
            join public.players_view tpv on dtf.player_id = tpv.player_id
            left join filtered_player_statistics tps on tpv.player_id = tps.player_id
            where dp.drafted_player_id = dtf.drafted_player
          ),
          '[]'::json
        )
      )
      order by pv.position, pv.player_id
    ) as players
  from public.drafted_teams dt
  join public.drafted_players dp on dt.drafted_team_id = dp.drafted_team
  join public.players_view pv on dp.drafted_player = pv.player_id
  left join filtered_player_statistics fps on pv.player_id = fps.player_id
  where dt.active_season = active_season_param
  group by dt.drafted_team_id, dt.team_name, dt.team_owner, dt.allowed_transfers
  order by lower(dt.team_name);
end;
$function$;

grant execute on function public.get_drafted_teams_with_player_points_by_gameweek(integer, text)
to anon, authenticated, service_role;

-- Keep the public table fallback limited to fields used by public league views.
revoke select on public.drafted_teams from anon;
grant select (
  drafted_team_id,
  team_name,
  team_owner,
  allowed_transfers,
  active_season,
  created_at,
  updated_at,
  edited_count,
  total_team_value
) on public.drafted_teams to anon;
