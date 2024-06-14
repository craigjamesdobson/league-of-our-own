
SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

CREATE EXTENSION IF NOT EXISTS "pg_net" WITH SCHEMA "extensions";

CREATE EXTENSION IF NOT EXISTS "pgsodium" WITH SCHEMA "pgsodium";

COMMENT ON SCHEMA "public" IS 'standard public schema';

CREATE EXTENSION IF NOT EXISTS "moddatetime" WITH SCHEMA "extensions";

CREATE EXTENSION IF NOT EXISTS "pg_graphql" WITH SCHEMA "graphql";

CREATE EXTENSION IF NOT EXISTS "pg_stat_statements" WITH SCHEMA "extensions";

CREATE EXTENSION IF NOT EXISTS "pgcrypto" WITH SCHEMA "extensions";

CREATE EXTENSION IF NOT EXISTS "pgjwt" WITH SCHEMA "extensions";

CREATE EXTENSION IF NOT EXISTS "supabase_vault" WITH SCHEMA "vault";

CREATE EXTENSION IF NOT EXISTS "uuid-ossp" WITH SCHEMA "extensions";

CREATE OR REPLACE FUNCTION "public"."delete_rows_with_criteria"() RETURNS "trigger"
    LANGUAGE "plpgsql"
    AS $$
BEGIN
    -- Delete rows that match the specified criteria
    DELETE FROM player_statistics
    WHERE (goals = 0 OR goals IS NULL)
      AND (assists = 0 OR assists IS NULL)
      AND (clean_sheet = false OR clean_sheet IS NULL)
      AND (red_card = false OR red_card IS NULL);

    RETURN NULL; -- Returning NULL to indicate that the trigger has completed successfully
END;
$$;

ALTER FUNCTION "public"."delete_rows_with_criteria"() OWNER TO "postgres";

CREATE OR REPLACE FUNCTION "public"."get_drafted_teams_and_players"() RETURNS "json"
    LANGUAGE "plpgsql"
    AS $$DECLARE
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
END;$$;

ALTER FUNCTION "public"."get_drafted_teams_and_players"() OWNER TO "postgres";

CREATE OR REPLACE FUNCTION "public"."get_drafted_teams_with_player_points_by_gameweek"("game_week_param" integer) RETURNS TABLE("drafted_team_id" integer, "team_name" "text", "team_email" character varying, "team_owner" "text", "allowed_transfers" boolean, "weekly_stats" "json", "players" "json")
    LANGUAGE "plpgsql"
    AS $$
BEGIN
  RETURN QUERY
  WITH filtered_player_statistics AS (
    SELECT
      ps.player_id,
      ps.fixture_id,
      ps.points,
      SUM(ps.goals) AS week_goals,
      SUM(ps.assists) AS week_assists,
      SUM(CASE WHEN ps.red_card THEN 1 ELSE 0 END) AS week_redcards,
      SUM(CASE WHEN ps.clean_sheet THEN 1 ELSE 0 END) AS week_cleansheets
    FROM
      player_statistics ps
      JOIN fixtures f ON ps.fixture_id = f.id AND f.game_week = game_week_param
    GROUP BY
      ps.player_id, ps.fixture_id, ps.points
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
        'drafted_team',
        dp.drafted_team,
        'data',
        pv.*,
        'points',
        COALESCE(fps.points, 0),
        'week_goals',
        COALESCE(fps.week_goals, 0),
        'week_assists',
        COALESCE(fps.week_assists, 0),
        'week_redcards',
        COALESCE(fps.week_redcards, 0),
        'week_cleansheets',
        COALESCE(fps.week_cleansheets, 0),
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
                  COALESCE(tps.points, 0),
                  'week_goals',
                  COALESCE(tps.week_goals, 0),
                  'week_assists',
                  COALESCE(tps.week_assists, 0),
                  'week_redcards',
                  COALESCE(tps.week_redcards, 0),
                  'week_cleansheets',
                  COALESCE(tps.week_cleansheets, 0),
                  'data',
                  tpv.*
                )
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
      ) ORDER BY pv.position, pv.player_id
    ) AS players
  FROM
    drafted_teams dt
    JOIN drafted_players dp ON dt.drafted_team_id = dp.drafted_team
    JOIN players_view pv ON dp.drafted_player = pv.player_id
    LEFT JOIN filtered_player_statistics fps ON pv.player_id = fps.player_id
  GROUP BY
    dt.drafted_team_id,
    dt.team_name,
    dt.team_email,
    dt.team_owner,
    dt.allowed_transfers
  ORDER BY
    dt.team_name;
END;
$$;

ALTER FUNCTION "public"."get_drafted_teams_with_player_points_by_gameweek"("game_week_param" integer) OWNER TO "postgres";

CREATE OR REPLACE FUNCTION "public"."get_player_stats_by_team_id"("team_id_param" integer) RETURNS TABLE("player_id" integer, "number_code" integer, "image" "text", "image_large" "text", "web_name" "text", "first_name" "text", "second_name" "text", "goals_scored" integer, "assists" integer, "clean_sheets" integer, "red_cards" integer, "cost" numeric, "status" "text", "is_unavailable" boolean, "unavailable_for_season" boolean, "news" "text", "position" integer, "team" integer, "team_name" "text", "team_short_name" "text", "minutes" integer, "week_goals" integer, "week_assists" integer, "week_cleansheet" boolean, "week_redcard" boolean)
    LANGUAGE "plpgsql"
    AS $$
