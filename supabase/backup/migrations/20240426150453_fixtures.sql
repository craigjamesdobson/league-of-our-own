create extension if not exists "moddatetime" with schema "extensions";


create sequence "public"."drafted_teams_team_id_seq";

create table "public"."drafted_players" (
    "drafted_player_id" bigint generated by default as identity not null,
    "created_at" timestamp with time zone not null default now(),
    "drafted_team" integer,
    "drafted_player" integer
);


alter table "public"."drafted_players" enable row level security;

create table "public"."drafted_players_pending" (
    "drafted_player_id" bigint generated by default as identity not null,
    "created_at" timestamp with time zone not null default now(),
    "drafted_team" integer,
    "drafted_player" integer
);


alter table "public"."drafted_players_pending" enable row level security;

create table "public"."drafted_teams" (
    "drafted_team_id" integer not null default nextval('drafted_teams_team_id_seq'::regclass),
    "team_name" text not null,
    "team_owner" text not null,
    "team_email" character varying(255) not null,
    "allowed_transfers" boolean not null
);


alter table "public"."drafted_teams" enable row level security;

create table "public"."drafted_teams_pending" (
    "drafted_team_id" bigint not null default nextval('drafted_teams_team_id_seq'::regclass),
    "created_at" timestamp with time zone not null default now(),
    "team_name" text not null,
    "team_owner" text not null,
    "team_email" text not null,
    "allowed_transfers" boolean not null,
    "key" uuid not null default gen_random_uuid()
);


alter table "public"."drafted_teams_pending" enable row level security;

create table "public"."drafted_transfers" (
    "drafted_transfer_id" bigint generated by default as identity not null,
    "created_at" timestamp with time zone not null default now(),
    "transfer_week" integer,
    "active_transfer_expiry" date,
    "player_id" integer not null,
    "drafted_player" bigint not null
);


alter table "public"."drafted_transfers" enable row level security;

create table "public"."fixtures" (
    "id" bigint generated by default as identity not null,
    "created_at" timestamp with time zone not null default now(),
    "game_week" bigint,
    "home_team" integer,
    "away_team" integer,
    "home_team_score" integer,
    "away_team_score" integer
);


alter table "public"."fixtures" enable row level security;

create table "public"."player_statistics" (
    "id" bigint generated by default as identity not null,
    "created_at" timestamp with time zone not null default now(),
    "player_id" integer,
    "fixture_id" bigint,
    "goals" integer,
    "assists" integer,
    "red_card" boolean,
    "clean_sheet" boolean,
    "author" uuid,
    "points" integer not null default 0
);


alter table "public"."player_statistics" enable row level security;

create table "public"."players" (
    "chance_of_playing_next_round" text,
    "chance_of_playing_this_round" text,
    "code" integer not null,
    "cost_change_event" integer,
    "cost_change_event_fall" integer,
    "cost_change_start" integer,
    "cost_change_start_fall" integer,
    "dreamteam_count" integer,
    "element_type" integer,
    "ep_next" text,
    "ep_this" text,
    "event_points" integer,
    "first_name" text,
    "form" text,
    "player_id" integer not null,
    "in_dreamteam" boolean,
    "news" text,
    "news_added" text,
    "now_cost" integer,
    "photo" text,
    "points_per_game" text,
    "second_name" text,
    "selected_by_percent" text,
    "special" boolean,
    "squad_number" text,
    "status" text,
    "team" integer not null,
    "team_code" bigint,
    "total_points" integer,
    "transfers_in" integer,
    "transfers_in_event" integer,
    "transfers_out" integer,
    "transfers_out_event" integer,
    "value_form" text,
    "value_season" text,
    "web_name" text,
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
    "influence" text,
    "creativity" text,
    "threat" text,
    "ict_index" text,
    "starts" integer,
    "expected_goals" text,
    "expected_assists" text,
    "expected_goal_involvements" text,
    "expected_goals_conceded" text,
    "influence_rank" integer,
    "influence_rank_type" integer,
    "creativity_rank" integer,
    "creativity_rank_type" integer,
    "threat_rank" integer,
    "threat_rank_type" integer,
    "ict_index_rank" integer,
    "ict_index_rank_type" integer,
    "corners_and_indirect_freekicks_order" text,
    "corners_and_indirect_freekicks_text" text,
    "direct_freekicks_order" text,
    "direct_freekicks_text" text,
    "penalties_order" text,
    "penalties_text" text,
    "expected_goals_per_90" text,
    "saves_per_90" text,
    "expected_assists_per_90" text,
    "expected_goal_involvements_per_90" text,
    "expected_goals_conceded_per_90" text,
    "goals_conceded_per_90" text,
    "now_cost_rank" integer,
    "now_cost_rank_type" integer,
    "form_rank" integer,
    "form_rank_type" integer,
    "points_per_game_rank" integer,
    "points_per_game_rank_type" integer,
    "selected_rank" integer,
    "selected_rank_type" integer,
    "starts_per_90" text,
    "clean_sheets_per_90" text,
    "updated_at" timestamp with time zone,
    "created_at" timestamp with time zone
);


