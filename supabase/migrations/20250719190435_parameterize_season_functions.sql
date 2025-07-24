drop function if exists "public"."get_drafted_teams_with_player_points_by_gameweek"(game_week_param integer);

set check_function_bodies = off;

CREATE OR REPLACE FUNCTION public.get_drafted_teams_with_player_points_by_gameweek(game_week_param integer, active_season_param text)
 RETURNS TABLE(drafted_team_id integer, team_name text, team_email text, team_owner text, allowed_transfers boolean, weekly_stats json, players json)
 LANGUAGE plpgsql
AS $function$BEGIN
      RETURN QUERY
      WITH filtered_player_statistics AS (
          SELECT
              ps.player_id,
              SUM(ps.points) AS points,
              SUM(ps.goals) AS week_goals,
              SUM(ps.assists) AS week_assists,
              SUM(CASE WHEN ps.red_card THEN 1 ELSE
  0 END) AS week_redcards,
              SUM(CASE WHEN ps.clean_sheet THEN 1
  ELSE 0 END) AS week_cleansheets
          FROM
              player_statistics ps
              JOIN fixtures f ON ps.fixture_id =
  f.id AND f.game_week = game_week_param
          GROUP BY
              ps.player_id
      )
      SELECT
          dt.drafted_team_id,
          dt.team_name,
          dt.team_email,
          dt.team_owner,
          dt.allowed_transfers,
          json_build_object(
              'points', 0,
              'goals', 0,
              'assists', 0,
              'red_cards', 0,
              'clean_sheets', 0
          ) AS weekly_stats,
          json_agg(
              json_build_object(
                  'drafted_player_id',
  dp.drafted_player_id,
                  'drafted_team', dp.drafted_team,
                  'data', pv.*,
                  'points', COALESCE(fps.points, 0),
                  'week_goals',
  COALESCE(fps.week_goals, 0),
                  'week_assists',
  COALESCE(fps.week_assists, 0),
                  'week_redcards',
  COALESCE(fps.week_redcards, 0),
                  'week_cleansheets',
  COALESCE(fps.week_cleansheets, 0),
                  'transfers', COALESCE(
                      (
                          SELECT
                              json_agg(
                                  json_build_object(

  'drafted_transfer_id', dtf.drafted_transfer_id,

  'transfer_week', dtf.transfer_week,

  'active_transfer_expiry',
  dtf.active_transfer_expiry,
                                      'points',
  COALESCE(tps.points, 0),
                                      'week_goals',
  COALESCE(tps.week_goals, 0),

  'week_assists', COALESCE(tps.week_assists, 0),

  'week_redcards', COALESCE(tps.week_redcards, 0),

  'week_cleansheets', COALESCE(tps.week_cleansheets,
   0),
                                      'data', tpv.*
                                  )
                                  ORDER BY
  dtf.transfer_week ASC
                              )
                          FROM
                              drafted_transfers dtf
                              JOIN players_view tpv
  ON dtf.player_id = tpv.player_id
                              LEFT JOIN
  filtered_player_statistics tps ON tpv.player_id =
  tps.player_id
                          WHERE
                              dp.drafted_player_id =
   dtf.drafted_player
                      ),
                      '[]'::json
                  )
              )
              ORDER BY pv.position, pv.player_id
          ) AS players
      FROM
          drafted_teams dt
          JOIN drafted_players dp ON
  dt.drafted_team_id = dp.drafted_team
          JOIN players_view pv ON dp.drafted_player
  = pv.player_id
          LEFT JOIN filtered_player_statistics fps
  ON pv.player_id = fps.player_id
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
  END;$function$
;

CREATE OR REPLACE FUNCTION public.get_weekly_stats_for_gameweek(target_week integer, active_season_param text)
 RETURNS TABLE(drafted_team_id integer, team_name text, team_owner text, goals integer, assists integer, clean_sheets integer, red_cards integer, total_points integer, week_points integer, weekly_winner boolean, prev_week_position bigint)
 LANGUAGE plpgsql
