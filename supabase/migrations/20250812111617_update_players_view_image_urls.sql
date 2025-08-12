create or replace view "public"."players_view" as  SELECT p.player_id,
    p.code,
    (('https://resources.premierleague.com/premierleague25/photos/players/40x40/'::text || p.code) || '.png'::text) AS image,
    (('https://resources.premierleague.com/premierleague25/photos/players/110x140/'::text || p.code) || '.png'::text) AS image_large,
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