alter table "public"."players" enable row level security;

create table "public"."profiles" (
    "id" uuid not null,
    "updated_at" timestamp with time zone,
    "username" text,
    "full_name" text,
    "avatar_url" text,
    "website" text
);


alter table "public"."profiles" enable row level security;

create table "public"."teams" (
    "code" integer not null,
    "draw" integer,
    "form" text,
    "id" integer not null,
    "loss" integer,
    "name" text,
    "played" integer,
    "points" integer,
    "position" integer,
    "short_name" text,
    "strength" integer,
    "team_division" text,
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


alter table "public"."teams" enable row level security;

alter sequence "public"."drafted_teams_team_id_seq" owned by "public"."drafted_teams"."drafted_team_id";

CREATE UNIQUE INDEX drafted_players_pending_pkey ON public.drafted_players_pending USING btree (drafted_player_id);

CREATE UNIQUE INDEX drafted_players_pkey ON public.drafted_players USING btree (drafted_player_id);

CREATE UNIQUE INDEX drafted_teams_pending_drafted_team_id_key ON public.drafted_teams_pending USING btree (drafted_team_id);

CREATE UNIQUE INDEX drafted_teams_pending_key_key ON public.drafted_teams_pending USING btree (key);

CREATE UNIQUE INDEX drafted_teams_pending_pkey ON public.drafted_teams_pending USING btree (drafted_team_id);

CREATE UNIQUE INDEX drafted_teams_pkey ON public.drafted_teams USING btree (drafted_team_id);

CREATE UNIQUE INDEX drafted_transfers_pkey ON public.drafted_transfers USING btree (drafted_transfer_id);

CREATE UNIQUE INDEX fixtures_pkey ON public.fixtures USING btree (id);

CREATE UNIQUE INDEX player_statistics_pkey ON public.player_statistics USING btree (id);

CREATE UNIQUE INDEX players_pkey ON public.players USING btree (player_id);

CREATE UNIQUE INDEX profiles_pkey ON public.profiles USING btree (id);

CREATE UNIQUE INDEX profiles_username_key ON public.profiles USING btree (username);

CREATE UNIQUE INDEX teams_pkey ON public.teams USING btree (id);

CREATE UNIQUE INDEX unique_player_fixture_combination ON public.player_statistics USING btree (player_id, fixture_id);

alter table "public"."drafted_players" add constraint "drafted_players_pkey" PRIMARY KEY using index "drafted_players_pkey";

alter table "public"."drafted_players_pending" add constraint "drafted_players_pending_pkey" PRIMARY KEY using index "drafted_players_pending_pkey";

alter table "public"."drafted_teams" add constraint "drafted_teams_pkey" PRIMARY KEY using index "drafted_teams_pkey";

alter table "public"."drafted_teams_pending" add constraint "drafted_teams_pending_pkey" PRIMARY KEY using index "drafted_teams_pending_pkey";

alter table "public"."drafted_transfers" add constraint "drafted_transfers_pkey" PRIMARY KEY using index "drafted_transfers_pkey";

alter table "public"."fixtures" add constraint "fixtures_pkey" PRIMARY KEY using index "fixtures_pkey";

alter table "public"."player_statistics" add constraint "player_statistics_pkey" PRIMARY KEY using index "player_statistics_pkey";

alter table "public"."players" add constraint "players_pkey" PRIMARY KEY using index "players_pkey";

alter table "public"."profiles" add constraint "profiles_pkey" PRIMARY KEY using index "profiles_pkey";

alter table "public"."teams" add constraint "teams_pkey" PRIMARY KEY using index "teams_pkey";

alter table "public"."drafted_players" add constraint "drafted_players_drafted_player_fkey" FOREIGN KEY (drafted_player) REFERENCES players(player_id) not valid;

alter table "public"."drafted_players" validate constraint "drafted_players_drafted_player_fkey";

alter table "public"."drafted_players" add constraint "drafted_players_drafted_team_fkey" FOREIGN KEY (drafted_team) REFERENCES drafted_teams(drafted_team_id) not valid;

alter table "public"."drafted_players" validate constraint "drafted_players_drafted_team_fkey";

alter table "public"."drafted_players_pending" add constraint "drafted_players_pending_drafted_player_fkey" FOREIGN KEY (drafted_player) REFERENCES players(player_id) not valid;

alter table "public"."drafted_players_pending" validate constraint "drafted_players_pending_drafted_player_fkey";

alter table "public"."drafted_players_pending" add constraint "drafted_players_pending_drafted_team_fkey" FOREIGN KEY (drafted_team) REFERENCES drafted_teams_pending(drafted_team_id) not valid;

alter table "public"."drafted_players_pending" validate constraint "drafted_players_pending_drafted_team_fkey";

alter table "public"."drafted_teams_pending" add constraint "drafted_teams_pending_drafted_team_id_key" UNIQUE using index "drafted_teams_pending_drafted_team_id_key";

alter table "public"."drafted_teams_pending" add constraint "drafted_teams_pending_key_key" UNIQUE using index "drafted_teams_pending_key_key";

alter table "public"."drafted_transfers" add constraint "drafted_transfers_drafted_player_fkey" FOREIGN KEY (drafted_player) REFERENCES drafted_players(drafted_player_id) not valid;

alter table "public"."drafted_transfers" validate constraint "drafted_transfers_drafted_player_fkey";

alter table "public"."drafted_transfers" add constraint "drafted_transfers_player_id_fkey" FOREIGN KEY (player_id) REFERENCES players(player_id) not valid;

alter table "public"."drafted_transfers" validate constraint "drafted_transfers_player_id_fkey";

alter table "public"."fixtures" add constraint "public_fixtures_away_team_fkey" FOREIGN KEY (away_team) REFERENCES teams(id) not valid;

alter table "public"."fixtures" validate constraint "public_fixtures_away_team_fkey";

alter table "public"."fixtures" add constraint "public_fixtures_home_team_fkey" FOREIGN KEY (home_team) REFERENCES teams(id) not valid;

alter table "public"."fixtures" validate constraint "public_fixtures_home_team_fkey";

alter table "public"."player_statistics" add constraint "public_player_statistics_author_fkey" FOREIGN KEY (author) REFERENCES auth.users(id) ON UPDATE CASCADE not valid;

alter table "public"."player_statistics" validate constraint "public_player_statistics_author_fkey";

alter table "public"."player_statistics" add constraint "public_player_statistics_fixture_id_fkey" FOREIGN KEY (fixture_id) REFERENCES fixtures(id) not valid;

alter table "public"."player_statistics" validate constraint "public_player_statistics_fixture_id_fkey";

alter table "public"."player_statistics" add constraint "public_player_statistics_player_id_fkey" FOREIGN KEY (player_id) REFERENCES players(player_id) not valid;

alter table "public"."player_statistics" validate constraint "public_player_statistics_player_id_fkey";

alter table "public"."player_statistics" add constraint "unique_player_fixture_combination" UNIQUE using index "unique_player_fixture_combination";

alter table "public"."players" add constraint "players_team_fkey" FOREIGN KEY (team) REFERENCES teams(id) not valid;

alter table "public"."players" validate constraint "players_team_fkey";

alter table "public"."profiles" add constraint "profiles_id_fkey" FOREIGN KEY (id) REFERENCES auth.users(id) ON DELETE CASCADE not valid;

alter table "public"."profiles" validate constraint "profiles_id_fkey";

alter table "public"."profiles" add constraint "profiles_username_key" UNIQUE using index "profiles_username_key";

alter table "public"."profiles" add constraint "username_length" CHECK ((char_length(username) >= 3)) not valid;

alter table "public"."profiles" validate constraint "username_length";

set check_function_bodies = off;

CREATE OR REPLACE FUNCTION public.delete_rows_with_criteria()
 RETURNS trigger
 LANGUAGE plpgsql
AS $function$
BEGIN
    -- Delete rows that match the specified criteria
    DELETE FROM player_statistics
    WHERE (goals = 0 OR goals IS NULL)
      AND (assists = 0 OR assists IS NULL)
      AND (clean_sheet = false OR clean_sheet IS NULL)
      AND (red_card = false OR red_card IS NULL);

    RETURN NULL; -- Returning NULL to indicate that the trigger has completed successfully
END;
$function$
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

CREATE OR REPLACE FUNCTION public.get_player_stats_by_team_id(team_id_param integer)
 RETURNS TABLE(player_id integer, number_code integer, image text, image_large text, web_name text, first_name text, second_name text, goals_scored integer, assists integer, clean_sheets integer, red_cards integer, cost numeric, status text, is_unavailable boolean, unavailable_for_season boolean, news text, "position" integer, team integer, team_name text, team_short_name text, minutes integer, week_goals integer, week_assists integer, week_cleansheet boolean, week_redcard boolean)
 LANGUAGE plpgsql
AS $function$
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
$function$
;

CREATE OR REPLACE FUNCTION public.get_player_stats_by_team_id_for_fixture(team_id_param integer, fixture_id_param integer)
 RETURNS TABLE(player_id integer, code integer, image text, image_large text, web_name text, first_name text, second_name text, goals_scored integer, assists integer, clean_sheets integer, red_cards integer, cost numeric, status text, is_unavailable boolean, unavailable_for_season boolean, news text, "position" integer, team integer, team_name text, team_short_name text, minutes integer, week_goals integer, week_assists integer, week_cleansheet boolean, week_redcard boolean)
 LANGUAGE plpgsql
AS $function$
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
$function$
;

CREATE OR REPLACE FUNCTION public.get_player_team()
 RETURNS TABLE(web_name text, team_name text, team_id bigint)
 LANGUAGE plpgsql
AS $function$
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
$function$
;

CREATE OR REPLACE FUNCTION public.handle_new_user()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
AS $function$
begin
  insert into public.profiles (id, full_name, avatar_url)
  values (new.id, new.raw_user_meta_data->>'full_name', new.raw_user_meta_data->>'avatar_url');
  return new;
end;
$function$
;

CREATE OR REPLACE FUNCTION public.insert_or_update_data(id_field integer, other_field text)
 RETURNS void
 LANGUAGE plpgsql
AS $function$
BEGIN
    IF id_field = 0 THEN
        -- Insert new row
        INSERT INTO your_table_name(id_field, other_field) VALUES (id_field, other_field);
    ELSE
        -- Update existing row
        UPDATE your_table_name SET other_field = other_field WHERE id_field = id_field;
    END IF;
END;
$function$
;

create or replace view "public"."players_view" as  SELECT p.player_id,
    p.code,
    (('https://resources.premierleague.com/premierleague/photos/players/40x40/p'::text || p.code) || '.png'::text) AS image,
    (('https://resources.premierleague.com/premierleague/photos/players/250x250/p'::text || p.code) || '.png'::text) AS image_large,
    p.web_name,
    p.first_name,
    p.second_name,
    p.goals_scored,
    p.assists,
    p.clean_sheets,
    p.red_cards,
    round((((p.now_cost + p.cost_change_start_fall))::numeric / 10.0), 1) AS cost,
        CASE
            WHEN (p.status = ANY (ARRAY['i'::text, 'n'::text, 's'::text, 'd'::text])) THEN 'temporary-unavailable'::text
            WHEN (p.status = 'u'::text) THEN 'unavailable-for-season'::text
            ELSE 'available'::text
        END AS status,
        CASE
            WHEN (p.status = ANY (ARRAY['i'::text, 'n'::text, 's'::text, 'd'::text, 'u'::text])) THEN true
            ELSE false
        END AS is_unavailable,
        CASE
            WHEN (p.status = 'u'::text) THEN true
            ELSE false
        END AS unavailable_for_season,
    p.news,
    p.element_type AS "position",
    p.team,
    t.name AS team_name,
    t.short_name AS team_short_name,
    p.minutes
   FROM (players p
     LEFT JOIN teams t ON ((p.team = t.id)));


CREATE OR REPLACE FUNCTION public.set_author()
 RETURNS trigger
 LANGUAGE plpgsql
AS $function$BEGIN
    IF TG_OP = 'INSERT' THEN
        NEW.author := auth.uid();
    ELSIF TG_OP = 'UPDATE' THEN
        NEW.author := auth.uid();
    END IF;
    RETURN NEW;
END;$function$
;

grant delete on table "public"."drafted_players" to "anon";

grant insert on table "public"."drafted_players" to "anon";

grant references on table "public"."drafted_players" to "anon";

grant select on table "public"."drafted_players" to "anon";

grant trigger on table "public"."drafted_players" to "anon";

grant truncate on table "public"."drafted_players" to "anon";

grant update on table "public"."drafted_players" to "anon";

grant delete on table "public"."drafted_players" to "authenticated";

grant insert on table "public"."drafted_players" to "authenticated";

grant references on table "public"."drafted_players" to "authenticated";

grant select on table "public"."drafted_players" to "authenticated";

grant trigger on table "public"."drafted_players" to "authenticated";

grant truncate on table "public"."drafted_players" to "authenticated";

grant update on table "public"."drafted_players" to "authenticated";

grant delete on table "public"."drafted_players" to "service_role";

grant insert on table "public"."drafted_players" to "service_role";

grant references on table "public"."drafted_players" to "service_role";

grant select on table "public"."drafted_players" to "service_role";

grant trigger on table "public"."drafted_players" to "service_role";

grant truncate on table "public"."drafted_players" to "service_role";

grant update on table "public"."drafted_players" to "service_role";

grant delete on table "public"."drafted_players_pending" to "anon";

grant insert on table "public"."drafted_players_pending" to "anon";

grant references on table "public"."drafted_players_pending" to "anon";

grant select on table "public"."drafted_players_pending" to "anon";

grant trigger on table "public"."drafted_players_pending" to "anon";

grant truncate on table "public"."drafted_players_pending" to "anon";

grant update on table "public"."drafted_players_pending" to "anon";

grant delete on table "public"."drafted_players_pending" to "authenticated";

grant insert on table "public"."drafted_players_pending" to "authenticated";

grant references on table "public"."drafted_players_pending" to "authenticated";

grant select on table "public"."drafted_players_pending" to "authenticated";

grant trigger on table "public"."drafted_players_pending" to "authenticated";

grant truncate on table "public"."drafted_players_pending" to "authenticated";

grant update on table "public"."drafted_players_pending" to "authenticated";

grant delete on table "public"."drafted_players_pending" to "service_role";

grant insert on table "public"."drafted_players_pending" to "service_role";

grant references on table "public"."drafted_players_pending" to "service_role";

grant select on table "public"."drafted_players_pending" to "service_role";

grant trigger on table "public"."drafted_players_pending" to "service_role";

grant truncate on table "public"."drafted_players_pending" to "service_role";

grant update on table "public"."drafted_players_pending" to "service_role";

grant delete on table "public"."drafted_teams" to "anon";

grant insert on table "public"."drafted_teams" to "anon";

grant references on table "public"."drafted_teams" to "anon";

grant select on table "public"."drafted_teams" to "anon";

grant trigger on table "public"."drafted_teams" to "anon";

grant truncate on table "public"."drafted_teams" to "anon";

grant update on table "public"."drafted_teams" to "anon";

grant delete on table "public"."drafted_teams" to "authenticated";

grant insert on table "public"."drafted_teams" to "authenticated";

grant references on table "public"."drafted_teams" to "authenticated";

grant select on table "public"."drafted_teams" to "authenticated";

grant trigger on table "public"."drafted_teams" to "authenticated";

grant truncate on table "public"."drafted_teams" to "authenticated";

grant update on table "public"."drafted_teams" to "authenticated";

grant delete on table "public"."drafted_teams" to "service_role";

grant insert on table "public"."drafted_teams" to "service_role";

grant references on table "public"."drafted_teams" to "service_role";

grant select on table "public"."drafted_teams" to "service_role";

grant trigger on table "public"."drafted_teams" to "service_role";

grant truncate on table "public"."drafted_teams" to "service_role";

grant update on table "public"."drafted_teams" to "service_role";

grant delete on table "public"."drafted_teams_pending" to "anon";

grant insert on table "public"."drafted_teams_pending" to "anon";

grant references on table "public"."drafted_teams_pending" to "anon";

grant select on table "public"."drafted_teams_pending" to "anon";

grant trigger on table "public"."drafted_teams_pending" to "anon";

grant truncate on table "public"."drafted_teams_pending" to "anon";

grant update on table "public"."drafted_teams_pending" to "anon";

grant delete on table "public"."drafted_teams_pending" to "authenticated";

grant insert on table "public"."drafted_teams_pending" to "authenticated";

grant references on table "public"."drafted_teams_pending" to "authenticated";

grant select on table "public"."drafted_teams_pending" to "authenticated";

grant trigger on table "public"."drafted_teams_pending" to "authenticated";

grant truncate on table "public"."drafted_teams_pending" to "authenticated";

grant update on table "public"."drafted_teams_pending" to "authenticated";

grant delete on table "public"."drafted_teams_pending" to "service_role";

grant insert on table "public"."drafted_teams_pending" to "service_role";

grant references on table "public"."drafted_teams_pending" to "service_role";

grant select on table "public"."drafted_teams_pending" to "service_role";

grant trigger on table "public"."drafted_teams_pending" to "service_role";

grant truncate on table "public"."drafted_teams_pending" to "service_role";

grant update on table "public"."drafted_teams_pending" to "service_role";

grant delete on table "public"."drafted_transfers" to "anon";

grant insert on table "public"."drafted_transfers" to "anon";

grant references on table "public"."drafted_transfers" to "anon";

grant select on table "public"."drafted_transfers" to "anon";

grant trigger on table "public"."drafted_transfers" to "anon";

grant truncate on table "public"."drafted_transfers" to "anon";

grant update on table "public"."drafted_transfers" to "anon";

grant delete on table "public"."drafted_transfers" to "authenticated";

grant insert on table "public"."drafted_transfers" to "authenticated";

grant references on table "public"."drafted_transfers" to "authenticated";

grant select on table "public"."drafted_transfers" to "authenticated";

grant trigger on table "public"."drafted_transfers" to "authenticated";

grant truncate on table "public"."drafted_transfers" to "authenticated";

grant update on table "public"."drafted_transfers" to "authenticated";

grant delete on table "public"."drafted_transfers" to "service_role";

grant insert on table "public"."drafted_transfers" to "service_role";

grant references on table "public"."drafted_transfers" to "service_role";

grant select on table "public"."drafted_transfers" to "service_role";

grant trigger on table "public"."drafted_transfers" to "service_role";

grant truncate on table "public"."drafted_transfers" to "service_role";

grant update on table "public"."drafted_transfers" to "service_role";

grant delete on table "public"."fixtures" to "anon";

grant insert on table "public"."fixtures" to "anon";

grant references on table "public"."fixtures" to "anon";

grant select on table "public"."fixtures" to "anon";

grant trigger on table "public"."fixtures" to "anon";

grant truncate on table "public"."fixtures" to "anon";

grant update on table "public"."fixtures" to "anon";

grant delete on table "public"."fixtures" to "authenticated";

grant insert on table "public"."fixtures" to "authenticated";

grant references on table "public"."fixtures" to "authenticated";

grant select on table "public"."fixtures" to "authenticated";

grant trigger on table "public"."fixtures" to "authenticated";

grant truncate on table "public"."fixtures" to "authenticated";

grant update on table "public"."fixtures" to "authenticated";

grant delete on table "public"."fixtures" to "service_role";

grant insert on table "public"."fixtures" to "service_role";

grant references on table "public"."fixtures" to "service_role";

grant select on table "public"."fixtures" to "service_role";

grant trigger on table "public"."fixtures" to "service_role";

grant truncate on table "public"."fixtures" to "service_role";

grant update on table "public"."fixtures" to "service_role";

grant delete on table "public"."player_statistics" to "anon";

grant insert on table "public"."player_statistics" to "anon";

grant references on table "public"."player_statistics" to "anon";

grant select on table "public"."player_statistics" to "anon";

grant trigger on table "public"."player_statistics" to "anon";

grant truncate on table "public"."player_statistics" to "anon";

grant update on table "public"."player_statistics" to "anon";

grant delete on table "public"."player_statistics" to "authenticated";

grant insert on table "public"."player_statistics" to "authenticated";

grant references on table "public"."player_statistics" to "authenticated";

grant select on table "public"."player_statistics" to "authenticated";

grant trigger on table "public"."player_statistics" to "authenticated";

grant truncate on table "public"."player_statistics" to "authenticated";

grant update on table "public"."player_statistics" to "authenticated";

grant delete on table "public"."player_statistics" to "service_role";

grant insert on table "public"."player_statistics" to "service_role";

grant references on table "public"."player_statistics" to "service_role";

grant select on table "public"."player_statistics" to "service_role";

grant trigger on table "public"."player_statistics" to "service_role";

grant truncate on table "public"."player_statistics" to "service_role";

grant update on table "public"."player_statistics" to "service_role";

grant delete on table "public"."players" to "anon";

grant insert on table "public"."players" to "anon";

grant references on table "public"."players" to "anon";

grant select on table "public"."players" to "anon";

grant trigger on table "public"."players" to "anon";

grant truncate on table "public"."players" to "anon";

grant update on table "public"."players" to "anon";

grant delete on table "public"."players" to "authenticated";

grant insert on table "public"."players" to "authenticated";

grant references on table "public"."players" to "authenticated";

grant select on table "public"."players" to "authenticated";

grant trigger on table "public"."players" to "authenticated";

grant truncate on table "public"."players" to "authenticated";

grant update on table "public"."players" to "authenticated";

grant delete on table "public"."players" to "service_role";

grant insert on table "public"."players" to "service_role";

grant references on table "public"."players" to "service_role";

grant select on table "public"."players" to "service_role";

grant trigger on table "public"."players" to "service_role";

grant truncate on table "public"."players" to "service_role";

grant update on table "public"."players" to "service_role";

grant delete on table "public"."profiles" to "anon";

grant insert on table "public"."profiles" to "anon";

grant references on table "public"."profiles" to "anon";

grant select on table "public"."profiles" to "anon";

grant trigger on table "public"."profiles" to "anon";

grant truncate on table "public"."profiles" to "anon";

grant update on table "public"."profiles" to "anon";

grant delete on table "public"."profiles" to "authenticated";

grant insert on table "public"."profiles" to "authenticated";

grant references on table "public"."profiles" to "authenticated";

grant select on table "public"."profiles" to "authenticated";

grant trigger on table "public"."profiles" to "authenticated";

grant truncate on table "public"."profiles" to "authenticated";

grant update on table "public"."profiles" to "authenticated";

grant delete on table "public"."profiles" to "service_role";

grant insert on table "public"."profiles" to "service_role";

grant references on table "public"."profiles" to "service_role";

grant select on table "public"."profiles" to "service_role";

grant trigger on table "public"."profiles" to "service_role";

grant truncate on table "public"."profiles" to "service_role";

grant update on table "public"."profiles" to "service_role";

grant delete on table "public"."teams" to "anon";

grant insert on table "public"."teams" to "anon";

grant references on table "public"."teams" to "anon";

grant select on table "public"."teams" to "anon";

grant trigger on table "public"."teams" to "anon";

grant truncate on table "public"."teams" to "anon";

grant update on table "public"."teams" to "anon";

grant delete on table "public"."teams" to "authenticated";

grant insert on table "public"."teams" to "authenticated";

grant references on table "public"."teams" to "authenticated";

grant select on table "public"."teams" to "authenticated";

grant trigger on table "public"."teams" to "authenticated";

grant truncate on table "public"."teams" to "authenticated";

grant update on table "public"."teams" to "authenticated";

grant delete on table "public"."teams" to "service_role";

grant insert on table "public"."teams" to "service_role";

grant references on table "public"."teams" to "service_role";

grant select on table "public"."teams" to "service_role";

grant trigger on table "public"."teams" to "service_role";

grant truncate on table "public"."teams" to "service_role";

grant update on table "public"."teams" to "service_role";

create policy "Enable read access for all users"
on "public"."drafted_players"
as permissive
for select
to public
using (true);


create policy "enable read access"
on "public"."drafted_players_pending"
as permissive
for select
to public
using (true);


create policy "Enable all access for authenticated users"
on "public"."drafted_teams"
as permissive
for all
to authenticated
with check (true);


create policy "Enable read access for all users"
on "public"."drafted_teams"
as permissive
for select
to public
using (true);


create policy "Allow read access"
on "public"."drafted_teams_pending"
as permissive
for select
to public
using (true);


create policy "Allow all access to authenticated user"
on "public"."drafted_transfers"
as permissive
for all
to authenticated
using (true);


create policy "Enable read access for all users"
on "public"."drafted_transfers"
as permissive
for select
to public
using (true);


create policy "allow_all_access_to_authenticated"
on "public"."fixtures"
as permissive
for all
to authenticated
using (true);


create policy "allow_auth_all_access"
on "public"."player_statistics"
as permissive
for all
to authenticated
using (true);


create policy "Allow auth users access to all"
on "public"."players"
as permissive
for all
to authenticated
using (true);


create policy "Enable read access for all users"
on "public"."players"
as permissive
for select
to public
using (true);


create policy "Public profiles are viewable by everyone."
on "public"."profiles"
as permissive
for select
to public
using (true);


create policy "Users can insert their own profile."
on "public"."profiles"
as permissive
for insert
to public
with check ((auth.uid() = id));


create policy "Users can update own profile."
on "public"."profiles"
as permissive
for update
to public
using ((auth.uid() = id));


create policy "allow_read_access_to_all"
on "public"."teams"
as permissive
for select
to public
using (true);


CREATE TRIGGER delete_empty_player_statistics AFTER INSERT OR DELETE OR UPDATE ON public.player_statistics FOR EACH ROW EXECUTE FUNCTION delete_rows_with_criteria();

CREATE TRIGGER set_author_trigger BEFORE INSERT OR UPDATE ON public.player_statistics FOR EACH ROW EXECUTE FUNCTION set_author();

CREATE TRIGGER handle_updated_at BEFORE UPDATE ON public.players FOR EACH ROW EXECUTE FUNCTION moddatetime('updated_at');


