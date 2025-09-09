drop function if exists "public"."get_drafted_teams_with_player_points_by_gameweek"(game_week_param integer, active_season_param text);

set check_function_bodies = off;

CREATE OR REPLACE FUNCTION public.get_drafted_teams_with_player_points_by_gameweek(game_week_param integer, active_season_param text)
 RETURNS TABLE(drafted_team_id integer, team_name text, team_email text, team_owner text, allowed_transfers boolean, players json)
 LANGUAGE plpgsql
AS $function$
BEGIN
      RETURN QUERY
      WITH filtered_player_statistics AS (
          SELECT
              ps.player_id,
              SUM(ps.points) AS points,
              SUM(ps.goals) AS week_goals,
              SUM(ps.assists) AS week_assists,
              SUM(CASE WHEN ps.red_card THEN 1 ELSE 0 END) AS week_redcards,
              SUM(CASE WHEN ps.clean_sheet THEN 1 ELSE 0 END) AS week_cleansheets
          FROM
              player_statistics ps
              JOIN fixtures f ON ps.fixture_id = f.id AND f.game_week = game_week_param
          GROUP BY
              ps.player_id
      )
      SELECT
          dt.drafted_team_id,
          dt.team_name,
          dt.team_email,
          dt.team_owner,
          dt.allowed_transfers,
          json_agg(
              json_build_object(
                  'drafted_player_id', dp.drafted_player_id,
                  'drafted_team', dp.drafted_team,
                  'data', pv.*,
                  'points', COALESCE(fps.points, 0),
                  'week_goals', COALESCE(fps.week_goals, 0),
                  'week_assists', COALESCE(fps.week_assists, 0),
                  'week_redcards', COALESCE(fps.week_redcards, 0),
                  'week_cleansheets', COALESCE(fps.week_cleansheets, 0),
                  'transfers', COALESCE(
                      (
                          SELECT
                              json_agg(
                                  json_build_object(
                                      'drafted_transfer_id', dtf.drafted_transfer_id,
                                      'transfer_week', dtf.transfer_week,
                                      'active_transfer_expiry', dtf.active_transfer_expiry,
                                      'points', COALESCE(tps.points, 0),
                                      'week_goals', COALESCE(tps.week_goals, 0),
                                      'week_assists', COALESCE(tps.week_assists, 0),
                                      'week_redcards', COALESCE(tps.week_redcards, 0),
                                      'week_cleansheets', COALESCE(tps.week_cleansheets, 0),
                                      'data', tpv.*
                                  )
                                  ORDER BY dtf.transfer_week ASC
                              )
                          FROM
                              drafted_transfers dtf
                              JOIN players_view tpv ON dtf.player_id = tpv.player_id
                              LEFT JOIN filtered_player_statistics tps ON tpv.player_id = tps.player_id
                          WHERE
                              dp.drafted_player_id = dtf.drafted_player
                      ),
                      '[]'::json
                  )
              )
              ORDER BY pv.position, pv.player_id
          ) AS players
      FROM
          drafted_teams dt
          JOIN drafted_players dp ON dt.drafted_team_id = dp.drafted_team
          JOIN players_view pv ON dp.drafted_player = pv.player_id
          LEFT JOIN filtered_player_statistics fps ON pv.player_id = fps.player_id
      WHERE
          dt.active_season = active_season_param
      GROUP BY
          dt.drafted_team_id,
          dt.team_name,
          dt.team_email,
          dt.team_owner,
          dt.allowed_transfers
      ORDER BY
          LOWER(dt.team_name);
  END;
$function$
;


