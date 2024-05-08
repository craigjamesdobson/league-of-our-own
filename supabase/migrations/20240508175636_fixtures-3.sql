alter table "public"."fixtures" enable row level security;

alter table "public"."player_statistics" enable row level security;

set check_function_bodies = off;

CREATE OR REPLACE FUNCTION public.get_drafted_teams_with_player_points_by_gameweek(game_week_param integer)
 RETURNS TABLE(drafted_team_id integer, team_name text, team_email character varying, team_owner text, allowed_transfers boolean, players json)
 LANGUAGE plpgsql
AS $function$BEGIN
  RETURN QUERY
  SELECT
    dt.drafted_team_id,
    dt.team_name,
    dt.team_email,
    dt.team_owner,
    dt.allowed_transfers,
    json_agg(
      json_build_object(
        'drafted_player_id',
        dp.drafted_player_id,
        'drafted_team',
        dp.drafted_team,
        'data',
        pv.*,
        'points',
        CASE WHEN f.game_week = game_week_param THEN COALESCE(ps.points, 0) ELSE 0 END,
        'transfers',
        COALESCE(
          (
            SELECT
              json_agg(
                json_build_object(
                  'drafted_transfer_id',
                  dtf.drafted_transfer_id,
                  'transfer_week',
                  dtf.transfer_week,
                  'active_transfer_expiry',
                  dtf.active_transfer_expiry,
                  'points',
                  CASE WHEN f.game_week = game_week_param THEN COALESCE(ps.points, 0) ELSE 0 END,
                  'data',
                  tpv.*
                )
              )
            FROM
              drafted_transfers dtf
              JOIN players_view tpv ON dtf.player_id = tpv.player_id
              LEFT JOIN player_statistics ps ON tpv.player_id = ps.player_id
            WHERE
              dp.drafted_player_id = dtf.drafted_player
          ),
          '[]'::json
        )
      ) order by pv.position, pv.player_id
    ) AS players
FROM
    drafted_teams dt
    JOIN drafted_players dp ON dt.drafted_team_id = dp.drafted_team
    JOIN players_view pv ON dp.drafted_player = pv.player_id
    LEFT JOIN player_statistics ps ON pv.player_id = ps.player_id
    LEFT JOIN fixtures f ON ps.fixture_id = f.id
GROUP BY
    dt.drafted_team_id,
    dt.team_name,
    dt.team_email,
    dt.team_owner,
    dt.allowed_transfers
ORDER BY
    dt.team_name;
END$function$
;

CREATE OR REPLACE FUNCTION public.get_drafted_teams_and_players()
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
                ) order by pv.position, pv.player_id
            ) AS players
        FROM
            drafted_teams dt
            JOIN drafted_players dp ON dt.drafted_team_id = dp.drafted_team
            JOIN players_view pv ON dp.drafted_player = pv.player_id
        GROUP BY
            dt.drafted_team_id,
            dt.team_name,
            dt.team_email,
            dt.team_owner,
            dt.allowed_transfers
        ORDER BY
            dt.team_name
    ) row;
    
    RETURN result;
END;$function$
;

create policy "allow all access for authenticated"
on "public"."fixtures"
as permissive
for all
to authenticated
using (true);


create policy "all all access for auithenticated"
on "public"."player_statistics"
as permissive
for all
to authenticated
using (true);



