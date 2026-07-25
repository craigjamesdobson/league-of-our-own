begin;

-- Local-only fictional data for browsing the application and rehearsing the
-- explicit completed-Season archive operation. This intentionally creates no
-- archive rows: run archive_completed_season manually after inspecting it.

insert into public.settings (setting_key, setting_value)
values
  ('current_gameweek', '38'),
  ('season_complete', 'false')
on conflict (setting_key) do update
set
  setting_value = excluded.setting_value,
  updated_at = now();

insert into public.teams (id, name, short_name)
values
  (1, 'Northbridge City', 'NBC'),
  (2, 'Riverside Athletic', 'RVA'),
  (3, 'Westford United', 'WFU'),
  (4, 'Eastgate Rovers', 'EGR'),
  (5, 'Kingsway FC', 'KNG'),
  (6, 'Meadow Park', 'MDW'),
  (7, 'Harbour Town', 'HBR'),
  (8, 'Hillcrest Wanderers', 'HLW');

with generated_players as (
  select
    player_number,
    names.first_names[((player_number - 1) % 8) + 1] as first_name,
    names.last_names[((player_number - 1) / 8) + 1] as last_name
  from generate_series(1, 64) as player_number
  cross join (
    select
      array[
        'Aaron',
        'Ben',
        'Callum',
        'Dylan',
        'Elliot',
        'Finley',
        'George',
        'Harvey'
      ] as first_names,
      array[
        'Adams',
        'Bennett',
        'Carter',
        'Davies',
        'Evans',
        'Foster',
        'Green',
        'Hughes'
      ] as last_names
  ) names
)
insert into public.players (
  player_id,
  code,
  web_name,
  first_name,
  second_name,
  element_type,
  team,
  now_cost,
  cost_change_start_fall,
  status,
  minutes,
  goals_scored,
  assists,
  clean_sheets,
  red_cards,
  total_points,
  created_at,
  updated_at
)
select
  player_number,
  100000 + player_number,
  first_name || ' ' || last_name,
  first_name,
  last_name,
  case
    when player_number between 1 and 8 then 1
    when player_number between 9 and 32 then 2
    when player_number between 33 and 48 then 3
    else 4
  end,
  ((player_number - 1) % 8) + 1,
  45 + ((player_number % 7) * 5),
  0,
  'a',
  1800 + (player_number * 10),
  case
    when player_number > 48 then player_number % 12
    else player_number % 4
  end,
  player_number % 8,
  player_number % 10,
  case when player_number = 30 then 1 else 0 end,
  40 + (player_number * 2),
  now(),
  now()
from generated_players;

insert into public.drafted_teams (
  drafted_team_id,
  team_name,
  team_owner,
  team_email,
  allowed_transfers,
  active_season,
  allow_communication,
  contact_number,
  edited_count,
  total_team_value
)
values
  (
    1,
    'Expected Goals FC',
    'Alex Morgan',
    'alex@example.test',
    true,
    '25-26',
    false,
    null,
    1,
    63.5
  ),
  (
    2,
    'The High Press',
    'Bailey Jones',
    'bailey@example.test',
    true,
    '25-26',
    false,
    null,
    0,
    64.2
  ),
  (
    3,
    'Clean Sheet Society',
    'Casey Patel',
    'casey@example.test',
    false,
    '25-26',
    false,
    null,
    2,
    61.8
  ),
  (
    4,
    'Net Six and Chill',
    'Devon Smith',
    'devon@example.test',
    true,
    '25-26',
    false,
    null,
    1,
    62.6
  );

with squad_players (drafted_team_id, player_ids) as (
  values
    (1, array[1, 9, 10, 11, 12, 33, 34, 35, 49, 50, 51]),
    (2, array[2, 13, 14, 15, 16, 36, 37, 38, 52, 53, 54]),
    (3, array[3, 17, 18, 19, 20, 39, 40, 41, 55, 56, 57]),
    (4, array[4, 21, 22, 23, 24, 42, 43, 44, 58, 59, 60])
)
insert into public.drafted_players (
  drafted_player_id,
  drafted_team,
  drafted_player
)
select
  ((squad.drafted_team_id - 1) * 11) + player_slot.ordinality,
  squad.drafted_team_id,
  player_slot.player_id
