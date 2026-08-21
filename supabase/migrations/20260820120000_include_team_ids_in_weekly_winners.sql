CREATE OR REPLACE FUNCTION public.get_weekly_winners()
RETURNS TABLE(week integer, top_teams json[], points integer)
LANGUAGE plpgsql
AS $$
BEGIN
  RETURN QUERY
  WITH all_weeks AS (
    SELECT generate_series(1, 38) AS week
  ),
  max_points AS (
    SELECT
      ws.week,
      MAX(ws.points) AS max_points
    FROM weekly_statistics ws
    GROUP BY ws.week
  ),
  top_teams AS (
    SELECT
      ws.week,
      dt.drafted_team_id,
      dt.team_name,
      dt.team_owner,
      ws.points
    FROM weekly_statistics ws
    JOIN drafted_teams dt ON ws.team = dt.drafted_team_id
    JOIN max_points mp ON ws.week = mp.week AND ws.points = mp.max_points
  )
  SELECT
    aw.week,
    array_agg(
      json_build_object(
        'drafted_team_id', tt.drafted_team_id,
        'team_name', tt.team_name,
        'team_owner', tt.team_owner
      )
    ) AS top_teams,
    mp.max_points AS points
  FROM all_weeks aw
  LEFT JOIN top_teams tt ON aw.week = tt.week
  LEFT JOIN max_points mp ON aw.week = mp.week
  GROUP BY aw.week, mp.max_points
  ORDER BY aw.week;
END;
$$;