BEGIN
    RETURN QUERY
    SELECT
        pv.player_id,
        pv.code,
        pv.image,
        pv.image_large,
        pv.web_name,
        pv.first_name,
        pv.second_name,
        pv.goals_scored,
        pv.assists,
        pv.clean_sheets,
        pv.red_cards,
        pv.cost,
        pv.status,
        pv.is_unavailable,
        pv.unavailable_for_season,
        pv.news,
        pv.position,
        pv.team,
        pv.team_name,
        pv.team_short_name,
        pv.minutes,
        COALESCE(ps.goals, 0) AS week_goals,
        COALESCE(ps.assists, 0) AS week_assists,
        COALESCE(ps.clean_sheet, FALSE) AS week_cleansheet,
        COALESCE(ps.red_card, FALSE) AS week_redcard
    FROM
        players_view pv
    LEFT JOIN
        player_statistics ps ON pv.player_id = ps.player_id
    WHERE
        pv.team = team_id_param
    ORDER BY
        pv.minutes DESC;
END;
$$;

ALTER FUNCTION "public"."get_player_stats_by_team_id"("team_id_param" integer) OWNER TO "postgres";

CREATE OR REPLACE FUNCTION "public"."get_player_stats_by_team_id_for_fixture"("team_id_param" integer, "fixture_id_param" integer) RETURNS TABLE("player_id" integer, "code" integer, "image" "text", "image_large" "text", "web_name" "text", "first_name" "text", "second_name" "text", "goals_scored" integer, "assists" integer, "clean_sheets" integer, "red_cards" integer, "cost" numeric, "status" "text", "is_unavailable" boolean, "unavailable_for_season" boolean, "news" "text", "position" integer, "team" integer, "team_name" "text", "team_short_name" "text", "minutes" integer, "week_goals" integer, "week_assists" integer, "week_cleansheet" boolean, "week_redcard" boolean)
    LANGUAGE "plpgsql"
    AS $$
BEGIN
    RETURN QUERY
    SELECT
        pv.player_id,
        pv.code,
        pv.image,
        pv.image_large,
        pv.web_name,
        pv.first_name,
        pv.second_name,
        pv.goals_scored,
        pv.assists,
        pv.clean_sheets,
        pv.red_cards,
        pv.cost,
        pv.status,
        pv.is_unavailable,
        pv.unavailable_for_season,
        pv.news,
        pv.position,
        pv.team,
        pv.team_name,
        pv.team_short_name,
        pv.minutes,
        COALESCE(ps.goals, 0) AS week_goals,
        COALESCE(ps.assists, 0) AS week_assists,
        COALESCE(ps.clean_sheet, FALSE) AS week_cleansheet,
        COALESCE(ps.red_card, FALSE) AS week_redcard
    FROM
        players_view pv
    LEFT JOIN
        player_statistics ps ON pv.player_id = ps.player_id
                               AND ps.fixture_id = fixture_id_param
    WHERE
        pv.team = team_id_param
    ORDER BY
        pv.minutes DESC;
END;
$$;

ALTER FUNCTION "public"."get_player_stats_by_team_id_for_fixture"("team_id_param" integer, "fixture_id_param" integer) OWNER TO "postgres";

CREATE OR REPLACE FUNCTION "public"."get_player_team"() RETURNS TABLE("web_name" "text", "team_name" "text", "team_id" bigint)
    LANGUAGE "plpgsql"
    AS $$
BEGIN
  RETURN QUERY
    SELECT
      P.WEB_NAME,
      T.NAME AS TEAM_NAME,
      T.ID AS TEAM_ID
    FROM
      PLAYERS AS P
      JOIN TEAMS AS T ON P.TEAM = T.ID;
END;
$$;

ALTER FUNCTION "public"."get_player_team"() OWNER TO "postgres";

CREATE OR REPLACE FUNCTION "public"."get_weekly_stats_for_gameweek"("target_week" integer) RETURNS TABLE("drafted_team_id" integer, "team_name" "text", "team_owner" "text", "goals" integer, "assists" integer, "clean_sheets" integer, "red_cards" integer, "total_points" integer, "week_points" integer, "weekly_winner" boolean, "prev_week_position" bigint)
    LANGUAGE "plpgsql"
    AS $$