from squad_players squad
cross join lateral unnest(squad.player_ids)
  with ordinality as player_slot(player_id, ordinality);

insert into public.drafted_transfers (
  drafted_transfer_id,
  transfer_week,
  active_transfer_expiry,
  player_id,
  drafted_player,
  created_at
)
values
  (1, 10, '2025-11-01', 5, 1, '2025-10-01 10:00:00+00'),
  (2, 20, '2026-02-01', 6, 1, '2026-01-01 10:00:00+00'),
  (3, 38, '2026-06-01', 25, 13, '2026-05-20 10:00:00+00'),
  (4, 15, '2026-01-01', 45, 28, '2025-11-20 10:00:00+00'),
  (5, 38, '2026-06-01', 61, 42, '2026-05-21 10:00:00+00');

insert into public.fixtures (
  id,
  game_week,
  home_team,
  away_team,
  home_team_score,
  away_team_score,
  populated_at
)
values
  (1, 37, 1, 8, 2, 0, '2026-05-10 18:00:00+00'),
  (2, 37, 2, 7, 1, 1, '2026-05-10 18:00:00+00'),
  (3, 37, 3, 6, 3, 2, '2026-05-11 18:00:00+00'),
  (4, 37, 4, 5, 0, 1, '2026-05-11 18:00:00+00'),
  (5, 38, 8, 1, 1, 2, '2026-05-20 18:00:00+00'),
  (6, 38, 7, 2, 0, 0, '2026-05-20 18:00:00+00'),
  (7, 38, 6, 3, 2, 3, '2026-05-21 18:00:00+00'),
  (8, 38, 5, 4, null, null, null);

insert into public.player_statistics (
  player_id,
  fixture_id,
  goals,
  assists,
  red_card,
  clean_sheet,
  points
)
values
  (49, 1, 1, 0, false, false, 8),
  (9, 1, 0, 1, false, true, 7),
  (1, 1, 0, 0, false, true, 6),
  (50, 2, 1, 0, false, false, 7),
  (55, 2, 1, 0, false, false, 7),
  (51, 3, 2, 0, false, false, 12),
  (35, 3, 0, 2, false, false, 8),
  (52, 4, 1, 0, false, false, 8),
  (56, 5, 1, 0, false, false, 7),
  (49, 5, 1, 0, false, false, 8),
  (33, 5, 0, 1, false, false, 5),
  (2, 6, 0, 0, false, true, 6),
  (14, 6, 0, 0, false, true, 6),
  (53, 7, 2, 0, false, false, 12),
  (45, 7, 0, 1, false, false, 5),
  (30, 7, 0, 0, true, false, -1);

insert into public.weekly_statistics (
  team,
  goals,
  assists,
  clean_sheets,
  red_cards,
  week,
  points
)
values
  (1, 2, 2, 2, 0, 37, 70),
  (1, 1, 1, 1, 0, 38, 65),
  (2, 2, 1, 1, 0, 37, 68),
  (2, 1, 2, 2, 0, 38, 60),
  (3, 1, 2, 2, 0, 37, 62),
  (3, 3, 1, 1, 0, 38, 72),
  (4, 1, 1, 1, 0, 37, 60),
  (4, 1, 0, 0, 1, 38, 58);

select pg_catalog.setval(
  pg_catalog.pg_get_serial_sequence(
    'public.drafted_teams',
    'drafted_team_id'
  ),
  (select max(drafted_team_id) from public.drafted_teams),
  true
);

select pg_catalog.setval(
  pg_catalog.pg_get_serial_sequence(
    'public.drafted_players',
    'drafted_player_id'
  ),
  (select max(drafted_player_id) from public.drafted_players),
  true
);

select pg_catalog.setval(
  pg_catalog.pg_get_serial_sequence(
    'public.drafted_transfers',
    'drafted_transfer_id'
  ),
  (select max(drafted_transfer_id) from public.drafted_transfers),
  true
);

select pg_catalog.setval(
  pg_catalog.pg_get_serial_sequence('public.fixtures', 'id'),
  (select max(id) from public.fixtures),
  true
);

commit;
