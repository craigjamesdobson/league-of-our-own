begin;

create extension if not exists pgtap with schema extensions;
select plan(8);

update public.settings set setting_value = '7' where setting_key = 'current_gameweek';

create temporary table rollover_snapshots as
select 'squad' as kind, coalesce(jsonb_agg(jsonb_build_array(drafted_player_id, drafted_team, drafted_player) order by drafted_player_id), '[]') as contents
from public.drafted_players
union all
select 'transfers', coalesce(jsonb_agg(jsonb_build_array(drafted_transfer_id, drafted_player, player_id, transfer_week) order by drafted_transfer_id), '[]')
from public.drafted_transfers
union all
select 'team_scores', coalesce(jsonb_agg(jsonb_build_array(team, week, points, goals, assists, red_cards, clean_sheets) order by team, week), '[]')
from public.weekly_statistics
union all
select 'player_scores', coalesce(jsonb_agg(jsonb_build_array(player_id, fixture_id, points) order by player_id, fixture_id), '[]')
from public.player_statistics
union all
select 'requests', coalesce(jsonb_agg(jsonb_build_array(transfer_request_id, target_gameweek, status) order by transfer_request_id), '[]')
from public.transfer_requests
union all
select 'other_settings', coalesce(jsonb_agg(jsonb_build_array(setting_key, setting_value) order by setting_key), '[]')
from public.settings where setting_key <> 'current_gameweek';

update public.settings set setting_value = '8' where setting_key = 'current_gameweek';

select is((select setting_value from public.settings where setting_key = 'current_gameweek'), '8', 'rollover advances the current gameweek');

select is(
  (select coalesce(jsonb_agg(jsonb_build_array(drafted_player_id, drafted_team, drafted_player) order by drafted_player_id), '[]') from public.drafted_players),
  (select contents from rollover_snapshots where kind = 'squad'),
  'rollover does not rewrite the drafted squad'
);
select is(
  (select coalesce(jsonb_agg(jsonb_build_array(drafted_transfer_id, drafted_player, player_id, transfer_week) order by drafted_transfer_id), '[]') from public.drafted_transfers),
  (select contents from rollover_snapshots where kind = 'transfers'),
  'rollover does not create, remove or retarget recorded transfers'
);
select is(
  (select coalesce(jsonb_agg(jsonb_build_array(team, week, points, goals, assists, red_cards, clean_sheets) order by team, week), '[]') from public.weekly_statistics),
  (select contents from rollover_snapshots where kind = 'team_scores'),
  'rollover does not recalculate or overwrite saved team scores'
);
select is(
  (select coalesce(jsonb_agg(jsonb_build_array(player_id, fixture_id, points) order by player_id, fixture_id), '[]') from public.player_statistics),
  (select contents from rollover_snapshots where kind = 'player_scores'),
  'rollover does not import or change player scores'
);
select is(
  (select coalesce(jsonb_agg(jsonb_build_array(transfer_request_id, target_gameweek, status) order by transfer_request_id), '[]') from public.transfer_requests),
  (select contents from rollover_snapshots where kind = 'requests'),
  'rollover does not approve, reject, expire or retarget pending requests'
);
select is(
  (select coalesce(jsonb_agg(jsonb_build_array(setting_key, setting_value) order by setting_key), '[]') from public.settings where setting_key <> 'current_gameweek'),
  (select contents from rollover_snapshots where kind = 'other_settings'),
  'rollover does not change registration, publication or season settings'
);

update public.settings set setting_value = '38' where setting_key = 'current_gameweek';
select is(
  (select coalesce(jsonb_agg(jsonb_build_array(setting_key, setting_value) order by setting_key), '[]') from public.settings where setting_key <> 'current_gameweek'),
  (select contents from rollover_snapshots where kind = 'other_settings'),
  'advancing to the final gameweek does not automatically complete or archive the season'
);

select * from finish();
rollback;
