begin;

create extension if not exists pgtap with schema extensions;

select plan(23);

insert into public.teams (id, name, short_name)
values
  (1, 'North City', 'NOR'),
  (2, 'South United', 'SOU');

insert into public.players (
  player_id,
  code,
  web_name,
  element_type,
  team
)
select
  player_id,
  1000 + player_id,
  'Player ' || player_id,
  case
    when squad_position = 1 then 1
    when squad_position between 2 and 5 then 2
    when squad_position between 6 and 8 then 3
    else 4
  end,
  case when player_id % 2 = 0 then 2 else 1 end
from (
  select
    player_id,
    ((player_id - 1) % 11) + 1 as squad_position
  from generate_series(1, 22) as player_id
) players;

insert into public.players (
  player_id,
  code,
  web_name,
  element_type,
  team
)
values
  (23, 1023, 'Player 23', 1, 1),
  (24, 1024, 'Player 24', 1, 2),
  (25, 1025, 'Player 25', 1, 1);

insert into public.drafted_teams (
  drafted_team_id,
  team_name,
  team_owner,
  team_email,
  allowed_transfers,
  active_season,
  allow_communication,
  contact_number,
  total_team_value
)
values
  (
    1,
    'Alpha FC',
    'Alice',
    'alpha-private@example.test',
    true,
    '25-26',
    true,
    '07000000001',
    100
  ),
  (
    2,
    'Bravo FC',
    'Bob',
    'bravo-private@example.test',
    true,
    '25-26',
    false,
    '07000000002',
    100
  );

insert into public.drafted_players (
  drafted_player_id,
  drafted_team,
  drafted_player
)
select
  player_id,
  case when player_id <= 11 then 1 else 2 end,
  player_id
from generate_series(1, 22) as player_id;

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
  (1, 2, 1, 1, 0, 37, 80),
  (1, 1, 0, 0, 0, 38, 20),
  (2, 4, 2, 1, 0, 37, 90),
  (2, 0, 0, 1, 0, 38, 5);

insert into public.drafted_transfers (
  drafted_transfer_id,
  transfer_week,
  active_transfer_expiry,
  player_id,
  drafted_player,
  created_at
)
values
  (1, 10, '2026-01-01', 23, 1, '2025-10-01 10:00:00+00'),
  (2, 20, '2026-03-01', 24, 1, '2026-01-01 10:00:00+00'),
  (3, 15, '2026-02-01', 25, 12, '2025-11-01 10:00:00+00');

insert into public.drafted_teams (
  drafted_team_id,
  team_name,
  team_owner,
  team_email,
  allowed_transfers,
  active_season,
  total_team_value
)
values
  (6, 'Duplicate Player FC', 'Drew', 'drew@example.test', true, '21-22', 100),
  (3, 'Incomplete FC', 'Ivy', 'ivy@example.test', true, '22-23', 100),
  (4, 'No Score FC', 'Noah', 'noah@example.test', true, '23-24', 100),
  (5, 'Unnamed Player FC', 'Una', 'una@example.test', true, '24-25', 100);

insert into public.drafted_players (
  drafted_player_id,
  drafted_team,
  drafted_player
)
select
  400 + squad_position,
  6,
  case when squad_position = 5 then 2 else squad_position end
from generate_series(1, 11) as squad_position;

insert into public.drafted_players (
  drafted_player_id,
  drafted_team,
  drafted_player
)
select 100 + player_id, 3, player_id
from generate_series(1, 10) as player_id;

insert into public.drafted_players (
  drafted_player_id,
  drafted_team,
  drafted_player
)
select 200 + player_id, 4, player_id
from generate_series(1, 11) as player_id;

insert into public.players (
  player_id,
  code,
  web_name,
  element_type,
  team
)
values (26, 1026, null, 1, 1);

insert into public.drafted_players (
  drafted_player_id,
  drafted_team,
  drafted_player
)
values (301, 5, 26);

insert into public.drafted_players (
  drafted_player_id,
  drafted_team,
  drafted_player
)
select 300 + player_id, 5, player_id
from generate_series(2, 11) as player_id;

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
  (6, 1, 0, 0, 0, 38, 10),
  (4, 1, 0, 0, 0, 37, 10),
  (5, 1, 0, 0, 0, 38, 10);

select throws_ok(
  $$select * from public.archive_completed_season('21-22', '2021/22', 38)$$,
  'P0001',
  'Every Final Squad in Season 21-22 must contain 11 distinct players in the 1/4/3/3 formation',
  'preflight rejects the same player occupying two Final Squad slots'
);

select throws_ok(
  $$select * from public.archive_completed_season('22-23', '2022/23', 38)$$,
  'P0001',
  'Every fantasy team in Season 22-23 must have exactly 11 drafted slots',
  'preflight rejects an incomplete squad'
);

select throws_ok(
  $$select * from public.archive_completed_season('23-24', '2023/24', 38)$$,
  'P0001',
  'Every fantasy team in Season 23-24 must have statistics for gameweek 38',
  'preflight rejects missing final-gameweek statistics'
);

select throws_ok(
  $$select * from public.archive_completed_season('24-25', '2024/25', 38)$$,
  'P0001',
  'Season 24-25 has an unresolved Final Squad player or club',
  'preflight rejects missing player display data'
);