BEGIN
    RETURN QUERY
    WITH max_points_cte AS (
        SELECT MAX(total_points_for_week) AS max_points
        FROM (
            SELECT SUM(t.points) AS total_points_for_week
            FROM weekly_statistics t
            WHERE t.week = target_week
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
            SUM(t.points)::INT AS total_points_up_to_target_week,
            SUM(CASE WHEN t.week = target_week THEN t.points ELSE 0 END)::INT AS week_points
        FROM 
            weekly_statistics t
        JOIN 
            drafted_teams dt ON t.team = dt.drafted_team_id
        WHERE 
            t.week <= target_week
        GROUP BY 
            dt.drafted_team_id
    ), prev_week_ranking AS (
        SELECT 
            dt.drafted_team_id,
            ROW_NUMBER() OVER (ORDER BY SUM(t.points) DESC, SUM(t.goals) DESC) AS prev_week_position
        FROM 
            weekly_statistics t
        JOIN 
            drafted_teams dt ON t.team = dt.drafted_team_id
        WHERE 
            t.week <= (target_week - 1)
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
        tp.total_points_up_to_target_week AS total_points,
        tp.week_points,
        CASE 
            WHEN tp.week_points = mp.max_points THEN true 
            ELSE false 
        END AS weekly_winner,
        COALESCE(pwr.prev_week_position, 0) AS prev_week_position
    FROM 
        team_points_cte tp
    CROSS JOIN 
        max_points_cte mp
    LEFT JOIN 
        prev_week_ranking pwr ON tp.drafted_team_id = pwr.drafted_team_id
    ORDER BY 
        tp.total_points_up_to_target_week DESC, tp.goals DESC;
END;
$$;

ALTER FUNCTION "public"."get_weekly_stats_for_gameweek"("target_week" integer) OWNER TO "postgres";

CREATE OR REPLACE FUNCTION "public"."get_weekly_winners"() RETURNS TABLE("week" integer, "top_teams" "json"[], "points" integer)
    LANGUAGE "plpgsql"
    AS $$BEGIN
    RETURN QUERY
    WITH all_weeks AS (
        SELECT generate_series(1, 38) AS week
    ),
    max_points AS (
        SELECT
            ws.week,
            MAX(ws.points) AS max_points
        FROM
            weekly_statistics ws
        GROUP BY
            ws.week
    ),
    top_teams AS (
        SELECT
            ws.week,
            dt.team_name,
            dt.team_owner,
            ws.points
        FROM
            weekly_statistics ws
        JOIN drafted_teams dt ON ws.team = dt.drafted_team_id
        JOIN max_points mp ON ws.week = mp.week AND ws.points = mp.max_points
    )
    SELECT
        aw.week,
        array_agg(
            json_build_object(
                'team_name',
                tt.team_name,
                'team_owner',
                tt.team_owner
            )
        ) AS top_teams,
        mp.max_points AS points
    FROM
        all_weeks aw
    LEFT JOIN top_teams tt ON aw.week = tt.week
    LEFT JOIN max_points mp ON aw.week = mp.week
    GROUP BY
        aw.week,
        mp.max_points
    ORDER BY
        aw.week;

END;$$;

ALTER FUNCTION "public"."get_weekly_winners"() OWNER TO "postgres";

CREATE OR REPLACE FUNCTION "public"."handle_new_user"() RETURNS "trigger"
    LANGUAGE "plpgsql" SECURITY DEFINER
    AS $$
begin
  insert into public.profiles (id, full_name, avatar_url)
  values (new.id, new.raw_user_meta_data->>'full_name', new.raw_user_meta_data->>'avatar_url');
  return new;
end;
$$;

ALTER FUNCTION "public"."handle_new_user"() OWNER TO "postgres";

CREATE OR REPLACE FUNCTION "public"."insert_or_update_data"("id_field" integer, "other_field" "text") RETURNS "void"
    LANGUAGE "plpgsql"
    AS $$
BEGIN
    IF id_field = 0 THEN
        -- Insert new row
        INSERT INTO your_table_name(id_field, other_field) VALUES (id_field, other_field);
    ELSE
        -- Update existing row
        UPDATE your_table_name SET other_field = other_field WHERE id_field = id_field;
    END IF;
END;
$$;

ALTER FUNCTION "public"."insert_or_update_data"("id_field" integer, "other_field" "text") OWNER TO "postgres";

CREATE OR REPLACE FUNCTION "public"."set_author"() RETURNS "trigger"
    LANGUAGE "plpgsql"
    AS $$BEGIN
    IF TG_OP = 'INSERT' THEN
        NEW.author := auth.uid();
    ELSIF TG_OP = 'UPDATE' THEN
        NEW.author := auth.uid();
    END IF;
    RETURN NEW;
END;$$;

ALTER FUNCTION "public"."set_author"() OWNER TO "postgres";

CREATE OR REPLACE FUNCTION "public"."your_function_name"("game_week_param" integer) RETURNS TABLE("drafted_team_id" integer, "team_name" "text", "team_email" "text", "team_owner" "text", "allowed_transfers" boolean, "weekly_stats" "json", "players" "json")
    LANGUAGE "plpgsql"
    AS $$
BEGIN
  RETURN QUERY
  WITH filtered_player_statistics AS (
    SELECT
      ps.player_id,
      ps.fixture_id,
      ps.points,
      SUM(ps.goals) AS week_goals,
      SUM(ps.assists) AS week_assists,
      SUM(CASE WHEN ps.red_card THEN 1 ELSE 0 END) AS week_redcards,
      SUM(CASE WHEN ps.clean_sheet THEN 1 ELSE 0 END) AS week_cleansheets
    FROM
      player_statistics ps
      JOIN fixtures f ON ps.fixture_id = f.id AND f.game_week = game_week_param
    GROUP BY
      ps.player_id, ps.fixture_id, ps.points
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
        'drafted_team',
        dp.drafted_team,
        'data',
        pv.*,
        'points',
        COALESCE(fps.points, 0),
        'week_goals',
        COALESCE(fps.week_goals, 0),
        'week_assists',
        COALESCE(fps.week_assists, 0),
        'week_redcards',
        COALESCE(fps.week_redcards, 0),
        'week_cleansheets',
        COALESCE(fps.week_cleansheets, 0),
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
                  COALESCE(tps.points, 0),
                  'week_goals',
                  COALESCE(tps.week_goals, 0),
                  'week_assists',
                  COALESCE(tps.week_assists, 0),
                  'week_redcards',
                  COALESCE(tps.week_redcards, 0),
                  'week_cleansheets',
                  COALESCE(tps.week_cleansheets, 0),
                  'data',
                  tpv.*
                )
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
      ) ORDER BY pv.position, pv.player_id
    ) AS players
  FROM
    drafted_teams dt
    JOIN drafted_players dp ON dt.drafted_team_id = dp.drafted_team
    JOIN players_view pv ON dp.drafted_player = pv.player_id
    LEFT JOIN filtered_player_statistics fps ON pv.player_id = fps.player_id
  GROUP BY
    dt.drafted_team_id,
    dt.team_name,
    dt.team_email,
    dt.team_owner,
    dt.allowed_transfers
  ORDER BY
    dt.team_name;
END;
$$;

ALTER FUNCTION "public"."your_function_name"("game_week_param" integer) OWNER TO "postgres";

SET default_tablespace = '';

SET default_table_access_method = "heap";

CREATE TABLE IF NOT EXISTS "public"."drafted_players" (
    "drafted_player_id" bigint NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "drafted_team" integer,
    "drafted_player" integer
);