AS $function$BEGIN
    RETURN QUERY
    WITH max_points_cte AS (
      SELECT MAX(total_points_for_week) AS
  max_points
      FROM (
        SELECT SUM(t.points) AS
  total_points_for_week
        FROM weekly_statistics t
        JOIN drafted_teams dt ON t.team =
  dt.drafted_team_id
        WHERE t.week = target_week
          AND dt.active_season = active_season_param
        GROUP BY t.team
      ) AS sub_query
    ), team_points_cte AS (
      SELECT
        dt.drafted_team_id,
        dt.team_name,
        dt.team_owner,
        SUM(t.goals)::INT AS goals,
        SUM(t.assists)::INT AS assists,
        SUM(t.clean_sheets)::INT AS clean_sheets,
        SUM(t.red_cards)::INT AS red_cards,
        SUM(t.points)::INT AS
  total_points_up_to_target_week,
        SUM(CASE WHEN t.week = target_week THEN
  t.points ELSE 0 END)::INT AS week_points
      FROM
        weekly_statistics t
      JOIN
        drafted_teams dt ON t.team =
  dt.drafted_team_id
      WHERE
        t.week <= target_week
        AND dt.active_season = active_season_param
      GROUP BY
        dt.drafted_team_id
    ), prev_week_ranking AS (
      SELECT
        dt.drafted_team_id,
        ROW_NUMBER() OVER (ORDER BY SUM(t.points)
  DESC, SUM(t.goals) DESC) AS prev_week_position
      FROM
        weekly_statistics t
      JOIN
        drafted_teams dt ON t.team =
  dt.drafted_team_id
      WHERE
        t.week <= (target_week - 1)
        AND dt.active_season = active_season_param
      GROUP BY
        dt.drafted_team_id
    )
    SELECT
      tp.drafted_team_id,
      tp.team_name,
      tp.team_owner,
      tp.goals,
      tp.assists,
      tp.clean_sheets,
      tp.red_cards,
      tp.total_points_up_to_target_week AS
  total_points,
      tp.week_points,
      CASE
        WHEN tp.week_points = mp.max_points THEN
  true
        ELSE false
      END AS weekly_winner,
      COALESCE(pwr.prev_week_position, 0) AS
  prev_week_position
    FROM
      team_points_cte tp
    CROSS JOIN
      max_points_cte mp
    LEFT JOIN
      prev_week_ranking pwr ON tp.drafted_team_id =
  pwr.drafted_team_id
    ORDER BY
      tp.total_points_up_to_target_week DESC,
  tp.goals DESC;
  END;$function$
;

CREATE OR REPLACE FUNCTION public.get_drafted_teams_by_season(active_season_param text)
 RETURNS json
 LANGUAGE plpgsql
AS $function$DECLARE
    result JSON;
BEGIN
    SELECT json_agg(row_to_json(row)) INTO result
    FROM (
        SELECT
            dt.drafted_team_id,
            dt.team_name,
            dt.team_email,
            dt.team_owner,
            dt.allowed_transfers,
            dt.created_at,
            dt.updated_at,
            dt.edited_count,
            json_agg(
                json_build_object(
                    'drafted_player_id', dp.drafted_player_id,
                    'drafted_team', dp.drafted_team,
                    'data', pv.*,
                    'transfers',
                    COALESCE(
                        (
                            SELECT json_agg(
                                json_build_object(
                                    'drafted_transfer_id', dtf.drafted_transfer_id,
                                    'transfer_week', dtf.transfer_week,
                                    'active_transfer_expiry', dtf.active_transfer_expiry,
                                    'data', pv.*
                                )
                                ORDER BY dtf.transfer_week
                            )
                            FROM drafted_transfers dtf
                            JOIN players_view pv ON dtf.player_id = pv.player_id
                            WHERE dp.drafted_player_id = dtf.drafted_player
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
        WHERE
            dt.active_season = active_season_param
        GROUP BY
            dt.drafted_team_id,
            dt.team_name,
            dt.team_email,
            dt.team_owner,
            dt.allowed_transfers
        ORDER BY
            LOWER(dt.team_name)
    ) row;
    
    RETURN result;
END;$function$
;