select is(
  (
    select count(*)::integer
    from public.seasons
    where season_key in ('21-22', '22-23', '23-24', '24-25')
  ),
  0,
  'a failed preflight leaves no partial Season snapshot'
);

create temporary table archive_call_result as
select *
from public.archive_completed_season('25-26', '2025/26', 38);

select is(
  (select team_count from archive_call_result),
  2,
  'archives every fantasy team'
);

select is(
  (select player_count from archive_call_result),
  22,
  'archives exactly eleven final players per team'
);

select is(
  (select transfer_count from archive_call_result),
  3,
  'archives every transfer'
);

select ok(
  (select archived_at is not null from public.seasons where season_key = '25-26'),
  'publishes the Season only after building the snapshot'
);

select results_eq(
  $$
    select team_name, owner_display_name, final_position, final_score
    from public.season_results
    order by final_position
  $$,
  $$
    values
      ('Alpha FC'::text, 'Alice'::text, 1::smallint, 100),
      ('Bravo FC'::text, 'Bob'::text, 2::smallint, 95)
  $$,
  'captures deterministic final standings'
);

select results_eq(
  $$
    select sr.team_name, count(*)::bigint
    from public.season_result_players srp
    join public.season_results sr on sr.id = srp.season_result_id
    group by sr.team_name
    order by sr.team_name
  $$,
  $$
    values
      ('Alpha FC'::text, 11::bigint),
      ('Bravo FC'::text, 11::bigint)
  $$,
  'captures a complete Final Squad for each result'
);

select ok(
  exists (
    select 1
    from public.season_result_players srp
    join public.season_results sr on sr.id = srp.season_result_id
    where sr.team_name = 'Alpha FC'
      and srp.player_display_name = 'Player 24'
  )
  and not exists (
    select 1
    from public.season_result_players srp
    join public.season_results sr on sr.id = srp.season_result_id
    where sr.team_name = 'Alpha FC'
      and srp.player_display_name in ('Player 1', 'Player 23')
  ),
  'uses the latest replacement in a drafted slot for the Final Squad'
);

select results_eq(
  $$
    select
      srp.player_display_name,
      srp.position,
      srp.club_name,
      srp.club_short_name
    from public.season_result_players srp
    join public.season_results sr on sr.id = srp.season_result_id
    where sr.team_name = 'Alpha FC'
      and srp.player_display_name = 'Player 24'
  $$,
  $$
    values (
      'Player 24'::text,
      'goalkeeper'::text,
      'South United'::text,
      'SOU'::text
    )
  $$,
  'captures Final Squad position and club display data'
);

select results_eq(
  $$
    select
      srt.gameweek,
      srt.transfer_order,
      srt.outgoing_player_display_name,
      srt.incoming_player_display_name
    from public.season_result_transfers srt
    join public.season_results sr on sr.id = srt.season_result_id
    where sr.team_name = 'Alpha FC'
    order by srt.transfer_order
  $$,
  $$
    values
      (10::smallint, 1::smallint, 'Player 1'::text, 'Player 23'::text),
      (20::smallint, 2::smallint, 'Player 23'::text, 'Player 24'::text)
  $$,
  'preserves the outgoing-to-incoming transfer chain'
);

select ok(
  not exists (
    select 1
    from public.season_results
    where team_name in (
      'alpha-private@example.test',
      'bravo-private@example.test',
      '07000000001',
      '07000000002'
    )
      or owner_display_name in (
        'alpha-private@example.test',
        'bravo-private@example.test',
        '07000000001',
        '07000000002'
      )
  ),
  'does not copy private operational team fields'
);

select throws_ok(
  $$update public.season_results set final_score = 0$$,
  'P0001',
  'Archived Season snapshots are read-only',
  'completed results are immutable'
);

select throws_ok(
  $$delete from public.season_result_players$$,
  'P0001',
  'Archived Season snapshots are read-only',
  'completed Final Squads are immutable'
);

select throws_ok(
  $$update public.season_result_transfers set gameweek = 1$$,
  'P0001',
  'Archived Season snapshots are read-only',
  'completed Season Transfers are immutable'
);

select throws_ok(
  $$update public.seasons set display_name = 'Changed' where season_key = '25-26'$$,
  'P0001',
  'Archived Season snapshots are read-only',
  'the completed Season is immutable'
);

select throws_ok(
  $$select * from public.archive_completed_season('25-26', 'Duplicate', 38)$$,
  'P0001',
  'Season 25-26 has already been archived',
  'rejects duplicate archival'
);

select ok(
  not has_function_privilege(
    'anon',
    'public.archive_completed_season(text,text,integer)',
    'EXECUTE'
  ),
  'anonymous users cannot run the archive operation'
);

select ok(
  not has_function_privilege(
    'authenticated',
    'public.archive_completed_season(text,text,integer)',
    'EXECUTE'
  ),
  'authenticated users cannot run the archive operation'
);

select ok(
  not has_function_privilege(
    'service_role',
    'public.archive_completed_season(text,text,integer)',
    'EXECUTE'
  ),
  'the application service role cannot run the archive operation'
);

select * from finish();

rollback;