ALTER TABLE "public"."drafted_players" OWNER TO "postgres";

ALTER TABLE "public"."drafted_players" ALTER COLUMN "drafted_player_id" ADD GENERATED BY DEFAULT AS IDENTITY (
    SEQUENCE NAME "public"."drafted_players_id_seq"
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);

CREATE TABLE IF NOT EXISTS "public"."drafted_players_pending" (
    "drafted_player_id" bigint NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "drafted_team" integer,
    "drafted_player" integer
);

ALTER TABLE "public"."drafted_players_pending" OWNER TO "postgres";

ALTER TABLE "public"."drafted_players_pending" ALTER COLUMN "drafted_player_id" ADD GENERATED BY DEFAULT AS IDENTITY (
    SEQUENCE NAME "public"."drafted_players_pending_drafted_player_id_seq"
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);

CREATE TABLE IF NOT EXISTS "public"."drafted_teams" (
    "drafted_team_id" integer NOT NULL,
    "team_name" "text" NOT NULL,
    "team_owner" "text" NOT NULL,
    "team_email" character varying(255) NOT NULL,
    "allowed_transfers" boolean NOT NULL
);

ALTER TABLE "public"."drafted_teams" OWNER TO "postgres";

CREATE SEQUENCE IF NOT EXISTS "public"."drafted_teams_team_id_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;

ALTER TABLE "public"."drafted_teams_team_id_seq" OWNER TO "postgres";

ALTER SEQUENCE "public"."drafted_teams_team_id_seq" OWNED BY "public"."drafted_teams"."drafted_team_id";

CREATE TABLE IF NOT EXISTS "public"."drafted_teams_pending" (
    "drafted_team_id" bigint DEFAULT "nextval"('"public"."drafted_teams_team_id_seq"'::"regclass") NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "team_name" "text" NOT NULL,
    "team_owner" "text" NOT NULL,
    "team_email" "text" NOT NULL,
    "allowed_transfers" boolean NOT NULL,
    "key" "uuid" DEFAULT "gen_random_uuid"() NOT NULL
);

ALTER TABLE "public"."drafted_teams_pending" OWNER TO "postgres";

CREATE TABLE IF NOT EXISTS "public"."drafted_transfers" (
    "drafted_transfer_id" bigint NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "transfer_week" integer,
    "active_transfer_expiry" "date",
    "player_id" integer NOT NULL,
    "drafted_player" bigint NOT NULL
);

ALTER TABLE "public"."drafted_transfers" OWNER TO "postgres";

ALTER TABLE "public"."drafted_transfers" ALTER COLUMN "drafted_transfer_id" ADD GENERATED BY DEFAULT AS IDENTITY (
    SEQUENCE NAME "public"."drafted_transfers_id_seq"
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);

CREATE TABLE IF NOT EXISTS "public"."fixtures" (
    "id" bigint NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "game_week" integer,
    "home_team" integer,
    "away_team" integer,
    "home_team_score" integer NOT NULL,
    "away_team_score" integer NOT NULL
);

ALTER TABLE "public"."fixtures" OWNER TO "postgres";

ALTER TABLE "public"."fixtures" ALTER COLUMN "id" ADD GENERATED BY DEFAULT AS IDENTITY (
    SEQUENCE NAME "public"."fixtures_id_seq"
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);

CREATE TABLE IF NOT EXISTS "public"."player_statistics" (
    "id" bigint NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "player_id" integer NOT NULL,
    "fixture_id" bigint NOT NULL,
    "goals" integer,
    "assists" integer,
    "red_card" boolean,
    "clean_sheet" boolean,
    "author" "uuid" DEFAULT "auth"."uid"(),
    "points" integer NOT NULL
);

ALTER TABLE "public"."player_statistics" OWNER TO "postgres";

ALTER TABLE "public"."player_statistics" ALTER COLUMN "id" ADD GENERATED BY DEFAULT AS IDENTITY (
    SEQUENCE NAME "public"."player_statistics_id_seq"
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);

CREATE TABLE IF NOT EXISTS "public"."players" (
    "chance_of_playing_next_round" "text",
    "chance_of_playing_this_round" "text",
    "code" integer NOT NULL,
    "cost_change_event" integer,
    "cost_change_event_fall" integer,
    "cost_change_start" integer,
    "cost_change_start_fall" integer,
    "dreamteam_count" integer,
    "element_type" integer,
    "ep_next" "text",
    "ep_this" "text",
    "event_points" integer,
    "first_name" "text",
    "form" "text",
    "player_id" integer NOT NULL,
    "in_dreamteam" boolean,
    "news" "text",
    "news_added" "text",
    "now_cost" integer,
    "photo" "text",
    "points_per_game" "text",
    "second_name" "text",
    "selected_by_percent" "text",
    "special" boolean,
    "squad_number" "text",
    "status" "text",
    "team" integer NOT NULL,
    "team_code" bigint,
    "total_points" integer,
    "transfers_in" integer,
    "transfers_in_event" integer,
    "transfers_out" integer,
    "transfers_out_event" integer,
    "value_form" "text",
    "value_season" "text",
    "web_name" "text",
    "minutes" integer,
    "goals_scored" integer,
    "assists" integer,
    "clean_sheets" integer,
    "goals_conceded" integer,
    "own_goals" integer,
    "penalties_saved" integer,
    "penalties_missed" integer,
    "yellow_cards" integer,
    "red_cards" integer,
    "saves" integer,
    "bonus" integer,
    "bps" integer,
    "influence" "text",
    "creativity" "text",
    "threat" "text",
    "ict_index" "text",
    "starts" integer,
    "expected_goals" "text",
    "expected_assists" "text",
    "expected_goal_involvements" "text",
    "expected_goals_conceded" "text",
    "influence_rank" integer,
    "influence_rank_type" integer,
    "creativity_rank" integer,
    "creativity_rank_type" integer,
    "threat_rank" integer,
    "threat_rank_type" integer,
    "ict_index_rank" integer,
    "ict_index_rank_type" integer,
    "corners_and_indirect_freekicks_order" "text",
    "corners_and_indirect_freekicks_text" "text",
    "direct_freekicks_order" "text",
    "direct_freekicks_text" "text",
    "penalties_order" "text",
    "penalties_text" "text",
    "expected_goals_per_90" "text",
    "saves_per_90" "text",
    "expected_assists_per_90" "text",
    "expected_goal_involvements_per_90" "text",
    "expected_goals_conceded_per_90" "text",
    "goals_conceded_per_90" "text",
    "now_cost_rank" integer,
    "now_cost_rank_type" integer,
    "form_rank" integer,
    "form_rank_type" integer,
    "points_per_game_rank" integer,
    "points_per_game_rank_type" integer,
    "selected_rank" integer,
    "selected_rank_type" integer,
    "starts_per_90" "text",
    "clean_sheets_per_90" "text",
    "updated_at" timestamp with time zone,
    "created_at" timestamp with time zone
);

