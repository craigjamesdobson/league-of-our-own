create or replace view public.player_statistics_totals as
select
  player_id,
  coalesce(sum(goals), 0)::int as goals,
  coalesce(sum(assists), 0)::int as assists,
  coalesce(sum(points), 0)::int as points,
  coalesce(sum(case when clean_sheet then 1 else 0 end), 0)::int as clean_sheets,
  coalesce(sum(case when red_card then 1 else 0 end), 0)::int as red_cards
from public.player_statistics
group by player_id;
