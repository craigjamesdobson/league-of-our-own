create or replace view public.players_view as
select
  p.player_id,
  p.code,
  ('https://resources.premierleague.com/premierleague25/photos/players/40x40/' || p.code || '.png') as image,
  ('https://resources.premierleague.com/premierleague25/photos/players/110x140/' || p.code || '.png') as image_large,
  p.web_name,
  p.first_name,
  p.second_name,
  p.goals_scored,
  p.assists,
  p.clean_sheets,
  p.red_cards,
  round(((p.now_cost + p.cost_change_start_fall)::numeric / 10.0), 1) as cost,
  case
    when p.status = any (array['i', 'n', 's', 'd']) then 'temporary-unavailable'
    when p.status = 'u' then 'unavailable-for-season'
    else 'available'
  end as status,
  case
    when p.status = any (array['i', 'n', 's', 'd', 'u']) then true
    else false
  end as is_unavailable,
  case
    when p.status = 'u' then true
    else false
  end as unavailable_for_season,
  p.news,
  p.element_type as position,
  p.team,
  t.name as team_name,
  t.short_name as team_short_name,
  p.minutes,
  p.total_points
from public.players p
left join public.teams t on t.id = p.team;