ALTER TABLE "public"."players" OWNER TO "postgres";

CREATE TABLE IF NOT EXISTS "public"."teams" (
    "code" integer NOT NULL,
    "draw" integer,
    "form" "text",
    "id" integer NOT NULL,
    "loss" integer,
    "name" "text",
    "played" integer,
    "points" integer,
    "position" integer,
    "short_name" "text",
    "strength" integer,
    "team_division" "text",
    "unavailable" boolean,
    "win" integer,
    "strength_overall_home" integer,
    "strength_overall_away" integer,
    "strength_attack_home" integer,
    "strength_attack_away" integer,
    "strength_defence_home" integer,
    "strength_defence_away" integer,
    "pulse_id" integer
);

ALTER TABLE "public"."teams" OWNER TO "postgres";

CREATE OR REPLACE VIEW "public"."players_view" AS
 SELECT "p"."player_id",
    "p"."code",
    (('https://resources.premierleague.com/premierleague/photos/players/40x40/p'::"text" || "p"."code") || '.png'::"text") AS "image",
    (('https://resources.premierleague.com/premierleague/photos/players/250x250/p'::"text" || "p"."code") || '.png'::"text") AS "image_large",
    "p"."web_name",
    "p"."first_name",
    "p"."second_name",
    "p"."goals_scored",
    "p"."assists",
    "p"."clean_sheets",
    "p"."red_cards",
    "round"(((("p"."now_cost" + "p"."cost_change_start_fall"))::numeric / 10.0), 1) AS "cost",
        CASE
            WHEN ("p"."status" = ANY (ARRAY['i'::"text", 'n'::"text", 's'::"text", 'd'::"text"])) THEN 'temporary-unavailable'::"text"
            WHEN ("p"."status" = 'u'::"text") THEN 'unavailable-for-season'::"text"
            ELSE 'available'::"text"
        END AS "status",
        CASE
            WHEN ("p"."status" = ANY (ARRAY['i'::"text", 'n'::"text", 's'::"text", 'd'::"text", 'u'::"text"])) THEN true
            ELSE false
        END AS "is_unavailable",
        CASE
            WHEN ("p"."status" = 'u'::"text") THEN true
            ELSE false
        END AS "unavailable_for_season",
    "p"."news",
    "p"."element_type" AS "position",
    "p"."team",
    "t"."name" AS "team_name",
    "t"."short_name" AS "team_short_name",
    "p"."minutes"
   FROM ("public"."players" "p"
     LEFT JOIN "public"."teams" "t" ON (("p"."team" = "t"."id")));

ALTER TABLE "public"."players_view" OWNER TO "postgres";

CREATE TABLE IF NOT EXISTS "public"."profiles" (
    "id" "uuid" NOT NULL,
    "updated_at" timestamp with time zone,
    "username" "text",
    "full_name" "text",
    "avatar_url" "text",
    "website" "text",
    CONSTRAINT "username_length" CHECK (("char_length"("username") >= 3))
);

ALTER TABLE "public"."profiles" OWNER TO "postgres";

CREATE TABLE IF NOT EXISTS "public"."weekly_statistics" (
    "id" bigint NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "team" integer,
    "goals" integer,
    "assists" integer,
    "clean_sheets" integer,
    "red_cards" integer,
    "week" integer NOT NULL,
    "points" integer NOT NULL
);

ALTER TABLE "public"."weekly_statistics" OWNER TO "postgres";

ALTER TABLE "public"."weekly_statistics" ALTER COLUMN "id" ADD GENERATED BY DEFAULT AS IDENTITY (
    SEQUENCE NAME "public"."weekly_statistics_id_seq"
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);

ALTER TABLE ONLY "public"."drafted_teams" ALTER COLUMN "drafted_team_id" SET DEFAULT "nextval"('"public"."drafted_teams_team_id_seq"'::"regclass");

ALTER TABLE ONLY "public"."drafted_players_pending"
    ADD CONSTRAINT "drafted_players_pending_pkey" PRIMARY KEY ("drafted_player_id");

ALTER TABLE ONLY "public"."drafted_players"
    ADD CONSTRAINT "drafted_players_pkey" PRIMARY KEY ("drafted_player_id");

ALTER TABLE ONLY "public"."drafted_teams_pending"
    ADD CONSTRAINT "drafted_teams_pending_drafted_team_id_key" UNIQUE ("drafted_team_id");

ALTER TABLE ONLY "public"."drafted_teams_pending"
    ADD CONSTRAINT "drafted_teams_pending_key_key" UNIQUE ("key");

