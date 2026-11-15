begin;

create extension if not exists pgtap with schema extensions;
select plan(12);

-- Isolated fixtures and all mutations roll back.
insert into auth.users (id, email)
values ('92000100-0000-4000-8000-000000000001', 'fixture-result-admin@example.test');

insert into public.profiles (id, full_name)
values ('92000100-0000-4000-8000-000000000001', 'Fixture Result Admin')
on conflict (id) do nothing;

insert into public.teams (id, name, short_name)
values (-920001, 'Result Home', 'RHM'), (-920002, 'Result Away', 'RAW');

insert into public.players (
  player_id, code, team, web_name, element_type, now_cost, cost_change_start_fall, status
)
values
  (-920001, -920001, -920001, 'Old Scorer', 4, 400, 0, 'a'),
  (-920002, -920002, -920001, 'New Scorer', 4, 400, 0, 'a'),
  (-920003, -920003, -920002, 'Sent Off', 2, 400, 0, 'a');

insert into public.fixtures (id, game_week, home_team, away_team, home_team_score, away_team_score)
values
  (-920001, 38, -920001, -920002, 1, 0),
  (-920002, 38, -920002, -920001, 3, 3);

insert into public.player_statistics (player_id, fixture_id, goals, assists, red_card, clean_sheet, points)
values
  (-920001, -920001, 1, 0, false, false, 3),
  (-920001, -920002, 3, 0, false, false, 9);

select ok(
  has_function_privilege('authenticated', 'public.save_fixture_result(bigint, integer, integer, jsonb)', 'EXECUTE')
    and not has_function_privilege('anon', 'public.save_fixture_result(bigint, integer, integer, jsonb)', 'EXECUTE'),
  'only signed-in administrators can save a fixture result'
);

select throws_ok(
  $$select public.save_fixture_result(-920001, 2, 1, '[]'::jsonb)$$,
  'P0001', 'Administrator authentication is required', 'saving requires an authenticated administrator'
);

select set_config('request.jwt.claim.sub', '92000100-0000-4000-8000-000000000001', true);
set local role authenticated;

select throws_ok(
  $$select public.save_fixture_result(-929999, 2, 1, '[]'::jsonb)$$,
  'P0001', 'Fixture not found', 'an unknown fixture is rejected'
);

select throws_ok(
  $$select public.save_fixture_result(-920001, 2, 1, '{"player_id": -920002}'::jsonb)$$,
  'P0001', 'Player statistics must be a list', 'statistics must be sent as a list'
);

-- A statistic for a player that does not exist fails the insert. The score
-- update and the delete that ran before it must be undone with it.
select throws_ok(
  $$select public.save_fixture_result(
    -920001, 5, 5,
    '[{"player_id": -929999, "goals": 1, "assists": 0, "clean_sheet": false, "red_card": false, "points": 3}]'::jsonb
  )$$,
  '23503', null, 'a statistic for an unknown player is rejected'
);

select results_eq(
  $$select home_team_score, away_team_score from public.fixtures where id = -920001$$,
  $$values (1, 0)$$, 'a failed save leaves the score unchanged'
);

select results_eq(
  $$select player_id, goals, points from public.player_statistics where fixture_id = -920001$$,
  $$values (-920001, 1, 3)$$, 'a failed save leaves the existing statistics in place'
);

select lives_ok(
  $$select public.save_fixture_result(
    -920001, 2, 1,
    '[
      {"player_id": -920002, "goals": 2, "assists": 0, "clean_sheet": false, "red_card": false, "points": 6},
      {"player_id": -920003, "goals": 0, "assists": 0, "clean_sheet": false, "red_card": true, "points": -10}
    ]'::jsonb
  )$$,
  'an administrator can save a fixture result'
);

select results_eq(
  $$select home_team_score, away_team_score, populated_by, populated_at is not null
    from public.fixtures where id = -920001$$,
  $$values (2, 1, '92000100-0000-4000-8000-000000000001'::uuid, true)$$,
  'the score is saved and records who entered it'
);

select results_eq(
  $$select player_id, goals, red_card, points, author
    from public.player_statistics where fixture_id = -920001 order by player_id desc$$,
  $$values
    (-920002, 2, false, 6, '92000100-0000-4000-8000-000000000001'::uuid),
    (-920003, 0, true, -10, '92000100-0000-4000-8000-000000000001'::uuid)$$,
  'the new statistics replace the old ones'
);

select results_eq(
  $$select player_id, goals, points from public.player_statistics where fixture_id = -920002$$,
  $$values (-920001, 3, 9)$$, 'statistics for other fixtures are untouched'
);

select lives_ok(
  $$select public.save_fixture_result(-920001, 0, 0, '[]'::jsonb)$$,
  'a result with no statistics clears the fixture''s statistics'
);

reset role;

select * from finish();
rollback;