ALTER TABLE ONLY "public"."drafted_teams_pending"
    ADD CONSTRAINT "drafted_teams_pending_pkey" PRIMARY KEY ("drafted_team_id");

ALTER TABLE ONLY "public"."drafted_teams"
    ADD CONSTRAINT "drafted_teams_pkey" PRIMARY KEY ("drafted_team_id");

ALTER TABLE ONLY "public"."drafted_transfers"
    ADD CONSTRAINT "drafted_transfers_pkey" PRIMARY KEY ("drafted_transfer_id");

ALTER TABLE ONLY "public"."fixtures"
    ADD CONSTRAINT "fixtures_pkey" PRIMARY KEY ("id");

ALTER TABLE ONLY "public"."player_statistics"
    ADD CONSTRAINT "player_statistics_pkey" PRIMARY KEY ("id");

ALTER TABLE ONLY "public"."players"
    ADD CONSTRAINT "players_pkey" PRIMARY KEY ("player_id");

ALTER TABLE ONLY "public"."profiles"
    ADD CONSTRAINT "profiles_pkey" PRIMARY KEY ("id");

ALTER TABLE ONLY "public"."profiles"
    ADD CONSTRAINT "profiles_username_key" UNIQUE ("username");

ALTER TABLE ONLY "public"."teams"
    ADD CONSTRAINT "teams_pkey" PRIMARY KEY ("id");

ALTER TABLE ONLY "public"."weekly_statistics"
    ADD CONSTRAINT "weekly_statistics_pkey" PRIMARY KEY ("id");

CREATE OR REPLACE TRIGGER "handle_updated_at" BEFORE UPDATE ON "public"."players" FOR EACH ROW EXECUTE FUNCTION "extensions"."moddatetime"('updated_at');

ALTER TABLE ONLY "public"."drafted_players"
    ADD CONSTRAINT "drafted_players_drafted_player_fkey" FOREIGN KEY ("drafted_player") REFERENCES "public"."players"("player_id");

ALTER TABLE ONLY "public"."drafted_players"
    ADD CONSTRAINT "drafted_players_drafted_team_fkey" FOREIGN KEY ("drafted_team") REFERENCES "public"."drafted_teams"("drafted_team_id");

ALTER TABLE ONLY "public"."drafted_players_pending"
    ADD CONSTRAINT "drafted_players_pending_drafted_player_fkey" FOREIGN KEY ("drafted_player") REFERENCES "public"."players"("player_id");

ALTER TABLE ONLY "public"."drafted_players_pending"
    ADD CONSTRAINT "drafted_players_pending_drafted_team_fkey" FOREIGN KEY ("drafted_team") REFERENCES "public"."drafted_teams_pending"("drafted_team_id");

ALTER TABLE ONLY "public"."drafted_transfers"
    ADD CONSTRAINT "drafted_transfers_drafted_player_fkey" FOREIGN KEY ("drafted_player") REFERENCES "public"."drafted_players"("drafted_player_id");

ALTER TABLE ONLY "public"."drafted_transfers"
    ADD CONSTRAINT "drafted_transfers_player_id_fkey" FOREIGN KEY ("player_id") REFERENCES "public"."players"("player_id");

ALTER TABLE ONLY "public"."players"
    ADD CONSTRAINT "players_team_fkey" FOREIGN KEY ("team") REFERENCES "public"."teams"("id");

ALTER TABLE ONLY "public"."profiles"
    ADD CONSTRAINT "profiles_id_fkey" FOREIGN KEY ("id") REFERENCES "auth"."users"("id") ON DELETE CASCADE;

ALTER TABLE ONLY "public"."fixtures"
    ADD CONSTRAINT "public_fixtures_away_team_fkey" FOREIGN KEY ("away_team") REFERENCES "public"."teams"("id");

ALTER TABLE ONLY "public"."fixtures"
    ADD CONSTRAINT "public_fixtures_home_team_fkey" FOREIGN KEY ("home_team") REFERENCES "public"."teams"("id");

ALTER TABLE ONLY "public"."player_statistics"
    ADD CONSTRAINT "public_player_statistics_author_fkey" FOREIGN KEY ("author") REFERENCES "auth"."users"("id");

ALTER TABLE ONLY "public"."player_statistics"
    ADD CONSTRAINT "public_player_statistics_fixture_id_fkey" FOREIGN KEY ("fixture_id") REFERENCES "public"."fixtures"("id");

ALTER TABLE ONLY "public"."player_statistics"
    ADD CONSTRAINT "public_player_statistics_player_id_fkey" FOREIGN KEY ("player_id") REFERENCES "public"."players"("player_id");

ALTER TABLE ONLY "public"."weekly_statistics"
    ADD CONSTRAINT "public_weekly_statistics_team_fkey" FOREIGN KEY ("team") REFERENCES "public"."drafted_teams"("drafted_team_id");

CREATE POLICY "Allow all access to authenticated user" ON "public"."drafted_transfers" TO "authenticated" USING (true);

CREATE POLICY "Allow auth users access to all" ON "public"."players" TO "authenticated" USING (true);

CREATE POLICY "Allow read access" ON "public"."drafted_teams_pending" FOR SELECT USING (true);

CREATE POLICY "Enable all access for authenticated users" ON "public"."drafted_teams" TO "authenticated" WITH CHECK (true);

CREATE POLICY "Enable read access for all users" ON "public"."drafted_players" FOR SELECT USING (true);

CREATE POLICY "Enable read access for all users" ON "public"."drafted_teams" FOR SELECT USING (true);

CREATE POLICY "Enable read access for all users" ON "public"."drafted_transfers" FOR SELECT USING (true);

CREATE POLICY "Enable read access for all users" ON "public"."players" FOR SELECT USING (true);

CREATE POLICY "Public profiles are viewable by everyone." ON "public"."profiles" FOR SELECT USING (true);

CREATE POLICY "Users can insert their own profile." ON "public"."profiles" FOR INSERT WITH CHECK (("auth"."uid"() = "id"));

CREATE POLICY "Users can update own profile." ON "public"."profiles" FOR UPDATE USING (("auth"."uid"() = "id"));

CREATE POLICY "all all access for auithenticated" ON "public"."player_statistics" TO "authenticated" USING (true);

CREATE POLICY "allow all access for authenticated" ON "public"."fixtures" TO "authenticated" USING (true);

CREATE POLICY "allow_read_access_to_all" ON "public"."teams" FOR SELECT USING (true);

ALTER TABLE "public"."drafted_players" ENABLE ROW LEVEL SECURITY;

ALTER TABLE "public"."drafted_players_pending" ENABLE ROW LEVEL SECURITY;

ALTER TABLE "public"."drafted_teams" ENABLE ROW LEVEL SECURITY;

ALTER TABLE "public"."drafted_teams_pending" ENABLE ROW LEVEL SECURITY;

ALTER TABLE "public"."drafted_transfers" ENABLE ROW LEVEL SECURITY;

CREATE POLICY "enable read access" ON "public"."drafted_players_pending" FOR SELECT USING (true);

ALTER TABLE "public"."fixtures" ENABLE ROW LEVEL SECURITY;

ALTER TABLE "public"."player_statistics" ENABLE ROW LEVEL SECURITY;

ALTER TABLE "public"."players" ENABLE ROW LEVEL SECURITY;

ALTER TABLE "public"."profiles" ENABLE ROW LEVEL SECURITY;

ALTER TABLE "public"."teams" ENABLE ROW LEVEL SECURITY;

ALTER PUBLICATION "supabase_realtime" OWNER TO "postgres";

REVOKE USAGE ON SCHEMA "public" FROM PUBLIC;
GRANT USAGE ON SCHEMA "public" TO "postgres";
GRANT USAGE ON SCHEMA "public" TO "anon";
GRANT USAGE ON SCHEMA "public" TO "authenticated";
GRANT USAGE ON SCHEMA "public" TO "service_role";

GRANT ALL ON FUNCTION "public"."delete_rows_with_criteria"() TO "anon";
GRANT ALL ON FUNCTION "public"."delete_rows_with_criteria"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."delete_rows_with_criteria"() TO "service_role";

GRANT ALL ON FUNCTION "public"."get_drafted_teams_and_players"() TO "anon";
GRANT ALL ON FUNCTION "public"."get_drafted_teams_and_players"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."get_drafted_teams_and_players"() TO "service_role";

GRANT ALL ON FUNCTION "public"."get_drafted_teams_with_player_points_by_gameweek"("game_week_param" integer) TO "anon";
GRANT ALL ON FUNCTION "public"."get_drafted_teams_with_player_points_by_gameweek"("game_week_param" integer) TO "authenticated";
GRANT ALL ON FUNCTION "public"."get_drafted_teams_with_player_points_by_gameweek"("game_week_param" integer) TO "service_role";

GRANT ALL ON FUNCTION "public"."get_player_stats_by_team_id"("team_id_param" integer) TO "anon";
GRANT ALL ON FUNCTION "public"."get_player_stats_by_team_id"("team_id_param" integer) TO "authenticated";
GRANT ALL ON FUNCTION "public"."get_player_stats_by_team_id"("team_id_param" integer) TO "service_role";

GRANT ALL ON FUNCTION "public"."get_player_stats_by_team_id_for_fixture"("team_id_param" integer, "fixture_id_param" integer) TO "anon";
GRANT ALL ON FUNCTION "public"."get_player_stats_by_team_id_for_fixture"("team_id_param" integer, "fixture_id_param" integer) TO "authenticated";
GRANT ALL ON FUNCTION "public"."get_player_stats_by_team_id_for_fixture"("team_id_param" integer, "fixture_id_param" integer) TO "service_role";

GRANT ALL ON FUNCTION "public"."get_player_team"() TO "anon";
GRANT ALL ON FUNCTION "public"."get_player_team"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."get_player_team"() TO "service_role";

GRANT ALL ON FUNCTION "public"."get_weekly_stats_for_gameweek"("target_week" integer) TO "anon";
GRANT ALL ON FUNCTION "public"."get_weekly_stats_for_gameweek"("target_week" integer) TO "authenticated";
GRANT ALL ON FUNCTION "public"."get_weekly_stats_for_gameweek"("target_week" integer) TO "service_role";

GRANT ALL ON FUNCTION "public"."get_weekly_winners"() TO "anon";
GRANT ALL ON FUNCTION "public"."get_weekly_winners"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."get_weekly_winners"() TO "service_role";

GRANT ALL ON FUNCTION "public"."handle_new_user"() TO "anon";
GRANT ALL ON FUNCTION "public"."handle_new_user"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."handle_new_user"() TO "service_role";

GRANT ALL ON FUNCTION "public"."insert_or_update_data"("id_field" integer, "other_field" "text") TO "anon";
GRANT ALL ON FUNCTION "public"."insert_or_update_data"("id_field" integer, "other_field" "text") TO "authenticated";
GRANT ALL ON FUNCTION "public"."insert_or_update_data"("id_field" integer, "other_field" "text") TO "service_role";

GRANT ALL ON FUNCTION "public"."set_author"() TO "anon";
GRANT ALL ON FUNCTION "public"."set_author"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."set_author"() TO "service_role";

GRANT ALL ON FUNCTION "public"."your_function_name"("game_week_param" integer) TO "anon";
GRANT ALL ON FUNCTION "public"."your_function_name"("game_week_param" integer) TO "authenticated";
GRANT ALL ON FUNCTION "public"."your_function_name"("game_week_param" integer) TO "service_role";

GRANT ALL ON TABLE "public"."drafted_players" TO "anon";
GRANT ALL ON TABLE "public"."drafted_players" TO "authenticated";
GRANT ALL ON TABLE "public"."drafted_players" TO "service_role";

GRANT ALL ON SEQUENCE "public"."drafted_players_id_seq" TO "anon";
GRANT ALL ON SEQUENCE "public"."drafted_players_id_seq" TO "authenticated";
GRANT ALL ON SEQUENCE "public"."drafted_players_id_seq" TO "service_role";

GRANT ALL ON TABLE "public"."drafted_players_pending" TO "anon";
GRANT ALL ON TABLE "public"."drafted_players_pending" TO "authenticated";
GRANT ALL ON TABLE "public"."drafted_players_pending" TO "service_role";

GRANT ALL ON SEQUENCE "public"."drafted_players_pending_drafted_player_id_seq" TO "anon";
GRANT ALL ON SEQUENCE "public"."drafted_players_pending_drafted_player_id_seq" TO "authenticated";
GRANT ALL ON SEQUENCE "public"."drafted_players_pending_drafted_player_id_seq" TO "service_role";

GRANT ALL ON TABLE "public"."drafted_teams" TO "anon";
GRANT ALL ON TABLE "public"."drafted_teams" TO "authenticated";
GRANT ALL ON TABLE "public"."drafted_teams" TO "service_role";

GRANT ALL ON SEQUENCE "public"."drafted_teams_team_id_seq" TO "anon";
GRANT ALL ON SEQUENCE "public"."drafted_teams_team_id_seq" TO "authenticated";
GRANT ALL ON SEQUENCE "public"."drafted_teams_team_id_seq" TO "service_role";

GRANT ALL ON TABLE "public"."drafted_teams_pending" TO "anon";
GRANT ALL ON TABLE "public"."drafted_teams_pending" TO "authenticated";
GRANT ALL ON TABLE "public"."drafted_teams_pending" TO "service_role";

GRANT ALL ON TABLE "public"."drafted_transfers" TO "anon";
GRANT ALL ON TABLE "public"."drafted_transfers" TO "authenticated";
GRANT ALL ON TABLE "public"."drafted_transfers" TO "service_role";

GRANT ALL ON SEQUENCE "public"."drafted_transfers_id_seq" TO "anon";
GRANT ALL ON SEQUENCE "public"."drafted_transfers_id_seq" TO "authenticated";
GRANT ALL ON SEQUENCE "public"."drafted_transfers_id_seq" TO "service_role";

GRANT ALL ON TABLE "public"."fixtures" TO "anon";
GRANT ALL ON TABLE "public"."fixtures" TO "authenticated";
GRANT ALL ON TABLE "public"."fixtures" TO "service_role";

GRANT ALL ON SEQUENCE "public"."fixtures_id_seq" TO "anon";
GRANT ALL ON SEQUENCE "public"."fixtures_id_seq" TO "authenticated";
GRANT ALL ON SEQUENCE "public"."fixtures_id_seq" TO "service_role";

GRANT ALL ON TABLE "public"."player_statistics" TO "anon";
GRANT ALL ON TABLE "public"."player_statistics" TO "authenticated";
GRANT ALL ON TABLE "public"."player_statistics" TO "service_role";

GRANT ALL ON SEQUENCE "public"."player_statistics_id_seq" TO "anon";
GRANT ALL ON SEQUENCE "public"."player_statistics_id_seq" TO "authenticated";
GRANT ALL ON SEQUENCE "public"."player_statistics_id_seq" TO "service_role";

GRANT ALL ON TABLE "public"."players" TO "anon";
GRANT ALL ON TABLE "public"."players" TO "authenticated";
GRANT ALL ON TABLE "public"."players" TO "service_role";

GRANT ALL ON TABLE "public"."teams" TO "anon";
GRANT ALL ON TABLE "public"."teams" TO "authenticated";
GRANT ALL ON TABLE "public"."teams" TO "service_role";

GRANT ALL ON TABLE "public"."players_view" TO "anon";
GRANT ALL ON TABLE "public"."players_view" TO "authenticated";
GRANT ALL ON TABLE "public"."players_view" TO "service_role";

GRANT ALL ON TABLE "public"."profiles" TO "anon";
GRANT ALL ON TABLE "public"."profiles" TO "authenticated";
GRANT ALL ON TABLE "public"."profiles" TO "service_role";

GRANT ALL ON TABLE "public"."weekly_statistics" TO "anon";
GRANT ALL ON TABLE "public"."weekly_statistics" TO "authenticated";
GRANT ALL ON TABLE "public"."weekly_statistics" TO "service_role";

GRANT ALL ON SEQUENCE "public"."weekly_statistics_id_seq" TO "anon";
GRANT ALL ON SEQUENCE "public"."weekly_statistics_id_seq" TO "authenticated";
GRANT ALL ON SEQUENCE "public"."weekly_statistics_id_seq" TO "service_role";

ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON SEQUENCES  TO "postgres";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON SEQUENCES  TO "anon";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON SEQUENCES  TO "authenticated";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON SEQUENCES  TO "service_role";

ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON FUNCTIONS  TO "postgres";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON FUNCTIONS  TO "anon";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON FUNCTIONS  TO "authenticated";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON FUNCTIONS  TO "service_role";

ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON TABLES  TO "postgres";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON TABLES  TO "anon";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON TABLES  TO "authenticated";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON TABLES  TO "service_role";

RESET ALL;

--
-- Dumped schema changes for auth and storage
--

